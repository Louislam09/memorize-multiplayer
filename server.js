const express = require('express');
const path = require('path');
const app = express();
const server = require('http').Server(app);
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname,'public' )));

// Start My Server
server.listen(PORT, ()=> console.log(`Server running in port ${PORT}`) );

const socket = require('socket.io');

const io = socket(server);

io.on('connection', onConnect);

const colors = [
    "start-6",
    "arrow-down",
    "penta",
    "start-4",
    "rhoumbus",
    "triangle",
    "heart",
    "lightning",
];

let colors1 = colors.sort(() => 0.5 - Math.random());
let colors2 = [...colors].sort(() => 0.5 - Math.random());

let room1 = [];
let room = 'game';

const connections = [null, null];
let playAgainConfirmations = [null, null];

function playAgain(playAgainConfirmations){

}

function onConnect(socket){
    let playerIndex = -1;
    
    switchRoom(socket,room);

    socket.on('user-name', name => {
        for(const i in connections){
            if(connections[i] === null){
                playerIndex = i;
                break
            }
        }
        
        room1[playerIndex] = { userName: name , num: playerIndex };

        socket.to(room).broadcast.emit('oponent-connected', {
            message: 'Tu oponente sea conectado :)'
        });

        io.emit('players-info', [...room1]);
      
        // If there is a player 3, ignore it.
        if(playerIndex === -1) return;
      
        console.log(`Player ${playerIndex} has connected`);
    
        connections[playerIndex] = false;
    });

    socket.on('play-again-confirmation', data => {
        for(const i in playAgainConfirmations){
            if(playAgainConfirmations[i] === null){
                playAgainConfirmations[i] = true;
                break
            }
        }
      
        
        if(playAgainConfirmations.every(res => res === true)){
            colors1 = colors.sort(() => 0.5 - Math.random());
            colors2 = [...colors].sort(() => 0.5 - Math.random());
            
            io.emit('colors', {
                colors1: colors1,
                colors2: colors2
            });
            playAgainConfirmations = [null, null];
        }
          
        let { alertName } = data; 
        if(playAgainConfirmations[0]){
            socket.to(room).broadcast.emit('acept-match', alertName);
        }


    });

    socket.on('disconnect', _ =>{
        console.log(`Player ${playerIndex} has  disconnected`);

        socket.to(room).broadcast.emit('oponent-disconneted', {
            message: 'Tu oponente sea desconectado :('
        });

        connections[playerIndex] = null;
        playAgainConfirmations[playerIndex] = null;

    })

    socket.emit('colors', {
        colors1: colors1,
        colors2: colors2
    });

    socket.on('cardClicked', ({cardsToSent}) => {
		socket.to(room).broadcast.emit('clicked', cardsToSent);
    });

    socket.on('canClick', ({canClick}) => {
		socket.to(room).broadcast.emit('canNotClick', canClick);
    });

}

function switchRoom(socket,roomName){
    socket.join(roomName);
    socket.emit('msg', {
        sender: '-Server-',
        content: `You move to ${roomName}`
    })
}