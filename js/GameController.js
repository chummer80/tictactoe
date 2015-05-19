angular
	.module('tictactoe')
	.controller(
		'GameController', 
		[
			'$scope', 
			'$firebaseObject', 
			'$firebaseArray', 
			GameController
		]
	);



function GameController($scope, $firebaseObject, $firebaseArray) {
	
	// CONSTANTS

	$scope.states = {
		login: 0,
		gamefull: 1,
		config: 2,
		waiting: 3,
		playing: 4,
		gameover: 5
	};

	var winCodes = {
		pending: -2,
		draw: -1,
		player0: 0,
		player1: 1
	};


	// INTERNAL (LOCAL) VARIABLES

	var boardUnwatch, playersUnwatch, gameConfiguredUnwatch;
	var selfPlayerIndex, selfRef;
	$scope.playerName;
	setState($scope.states.login);

	// FIREBASE (REMOTE) VARIABLES

	var rootRef = new Firebase('https://toe.firebaseio.com/');

	var gameConfiguredRef = rootRef.child('gameConfigured');
	var tempFirebaseObj = $firebaseObject(gameConfiguredRef);
	tempFirebaseObj.$bindTo($scope, 'gameConfigured');

	tempFirebaseObj = $firebaseObject(rootRef.child('winLineLength'));
	tempFirebaseObj.$bindTo($scope, 'winLineLength');

	tempFirebaseObj = $firebaseObject(rootRef.child('gameBoardSize'));
	tempFirebaseObj.$bindTo($scope, 'gameBoardSize');

	tempFirebaseObj = $firebaseObject(rootRef.child('currentPlayerIndex'));
	tempFirebaseObj.$bindTo($scope, 'currentPlayerIndex');	

	tempFirebaseObj = $firebaseObject(rootRef.child('moveCount'));
	tempFirebaseObj.$bindTo($scope, 'moveCount');

	tempFirebaseObj = $firebaseObject(rootRef.child('winnerIndex'));
	tempFirebaseObj.$bindTo($scope, 'winnerIndex');
	
	// $scope.gameBoard will be a 2D array that hold a player index in each cell to indicate which
	// player has claimed that cell. If no one has claimed it then it holds -1.
	$scope.gameBoard = $firebaseArray(rootRef.child('gameBoard'));
	$scope.players = $firebaseArray(rootRef.child('players'));




	// FUNCTIONS

	function setState(state) {
		$scope.gameState = state;
	}

	function isState(state) {
		return $scope.gameState === state;
	}

	function checkForWin(event) {
		var numSpaces = $scope.gameBoardSize.$value * $scope.gameBoardSize.$value;
		if (event.event === "child_changed") {
			// check win condition
			for (var i = 0; i < 2; i++) {
				if (isWinningPlayer(i)) {
					boardUnwatch();	// stop checking for winner
					endGame(i);

					return;	// win checking no longer needed. return to stop.
				}
			}

			// if nobody won and there are no more available spaces it's a draw
			if ($scope.winnerIndex.$value === winCodes.pending && 
				$scope.moveCount.$value >= numSpaces) {
				boardUnwatch();	// stop checking for winner
				endGame(winCodes.draw);
			}
		}
		else {
			debug("something wonky happened to the board: " + event);
		}
	}

	function startGame() {
		boardUnwatch = $scope.gameBoard.$watch(checkForWin);
		setState($scope.states.playing);
		debug("Starting Game");
	}

	function initBoard() {
		var rowArray;
		
		// clear old game board
		$scope.gameBoard.forEach(function(item) {
			$scope.gameBoard.$remove(item);
		});

		// initialize game board
		for (var row = 0; row < $scope.gameBoardSize.$value; row++) {
			rowArray = [];
			for(var col = 0; col < $scope.gameBoardSize.$value; col++) {
				rowArray.push(-1);	// -1 means empty
			}
			$scope.gameBoard.$add(rowArray);
		}
	}

	function initGame() {
		initBoard();
		$scope.currentPlayerIndex.$value = 0;
		$scope.moveCount.$value = 0;
		$scope.winnerIndex.$value = winCodes.pending;
	}

	// Win-checking algorithm:
	// Use recursive functions that take in a starting set of coordinates and looks in each
	// direction to find out the length of the line (number of consecutive same game markers).
	//
	// if current cell value is the one we're looking for, then
	// 		if there are no more cells to check (encountered the edge of the board) then
	// 			return 1;
	// 		else 
	// 			return 1 + recursive call to function (using same desired cell val and next cell's coordinates)
	// else
	// 		return 0
	function getLineLength(searchVal, dir, row, col) {
		var nextRow, nextCol;
		switch(dir) {
			case 'R':
				nextRow = row;
				nextCol = col + 1;
				break;
			case 'D':
				nextRow = row + 1;
				nextCol = col;
				break;
			case 'DR':
				nextRow = row + 1;
				nextCol = col + 1;
				break;
			case 'DL':
				nextRow = row + 1;
				nextCol = col -1;
				break;
			default:
				debug("Invalid direction was passed into getLineLength(): " + dir);
				break;
		}

		if ($scope.gameBoard[row][col] === searchVal) {
			// 	if there are no more cells to check (end of game board) then
			if ((nextRow >= $scope.gameBoardSize.$value) || 
				(nextCol >= $scope.gameBoardSize.$value)) {
				return 1;
			}
			// check if next cell should add on to the length counter
			else {
				return (1 + getLineLength(searchVal, dir, nextRow, nextCol));
			}
		}
		// search value was not found, so $scope line has no length.
		else {
			return 0;
		}
	}

	function isWinningPlayer(playerIndex) {
		var searchArgs = [];

		// Go through every cell, using each one as starting point for win checking
		for (var row = 0; row < $scope.gameBoardSize.$value; row++) {
			for (var col = 0; col < $scope.gameBoardSize.$value; col++) {
				// check for a winning line in every direction starting from this cell.
				// return immediately if a winning line is found.
				searchArgs = [
					{
						dir: 'R',
						remainingCells: $scope.gameBoardSize.$value - col
					},
					{
						dir: 'D',
						remainingCells: $scope.gameBoardSize.$value - row
					},
					{
						dir: 'DR',
						remainingCells: Math.min($scope.gameBoardSize.$value - row, $scope.gameBoardSize.$value - col)
					},
					{
						dir: 'DL',
						remainingCells: Math.min($scope.gameBoardSize.$value - row, col + 1)
					}
				];

				for(var i = 0; i < searchArgs.length; i++) {
					// only get line length if it's possible for this line to be long enough to win
					if (searchArgs[i].remainingCells >= $scope.winLineLength.$value) {
						if (getLineLength(playerIndex, searchArgs[i].dir, row, col) >= $scope.winLineLength.$value) {
							return true;
						}
					}
				}
			}
		}

		return false;
	}

	function playersWatchCB(event) {
		if (isState($scope.states.waiting)) {
			// configuring player disconnected before finishing
			if (event.event === "child_removed") {
				// become the configuring player (player 0)
				debug("becoming playerIndex 0");
				selfPlayerIndex = 0;
				// remove the 'value' event listener we used to need when this was not the configuring player
				gameConfiguredRef.off('value');	
				beginConfig();
			}
			// player already configured the game and was waiting for an opponent. 
			// this event indicates the opponent has connected.
			else if (event.event === "child_added") {
				startGame();
			}
		}

		// if opponent rage quits during game, you auto-win
		if (isState($scope.states.playing) && event.event === "child_removed") {
			endGame(selfPlayerIndex);
		}
	}

	function endGame(winner) {
		// stop watching for opponent DC now
		playersUnwatch();
		$scope.winnerIndex.$value = winner;
		setState($scope.states.gameover);
	}

	function beginConfig() {
		$scope.gameConfigured.$value = false;
		setState($scope.states.config);
	}

	// player attempted a move by clicking cell on the board
	$scope.cellClick = function(row, col) {
		if (!isState($scope.states.playing)) {
			debug("cellClick() was called from wrong state: " + $scope.gameState);
			return;
		}

		if ($scope.isValidMove(row, col)) {
			$scope.playClick();
			// claim $scope cell. It now belongs to the current player.
			$scope.gameBoard[row][col] = $scope.currentPlayerIndex.$value;
			$scope.gameBoard.$save(row);
			$scope.moveCount.$value++;
			
			// switch to opponent's turn
			$scope.currentPlayerIndex.$value = 1 - $scope.currentPlayerIndex.$value;
			
		}
	};

	// determines whether a cell should be clickable
	$scope.isValidMove = function(row, col) {
		var isPlayerTurn = $scope.currentPlayerIndex.$value === selfPlayerIndex;
		var cellEmpty = $scope.gameBoard[row][col] === -1;

		return isPlayerTurn && cellEmpty;
	};

	$scope.getGameStatusMsg = function() {
		if (!isState($scope.states.playing) && !isState($scope.states.gameover)) {
			return "";
		}

		// -2 means there is no winner yet
		if ($scope.winnerIndex.$value === winCodes.pending) {
			if ($scope.currentPlayerIndex.$value === selfPlayerIndex) {
				return "Your turn. Pick a square already.";
			}
			else {
				return "Other dude's turn. Hang on a sec.";
			}
		}
		// -1 means draw
		else if ($scope.winnerIndex.$value === winCodes.draw) {
			return "DRAW";
		}
		// 0 or 1 means a player has won
		else {
			if ($scope.winnerIndex.$value === selfPlayerIndex) {
				return "YOU WIN!";
			}
			else {
				return "YOU LOSE, SUCKA!";
			}
		}
	};

	$scope.findGame = function () {
		if (!isState($scope.states.login)) {
			debug("calling findGame() from wrong state: " + $scope.gameState);
			return;
		}

		// if there is no open spot, then go to game full screen
		if ($scope.players.length >= 2) {
			debug("Game is full");
			setState($scope.states.gamefull);
			return;
		}
				
		// if this is the first player to join, then this player will be player1.
		// if first player already exists, then this player will be player2.
		selfPlayerIndex = ($scope.players.length === 0) ? 0 : 1;
		// if ($scope.players.length === 0) {
		// 	selfPlayerIndex = 0;
		// }
		// else {
		// 	selfPlayerIndex = 1;
		// }
		debug("Player Index: " + selfPlayerIndex);

		// if name was left blank, give a default name
		if (!$scope.playerName) { $scope.playerName = getRandomName(); }

		// mark the spot filled in firebase
		$scope.players
			.$add($scope.playerName)
			.then(function(ref) {
				selfRef = ref;
				// set up automatic deletion of this player object when player disconnects
				selfRef.onDisconnect().remove();

				// first player who joined gets to configure the settings
				if (selfPlayerIndex === 0) {
					beginConfig();
				}
				// second player who joined goes to the waiting room.
				else {
					// regardless of whether a game begins now, or if waiting for opponent 
					// to configure game begins, a players $watch is needed.
					playersUnwatch = $scope.players.$watch(playersWatchCB);
					if ($scope.gameConfigured.$value) {
						startGame();
					}
					else {
						setState($scope.states.waiting);
						gameConfiguredRef.on('value', function(snapshot) {
							if (snapshot.val() === true) {
								gameConfiguredRef.off('value');
								startGame();
							}
						});
					}
				}
			});
	};

	$scope.config = function() {
		if (!isState($scope.states.config)) {
			debug("config() was called from wrong state: " + $scope.gameState);
			return;
		}

		initGame();
		$scope.gameConfigured.$value = true;

		// regardless of whether a game begins now, or if waiting for opponent 
		// connect begins, a players $watch is needed.
		playersUnwatch = $scope.players.$watch(playersWatchCB);
		if ($scope.players.length >= 2) {
			startGame();
		}
		else {
			setState($scope.states.waiting);
		}
	};

	$scope.validateConfig = function() {
		if ($scope.winLineLength.$value > $scope.gameBoardSize.$value) {
			$scope.winLineLength.$value = $scope.gameBoardSize.$value;
		}
	};

	$scope.restart = function() {
		// remove player from the game to make a new empty slot
		selfRef.remove();
		setState($scope.states.login);
	};

	$scope.toggleBtnAnim = function(event) {
		event.target.classList.toggle('pulse');
	};

	$scope.playClick = function() {
		playClick();
	};
}