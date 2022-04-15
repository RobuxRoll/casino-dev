const socket = io("https://robuxroll.herokuapp.com");

const popup = document.getElementById('popup');
const popupText = document.getElementById('popup-text');

document.getElementById('popup-exit').onclick = () => { popup.style.display = 'none' };

let balance = Cookies.set('balance', parseInt("0"));
let username = Cookies.set('username', '');
let isRolling = Cookies.set('isRolling', 'false');
var isLoggedIn = Cookies.set('isLoggedIn', 'false');
/**
 *      .
 *     / \
 *      |
 *      |
 * 
 * Need to change this to Const or Function for
 * cookies implementation, login and register
 */

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

document.getElementById('userLoggedIn').onclick = () => {
    window.open("/profile","_self");
}
