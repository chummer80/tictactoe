angular
	.module('tictactoe')
	.controller(
			'GameController', 
			['$scope', '$firebaseObject', '$firebaseArray', GameController]);

function GameController($scope, $firebaseObject, $firebaseArray) {

	var winLineLength = 3;
	var gameBoardSize = 3;
	var currentPlayerIndex = 0;
	var moveCount = 0;

	// $scope.gameBoard will be a 2D array that hold a player index in each cell to indicate which
	// player has claimed that cell. If no one has claimed it then it holds null.
	$scope.gameBoard = [];	
	$scope.winnerIndex = null;


	$scope.cellClick = function(row, col) {
		// only finish the move if empty cell was clicked and game hasn't been won yet
		if ($scope.gameBoard[row][col] === null && $scope.winnerIndex === null) {
			// claim $scope cell. It now belongs to the current player.
			$scope.gameBoard[row][col] = currentPlayerIndex;
			moveCount++;
			
			// check win condition
			if (checkPlayerWin(currentPlayerIndex)) {
				$scope.winnerIndex = currentPlayerIndex;
			}
			// if there are no more available spaces it's a draw
			else if (moveCount >= (gameBoardSize * gameBoardSize)) {
				$scope.winnerIndex = -1;
			}
			// toggle which player's turn it is
			else {
				currentPlayerIndex = 1 - currentPlayerIndex;
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
			if (col + 1 >= gameBoardSize) {
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
			if (row + 1 >= gameBoardSize) {
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
			if ((row + 1 >= gameBoardSize )|| (col + 1 >= gameBoardSize)) {
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
			if ((row + 1 >= gameBoardSize )|| (col - 1 < 0)) {
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
		for (var row = 0; row < gameBoardSize; row++) {
			for (var col = 0; col < gameBoardSize; col++) {
				// check horizontally from $scope cell
				// only if it is possible for $scope line to be long enough to win
				remainingCells = gameBoardSize - col;
				if (remainingCells >= winLineLength) {
					if (getHorLineLength(playerIndex, row, col) >= winLineLength) {
						return true;
					}
				}
				// check vertically from $scope cell
				remainingCells = gameBoardSize - row;
				if (remainingCells >= winLineLength) {
					if (getVertLineLength(playerIndex, row, col) >= winLineLength) {
						return true;
					}
				}
				// check diagonally down-right from $scope cell
				remainingCells = Math.min(gameBoardSize - row, gameBoardSize - col);
				if (remainingCells >= winLineLength) {
					if (getDiagRightLineLength(playerIndex, row, col) >= winLineLength) {
						return true;
					}
				}
				// check diagonally down-left from $scope cell
				remainingCells = Math.min(gameBoardSize - row, col + 1);
				if (remainingCells >= winLineLength) {
					if (getDiagLeftLineLength(playerIndex, row, col) >= winLineLength) {
						return true;
					}
				}
			}
		}

		return false;
	};


	$scope.getWinMsg = function() {
		if ($scope.winnerIndex === null) {
			return "";
		}
		else if ($scope.winnerIndex === -1) {
			return "DRAW";
		}
		else {
			return "Player " + ($scope.winnerIndex + 1) + " WINS!";
		}
	};


	$scope.resetGame = function() {
		// initialize game board
		for (var row = 0; row < gameBoardSize; row++) {
			$scope.gameBoard[row] = [];
			for(var col = 0; col < gameBoardSize; col++) {
				$scope.gameBoard[row][col] = null;
			}
		}
		// initialize game state
		currentPlayerIndex = 0;
		$scope.winnerIndex = null;
		moveCount = 0;
	};






	// START

	$scope.resetGame();
}