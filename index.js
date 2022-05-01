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

let cards = [
  'card_club_A',
  'card_club_2',
  'card_club_3',
  'card_club_4',
  'card_club_5',
  'card_club_6',
  'card_club_7',
  'card_club_8',
  'card_club_9',
  'card_club_10',
  'card_club_J',
  'card_club_Q',
  'card_club_K',
  'card_diamond_A',
  'card_diamond_2',
  'card_diamond_3',
  'card_diamond_4',
  'card_diamond_5',
  'card_diamond_6',
  'card_diamond_7',
  'card_diamond_8',
  'card_diamond_9',
  'card_diamond_10',
  'card_diamond_J',
  'card_diamond_Q',
  'card_diamond_K',
  'card_hearth_A',
  'card_hearth_2',
  'card_hearth_3',
  'card_hearth_4',
  'card_hearth_5',
  'card_hearth_6',
  'card_hearth_7',
  'card_hearth_8',
  'card_hearth_9',
  'card_hearth_10',
  'card_hearth_J',
  'card_hearth_Q',
  'card_hearth_K',
  'card_spade_A',
  'card_spade_2',
  'card_spade_3',
  'card_spade_4',
  'card_spade_5',
  'card_spade_6',
  'card_spade_7',
  'card_spade_8',
  'card_spade_9',
  'card_spade_10',
  'card_spade_J',
  'card_spade_Q',
  'card_spade_K'
]

async function virtualShuffle (array, shuffles) {
  for (let i = 0; i < (shuffles * array.length); i++) {
    let number1 = (Math.floor(Math.random() * array.length));
    let number2 = (Math.floor(Math.random() * array.length));
    let help = array[number1];
    array[number1] = array[number2];
    array[number2] = help;
  }
}

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
      console.log("Request Login: " + args[0] + " Success [" + getUserId(args[0]) + "]")
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

  socket.on('betBlackjack', args => {
    let userId = getUserRelationId(args[0]);
    let bet = args[1];
    if (bet <= regUserBalance[userId]) {
      let randomCards = randomNumbersArray(20, cards.length);
      let playerCards = [
          cards[randomCards[0]],
          cards[randomCards[1]],
          cards[randomCards[2]],
          cards[randomCards[3]],
          cards[randomCards[4]],
          cards[randomCards[5]],
          cards[randomCards[6]]
      ]
      let dealerCards = [
          cards[randomCards[7]],
          cards[randomCards[8]],
          cards[randomCards[9]],
          cards[randomCards[10]],
          cards[randomCards[11]],
          cards[randomCards[12]],
          cards[randomCards[13]]
      ]
      let playerCardCounter = 0;
      let playerValue = cardValue(playerCards[playerCardCounter]);
      let dealerCardCounter = 0;
      let dealerValue = cardValue(dealerCards[dealerCardCounter]);
  
      regUserBalance[userId] = regUserBalance[userId] - args[1];
      console.log('User[' + regUserName[userId] + '] betted ' + args[1] + ' on blackjack');
      io.to(socket.id).emit('updateUser', [args[0], regUserName[userId], regUserBalance[userId]]);
      io.to(socket.id).emit('startBlackjack', [playerCards[playerCardCounter], playerValue, dealerCards[dealerCardCounter], dealerValue]);
      playerCardCounter++;
      dealerCardCounter++;
  
      socket.on('hitBlackjack', args => {
        playerValue = (playerValue * 1 + cardValue(playerCards[playerCardCounter]) * 1);
        if (playerValue === 21) {
          io.to(socket.id).emit('winBlackjack', [playerCards[playerCardCounter], playerValue]);
          regUserBalance[userId] = (regUserBalance[userId] * 1 + bet * 2);
        } else if (playerValue > 21) {
          io.to(socket.id).emit('lostBlackjack', [playerCards[playerCardCounter], playerValue]);
        } else {
          io.to(socket.id).emit('hitBlackjack', [playerCards[playerCardCounter], playerValue]);
        }
        playerCardCounter++;
      });
  
      socket.on('standBlackjack', args => {
        let checker = true;
        while (checker) {
          dealerValue = (dealerValue * 1 + cardValue(dealerCards[dealerCardCounter]) * 1);
          io.to(socket.id).emit('dealerBlackjack', [dealerCards[dealerCardCounter], dealerValue]);
          dealerCardCounter++;
          if (dealerValue > playerValue) {
            checker = false;
          }
        }
        if (dealerValue > 21) {
          console.log()
          io.to(socket.id).emit('dealerLostBlackjack');
          regUserBalance[userId] = (regUserBalance[userId] * 1 + bet * 2);
        } else if (dealerValue <= 21) {
          io.to(socket.id).emit('dealerWinBlackjack');
        }
      })
    } else {
      io.to(socket.id).emit('wrongBetBlackjack', bet);
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

const getRndInteger = (min, max) => {
  return Math.floor(Math.random() * (max - min) ) + min;
}

const findInArray = (array, find) => {
  for(let i = 0; i < array.length; i++) {
    if (array[i] === find) {
      return true;
    }
  }
  return false;
}

const randomNumbersArray = (length, max) => {
  let array = [];
  for(let i = 0; i < length; i++) {
    let generateNumber = getRndInteger(0, max);
    if (findInArray(array, generateNumber)) {
      i--;
    } else {
      array.push(generateNumber);
    }
  }
  return array;
}

const generateString = (length) => {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const randomFromArray = (array) => {
  return array[Math.floor(Math.random() * array.length)];
}

const cardValue = (card) => {
  let value = card.split('_')[2].toUpperCase();
  if (value === 'K' || value === 'Q' || value === 'J') {
    value = 10;
  } else if (value === 'A') {
    value = 11;
  }
  return value;
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
  virtualShuffle(cards, 10000);
  console.log('Server: Shuffle Cards:');
  console.log(cards);
  setTimeout(relationID, relationIdInterval);
}

server.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
  setTimeout(rouletteTimeout, time);
  setTimeout(relationID, 0);
});
