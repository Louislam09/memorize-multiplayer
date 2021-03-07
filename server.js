const express = require('express');
const path = require('path');
const app = express();
const server = require('http').Server(app);
const PORT = process.env.PORT || 3000;
const { v4: uuidv4 } = require('uuid');

app.use(express.static(path.join(__dirname,'public' )));

// Start My Server
server.listen(PORT, () => console.log(`Server running in port ${PORT}`));

const socket = require('socket.io');
const { Console } = require('console');

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
let room = 'game' + Math.random().toFixed(3);

const connections = {};
let playAgainConfirmations = {};

function onConnect(socket){
    let playerIndex = -1,
    playerRoom = "default";
    
    socket.on('get-code', ({ hasCode, code }) => {
        if(hasCode){
            socket.join(code)
        }else{
            let uCode = uuidv4().split("-")[0];
            connections[uCode] = [null,null];
            playAgainConfirmations[uCode] = [null,null];
            socket.emit('code', {
                code: uCode
            })
            socket.join(uCode)
        }
    })
    
    socket.on('user-name', ({name, roomName}) => {
        for(const i in connections[roomName]){
            if(connections[roomName][i] === null){
                playerIndex = i;
                playerRoom = roomName;
                connections[roomName][i] = i;
                break
            }
        }

        // If there is a player 3, ignore it.
        if(playerIndex === -1) return;
        
        room1[playerIndex] = { userName: name , num: playerIndex};
        
        socket.to(roomName).broadcast.emit('oponent-connected', {
            message: 'Tu Oponente Sea Conectado :)'
        });

        io.to(roomName).emit('players-info', [...room1]);
       
    });

    socket.on('play-again-confirmation', data => {
        if(playerIndex === -1) return;
        let { alertName,roomName } = data; 
        for(const i in playAgainConfirmations[roomName]){
            if(playAgainConfirmations[roomName][i] === null){
                playAgainConfirmations[roomName][i] = true;
                break
            }
        }
        
        if(playAgainConfirmations[roomName].every(res => res === true)){
            colors1 = colors.sort(() => 0.5 - Math.random());
            colors2 = [...colors].sort(() => 0.5 - Math.random());
            
            io.to(roomName).emit('colors', {
                cardsName1: colors1,
                cardsName2: colors2
            });
            playAgainConfirmations[roomName] = [null, null];
        }
          
        if(playAgainConfirmations[roomName][0]){
            socket.to(roomName).broadcast.emit('acept-match', alertName);
        }
    });

    socket.on('disconnect', _ =>{
        if(playerIndex === -1) return;
            socket.to(playerRoom).broadcast.emit('oponent-disconneted', {
            message: 'Tu Oponente Sea Desconectado :('
        });

        if(playerIndex !== -1 ){
            connections[playerRoom][playerIndex] = null;
        }

        playAgainConfirmations[playerRoom][playerIndex] = null;
    })

    socket.emit('colors', {
        cardsName1: colors1,
        cardsName2: colors2
    });

    socket.on('cardClicked', ({cardsToSent,roomName}) => {
		socket.to(roomName).broadcast.emit('clicked', cardsToSent);
    });
    
    socket.on('oponent-message', ({message,roomName}) => {
        if(playerIndex === -1) return;
        socket.to(roomName).broadcast.emit('oponent-message', message);
    })
}

function switchRoom(socket,roomName){
    socket.join(roomName);
    socket.emit('msg', {
        sender: '-Server-',
        content: `You move to ${roomName}`
    })
}