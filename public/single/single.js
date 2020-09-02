let container = document.querySelector(".container");
let gameScreen = document.querySelector(".game-screen");
let scoreScreen = document.querySelector(".score-menu");
let isTurnDiv = document.querySelector(".is-turn");
let player1Div = document.querySelector(".player1-score");
let player2Div = document.querySelector(".player2-score");
let gameEnd = document.querySelector('.game__end');
let playAgainButton = gameEnd.querySelector('.play__again__button');
let backHomeButton = gameEnd.querySelector('.back__home');
let winnerDiv = gameEnd.querySelector('h1');

// const socket = io.connect('http://192.168.43.10:3000/');
// const socket = io();

let colors = [
  "start-6",
  "arrow-down",
  "penta",
  "start-4",
  "rhoumbus",
  "triangle",
  "heart",
  "lightning",
];

const numberOfCard = 16;
let cards = [];
let cardsToVerify = [];
let cardsToSent = [];

let userName = prompt('Escribe Tu Nombre: ');
let playAgainMessage = false;

let enemyName = 'Computadora';

let userPoint = 0,
  enemyPoint = 0;

let myTurn = true;
let computerCardToOpen = 0;
let computerTempCard;

let currectPlayer = '';
let playerNumber = 0;

function resetGame() {
  gameScreen.innerHTML = '';

  hideElement(gameEnd);
  showElement(container);
  
  cards = [];
  gameScreen.innerHTML = '';
  computerCardToOpen = 0;
  userPoint = 0;
  enemyPoint = 0;
  player1Div.innerText = `${userName}: ${userPoint}`;
  player2Div.innerText = `${enemyName}: ${enemyPoint}`;

  isTurn();
}

createBoard();

function createBoard(){
    resetGame();

    let colors1 = colors.sort(() => 0.5 - Math.random());
    let colors2 = [...colors].sort(() => 0.5 - Math.random());

    for (let i = 0; i < numberOfCard; i++) {
        let card = document.createElement("div");
        card.classList.add("card");
        card.id = i;
        if (i <= 7) card.classList.add(colors1[i]);

        if (i > 7) card.classList.add(colors2[i - 8]);
        card.classList.add("hide");

        cards.push(card);
        gameScreen.appendChild(card);
    }

    cards.forEach((card) => {
        card.addEventListener("click", cardClicked);
    });
}

function cardClicked(event) {
    if(myTurn){
    let elementClicked = event.target;
    computerTempCard = elementClicked;
    elementClicked.classList.add('flip');

    setTimeout(() =>{
      elementClicked.classList.remove('flip');
      if( elementClicked.classList.contains('hide') ){
          elementClicked.classList.remove("hide");
          cardsToVerify.push(elementClicked);
          cardsToSent.push(elementClicked.id);
  
          if (cardsToVerify.length === 2) {
              areEqual(cardsToVerify);
          }
  
      } else {
          alert('Esta Carta Ya Esta Revelada!\n Presione Otra!');
          return;
      }
    },500)

    } else {
        isTurnDiv.innerText = `No es tu turno!`;
        isTurnDiv.classList.add('not-turn');

        setTimeout( () => {
            isTurnDiv.classList.remove('not-turn');

            if(myTurn) {
                isTurnDiv.innerText = `Es turno de : ${userName}`;
            } else {
                isTurnDiv.innerText = `Es turno de : ${enemyName}`;
            }

        },2000)
    
  }   
}

function compuCardClicked(){
    let chooseCard;
    if(Math.random() < 0.4 && cardsToVerify[0]){
        let cardEqual = cards.filter( card => 
            card.classList[1] === computerTempCard.classList[1] &&
            card.id !== computerTempCard.id
        );

        chooseCard = cardEqual[0];  
        chooseCard.classList.remove("hide");
    }else {
        let cardsAvailable = cards.filter(card=> card.classList.contains('hide'));
        chooseCard = randomFrom(cardsAvailable);
        computerTempCard = chooseCard;
        chooseCard.classList.remove("hide");
    }

    cardsToVerify.push(chooseCard);
    cardsToSent.push(chooseCard.id);

    if (cardsToVerify.length === 2) {
        areEqual(cardsToVerify);
    }
}

function randomFrom(array){
    return array[Math.floor(Math.random() * array.length)];
}

function areEqual(array) {
  if (array[0].classList[1] == array[1].classList[1]) {
    cardsToVerify = [];
    cardsToSent = [];
    setPoint();
  } else {
    setTimeout(() => {
        cardsToVerify.forEach((card) => {
            card.classList.add("flip");
            setTimeout(() =>{
              card.classList.remove('flip')
              card.classList.add("hide");
            },500);
        });
        cardsToVerify = [];
        cardsToSent = [];
        swapTurn();
        isTurn();
    }, 500);
  }

  if (gameCompleted()) {
    isTurnDiv.classList.add('win');
    
    if (userPoint > enemyPoint) {
        isTurnDiv.innerText = `El Ganador es: ${userName}`;
        winnerDiv.innerText = `El Ganador es: ${userName}`;
    }else if (userPoint < enemyPoint) {
        isTurnDiv.innerText = `El Ganador es: ${enemyName}`;
        winnerDiv.innerText = `El Ganador es: ${enemyName}`;
    }else {
        isTurnDiv.innerText = `Empate!`;
        winnerDiv.innerText = `Empate!`;
    }

    playAgain();

    setTimeout(()=>{
      isTurnDiv.classList.remove('win');
    },2000)
  }
}

function swapTurn() {
  myTurn = !myTurn;
}

function isTurn() {
  if (myTurn) {
    isTurnDiv.innerText = `Es turno de : ${userName}`;
    currectPlayer = userName;
  } else {
    isTurnDiv.innerText = `Es turno de : ${enemyName}`;
    currectPlayer = enemyName;

     computerCardToOpen = 2;

    let timing = setInterval(() => {
        if(computerCardToOpen !== 0 ){
            if( !gameCompleted() ){
                compuCardClicked();

            } else {
                clearInterval(timing);
            }

            setTimeout(() => {
                if( computerCardToOpen === 1 && !myTurn) computerCardToOpen = 2;
                computerCardToOpen--;
            }, 600);

        }else{
            clearInterval(timing);
        }
    }, 1000);
  }
}

function gameCompleted() {
  return cards.every((card) => card.classList.contains("hide") == false);
}

function setPoint() {
  if (myTurn) {
    userPoint++;
  } else {
    enemyPoint++;
  }

  player1Div.innerText = `${userName}: ${userPoint}`;
  player2Div.innerText = `${enemyName}: ${enemyPoint}`;
}

function playAgain(){
  showElement(playAgainButton,true);
  hideElement(container);
  showElement(gameEnd);
}

function showElement(element,v = false) {
  if(element === container){
    element.style.display = "";
    return;
  }

  if(v){
    element.style.visibily= "visible";

  }

  element.style.display = "flex";

}

function hideElement(element,v = false) {
  if(v){
    element.style.visibily= "hidden";
  }
    element.style.display = "none";
}

playAgainButton.addEventListener('click', () => {
    hideElement(playAgainButton,true);
    createBoard();
})

backHomeButton.addEventListener('click',() => {
  let origin = window.location.origin;
  window.open(`${origin}`,'_parent');
})

