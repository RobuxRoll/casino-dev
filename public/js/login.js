let logUsername = document.getElementById('log-username');
let logPassword = document.getElementById('log-password');

let regForm = document.getElementById('regForm');

logForm.addEventListener('submit', function(e) {
    e.preventDefault();
    socket.emit('userIfExists', [logUsername.value, logPassword.value]);
    logUsername.value = '';
    logPassword.value = '';
});

socket.on('userLogin', function(args) {
    document.cookie = 'relationId=' + args[0];
    window.open("/profile","_self");
});

socket.on('userLoginFalse', function(args) {
    popupText.innerHTML = "Wrong Username or Password";
    popup.style.display = "block";
});