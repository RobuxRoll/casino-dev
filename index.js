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
const relationIdInterval = 3600000
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
let regUserRelationID = [0];

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/roulette', (req, res) => {
  res.sendFile(__dirname + '/public/roulette.html')
})

app.get('/blackjack', (req, res) => {
  res.sendFile(__dirname + '/public/blackjack.html')
})

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
    let userId = getUserRelationId(args[0]);
    userBetsIds.push(userId);
    userBetsSocketIds.push(socket.id);
    userBetsCoins.push(args[1]);
    userBetsColors.push(args[2]);
    regUserBalance[userId] = regUserBalance[userId] - args[1];
    console.log("User[" + regUserName[userId] + "]: " + args[1] + " on " + args[2]);
    io.to(socket.id).emit('updateUser', [args[0], regUserName[userId], regUserBalance[userId]]);
    io.emit('userBet', [regUserName[userId], args[1], args[2]]);
  });

  socket.on('userCreate', args => {
    if(!regUserName.includes(args[0])) {
      console.log("Request Register: " + args[0] + ", Password: " + args[1]);
      regUserName.push(args[0]);
      regUserPassword.push(args[1]);
      regUserBalance.push(newUserBonus);
      regUserDailyReward.push(0);
      regUserRelationID.push(generateString(64));
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
      console.log("Request Login: Token " + regUserRelationID[getUserId(args[0])])
      let id = getUserId(args[0]);
      io.to(socket.id).emit('userLogin', [id, args[0], regUserBalance[id]]);
    } else {
      console.log("Request Login: " + args[0] + " Failed");
      io.to(socket.id).emit('userLoginFalse', false);
    }
  });

  socket.on('checkUser', args => {
    io.to(socket.id).emit('updateUser', [args, regUserName[getUserRelationId(args)], regUserBalance[getUserRelationId(args)]]);
  });

  socket.on('dailyReward', args => {
    let id = getUserRelationId(args);
    if (Date.now() > regUserDailyReward[id]) {
      regUserBalance[id] = regUserBalance[id] + dailyBonus;
      io.to(socket.id).emit('updateBalance', regUserBalance[id]);
      let tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate()+1);
      regUserDailyReward[id] = (tomorrow);
      console.log("User[" + args + "]: Reward Success (next time " + regUserDailyReward[id] + ")");
    } else {
      io.to(socket.id).emit('updateBalanceFailed', regUserDailyReward[args]);
    }
  });

  socket.on('joinblackjack', args => {
    console.log('Server: ' + socket.id + ' joined blackjack')
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
      return regUserRelationID[i];
    }
  }
  return null;
}

const getUserRelationId = (relation) => {
  for(let i = 0; i < regUserRelationID.length; i++) {
    if (regUserRelationID[i] === relation) {
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

const generateString = (length) => {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
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

const relationID = () => {
  for (let i = 0; i < regUserRelationID.length; i++) {
    regUserRelationID[i] = generateString(64);
  }
  console.log("Server: Update Relations:");
  console.log(regUserRelationID);
  setTimeout(relationID, relationIdInterval);
}

server.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
  setTimeout(rouletteTimeout, time);
  setTimeout(relationID, 0);
});
