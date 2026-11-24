const wordDisplay = document.getElementById('word-display');
const guessesDiv = document.getElementById('guesses');
const livesDiv = document.getElementById('lives');
const guessInput = document.getElementById('guess-input');
const guessButton = document.getElementById('guess-button');
const hintButton = document.getElementById('hint-button');

let word = '';
let guessedLetters = [];
let incorrectGuesses = 0;
let lives = 6;
let hintUsed = false;

async function getWord() {
    // static build: the word list ships next to the page
    try {
        const res = await fetch('words.txt');
        const words = (await res.text()).split(/\r?\n/).map(w => w.trim()).filter(Boolean);
        if (words.length) return words[Math.floor(Math.random() * words.length)];
    } catch (e) { /* fall through */ }
    return ['BRAKES','ORBIT','THRUST','PAYLOAD','MODULE','CRATER'][Math.floor(Math.random()*6)];
}

function displayWord() {
    let display = '';
    for (const letter of word) {
        if (guessedLetters.includes(letter)) {
            display += letter;
        } else {
            display += '_';
        }
    }
    wordDisplay.textContent = display;
}

function updateGuesses() {
    guessesDiv.textContent = `Guessed letters: ${guessedLetters.join(', ')}`;
    livesDiv.textContent = `Lives: ${lives - incorrectGuesses}`;
}

function checkWin() {
    if (word.split('').every(letter => guessedLetters.includes(letter))) {
        endGame('You win!');
    }
}

function checkLoss() {
    if (incorrectGuesses >= lives) {
        endGame(`You lose! The word was: ${word}`);
    }
}

function endGame(message) {
    guessInput.disabled = true;
    guessButton.disabled = true;
    hintButton.disabled = true;
    alert(message);
}

guessButton.addEventListener('click', () => {
    const guess = guessInput.value.toLowerCase();
    guessInput.value = '';

    if (guess && !guessedLetters.includes(guess)) {
        guessedLetters.push(guess);
        if (word.includes(guess)) {
            // Correct guess
        } else {
            incorrectGuesses++;
        }
        displayWord();
        updateGuesses();
        checkWin();
        checkLoss();
    }
});

hintButton.addEventListener('click', () => {
    if (!hintUsed) {
        for (const letter of word) {
            if (!guessedLetters.includes(letter)) {
                guessedLetters.push(letter);
                hintUsed = true;
                displayWord();
                updateGuesses();
                checkWin();
                break;
            }
        }
    } else {
        alert('Hint already used!');
    }
});

async function init() {
    word = await getWord();
    displayWord();
    updateGuesses();
}

init();
