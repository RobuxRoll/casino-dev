const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 3000;
const time = 28000;
const rouletteInterval = 10000;
let bets;

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});


app.get('/fair-play', (req, res) => {
  res.sendFile(__dirname + '/public/fairplay.html')
});

app.get('/contact', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
});

io.on('connection', (socket) => {
  console.log("Server: New user connected " + socket.id);
  io.to(socket.id).emit('updateUser', [1000, socket.id]);
  socket.on('userBet', args => {
    console.log("UserID " + args[0] + ": " + args[1] + " on " + args[2]);
    io.emit('userBet', args);
  });
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
  console.log("Server: RouletteSpin " + random + " " + result + " (next in: " + time + " ms)")
  io.emit('spin', [random, time]);
  setTimeout(rouletteTimeout, time);
}

http.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  setTimeout(rouletteTimeout, time);
});
