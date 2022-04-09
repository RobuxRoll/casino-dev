const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 3000;
const time = 10000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


// New User connected
io.on('connection', (socket) => {
  // Send New User balance
  console.log("Server: New user connected " + socket.id);
  io.to(socket.id).emit('updateBalance', 1000);
  // Check if UserID bets
  socket.on('userBet', args => {
    console.log("UserID " + args[0] + ": " + args[1] + " on " + args[2]);
    // What will Server do if UserID bets
  });
});

function rouletteTimeout() {
  // Send all Users RoulletteSpin
  let random = Math.floor(Math.random() * 31) + 1;
  console.log("Server: RouletteSpin " + random + " (next in: " + time + " ms)")
  io.emit('spin', random);
  setTimeout(rouletteTimeout, time);
}

http.listen(port, () => {
  // Starts after NPM START
  console.log(`Server running at http://localhost:${port}/`);
  setTimeout(rouletteTimeout, time);
});
