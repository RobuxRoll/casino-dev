const socket = io("https://robuxroll.herokuapp.com");

const popup = document.getElementById('popup');
const popupText = document.getElementById('popup-text');

document.getElementById('popup-exit').onclick = () => { popup.style.display = 'none' };

let id;
let balance = 0;
let username;
let isRolling = false;
let isLoggedIn = loggedIn();
function loggedIn() {
    if(getCookie('relationId') != '') {
        socket.emit('checkUser', getCookie('relationId'));
        return true;
    } else {
        return false;
    }
};

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

socket.on('updateUser', async function(args) {
    if (args[1] != null) {
        id = args[0];
        username = args[1];
        balance = Math.round(args[2] * 100) / 100;
        document.getElementById("balance").innerHTML = balance;
        document.getElementById("username").innerHTML = username;
        console.log("Server: User Update [" + args + "]");
        document.getElementById('userLoggedIn').style.display = 'block';
        document.getElementById('userGuest').style.display = 'none';
    } else {
        document.cookie = "relationId= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    }
});

document.getElementById('userLoggedIn').onclick = () => {
    window.open("/profile","_self");
}

socket.emit('joinblackjack');