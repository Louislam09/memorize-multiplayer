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
let toggleChat = document.querySelector('.toggle-chat');
let countMessageDiv = toggleChat.querySelector('.count-message');
let chatSection = document.querySelector('.chat-section');
let chatContent = document.querySelector('.chat-content');
let chatTextValue = document.querySelector('.chat-text');
let chatSendButton = document.querySelector('.send-message-button');

const socket = io();

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

let cards = [],
cardsToVerify = [],
cardsToSent = [];

let myName = prompt('Escribe Tu Nombre: '),
  enemyName,
  countMessage = 0,
  userPoint = 0,
  enemyPoint = 0,
  currectPlayer = '',
  playerNumber = 0;

let waitingOponentTime,
  myTurn = false,
  isChatOpen = false;
  
let notificationSound = new Audio('sound/notification.mp3');


socket.emit('user-name', myName);

socket.on('players-info', playerInformations => {
  for(const i in playerInformations){
    if(playerInformations[i].num === '-1'){
      isTurnDiv.innerText = 'Sorry, The Server Is Full';

    } else {
      playerNumber = parseInt(playerInformations[i].num);
      
      if(playerInformations[playerNumber].userName !== myName){
        enemyName = playerInformations[playerNumber].userName;
        break;
      }

      if(playerNumber === 0 && playerInformations[playerNumber].userName === myName){
        myTurn = true;
      }
    }
  }

  if(myName !== undefined && enemyName !== undefined) isTurn();
});

socket.on('colors', cardsFromServer => {
  createBoard(cardsFromServer);
})

function resetGame() {
  gameScreen.innerHTML = '';

  hideElement(gameEnd);
  showElement(container);
  
  cards = [];
  gameScreen.innerHTML = '';
  
  userPoint = 0;
  enemyPoint = 0;
  player1Div.innerText = `${myName}: ${userPoint}`;
  player2Div.innerText = `${enemyName}: ${enemyPoint}`;

  isTurn();
}

function createBoard(cardsName){
  resetGame();
  const { cardsName1, cardsName2 } = cardsName;
  for (let i = 0; i < numberOfCard; i++) {
    let card = document.createElement("div");
    card.id = i;
    card.classList.add("card");
    if (i <= 7) card.classList.add(cardsName1[i]);
    if (i > 7) card.classList.add(cardsName2[i - 8]);
    card.classList.add("hide");
    card.addEventListener("click", cardClicked);
    cards.push(card);
    gameScreen.appendChild(card);
  }
  hideElement(chatSection);
}

function cardClicked(event) {
  if(myTurn){
    let elementClicked = event.target;
    elementClicked.classList.add('flip');

    setTimeout(() =>{
      elementClicked.classList.remove('flip');

    if(elementClicked.classList.contains('hide')){

      elementClicked.classList.remove("hide");
      cardsToVerify.push(elementClicked);
      cardsToSent.push(elementClicked.id);
    
      socket.emit('cardClicked', {
        cardsToSent: cardsToSent
      });
    
      if (cardsToVerify.length === 2) {
          areEqual(cardsToVerify);
      }
    } else {
      alert('Esta Carta Ya Esta Revelada!\n Presione Otra!')
      return;
    }
  },500)

  } else {
    isTurnDiv.innerText = `No es tu turno!`;
    isTurnDiv.classList.add('not-turn');
    setTimeout(() => {
      isTurnDiv.classList.remove('not-turn')
      if(myTurn) {
        isTurnDiv.innerText = `Es turno de : ${myName}`;
      } else {
        isTurnDiv.innerText = `Es turno de : ${enemyName}`;
      }
    },2000)
  }
}

function areEqual(array) {
  if (array[0].classList[1] == array[1].classList[1]) {
    cardsToVerify = [];
    cardsToSent = [];
    setPoint();
  } else {
    setTimeout(() => {
      array.forEach((card) => {
          card.classList.add("flip");
          setTimeout(() =>{
            card.classList.remove('flip');
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
      isTurnDiv.innerText = `El Ganador es: ${myName}`;
      winnerDiv.innerText = `El Ganador es: ${myName}`;
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
    clearInterval(waitingOponentTime)
    isTurnDiv.innerText = `Es turno de : ${myName}`;
    currectPlayer = myName;
  } else {
    clearInterval(waitingOponentTime)
    isTurnDiv.innerText = `Es turno de : ${enemyName}`;
    currectPlayer = enemyName;
  }

  if(enemyName === undefined) waitingOponentLoop();
}

function waitingOponentLoop(){
  let amountOfDot = 3;
  let dot = '';
  waitingOponentTime = setInterval(() => {
    dot += '.';
    isTurnDiv.innerText = `Esperando Tu Oponente${dot}`;
    amountOfDot--;
    if(amountOfDot === 0) amountOfDot = 3 , dot = '';
  }, 700);
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

  player1Div.innerText = `${myName}: ${userPoint}`;
  player2Div.innerText = `${enemyName}: ${enemyPoint}`;
}

function playAgain(){
  showElement(playAgainButton,true);
  hideElement(container);
  showElement(gameEnd);
}

function makeMessage(messageText,whoSent){
  let message = document.createElement('div');
  message.classList.add('chat-content__message');
  message.innerText = messageText;
  message.classList.add(whoSent);
  chatContent.appendChild(message);
  chatContent.scrollTop = chatContent.scrollHeight;
}

function showElement(element,visibily = false) {
  if(element === container){
    element.style.display = "";
    return;
  }

  if(visibily) element.style.visibily= "visible";

  element.style.display = "flex";
}

function hideElement(element,visibily = false) {
  if(visibily){
    element.style.visibily= "hidden";
  }
    element.style.display = "none";
}

function playSound(sound){
  sound.currentTime  = 0;
  sound.play();
}

socket.on('clicked', (data) =>{
    cardsToSent = data;
    data.forEach(id => cards[id].classList.remove('hide'));

    if(cardsToSent.length === 2){
        cardsToSent[0] = cards[data[0]];
        cardsToSent[1] = cards[data[1]];
        areEqual(cardsToSent);
    } 
})

socket.on('acept-match', data => {
  let message = `${data} Quiere Juegar De Nuevo!\n Presionar Play Again Para Volver\n a Jugar! `;
  alert(message);
});

socket.on('oponent-disconneted', data => {
  let { message } = data;
  alert( message );
});

socket.on('oponent-connected', data => {
  let { message } = data;
  alert( message );
});

socket.on('oponent-message',({message})=>{
  if(!isChatOpen) {
    countMessage++;
    countMessageDiv.innerText = countMessage;
    showElement(countMessageDiv);
  }
  
  makeMessage(message,'player2');
  playSound(notificationSound);
})

playAgainButton.addEventListener('click', () => {
  winnerDiv.innerText = `Esperando tu oponente...`;
  socket.emit('play-again-confirmation',{
    data: true,
    alertName: myName
  });
  hideElement(playAgainButton,true);
});

backHomeButton.addEventListener('click', () => {
  let origin = window.location.origin;
  window.open(`${origin}`,'_parent');
});

toggleChat.addEventListener('click',() => {
  if(isChatOpen){
    hideElement(chatSection);
    isChatOpen = !isChatOpen;
  } else {
    isChatOpen = !isChatOpen;
    showElement(chatSection);
    hideElement(countMessageDiv);
    countMessage = 0;
  }
})

chatSendButton.addEventListener('click',() => {
  let message = chatTextValue.value;
  if(message.trim() === '') return;
  makeMessage(message,'player1');
  socket.emit('oponent-message', {
    message: message
  });
  chatTextValue.value = '';
})
