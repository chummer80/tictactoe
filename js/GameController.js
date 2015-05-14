angular
	.module('tictactoe')
	.controller(
			'GameController', 
			['$scope', '$firebaseObject', '$firebaseArray', GameController]);

function GameController($scope, $firebaseObject, $firebaseArray) {

	var rootRef = new Firebase('https://toe.firebaseio.com/');
	var winLineLength = $firebaseObject(rootRef.child('winLineLength'));
	var gameBoardSize = $firebaseObject(rootRef.child('gameBoardSize'));
	var currentPlayerIndex = $firebaseObject(rootRef.child('currentPlayerIndex'));
	var moveCount = $firebaseObject(rootRef.child('moveCount'));
	var winnerIndex = $firebaseObject(rootRef.child('winnerIndex'));

	// $scope.gameBoard will be a 2D array that hold a player index in each cell to indicate which
	// player has claimed that cell. If no one has claimed it then it holds -1.
	$scope.gameBoard = $firebaseArray(rootRef.child('gameBoard'));


	$scope.cellClick = function(row, col) {
		// only finish the move if empty cell was clicked and game hasn't been won yet
		if ($scope.gameBoard[row][col] === -1 && $scope.winnerIndex.$value === -2) {
			// claim $scope cell. It now belongs to the current player.
			$scope.gameBoard[row][col] = $scope.currentPlayerIndex.$value;
			$scope.gameBoard.$save(row);
			$scope.moveCount.$value++;
			
			// check win condition
			if (checkPlayerWin($scope.currentPlayerIndex.$value)) {
				$scope.winnerIndex.$value = $scope.currentPlayerIndex.$value;
			}
			// if there are no more available spaces it's a draw
			else if ($scope.moveCount.$value >= ($scope.gameBoardSize.$value * $scope.gameBoardSize.$value)) {
				$scope.winnerIndex.$value = -1;
			}
			// toggle which player's turn it is
			else {
				$scope.currentPlayerIndex.$value = 1 - $scope.currentPlayerIndex.$value;
			}
		}
	};
	

	// A recursive function that takes in a starting set of coordinates and looks right
	// to find out the length of the line of consecutive same game markers
	var getHorLineLength = function(searchVal, row, col) {
	// if current cell val is the one we're looking for, then
	// 	if there are no more cells to check (end of row) then
	// 		return 1;
	// 	else 
	// 		return 1 + recursive call to function (using same desired cell val and next cell's coordinates)
	// else
	// 	return 0
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
	// A recursive function that takes in a starting set of coordinates and looks downward
	// to find out the length of the line of consecutive same game markers
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
	// A recursive function that takes in a starting set of coordinates and looks diagonally 
	// down-right to find out the length of the line of consecutive same game markers
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
	// A recursive function that takes in a starting set of coordinates and looks diagonally 
	// down-left to find out the length of the line of consecutive same game markers
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

	var checkPlayerWin = function(playerIndex) {
		var remainingCells;

		// Go through every cell, using each one as starting point for win checking
		for (var row = 0; row < $scope.gameBoardSize.$value; row++) {
			for (var col = 0; col < $scope.gameBoardSize.$value; col++) {
				// check horizontally from $scope cell
				// only if it is possible for $scope line to be long enough to win
				remainingCells = $scope.gameBoardSize.$value - col;
				if (remainingCells >= $scope.winLineLength.$value) {
					if (getHorLineLength(playerIndex, row, col) >= $scope.winLineLength.$value) {
						return true;
					}
				}
				// check vertically from $scope cell
				remainingCells = $scope.gameBoardSize.$value - row;
				if (remainingCells >= $scope.winLineLength.$value) {
					if (getVertLineLength(playerIndex, row, col) >= $scope.winLineLength.$value) {
						return true;
					}
				}
				// check diagonally down-right from $scope cell
				remainingCells = Math.min($scope.gameBoardSize.$value - row, $scope.gameBoardSize.$value - col);
				if (remainingCells >= $scope.winLineLength.$value) {
					if (getDiagRightLineLength(playerIndex, row, col) >= $scope.winLineLength.$value) {
						return true;
					}
				}
				// check diagonally down-left from $scope cell
				remainingCells = Math.min($scope.gameBoardSize.$value - row, col + 1);
				if (remainingCells >= $scope.winLineLength.$value) {
					if (getDiagLeftLineLength(playerIndex, row, col) >= $scope.winLineLength.$value) {
						return true;
					}
				}
			}
		}

		return false;
	};


	$scope.getWinMsg = function() {
		// -2 means there is no winner
		if ($scope.winnerIndex.$value === -2) {
			return "";
		}
		// -1 means draw
		else if ($scope.winnerIndex.$value === -1) {
			return "DRAW";
		}
		// 0 or 1 means player 1 or player 2
		else {
			return "Player " + ($scope.winnerIndex.$value + 1) + " WINS!";
		}
	};


	$scope.resetGameBoard = function() {
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
	};






	// START
	
	// gameBoard is a $firebaseArray so it cannot use $bindTo
	$scope.gameBoard.$loaded()
		.then(function() {
			$scope.resetGameBoard();
		});

	winLineLength.$bindTo($scope, 'winLineLength')
	// $scope.winLineLength.$loaded()
		.then(function() {
			$scope.winLineLength.$value = 3;
			// $scope.winLineLength.$save();
		});
	
	gameBoardSize.$bindTo($scope, 'gameBoardSize')
	// $scope.gameBoardSize.$loaded()
		.then(function() {
			$scope.gameBoardSize.$value = 3;
			// $scope.gameBoardSize.$save();
		});
	
	currentPlayerIndex.$bindTo($scope, 'currentPlayerIndex')
	// $scope.currentPlayerIndex.$loaded()
		.then(function() {
			$scope.currentPlayerIndex.$value = 0;
			// $scope.currentPlayerIndex.$save();
		});
	
	moveCount.$bindTo($scope, 'moveCount')
	// $scope.moveCount.$loaded()
		.then(function() {
			$scope.moveCount.$value = 0;
			// $scope.moveCount.$save();
		});

	winnerIndex.$bindTo($scope, 'winnerIndex')
	// $scope.winnerIndex.$loaded()
		.then(function() {
			$scope.winnerIndex.$value = -2;	// -2 means there is no winner
			// $scope.winnerIndex.$save();
		});
}