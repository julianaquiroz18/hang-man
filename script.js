/**
 * Global Variables
 */
const baseURL = "http://hang-man-api.herokuapp.com/"
const button = document.querySelector(".start");
const hiddenWord = document.querySelector(".hidden-word");
const missMessage = document.querySelector(".miss-message");
const hitMessage = document.querySelector(".hit-message");
const myHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
}
let getWordBody = {
    "complexity": "",
}
let checkCharacterBody = {
    "characters": [
        ""
    ]
}

let wordID;
let length;
let word = [];
let missCounter = 0;
let status;

/**
 * Events
 */
button.addEventListener("click", start);
document.addEventListener("keydown", listenKeyboard);


function start() {
    status = "playing";
    missCounter = 0;
    getComplexity(document.querySelector(".complexity").value);
}

function listenKeyboard(e) {
    if (status === "playing") {
        checkCharacterBody["characters"][0] = e.key;
        verifyCharacter();
    } else {
        alert("Press START to play again!");
    }

}

/**
 * @method paintInitialstate
 * @description Display game uI initial state  
 */
function paintInitialstate() {
    graphics(0);
    document.querySelector(".instruction").textContent = "Press any key!!!";
    for (let letter = 0; letter < length; letter++) {
        word[letter] = "_";
    }
    hiddenWord.textContent = word.join(" ");
}

/**
 * @method graphics
 * @description Draw hang-man status
 * @param number  
 */
function graphics(stepNumber) {
    const image = document.querySelector(".hangman-picture");
    fetch(`${baseURL}v1/step/${stepNumber}`)
        .then(response => response.json())
        .then(response => {
            image.src = `data:image/data;base64,${response.image}`
            if (missCounter >= 9) {
                displayLostMessage();
            }
        })
        .catch(error => console.log(error))
}

/**
 * @method getComplexity
 * @description Asign complexity to body required by fetch in getWord function
 * @param string  
 */
function getComplexity(complexity) {
    fetch(`${baseURL}v1/genword/${complexity}`)
        .then(response => response.json())
        .then(response => {
            getWordBody["complexity"] = response.complexity;
            getWord();
        })
        .catch(error => console.log(error))
}

/**
 * @method getWord
 * @description Get hidden-word  
 */
function getWord() {
    object = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(getWordBody),
    }
    fetch(`${baseURL}v1/word`, object)
        .then(response => response.json())
        .then(response => {
            wordID = response.id;
            length = response.length;
            paintInitialstate();
        })
        .catch(error => console.log(error))
}

/**
 * @method verifyCharacter
 * @description Check if the characters belongs to hidden-word 
 */
function verifyCharacter() {
    object = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(checkCharacterBody),
    }
    fetch(`${baseURL}v1/word/${wordID}`, object)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                missAction();
                throw new Error("Character not valid");
            }
        })
        .then(response => {
            hitAction(response.word_characters)
        })
        .catch(error => console.log(error))
}

/**
 * @method missAction
 * @description Actions executed when the charater does not belong to hidden-word
 */
function missAction() {
    hitMessage.textContent = "";
    missMessage.textContent = `You failed! Character "${checkCharacterBody["characters"][0]}" is not valid`;
    missCounter += 1;
    if (missCounter <= 9) {
        graphics(missCounter);
    } else {
        missMessage.textContent = "";
        displayLostMessage();
    }
}

function displayLostMessage() {
    setTimeout(() => {
        missMessage.textContent = "";
        status = "finish";
        alert("¡¡¡ GAME OVER !!!");
    }, 100);
}

/**
 * @method missAction
 * @description Actions executed when the charater belongs to hidden-word
 */
function hitAction(wordArray) {
    missMessage.textContent = "";
    hitMessage.textContent = `You guessed right! Character "${checkCharacterBody["characters"][0]}" is valid`;
    wordArray.forEach((letter, index) => {
        if (letter != "_") {
            word[index] = letter;
        }
    })
    hiddenWord.textContent = word.join(" ");
    verifyWord();
}

/**
 * @method verifyWord
 * @description Verify if the word is correct
 */
function verifyWord() {
    object = {
        method: 'HEAD',
    }
    fetch(`${baseURL}v1/word/${wordID}/${word.join("")}`, object)
        .then(response => {
            if (response.ok) {
                status = "finish";
                hitMessage.textContent = "";
                alert("YOU WON!");
            } else {
                throw new Error("Wrong word");
            }
        })
        .catch(error => console.log(error))
}