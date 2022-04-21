const socket = io("https://robuxroll.herokuapp.com");

const popup = document.getElementById('popup');
const popupText = document.getElementById('popup-text');

document.getElementById('popup-exit').onclick = () => { popup.style.display = 'none' };

let id;
let balance = 0;
let username;
let isPlaying = false;
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

const playerValue = document.getElementById('playerValue');
const playerCards = document.getElementById('playerCards');
const dealerValue = document.getElementById('dealerValue');
const dealerCards = document.getElementById('dealerCards');


const createCard = (cardName, element) => {
    const card = document.createElement('div');
    card.className = 'bj-card';
    card.style.backgroundImage = 'url("/assets/cards/' + cardName + '.png")';
    element.appendChild(card);
}

const clearTable = (element) => {
    element.innerHTML = ''
}

const resetTable = (element) => {
    element.innerHTML = '<div class="bj-card"></div>'
}

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (isLoggedIn) {
        if (!isPlaying) {
            if (document.getElementById('bjBet').value >= 2) {
                socket.emit('betBlackjack', [id, document.getElementById('bjBet').value]);
                document.getElementById('form').style.opacity = .5;
                document.getElementById('form').style.pointerEvents = 'none';
            } else {
                popupText.innerHTML = 'You need to bet at least $2';
                popup.style.display = 'table';
            }
        } else {
            popupText.innerHTML = 'Wait, until you end this game!';
            popup.style.display = 'table';
        }
    } else {
        popupText.innerHTML = 'You aren\'t logged in yet, <a href="/register">create an account</a> or <a href="/login">log in</a>.';
        popup.style.display = 'table';
    }
});

document.getElementById('bjHitme').onclick = () => {
    if (isPlaying) {
        socket.emit('hitBlackjack', id);
    }
}

document.getElementById('bjStand').onclick = () => {
    if (isPlaying) {
        socket.emit('standBlackjack', id);
    }
}

document.getElementById('bjScoreBubble').onclick = () => {
    window.open('/blackjack', '_self');
}

socket.on('startBlackjack', function(args) {
    isPlaying = true;
    clearTable(playerCards);
    createCard(args[0], playerCards);
    playerValue.innerHTML = args[1];
    clearTable(dealerCards);
    createCard(args[2], dealerCards);
    dealerValue.innerHTML = args[3];
});

socket.on('hitBlackjack', function(args) {
    createCard(args[0], playerCards);
    playerValue.innerHTML = args[1];
});

socket.on('winBlackjack', function(args) {
    createCard(args[0], playerCards);
    playerValue.innerHTML = args[1];
    isPlaying = false;
    setTimeout(() => {
        document.getElementById('bjScoreBubble').style.display = 'block';
        document.getElementById('bjScoreBubbleText').innerHTML = "You've won!";  
    }, 1000);
});

socket.on('lostBlackjack', function(args) {
    createCard(args[0], playerCards);
    playerValue.innerHTML = args[1];
    isPlaying = false;
    setTimeout(() => {
        document.getElementById('bjScoreBubble').style.display = 'block';
        document.getElementById('bjScoreBubbleText').innerHTML = "You've lost!";  
    }, 1000);
});

socket.on('dealerBlackjack', function(args) {
    createCard(args[0], dealerCards);
    dealerValue.innerHTML = args[1];
});

socket.on('dealerLostBlackjack', function() {
    isPlaying = false;
    setTimeout(() => {
        document.getElementById('bjScoreBubble').style.display = 'block';
        document.getElementById('bjScoreBubbleText').innerHTML = "You've won!";  
    }, 1000);
});

socket.on('dealerWinBlackjack', function() {
    isPlaying = false;
    setTimeout(() => {
        document.getElementById('bjScoreBubble').style.display = 'block';
        document.getElementById('bjScoreBubbleText').innerHTML = "You've lost!";  
    }, 1000);
});

socket.on('wrongBetBlackjack', function(args) {
    popupText.innerHTML = 'Insufficient funds - Your balance is ' + balance + '$ (' + (args - balance) + '$)';
    popup.style.display = 'table';
});