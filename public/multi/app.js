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

// const socket = io.connect('http://192.168.43.10:3000/');
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
let cards = [];
let cardsToVerify = [];
let cardsToSent = [];

let userName = prompt('Escribe Tu Nombre: ');
let playAgainMessage = false;

let enemyName;
let countMessage = 0;
let userPoint = 0,
  enemyPoint = 0;

let myTurn = false;

let currectPlayer = '';
let playerNumber = 0;

let waitingOponentTime;
let chatScreen = false;

let notificationSound = new Audio('sound/notification.mp3');

socket.emit('user-name', userName);

socket.on('players-info', informations => {
  for(const i in informations){
    if(informations[i].num === '-1'){
      isTurnDiv.innerText = 'Sorry, The Server Is Full';

    } else {
      playerNumber = parseInt(informations[i].num);
      
      if(informations[playerNumber].userName !== userName){
        enemyName = informations[playerNumber].userName;
        break;
      }

      if(playerNumber === 0 && informations[playerNumber].userName === userName){
        myTurn = true;
      }
    }
  }

  if(userName !== undefined && enemyName !== undefined) isTurn();
  console.log(`UserName: ${userName}  enemyName: ${enemyName}`)
});

socket.on('colors', data => {
  createBoard(data);

})

function resetGame() {
  gameScreen.innerHTML = '';

  hideElement(gameEnd);
  showElement(container);
  
  cards = [];
  gameScreen.innerHTML = '';
  
  userPoint = 0;
  enemyPoint = 0;
  player1Div.innerText = `${userName}: ${userPoint}`;
  player2Div.innerText = `${enemyName}: ${enemyPoint}`;

  isTurn();
}

function createBoard(data){
  resetGame();
  const { colors1, colors2 } = data;
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
    
      if (cardsToVerify.length == 2) {
          areEqual(cardsToVerify);
      }
      
      socket.emit('canClick', { 
        canClick: false
       } );
    } else {
      alert('Esta Carta Ya Esta Revelada!\n Presione Otra!')
      return;
    }
  },500)

  } else {
    isTurnDiv.innerText = `No es tu turno!`;
    isTurnDiv.classList.add('not-turn');

    setTimeout(()=>{
      isTurnDiv.classList.remove('not-turn')
      if(myTurn) {
        isTurnDiv.innerText = `Es turno de : ${userName}`;
      }else{
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
    clearInterval(waitingOponentTime)
    isTurnDiv.innerText = `Es turno de : ${userName}`;
    currectPlayer = userName;
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

  player1Div.innerText = `${userName}: ${userPoint}`;
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

function playSound(sound){
  sound.currentTime  = 0;
  sound.play();
}

socket.on('clicked', (data) =>{
    cardsToSent = data;

    data.forEach(id=>{
        cards[id].classList.remove('hide');
    })

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
  if(!chatScreen) {
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
    alertName: userName
  })

  hideElement(playAgainButton,true);

})

backHomeButton.addEventListener('click',()=>{
  let origin = window.location.origin;
  window.open(`${origin}`,'_parent');
});

toggleChat.addEventListener('click',() => {
  if(chatScreen){
    hideElement(chatSection);
    chatScreen = !chatScreen;
  }else{
    chatScreen = !chatScreen;
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
  })
  chatTextValue.value = '';
})
