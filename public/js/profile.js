document.getElementById('profileLogout').onclick = () => {
    document.cookie = "userId= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    window.open("/login","_self");
}

socket.on('updateUser', async function(args) {
    id = args[0];
    username = args[1];
    balance = Math.round(args[2] * 100) / 100;
    document.getElementById("profileBalance").innerHTML = balance;
    document.getElementById("profileUsername").innerHTML = username;
});