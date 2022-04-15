const express = require('express');
const cookies = require("js-cookie");
const app = express();
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const port = process.env.PORT || 3000;
const time = 28000;
const rouletteInterval = 10000;

let userBetsIds = [];
let userBetsCoins = [];
let userBetsColors = [];

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/fair-play', (req, res) => {
  res.sendFile(__dirname + '/public/fairplay.html')
});

app.get('/contact', (req, res) => {
  res.sendFile(__dirname + '/public/contact.html')
});

app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/public/register.html')
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/login.html')
});

app.get('/profile', (req, res) => {
  res.sendFile(__dirname + '/public/profile.html')
});

app.get('*', (req, res) => {
  res.sendFile(__dirname + '/public/404.html'); 
});

io.on('connection', (socket) => {
  console.log("Server: New user connected " + socket.id);
  io.to(socket.id).emit('connectUser', [1000, socket.id]);
  socket.on('userBet', args => {
    userBetsIds.push(args[0]);
    userBetsCoins.push(args[1]);
    userBetsColors.push(args[2]);
    console.log("UserID " + args[0] + ": " + args[1] + " on " + args[2]);
    io.emit('userBet', args);
  });
  socket.on('userCreate', args => {
    console.log("Request Register: " + args[0] + ", Password: " + args[1]);
  });
  socket.on('userIfExists', args => {
    console.log("Request Login: " + args[0] + ", Password: " + args[1]);
    /**
     * Database Check if User Exists, then Login
     */
    let userExists = true;
    let userName = "Guest";
    let userBallance = 125540;
    if (userExists) {
      io.to(socket.id).emit('userLogin', [userName, userBallance]);
    } else {
      io.to(socket.id).emit('userLoginFalse', false);
    }
  })
});

function rouletteTimeout() {
  let random = Math.floor(Math.random() * 31) + 1;
  if (random == 31) {
    result = 'gold';
  } else if (random % 2 == 0) {
    result = 'cyan';
  } else {
    result = 'purple';
  }
  console.log("Server: RouletteSpin " + random + " " + result + " (next in: " + time + " ms)");
  for(let i = 0; i < userBetsIds.length; i++) {
    if (userBetsColors[i] == result) {
      let multiplier;
      if (result == 'gold') {
        multiplier = 12;
      } else {
        multiplier = 2;
      }
      console.log("Server: User " + userBetsIds[i] + " update " + (userBetsCoins[i] * multiplier));
      io.to(userBetsIds[i]).emit('updateBalance', (userBetsCoins[i] * multiplier));
    }
  }
  userBetsIds = [];
  userBetsCoins = [];
  userBetsColors = [];
  io.emit('spin', [random, time]);
  setTimeout(rouletteTimeout, time);
}

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  setTimeout(rouletteTimeout, time);
});
