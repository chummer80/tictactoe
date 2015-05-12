angular
	.module("tictactoe")
	.controller("GameController", GameController);

function GameController() {

	this.winLineLength = 3;
	this.gameBoardSize = 3;

	this.currentPlayerIndex = 0;
	this.winnerIndex = null;
	this.moveCount = 0;

	// this.gameBoard will be a 2D array that hold a player index in each cell to indicate which
	// player has claimed that cell. If no one has claimed it then it holds null.
	this.gameBoard = [];	


	this.cellClick = function(row, col) {
		// only finish the move if empty cell was clicked and game hasn't been won yet
		if (this.gameBoard[row][col] === null && this.winnerIndex === null) {
			// claim this cell. It now belongs to the current player.
			this.gameBoard[row][col] = this.currentPlayerIndex;
			this.moveCount++;
			
			// check win condition
			if (this.checkPlayerWin(this.currentPlayerIndex)) {
				this.winnerIndex = this.currentPlayerIndex;
			}
			// if there are no more available spaces it's a draw
			else if (this.moveCount >= (this.gameBoardSize * this.gameBoardSize)) {
				this.winnerIndex = -1;
			}
			// toggle which player's turn it is
			else {
				this.currentPlayerIndex = 1 - this.currentPlayerIndex;
			}

		}
	};
	

	// A recursive function that takes in a starting set of coordinates and looks right
	// to find out the length of the line of consecutive same game markers
	this.getHorLineLength = function(searchVal, row, col) {
	// if current cell val is the one we're looking for, then
	// 	if there are no more cells to check (end of row) then
	// 		return 1;
	// 	else 
	// 		return 1 + recursive call to function (using same desired cell val and next cell's coordinates)
	// else
	// 	return 0
		if (this.gameBoard[row][col] === searchVal) {
			// 	if there are no more cells to check (end of row) then
			if (col + 1 >= this.gameBoardSize) {
				return 1;
			}
			// check if next cell should add on to the length counter
			else {
				return (1 + this.getHorLineLength(searchVal, row, col + 1));
			}
		}
		// search value was not found, so this line has no length.
		else {
			return 0;
		}
	};
	// A recursive function that takes in a starting set of coordinates and looks downward
	// to find out the length of the line of consecutive same game markers
	this.getVertLineLength = function(searchVal, row, col) {
		if (this.gameBoard[row][col] === searchVal) {
			// 	if there are no more cells to check (end of column) then
			if (row + 1 >= this.gameBoardSize) {
				return 1;
			}
			// check if next cell should add on to the length counter
			else {
				return (1 + this.getVertLineLength(searchVal, row + 1, col));
			}
		}
		// search value was not found, so this line has no length.
		else {
			return 0;
		}
	};
	// A recursive function that takes in a starting set of coordinates and looks diagonally 
	// down-right to find out the length of the line of consecutive same game markers
	this.getDiagRightLineLength = function(searchVal, row, col) {
		if (this.gameBoard[row][col] === searchVal) {
			// 	if there are no more cells to check (end of row or column) then
			if ((row + 1 >= this.gameBoardSize )|| (col + 1 >= this.gameBoardSize)) {
				return 1;
			}
			// check if next cell should add on to the length counter
			else {
				return (1 + this.getDiagRightLineLength(searchVal, row + 1, col + 1));
			}
		}
		// search value was not found, so this line has no length.
		else {
			return 0;
		}
	};
	// A recursive function that takes in a starting set of coordinates and looks diagonally 
	// down-left to find out the length of the line of consecutive same game markers
	this.getDiagLeftLineLength = function(searchVal, row, col) {
		if (this.gameBoard[row][col] === searchVal) {
			// 	if there are no more cells to check (end of row or column) then
			if ((row + 1 >= this.gameBoardSize )|| (col - 1 < 0)) {
				return 1;
			}
			// check if next cell should add on to the length counter
			else {
				return (1 + this.getDiagLeftLineLength(searchVal, row + 1, col - 1));
			}
		}
		// search value was not found, so this line has no length.
		else {
			return 0;
		}
	};

	this.checkPlayerWin = function(playerIndex) {
		var remainingCells;

		// Go through every cell, using each one as starting point for win checking
		for (var row = 0; row < this.gameBoardSize; row++) {
			for (var col = 0; col < this.gameBoardSize; col++) {
				// check horizontally from this cell
				// only if it is possible for this line to be long enough to win
				remainingCells = this.gameBoardSize - col;
				if (remainingCells >= this.winLineLength) {
					if (this.getHorLineLength(playerIndex, row, col) >= this.winLineLength) {
						return true;
					}
				}
				// check vertically from this cell
				remainingCells = this.gameBoardSize - row;
				if (remainingCells >= this.winLineLength) {
					if (this.getVertLineLength(playerIndex, row, col) >= this.winLineLength) {
						return true;
					}
				}
				// check diagonally down-right from this cell
				remainingCells = Math.min(this.gameBoardSize - row, this.gameBoardSize - col);
				if (remainingCells >= this.winLineLength) {
					if (this.getDiagRightLineLength(playerIndex, row, col) >= this.winLineLength) {
						return true;
					}
				}
				// check diagonally down-left from this cell
				remainingCells = Math.min(this.gameBoardSize - row, col + 1);
				if (remainingCells >= this.winLineLength) {
					if (this.getDiagLeftLineLength(playerIndex, row, col) >= this.winLineLength) {
						return true;
					}
				}
			}
		}

		return false;
	};


	this.getWinMsg = function() {
		if (this.winnerIndex === null) {
			return "";
		}
		else if (this.winnerIndex === -1) {
			return "DRAW";
		}
		else {
			return "Player " + (this.winnerIndex + 1) + " WINS!";
		}
	};


	// initialize game board
	this.resetGame = function() {
		for (var row = 0; row < this.gameBoardSize; row++) {
			this.gameBoard[row] = [];
			for(var col = 0; col < this.gameBoardSize; col++) {
				this.gameBoard[row][col] = null;
			}
		}
	};






	// START

	this.resetGame();
}