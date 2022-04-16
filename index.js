const express = require('express');
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
const newUserBonus = 100;
const dailyBonus = 10;

let userBetsIds = [];
let userBetsSocketIds = [];
let userBetsCoins = [];
let userBetsColors = [];

let regUserName = ['TestAccount'];
let regUserPassword = ['test123456789'];
let regUserBalance = [100000];
let regUserDailyReward = [0];

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
  // io.to(socket.id).emit('connectUser', [1000, socket.id]);

  socket.on('userBet', args => {
    userBetsIds.push(args[0]);
    userBetsSocketIds.push(socket.id);
    userBetsCoins.push(args[1]);
    userBetsColors.push(args[2]);
    regUserBalance[args[0]] = regUserBalance[args[0]] - args[1];
    console.log("UserID[" + args[0] + "] " + regUserName[args[0]] + ": " + args[1] + " on " + args[2]);
    io.to(socket.id).emit('updateUser', [args[0], regUserName[args[0]], regUserBalance[args[0]]]);
    io.emit('userBet', [regUserName[args[0]], args[1], args[2]]);
  });

  socket.on('userCreate', args => {
    if(!regUserName.includes(args[0])) {
      console.log("Request Register: " + args[0] + ", Password: " + args[1]);
      regUserName.push(args[0]);
      regUserPassword.push(args[1]);
      regUserBalance.push(newUserBonus);
      regUserDailyReward.push(0);
      io.to(socket.id).emit('userCreated', args);
    } else {
      io.to(socket.id).emit('userCreatedFalse', false);
    }
    });

  socket.on('userIfExists', args => {
    console.log("Request Login: " + args[0] + ", Password: " + args[1]);
    /**
     * Database Check if User Exists, then Login
     */
    if (userExists(args[0], args[1])) {
      console.log("Request Login: " + args[0] + " Success");
      let id = getUserId(args[0]);
      io.to(socket.id).emit('userLogin', [id, args[0], regUserBalance[id]]);
    } else {
      console.log("Request Login: " + args[0] + " Failed");
      io.to(socket.id).emit('userLoginFalse', false);
    }
  });

  socket.on('checkUser', args => {
    io.to(socket.id).emit('updateUser', [args, regUserName[args], regUserBalance[args]]);
  });

  socket.on('dailyReward', args => {
    if (Date.now() > regUserDailyReward[args]) {
      regUserBalance[args] = regUserBalance[args] + dailyBonus;
      io.to(socket.id).emit('updateBalance', regUserBalance[args]);
      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate()+1);
      regUserDailyReward[args] = (tomorrow);
      console.log("User[" + args + "]: Reward Success (next time " + regUserDailyReward[args] + ")");
    } else {
      io.to(socket.id).emit('updateBalanceFailed', regUserDailyReward[args]);
    }
  });
});

const userExists = (username, password) => {
  for(let i = 0; i < regUserName.length; i++) {
    if(regUserName[i] === username) {
      if(regUserPassword[i] === password) {
        return true;
      }
    }
  }
  return false;
}

const getUserId = (username) => {
  for(let i = 0; i < regUserName.length; i++) {
    if (regUserName[i] === username) {
      return i;
    }
  }
  return null;
}

const findInArray = (array, find) => {
  array.forEach(element => {
    if (element === find) {
      return true;
    }
  });
  return false;
}

const rouletteTimeout = () => {
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
      regUserBalance[userBetsIds[i]] = regUserBalance[userBetsIds[i]] + (userBetsCoins[i] * multiplier);
      console.log("Server: UserID[" + userBetsIds[i] + "] " + regUserBalance[userBetsIds[i]]);
      io.to(userBetsSocketIds[i]).emit('updateBalance', regUserBalance[userBetsIds[i]]);
    }
  }
  userBetsIds = [];
  userBetsSocketIds = [];
  userBetsCoins = [];
  userBetsColors = [];
  io.emit('spin', [random, time]);
  setTimeout(rouletteTimeout, time);
}

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  setTimeout(rouletteTimeout, time);
});
