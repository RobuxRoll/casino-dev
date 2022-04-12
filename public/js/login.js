const socket = io("https://robuxroll.herokuapp.com");

let logUsername = document.getElementById('log-username');
let logPassword = document.getElementById('log-password');

let regForm = document.getElementById('regForm');

logForm.addEventListener('submit', function(e) {
    e.preventDefault();
    socket.emit('userIfExists', [logUsername.value, logPassword.value]);
});

socket.on('userLogin', function(args) {
    console.log("User Logged In: " + args[0] + ", " + args[1]);
    window.open("/profile","_self");
});

socket.on('userLoginFalse', function(args) {
    console.log("User Logged In: " + args);
    popupText.innerHTML = "Wrong Username or Password";
    popup.style.display = "block";
});