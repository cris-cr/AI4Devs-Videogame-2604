# Sudoku Game Development Prompts

## Prompt 1: Game Requirements & Specification

### Context
Creating a Sudoku board game using HTML, CSS, and JavaScript.

### Goal
Create a sudoku board game with the following features:

#### Game Board
- 9x9 grid
- Partially prefilled on page load
- User can fill numbers respecting sudoku rules

#### Game Mechanics
- **Annotations**: User-entered suggested values (smaller numbers showing possible values)
- **Values**: User-entered actual numbers
- **Auto-clear Annotations Rule**: When a user enters a value in a field, all annotations of that number are cleared from:
  - The same 3x3 quadrant
  - The same row
  - The same column

#### Annotations Details
- Each field can hold annotations for all numbers (1-9)
- Annotations are cleared when:
  - A value matching that annotation number is placed in the same quadrant, row, or column

#### UI Design
- 9x9 grid, centered on the page
- Toggle button to switch between:
  - Annotation mode (adding possible values)
  - Value mode (adding actual numbers)
- Tools panel below the grid

---

## Prompt 2: Build Complete Game

### Requirements
- Build the entire game with HTML, CSS, and JavaScript
- **Color Design**:
  - Good UI colors with strong contrast (accessibility-first)
  - Prefilled system numbers: distinct color (e.g., darker/bolder)
  - User-entered values: different color (e.g., blue)
  - Annotations: small numbers, well-placed in fields
- **Annotations Layout**: Each field holds 9 annotations in a small 3x3 grid within the cell
- **Features**:
  - Board initialization with partially filled values
  - Toggle mode button
  - Add/remove values and annotations
  - Smart annotation clearing based on sudoku rules
  - Sudoku validation

---

## Prompt 3: Update Board with Invalid Entry Feedback

### Requirements
- When user enters an incorrect number (violates sudoku rules):
  - Display the number in the cell
  - Show it in red color indicating an error
  - Allow the user to see the mistake and correct it

---

## Prompt 4: Auto-clear Invalid Entries & Random Board Generation

### Requirements
- **Auto-clear Invalid Entries**: When user enters an invalid number:
  - Display it in red for 3 seconds
  - Automatically clear the field after 3 seconds
  - User doesn't need to manually remove it
- **Dynamic Board Generation**: 
  - Generate a new random Sudoku board each time the page loads
  - Create thousands of possible unique combinations
  - Each board is a valid Sudoku puzzle with some cells prefilled

---

## Prompt 5: Add Timer & Success Modal

### Requirements
- **Timer Display**:
  - Show a timer on the page that starts when the game loads
  - Display in format: MM:SS
  - Timer visible at all times
- **Completion Detection**:
  - Detect when the board is completely filled with valid values
  - Validate all cells follow Sudoku rules
- **Success Modal/Message**:
  - Show success message when board is completed
  - Display total time taken
  - Provide "Play Again" button to start a new board
  - Timer restarts with each new board

---

## Prompt 6: Update Input Mode to Keyboard Shortcuts

### Requirements
- **Remove toggle button**: No more annotation/value mode toggle
- **Keyboard Shortcuts**:
  - Number key (1-9) = Enter value in selected cell
  - Shift + Number (1-9) = Add/Toggle annotation in selected cell
  - Shift + Number on existing annotation = Remove that specific annotation
  - Delete or Backspace = Clear the selected cell
- **Remove Clear Selected button**: Use Delete key instead
- **Info panel update**: Show keyboard shortcuts instead of mode indicator

