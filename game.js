document.addEventListener('DOMContentLoaded', () => {

	class Tetromino {
		rotations;
		color;
		position;
		rotation;
		shape;
		miniShape;

		constructor(rotations, miniRotation, color) {
			this.rotations = rotations;
			this.color = color;
			this.rotation = 0;
			this.shape = rotations[this.rotation];
			this.miniShape = miniRotation;
			this.position = rowLength / 2;
		}
	}

	document.addEventListener('keyup', control);


	const startPauseButton = document.getElementById('start-button');
	startPauseButton.addEventListener('click', () => {
		if (dropInterval) {
			clearInterval(dropInterval);
			dropInterval = null
		} else {
			showBlock();
			dropInterval = setInterval(moveDown, 1000);
			showUpcomingTetromino()
		}
	});

	const grid = document.getElementById('grid');
	const mini_grid = document.getElementById('next-shape');
	const rowLength = 10;
	const gridSize = 200;
	const miniGridSize = 25;
	const miniGridRowLength = 5;
	const scoreDisplay = document.getElementById('score');
	let dropInterval = null;
	let playerScore = 0;

	// create squares in the grid
	for (let i = 0; i < gridSize; i++) {
		grid.innerHTML += '<div></div>';
	}

	// create a bottom row where the blocks should stop
	for (let i = 0; i < rowLength; i++) {
		grid.innerHTML += '<div class="stop"></div>';
	}

	for (let i = 0; i < miniGridSize; i++) {
		mini_grid.innerHTML += '<div class="next-block"></div>';
	}

	let gridBlockDivs = Array.from(document.querySelectorAll('#grid div'));
	const previewSquares = document.querySelectorAll('.next-block');

	// Initialise tetrominos
	const L = new Tetromino(
		[[1, rowLength + 1, rowLength * 2 + 1, 2], [rowLength, rowLength + 1, rowLength + 2, rowLength * 2 + 2], [1, rowLength + 1, rowLength * 2 + 1, rowLength * 2], [rowLength, rowLength * 2, rowLength * 2 + 1, rowLength * 2 + 2]],
		[1, miniGridRowLength + 1, miniGridRowLength * 2 + 1, 2],
		'green'
	);

	const S = new Tetromino(
		[[0, rowLength, rowLength + 1, rowLength * 2 + 1], [rowLength + 1, rowLength + 2, rowLength * 2, rowLength * 2 + 1]],
		[0, miniGridRowLength, miniGridRowLength + 1, miniGridRowLength * 2 + 1],
		'salmon'
	);

	const T = new Tetromino(
		[[1, rowLength, rowLength + 1, rowLength + 2], [1, rowLength + 1, rowLength + 2, rowLength * 2 + 1], [rowLength, rowLength + 1, rowLength + 2, rowLength * 2 + 1], [1, rowLength, rowLength + 1, rowLength * 2 + 1]],
		[1, miniGridRowLength, miniGridRowLength + 1, miniGridRowLength + 2],
		'orange'
	);

	const O = new Tetromino(
		[[0, 1, rowLength, rowLength + 1]],
		[0, 1, miniGridRowLength, miniGridRowLength + 1],
		'cyan'
	);

	const I = new Tetromino(
		[[1, rowLength + 1, rowLength * 2 + 1, rowLength * 3 + 1], [rowLength, rowLength + 1, rowLength + 2, rowLength + 3]],
		[1, miniGridRowLength + 1, miniGridRowLength * 2 + 1],
		'blue'
	);

	const allTetrominos = [L, S, T, O, I];

	let currentTetromino = selectRandomTetromino();
	let nextRandomTetromino = selectRandomTetromino();

	function selectRandomTetromino() {
		const randomIndex = Math.floor(Math.random() * allTetrominos.length);
		return Object.assign({}, allTetrominos[randomIndex]);
	}

	function showBlock() {
		currentTetromino.shape.forEach(blockIndex => {
			gridBlockDivs[currentTetromino.position + blockIndex].style.backgroundColor = currentTetromino.color;
		});
	}

	function hideBlock() {
		currentTetromino.shape.forEach(blockIndex => {
			gridBlockDivs[currentTetromino.position + blockIndex].style.backgroundColor = '';
		});
	}

	function moveDown() {
		hideBlock();
		currentTetromino.position += rowLength;
		showBlock();
		stop();
	}


	// move the tetromino left unless it can't
	function moveLeft() {
		hideBlock();
		const isAtLeftEdge = currentTetromino.shape.some(blockIndex => (currentTetromino.position + blockIndex) % rowLength === 0);
		const isSquareOccupied = currentTetromino.shape.some(blockIndex => gridBlockDivs[currentTetromino.position + blockIndex].classList.contains('stop'));

		if (!isAtLeftEdge) {
			currentTetromino.position -= 1
		} else if (isSquareOccupied) {
			currentTetromino.position += 1
		}
		showBlock();
	}

	function moveRight() {
		hideBlock();
		const isAtRightEdge = currentTetromino.shape.some(blockIndex => (currentTetromino.position + blockIndex) % rowLength === rowLength - 1);
		const isSquareOccupied = currentTetromino.shape.some(blockIndex => gridBlockDivs[currentTetromino.position + blockIndex].classList.contains('stop'));

		if (!isAtRightEdge) {
			currentTetromino.position += 1
		} else if (isSquareOccupied) {
			currentTetromino.position -= 1
		}
		showBlock();
	}

	// stop tetromino
	function stop() {
		const cannotGoFurther = currentTetromino.shape.some(blockIndex => gridBlockDivs[currentTetromino.position + blockIndex + rowLength].classList.contains('stop'));
		if (cannotGoFurther) {
			// console.log('Cannot go further.......', currentTetromino);
			currentTetromino.shape.forEach(blockIndex => {
				gridBlockDivs[currentTetromino.position + blockIndex].classList.add('stop');
			});
			// drop new tetromino
			currentTetromino = Object.assign({}, nextRandomTetromino);
			nextRandomTetromino = selectRandomTetromino();
			showBlock();
			showUpcomingTetromino();
			updateScore();
			endGame()
		}
	}


	function rotate() {
		hideBlock();
		// check if rotated block will overspill
		let rotatedTetromino = Object.assign({}, currentTetromino);
		performRotation(rotatedTetromino);
		const isAtLeftEdge = rotatedTetromino.shape.some(blockIndex => (rotatedTetromino.position + blockIndex) % rowLength === 0);
		const isAtRightEdge = rotatedTetromino.shape.some(blockIndex => (rotatedTetromino.position + blockIndex) % rowLength === rowLength - 1);
		const isSquareOccupied = rotatedTetromino.shape.some(blockIndex => gridBlockDivs[rotatedTetromino.position + blockIndex].classList.contains('stop'));

		if (!isAtRightEdge && !isAtLeftEdge && !isSquareOccupied) {
			performRotation(currentTetromino);
		}
		showBlock();
	}

	function performRotation(tetromino) {
		const nextShape = tetromino.rotation + 1;
		if (nextShape === tetromino.rotations.length) {
			tetromino.rotation = 0;
			tetromino.shape = tetromino.rotations[tetromino.rotation];
		} else {
			tetromino.rotation = nextShape;
			tetromino.shape = tetromino.rotations[nextShape];
		}
	}

	// control the tetromino with arrow keys
	function control(event) {
		switch (event.key) {
			case 'ArrowLeft':
				moveLeft();
				break;
			case 'ArrowUp':
				rotate();
				break;
			case 'ArrowRight':
				moveRight();
				break;
			case 'ArrowDown':
				moveDown();
				break;
		}
	}

	// show upcoming tetromino in mini-grid
	function showUpcomingTetromino() {
		const randomUpcomingTetromino = Object.assign({}, nextRandomTetromino);
		randomUpcomingTetromino.position = 6;
		//clear mini grid
		previewSquares.forEach(square => {
			square.style.backgroundColor = ''
		});
		randomUpcomingTetromino.miniShape.forEach(blockIndex => {
			previewSquares[randomUpcomingTetromino.position + blockIndex].style.backgroundColor = randomUpcomingTetromino.color;
		})
	}

	// update score
	function updateScore() {
		for (let i = 0; i < gridSize; i += rowLength) {
			const row = Array(rowLength).fill().map((item, index) => index + i);
			console.log('row:', row);
			const isComplete = row.every(blockIndex => gridBlockDivs[blockIndex].classList.contains('stop'));

			if (isComplete) {
				console.log('is complete..................');
				playerScore += rowLength;
				scoreDisplay.innerHTML = playerScore;
				row.forEach(blockIndex => {
					gridBlockDivs[blockIndex].classList.remove('stop');
					gridBlockDivs[blockIndex].style.backgroundColor = ''
				});
				const squaresRemoved = gridBlockDivs.splice(i, rowLength);
				gridBlockDivs = squaresRemoved.concat(gridBlockDivs);
				gridBlockDivs.forEach(cell => grid.appendChild(cell))
			}
		}
	}

	// check if the player ran out of space and stop the game
	function isScreenFull() {
		return currentTetromino.shape.some(blockIndex => gridBlockDivs[currentTetromino.position + blockIndex].classList.contains('stop'))
	}

	function endGame() {
		if (isScreenFull()) {
			document.getElementById('game-over').innerHTML = 'Game Over!!!';
			clearInterval(dropInterval)
		}

	}
});
