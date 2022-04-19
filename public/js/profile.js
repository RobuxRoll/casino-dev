document.getElementById('profileLogout').onclick = () => {
    document.cookie = "relationId= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    window.open("/login","_self");
}

socket.on('updateUser', async function(args) {
    id = args[0];
    username = args[1];
    balance = Math.round(args[2] * 100) / 100;
    document.getElementById("profileBalance").innerHTML = balance;
    document.getElementById("profileUsername").innerHTML = username;
});

document.getElementById('profileDailyreward').onclick = () => {
    socket.emit('dailyReward', id);
};

socket.on('updateBalance', function(args) {
    balance = Math.round(args * 100) / 100;
    document.getElementById("balance").innerHTML = balance;
    document.getElementById("profileBalance").innerHTML = balance;
});

socket.on('updateBalanceFailed', function(args) {
    popupText.innerHTML = "You can withdraw your daily reward tomorrow!";
    popup.style.display = "block";
});