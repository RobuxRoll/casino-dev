const socket = io(); // "https://robuxroll.herokuapp.com"

const popup = document.getElementById('popup');
const popupText = document.getElementById('popup-text');

let balance = 0;
let username;
let isRolling = false;
let isLoggedIn = true;

socket.on('connectUser', async function(args) {
    if (isLoggedIn) {
        balance = args[0] * 1;
        username = "User_" + args[1].slice(-6);
        document.getElementById("balance").innerHTML = balance;
        document.getElementById("username").innerHTML = username;
        console.log("Server: User Update [" + args + "]");
        document.getElementById('userLoggedIn').style.display = 'block';
        document.getElementById('userGuest').style.display = 'none';
    } else {
        document.getElementById('userLoggedIn').style.display = 'none';
        document.getElementById('userGuest').style.display = 'block';
    }
});