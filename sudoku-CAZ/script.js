// Sudoku Puzzle Generator
class PuzzleGenerator {
    static generatePuzzle(difficulty = 'medium') {
        const cellsToRemove = {
            easy: 30,
            medium: 45,
            hard: 55
        };

        let solution = this.generateSolution();
        let puzzle = solution.map(row => [...row]);
        const cellCount = cellsToRemove[difficulty] || 45;
        const positions = [];

        for (let i = 0; i < 81; i++) {
            positions.push(i);
        }

        // Shuffle positions
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        // Remove cells
        for (let i = 0; i < cellCount && i < positions.length; i++) {
            const pos = positions[i];
            const row = Math.floor(pos / 9);
            const col = pos % 9;
            puzzle[row][col] = 0;
        }

        return puzzle.flat();
    }

    static generateSolution() {
        const grid = Array(9).fill(null).map(() => Array(9).fill(0));
        this.fillGrid(grid);
        return grid;
    }

    static fillGrid(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

                    // Shuffle numbers
                    for (let i = numbers.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
                    }

                    for (let num of numbers) {
                        if (this.isValidForGrid(grid, row, col, num)) {
                            grid[row][col] = num;

                            if (this.fillGrid(grid)) {
                                return true;
                            }

                            grid[row][col] = 0;
                        }
                    }

                    return false;
                }
            }
        }
        return true;
    }

    static isValidForGrid(grid, row, col, num) {
        // Check row
        for (let c = 0; c < 9; c++) {
            if (grid[row][c] === num) return false;
        }

        // Check column
        for (let r = 0; r < 9; r++) {
            if (grid[r][col] === num) return false;
        }

        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (grid[r][c] === num) return false;
            }
        }

        return true;
    }
}

// Sudoku Game Logic
class SudokuGame {
    constructor() {
        this.grid = Array(81).fill(0);
        this.prefilled = Array(81).fill(false);
        this.userValues = Array(81).fill(0);
        this.annotations = Array(81).fill(null).map(() => new Set());
        this.invalidCells = new Set();
        this.invalidTimeouts = new Map();
        this.selectedCell = null;
        this.startTime = null;
        this.timerInterval = null;
        this.gameCompleted = false;
        this.initializeBoard();
        this.setupEventListeners();
        this.startTimer();
        this.render();
    }

    initializeBoard() {
        const puzzle = PuzzleGenerator.generatePuzzle('medium');

        puzzle.forEach((value, index) => {
            this.grid[index] = value;
            this.userValues[index] = 0;
            this.prefilled[index] = value !== 0;
        });
    }

    getRow(index) {
        return Math.floor(index / 9);
    }

    getCol(index) {
        return index % 9;
    }

    getBox(index) {
        const row = this.getRow(index);
        const col = this.getCol(index);
        return Math.floor(row / 3) * 3 + Math.floor(col / 3);
    }

    getIndicesInRow(index) {
        const row = this.getRow(index);
        return Array.from({ length: 9 }, (_, i) => row * 9 + i);
    }

    getIndicesInCol(index) {
        const col = this.getCol(index);
        return Array.from({ length: 9 }, (_, i) => i * 9 + col);
    }

    getIndicesInBox(index) {
        const box = this.getBox(index);
        const boxRow = Math.floor(box / 3) * 3;
        const boxCol = (box % 3) * 3;
        const indices = [];
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                indices.push(r * 9 + c);
            }
        }
        return indices;
    }

    isValidPlacement(index, value) {
        // Check row
        const rowIndices = this.getIndicesInRow(index);
        for (let i of rowIndices) {
            if (i !== index && this.getValue(i) === value) return false;
        }

        // Check column
        const colIndices = this.getIndicesInCol(index);
        for (let i of colIndices) {
            if (i !== index && this.getValue(i) === value) return false;
        }

        // Check 3x3 box
        const boxIndices = this.getIndicesInBox(index);
        for (let i of boxIndices) {
            if (i !== index && this.getValue(i) === value) return false;
        }

        return true;
    }

    getValue(index) {
        return this.userValues[index] || this.grid[index];
    }

    setValue(index, value) {
        if (this.prefilled[index]) return false;

        this.userValues[index] = value;

        // Clear any existing timeout for this cell
        if (this.invalidTimeouts.has(index)) {
            clearTimeout(this.invalidTimeouts.get(index));
            this.invalidTimeouts.delete(index);
        }

        if (value !== 0) {
            this.clearRelatedAnnotations(index, value);
            if (!this.isValidPlacement(index, value)) {
                this.invalidCells.add(index);
                // Auto-clear invalid entry after 3 seconds
                const timeoutId = setTimeout(() => {
                    this.userValues[index] = 0;
                    this.invalidCells.delete(index);
                    this.invalidTimeouts.delete(index);
                    this.render();
                }, 3000);
                this.invalidTimeouts.set(index, timeoutId);
            } else {
                this.invalidCells.delete(index);
            }
        } else {
            this.invalidCells.delete(index);
        }

        return true;
    }

    clearRelatedAnnotations(index, value) {
        const rowIndices = this.getIndicesInRow(index);
        const colIndices = this.getIndicesInCol(index);
        const boxIndices = this.getIndicesInBox(index);

        const allIndices = new Set([...rowIndices, ...colIndices, ...boxIndices]);

        for (let i of allIndices) {
            if (i !== index) {
                this.annotations[i].delete(value);
            }
        }
    }

    setAnnotation(index, value) {
        if (this.prefilled[index] || this.userValues[index] !== 0) return false;

        if (this.annotations[index].has(value)) {
            this.annotations[index].delete(value);
        } else {
            this.annotations[index].add(value);
        }

        return true;
    }

    clearCell(index) {
        if (this.prefilled[index]) return false;
        this.userValues[index] = 0;
        this.annotations[index].clear();
        this.invalidCells.delete(index);
        if (this.invalidTimeouts.has(index)) {
            clearTimeout(this.invalidTimeouts.get(index));
            this.invalidTimeouts.delete(index);
        }
        return true;
    }

    selectCell(index) {
        this.selectedCell = index;
        this.render();
    }

    handleCellInput(index, value) {
        if (value === 0) {
            this.clearCell(index);
        } else {
            this.setValue(index, value);
        }
        this.render();
    }

    handleAnnotationInput(index, value) {
        this.setAnnotation(index, value);
        this.render();
    }

    setupEventListeners() {
        document.getElementById('resetButton').addEventListener('click', () => {
            if (confirm('Reset board to initial state?')) {
                this.userValues = Array(81).fill(0);
                this.annotations = Array(81).fill(null).map(() => new Set());
                this.invalidCells.clear();
                this.invalidTimeouts.forEach(timeout => clearTimeout(timeout));
                this.invalidTimeouts.clear();
                this.selectedCell = null;
                this.render();
            }
        });

        document.getElementById('newGameButton').addEventListener('click', () => {
            this.newGame();
        });
    }

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            this.updateTimerDisplay();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        document.getElementById('timer').textContent = timeString;
    }

    getFormattedTime() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    isBoardComplete() {
        for (let i = 0; i < 81; i++) {
            const value = this.getValue(i);
            if (value === 0 || this.invalidCells.has(i)) {
                return false;
            }
        }
        return true;
    }

    showSuccessModal() {
        const modal = document.getElementById('successModal');
        const finalTime = document.getElementById('finalTime');
        finalTime.textContent = this.getFormattedTime();
        modal.classList.remove('hidden');
        this.stopTimer();
    }

    hideSuccessModal() {
        const modal = document.getElementById('successModal');
        modal.classList.add('hidden');
    }

    newGame() {
        this.hideSuccessModal();
        this.stopTimer();
        this.invalidTimeouts.forEach(timeout => clearTimeout(timeout));
        this.grid = Array(81).fill(0);
        this.prefilled = Array(81).fill(false);
        this.userValues = Array(81).fill(0);
        this.annotations = Array(81).fill(null).map(() => new Set());
        this.invalidCells.clear();
        this.invalidTimeouts.clear();
        this.selectedCell = null;
        this.gameCompleted = false;
        this.initializeBoard();
        this.startTimer();
        this.render();
    }

    updateModeLabel() {
        document.getElementById('modeLabel').textContent =
            this.isAnnotationMode ? 'Annotation Entry' : 'Value Entry';
    }

    render() {
        const grid = document.getElementById('sudokuGrid');
        grid.innerHTML = '';

        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';

            if (this.selectedCell === i) {
                cell.classList.add('selected');
            } else if (this.isRelated(i, this.selectedCell)) {
                cell.classList.add('related');
            }

            if (this.invalidCells.has(i)) {
                cell.classList.add('invalid-entry');
            }

            const value = this.getValue(i);

            if (value !== 0) {
                const valueEl = document.createElement('div');
                valueEl.className = 'value';
                valueEl.textContent = value;

                if (!this.prefilled[i]) {
                    cell.classList.add('user-entered');
                }

                cell.appendChild(valueEl);
            } else if (this.annotations[i].size > 0) {
                const annotationsEl = document.createElement('div');
                annotationsEl.className = 'annotations';

                for (let num = 1; num <= 9; num++) {
                    const annotation = document.createElement('div');
                    annotation.className = 'annotation';
                    if (this.annotations[i].has(num)) {
                        annotation.textContent = num;
                    }
                    annotationsEl.appendChild(annotation);
                }

                cell.appendChild(annotationsEl);
            }

            cell.addEventListener('click', () => this.selectCell(i));

            // Number pad input
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showNumberPad(i, e);
            });

            grid.appendChild(cell);
        }

        this.updateInfoPanel();
        this.checkCompletion();
    }

    checkCompletion() {
        if (!this.gameCompleted && this.isBoardComplete()) {
            this.gameCompleted = true;
            this.showSuccessModal();
        }
    }

    isRelated(index1, index2) {
        if (index2 === null) return false;
        if (index1 === index2) return false;

        const row1 = this.getRow(index1);
        const row2 = this.getRow(index2);
        const col1 = this.getCol(index1);
        const col2 = this.getCol(index2);
        const box1 = this.getBox(index1);
        const box2 = this.getBox(index2);

        return row1 === row2 || col1 === col2 || box1 === box2;
    }

    updateInfoPanel() {
        const info = document.getElementById('selectedInfo');
        if (this.selectedCell === null) {
            info.textContent = '📋 Click a cell to select | Shortcuts: 1-9 = Value | Shift+1-9 = Annotation | Delete = Clear';
        } else {
            const row = this.getRow(this.selectedCell) + 1;
            const col = this.getCol(this.selectedCell) + 1;
            const value = this.getValue(this.selectedCell);
            const valueText = value !== 0 ? `Value: ${value}` : 'Empty';
            info.textContent = `Cell (${row}, ${col}) - ${valueText} | 1-9 = Value | Shift+1-9 = Annotation | Delete = Clear`;
        }
    }

    showNumberPad(index, event) {
        if (this.prefilled[index]) return;

        const currentValue = this.getValue(index);
        const input = prompt(
            `${this.isAnnotationMode ? 'Annotations' : 'Value'} for cell (${this.getRow(index) + 1}, ${this.getCol(index) + 1}):\n` +
            `Enter 1-9, or 0 to clear:\n` +
            `Current: ${currentValue || 'empty'}`,
            ''
        );

        if (input !== null) {
            const value = parseInt(input);
            if (!isNaN(value) && value >= 0 && value <= 9) {
                this.handleCellInput(index, value);
            }
        }
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new SudokuGame();

    // Keyboard support for number input
    document.addEventListener('keydown', (e) => {
        if (game.selectedCell === null) return;

        // Check if key is a digit key (Digit0-Digit9) regardless of Shift
        const digitMatch = e.code.match(/Digit(\d)/);

        if (digitMatch) {
            const value = parseInt(digitMatch[1]);

            // Shift + Digit: Toggle annotation
            if (e.shiftKey && value >= 1 && value <= 9) {
                e.preventDefault();
                game.handleAnnotationInput(game.selectedCell, value);
            }
            // Just Digit (no Shift): Enter value
            else if (!e.shiftKey && !e.ctrlKey && !e.metaKey && value >= 1 && value <= 9) {
                e.preventDefault();
                game.handleCellInput(game.selectedCell, value);
            }
            // Digit 0 without shift: Clear cell
            else if (!e.shiftKey && value === 0) {
                e.preventDefault();
                game.clearCell(game.selectedCell);
                game.render();
            }
        }

        // Delete or Backspace: Clear cell
        if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            game.clearCell(game.selectedCell);
            game.render();
        }
    });
});
