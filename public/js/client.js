const socket = io("https://robuxroll.herokuapp.com");
const form = document.getElementById('form');
const betValue = document.getElementById('bet-value');

const lastGame1 = document.getElementById('lastGame1');
const lastGame2 = document.getElementById('lastGame2');
const lastGame3 = document.getElementById('lastGame3');
const lastGame4 = document.getElementById('lastGame4');
const lastGame5 = document.getElementById('lastGame5');

const popup = document.getElementById('popup');
const popupText = document.getElementById('popup-text');

document.getElementById('popup-exit').onclick = () => { popup.style.display = 'none' };
document.getElementById('b001').onclick = () => { betValue.value = Math.floor((betValue.value * 1 + .01) * 100) / 100 };
document.getElementById('b01').onclick = () => { betValue.value = Math.floor((betValue.value * 1 + .1) * 100) / 100 };
document.getElementById('b1').onclick = () => { betValue.value = Math.floor((betValue.value * 1 + 1) * 100) / 100 };
document.getElementById('b10').onclick = () => { betValue.value = Math.floor((betValue.value * 1 + 10) * 100) / 100 };
document.getElementById('b100').onclick = () => { betValue.value = Math.floor((betValue.value * 1 + 100) * 100) / 100 };
document.getElementById('b12').onclick = () => { betValue.value = Math.floor((betValue.value / 2) * 100) / 100 };
document.getElementById('b2').onclick = () => { betValue.value = Math.floor((betValue.value * 2) * 100) / 100 };
document.getElementById('bc').onclick = () => { betValue.value = '' };

let balance = 0;
let username;
let roll = 0;
let betColor;
let isRolling = false;

let winScreenTime = 3000;
let resetTime = 10000;

const timerDiv = document.getElementById('timer-div');
const timer = document.getElementById('timer');

const submitPurple = document.getElementById('submit-purple');
const submitGold = document.getElementById('submit-gold');
const submitCyan = document.getElementById('submit-cyan');

const betsCyan = document.getElementById('bets-cyan');
const cyanCount = document.getElementById('cyan-count');
const cyanCoins = document.getElementById('cyan-coins');

const betsGold = document.getElementById('bets-gold');
const goldCount = document.getElementById('gold-count');
const goldCoins = document.getElementById('gold-coins');

const betsPurple = document.getElementById('bets-purple');
const purpleCount = document.getElementById('purple-count');
const purpleCoins = document.getElementById('purple-coins');

submitPurple.onclick = () => { betColor = submitPurple.value }
submitGold.onclick = () => { betColor = submitGold.value }
submitCyan.onclick = () => { betColor = submitCyan.value }

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if(!isRolling && betValue.value > 0) {    
        if (betValue.value <= balance) {
            betValue.value = Math.floor(betValue.value * 100) / 100;
            socket.emit('userBet', [socket.id, betValue.value, betColor]);
            balance = balance - betValue.value;
            document.getElementById("balance").innerHTML = balance;
        } else {
            popupText.innerHTML = 'Insufficient funds - Your balance is ' + balance + '$ (' + (betValue.value - balance) + '$)';
            popup.style.display = 'table';
        }
    }
});

socket.on('spin', function(args) {
    isRolling = true;
    let timeSetter = (args[1] - winScreenTime - resetTime - 1000) / 1000; 
    timerDiv.style.opacity = '0';
    document.getElementById('sync-screen').style.display = 'none';
    console.log("Server: RouletteSpin " + args[0] + " (next in: " + args[1] + " ms)");
    submitPurple.style.opacity = '.7';
    submitGold.style.opacity = '.7';
    submitCyan.style.opacity = '.7';
    submitPurple.style.cursor = 'not-allowed';
    submitGold.style.cursor = 'not-allowed';
    submitCyan.style.cursor = 'not-allowed';
    if (args[0] == 31) {
        result = "<b class=\"coinGold\">G</b>";
        winColor = 'gold';
    } else if (args[0] % 2 == 0) {
        result = "<b class=\"coinCyan\">C</b>";
        winColor = 'cyan';
    } else {
        result = "<b class=\"coinPurple\">P</b>";
        winColor = 'purple';
    }
    let position = (args[0] * 128) + (Math.floor(Math.random() * (60 + 60 + 1)) - 60) + (128 * 15) + (3968 * roll);
    roll++;
    document.getElementById('roulette').style.backgroundPositionX = 'calc(50% - ' + position + 'px)';
    setTimeout(() => {
        lastGame1.innerHTML = lastGame2.innerHTML;
        lastGame2.innerHTML = lastGame3.innerHTML;
        lastGame3.innerHTML = lastGame4.innerHTML;
        lastGame4.innerHTML = lastGame5.innerHTML;
        lastGame5.innerHTML = result;
        switch (winColor) {
            case 'cyan':
                betsCyan.style.color = '#9FC088';
                betsPurple.style.color = '#CC704B';
                betsGold.style.color = '#CC704B';
                betsPurple.style.opacity = '.6';
                betsGold.style.opacity = '.6';
                break;
            case 'purple':
                betsCyan.style.color = '#CC704B';
                betsPurple.style.color = '#9FC088';
                betsGold.style.color = '#CC704B';
                betsCyan.style.opacity = '.6';
                betsGold.style.opacity = '.6';
                break;
            case 'gold':
                betsCyan.style.color = '#CC704B';
                betsPurple.style.color = '#CC704B';
                betsGold.style.color = '#9FC088';
                betsCyan.style.opacity = '.6';
                betsPurple.style.opacity = '.6';
                break;
            default:
                break;
        }
        setTimeout(() => {
            isRolling = false;
            timer.innerHTML = timeSetter;
            updateTimer();
            timerDiv.style.opacity = '1';
            submitPurple.style.opacity = '1';
            submitGold.style.opacity = '1';
            submitCyan.style.opacity = '1';
            submitPurple.style.cursor = 'pointer';
            submitGold.style.cursor = 'pointer';
            submitCyan.style.cursor = 'pointer';
            betsCyan.innerHTML = '';
            betsGold.innerHTML = '';
            betsPurple.innerHTML = '';
            cyanCoins.innerHTML = 0;
            goldCoins.innerHTML = 0;
            purpleCoins.innerHTML = 0;
            cyanCount.innerHTML = 0;
            goldCount.innerHTML = 0;
            purpleCount.innerHTML = 0;
            betsCyan.style.color = 'rgba(255, 255, 255, .5)';
            betsPurple.style.color = 'rgba(255, 255, 255, .5)';
            betsGold.style.color = 'rgba(255, 255, 255, .5)';
            betsCyan.style.opacity = '1';
            betsPurple.style.opacity = '1';
            betsGold.style.opacity = '1';
        }, winScreenTime);
    }, resetTime)
});

const updateTimer = (args) => {
    timer.innerHTML = (timer.innerHTML * 10 - 1) / 10;
    if (timer.innerHTML != 0) {   
        setTimeout(updateTimer, 100)
    }
}

socket.on('updateUser', async function(args) {
    balance = args[0] * 1;
    username = "User_" + args[1].slice(-6);
    document.getElementById("balance").innerHTML = balance;
    document.getElementById("username").innerHTML = username;
    console.log("Server: User Update [" + args + "]");
});

socket.on('userBet', function(args) {
    if(!isRolling) {
        console.log("UserID " + args[0] + ": " + args[1] + " on " + args[2]);
        if (args[2] == 'cyan') {
            betsCyan.innerHTML += '<div><div class="fl">User_' + args[0].slice(-6) + '</div><div class="fr">' + args[1] + '</div></div>';
            cyanCoins.innerHTML = cyanCoins.innerHTML * 1 + args[1] * 1;
            cyanCount.innerHTML++; 
        } else if (args[2] == 'gold') {
            betsGold.innerHTML += '<div><div class="fl">User_' + args[0].slice(-6) + '</div><div class="fr">' + args[1] + '</div></div>';
            goldCoins.innerHTML = goldCoins.innerHTML * 1 + args[1] * 1;
            goldCount.innerHTML++; 
        } else if (args[2] == 'purple') {
            betsPurple.innerHTML += '<div><div class="fl">User_' + args[0].slice(-6) + '</div><div class="fr">' + args[1] + '</div></div>';
            purpleCoins.innerHTML = purpleCoins.innerHTML * 1 + args[1] * 1;
            purpleCount.innerHTML++; 
        }
    }
});

socket.on('updateBalance', function(args) {
    setTimeout(() => {
        balance = balance + args;
        document.getElementById("balance").innerHTML = balance;
    }, resetTime);
});

function li(args) {
    let item = document.createElement('li');
    item.textContent = args;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
}
