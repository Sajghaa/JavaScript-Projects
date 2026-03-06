export const cardSymbols = {
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'],
    fruits: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒', '🍑', '🥭'],
    emojis: ['😀', '😎', '🥳', '😍', '🤔', '😴', '🤯', '🥶', '🤠', '👻', '🤖', '🎃'],
    numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
};

// Default card set
export const defaultCardSet = cardSymbols.animals;

// Difficulty configurations
export const difficultyConfig = {
    easy: { rows: 3, cols: 4, totalCards: 12 },
    medium: { rows: 4, cols: 4, totalCards: 16 },
    hard: { rows: 6, cols: 6, totalCards: 36 }
};