angular
	.module('tictactoe')
	.controller(
		'GameController', 
		[
			'$scope', 
			'$firebaseObject', 
			'$firebaseArray', 
			'$interval', 
			GameController
		]
	);



function GameController($scope, $firebaseObject, $firebaseArray, $interval) {
	
	// CONSTANTS

	$scope.states = {
		login: 0,
		gamefull: 1,
		config: 2,
		waiting: 3,
		playing: 4,
		gameover: 5
	};




	// INTERNAL (LOCAL) VARIABLES

	var selfPlayerIndex;
	var selfRef;
	$scope.playerName;
	$scope.gameState = $scope.states.login;

	// FIREBASE (REMOTE) VARIABLES

	var rootRef = new Firebase('https://toe.firebaseio.com/');

	var tempFirebaseObj = $firebaseObject(rootRef.child('gameConfigured'));
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
	var players = $firebaseArray(rootRef.child('players'));




	// FUNCTIONS

	function waitForGame() {
		waitingPromise = $interval(
			function() {
				// start game when 2 players have joined and game has been configured
				if (players.length >= 2  && $scope.gameConfigured.$value) {
					$scope.gameState = $scope.states.playing;
					$interval.cancel(waitingPromise);
					debug("Starting Game");
				}
			},
			0.2
		);
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
		$scope.winnerIndex.$value = -2;	// -2 means there is no winner
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

	var getLineLength = function(searchVal, dir, row, col) {
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
	};

/*	
	var getHorLineLength = function(searchVal, row, col) {
		if ($scope.gameBoard[row][col] === searchVal) {
			// 	if there are no more cells to check (end of row) then
			if (col + 1 >= $scope.gameBoardSize.$value) {
				return 1;
			}
			// check if next cell should add on to the length counter
			else {
				return (1 + getHorLineLength(searchVal, row, col + 1));
			}
		}
		// search value was not found, so $scope line has no length.
		else {
			return 0;
		}
	};

	var getVertLineLength = function(searchVal, row, col) {
		if ($scope.gameBoard[row][col] === searchVal) {
			// 	if there are no more cells to check (end of column) then
			if (row + 1 >= $scope.gameBoardSize.$value) {
				return 1;
			}
			// check if next cell should add on to the length counter
			else {
				return (1 + getVertLineLength(searchVal, row + 1, col));
			}
		}
		// search value was not found, so $scope line has no length.
		else {
			return 0;
		}
	};

	var getDiagRightLineLength = function(searchVal, row, col) {
		if ($scope.gameBoard[row][col] === searchVal) {
			// 	if there are no more cells to check (end of row or column) then
			if ((row + 1 >= $scope.gameBoardSize.$value )|| (col + 1 >= $scope.gameBoardSize.$value)) {
				return 1;
			}
			// check if next cell should add on to the length counter
			else {
				return (1 + getDiagRightLineLength(searchVal, row + 1, col + 1));
			}
		}
		// search value was not found, so $scope line has no length.
		else {
			return 0;
		}
	};

	var getDiagLeftLineLength = function(searchVal, row, col) {
		if ($scope.gameBoard[row][col] === searchVal) {
			// 	if there are no more cells to check (end of row or column) then
			if ((row + 1 >= $scope.gameBoardSize.$value )|| (col - 1 < 0)) {
				return 1;
			}
			// check if next cell should add on to the length counter
			else {
				return (1 + getDiagLeftLineLength(searchVal, row + 1, col - 1));
			}
		}
		// search value was not found, so $scope line has no length.
		else {
			return 0;
		}
	};
*/
	var checkPlayerWin = function(playerIndex) {
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
			/*			
				// check horizontally from $scope cell
				// only if it is possible for $scope line to be long enough to win
				remainingCells = $scope.gameBoardSize.$value - col;
				if (remainingCells >= $scope.winLineLength.$value) {
					if (getLineLength(playerIndex, 'R', row, col) >= $scope.winLineLength.$value) {
						return true;
					}
				}
				// check vertically from $scope cell
				remainingCells = $scope.gameBoardSize.$value - row;
				if (remainingCells >= $scope.winLineLength.$value) {
					if (getLineLength(playerIndex, 'D', row, col) >= $scope.winLineLength.$value) {
						return true;
					}
				}
				// check diagonally down-right from $scope cell
				remainingCells = Math.min($scope.gameBoardSize.$value - row, $scope.gameBoardSize.$value - col);
				if (remainingCells >= $scope.winLineLength.$value) {
					if (getLineLength(playerIndex, 'DR', row, col) >= $scope.winLineLength.$value) {
						return true;
					}
				}
				// check diagonally down-left from $scope cell
				remainingCells = Math.min($scope.gameBoardSize.$value - row, col + 1);
				if (remainingCells >= $scope.winLineLength.$value) {
					if (getLineLength(playerIndex, 'DL', row, col) >= $scope.winLineLength.$value) {
						return true;
					}
				}
			*/
			}
		}

		return false;
	};


	// player attempted a move by clicking cell on the board
	$scope.cellClick = function(row, col) {
		if ($scope.gameState !== $scope.states.playing) {
			debug("cellClick() was called from wrong state: " + $scope.gameState);
			return;
		}

		if ($scope.isValidMove(row, col)) {
			// claim $scope cell. It now belongs to the current player.
			$scope.gameBoard[row][col] = $scope.currentPlayerIndex.$value;
			$scope.gameBoard.$save(row);
			$scope.moveCount.$value++;
			
			// check win condition
			if (checkPlayerWin($scope.currentPlayerIndex.$value)) {
				$scope.winnerIndex.$value = $scope.currentPlayerIndex.$value;
				$scope.gameState = $scope.states.gameover;
			}
			// if there are no more available spaces it's a draw
			else if ($scope.moveCount.$value >= ($scope.gameBoardSize.$value * $scope.gameBoardSize.$value)) {
				$scope.winnerIndex.$value = -1;
				$scope.gameState = $scope.states.gameover;
			}
			// toggle which player's turn it is
			else {
				$scope.currentPlayerIndex.$value = 1 - $scope.currentPlayerIndex.$value;
			}
		}
	};

	// determines whether a cell should be clickable
	$scope.isValidMove = function(row, col) {
		var isPlayerTurn = $scope.currentPlayerIndex.$value === selfPlayerIndex;
		var cellEmpty = $scope.gameBoard[row][col] === -1;

		return isPlayerTurn && cellEmpty;
	};

	$scope.getGameStatusMsg = function() {
		if ($scope.gameState !== $scope.states.playing &&
			$scope.gameState !== $scope.states.gameover) {
			return "";
		}

		// -2 means there is no winner yet
		if (typeof $scope.winnerIndex.$value !== 'number' || 
			$scope.winnerIndex.$value === -2) {
			if ($scope.currentPlayerIndex.$value === selfPlayerIndex) {
				return "Your turn. Pick a square already.";
			}
			else {
				return "Other dude's turn. Please wait.";
			}
		}
		// -1 means draw
		else if ($scope.winnerIndex.$value === -1) {
			return "DRAW";
		}
		// 0 or 1 means player 1 or player 2
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
		if ($scope.gameState !== $scope.states.login) {
			debug("calling findGame() from wrong state: " + $scope.gameState);
			return;
		}

		// if there is no open spot, then go to game full screen
		if (players.length >= 2) {
			debug("Game is full");
			$scope.gameState = $scope.states.gamefull;
			return;
		}
				
		// if first player doesn't exist already, then this player will be player1.
		if (!players[0]) {
			selfPlayerIndex = 0;
		}
		// if first player already exists, then this player will be player2.
		else {
			selfPlayerIndex = 1;
		}
		debug("Player Index: " + selfPlayerIndex);

		// if name was left blank, give a default name
		if (!$scope.playerName) { $scope.playerName = "Player" + (selfPlayerIndex + 1); }

		// mark the spot filled in firebase
		players
			// .$add({
			// 	playerIndex: selfPlayerIndex,
			// 	name: $scope.playerName
			// })
			.$add($scope.playerName)
			.then(function(ref) {
				selfRef = ref;
				// set up automatic deletion of this player object when player disconnects
				selfRef.onDisconnect().remove();

				// first player who joined gets to configure the settings
				if (selfPlayerIndex === 0) {
					$scope.gameConfigured.$value = false;
					$scope.gameState = $scope.states.config;
				}
				// second player who joined goes to the waiting room.
				else {
					$scope.gameState = $scope.states.waiting;
					waitForGame();
				}
			});
	};

	$scope.config = function() {
		if ($scope.gameState !== $scope.states.config) {
			debug("config() was called from wrong state: " + $scope.gameState);
			return;
		}

		initGame();
		$scope.gameConfigured.$value = true;
		$scope.gameState = $scope.states.waiting;
		waitForGame();
	};



	$scope.getConfigMsg = function() {
		if ($scope.gameState !== $scope.states.config) {
			return "";
		}

		function add(text) {
			if (msg.length > 0) { msg += "\n"; }	// this is the line-feed HTML entity
			msg += text;
		}
		var msg = "";


		if ($scope.gameBoardSize.$value < 3) { 
			add("Game board cannot be smaller than 3x3."); 
		}
		else if ($scope.gameBoardSize.$value > 6) { 
			add("Game board cannot be larger than 6x6."); 
		} 
		
		if ($scope.winLineLength.$value < 3) { 
			add("Winning line length cannot be shorter than 3."); 
		}
		else if ($scope.winLineLength.$value > 4) { 
			add("Winning line length cannot be longer than 4."); 
		} 

		if ($scope.winLineLength.$value > $scope.gameBoardSize.$value) {
			add("Board must be bigger than then winning line length.");
		}
		return msg;
	};

	$scope.restart = function() {
		selfRef.remove();
		$scope.gameState = $scope.states.login;
	};
}