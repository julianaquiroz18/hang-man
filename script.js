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
        alert("YOU WON!");
    }

}

function paintInitialstate() {
    graphics(0);
    document.querySelector(".instruction").textContent = "Press any key!!!";
    for (let letter = 0; letter < length; letter++) {
        word[letter] = "_";
    }
    hiddenWord.textContent = word.join(" ");
    console.log(word);
}

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

function getComplexity(complexity) {
    fetch(`${baseURL}v1/genword/${complexity}`)
        .then(response => response.json())
        .then(response => {
            getWordBody["complexity"] = response.complexity;
            getWord();
        })
        .catch(error => console.log(error))
}

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
            console.log(wordID);
            console.log(length);
            paintInitialstate();
        })
        .catch(error => console.log(error))
}

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
        .catch(error =>
            console.log(error)
        )
}

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

function hitAction(wordArray) {
    missMessage.textContent = "";
    hitMessage.textContent = `You guessed right! Character "${checkCharacterBody["characters"][0]}" is valid`;
    wordArray.forEach((letter, index) => {
        if (letter != "_") {
            word[index] = letter;
        }
    })
    hiddenWord.textContent = word.join(" ");
    console.log(word.join(""))
    verifyWord();
}

function displayLostMessage() {
    setTimeout(() => {
        missMessage.textContent = "";
        alert("¡¡¡ GAME OVER !!!");
    }, 100);
}

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
        .catch(error =>
            console.log(error)
        )

}