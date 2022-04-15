let regUsername = document.getElementById('reg-username');
let regPassword1 = document.getElementById('reg-password1');
let regPassword2 = document.getElementById('reg-password2');
let regCheck1 = document.getElementById('reg-check1')

let idCheck1 = document.getElementById('check1');
let idCheck2 = document.getElementById('check2');
let idCheck3 = document.getElementById('check3');
let idCheck4 = document.getElementById('check4');

let check1 = false;
let check2 = false;
let check3 = false;
let check4 = false;

let regForm = document.getElementById('regForm');

// this is a mess
regUsername.oninput = () => { 
    regUsername.value = regUsername.value.replace(/^\s+|\s+$/gm,'');
    let text = regUsername.value;
    if (text.length >= 6 && text.length <= 12) {
        idCheck1.style.color = '#9FC088';
        check1 = true;
    } else {
        idCheck1.style.color = '#DB3C3C';
        check1 = false;
    }
};

regPassword1.oninput = () => { 
    regPassword1.value = regPassword1.value.replace(/^\s+|\s+$/gm,'');
    let text = regPassword1.value;
    if (text.length >= 8 && text.length <= 24) {
        idCheck2.style.color = '#9FC088';
        check2 = true;
    } else {
        idCheck2.style.color = '#DB3C3C';
        check2 = false;
    }
    if (regPassword2.value == regPassword1.value) {
        idCheck3.style.color = '#9FC088';
        check3 = true;
    } else {
        idCheck3.style.color = '#DB3C3C';
        check3 = false;
    }
};

regPassword2.oninput = () => {
    regPassword2.value = regPassword2.value.replace(/^\s+|\s+$/gm,'');
    if (regPassword2.value == regPassword1.value) {
        idCheck3.style.color = '#9FC088';
        check3 = true;
    } else {
        idCheck3.style.color = '#DB3C3C';
        check3 = false;
    }
}

regCheck1.oninput = () => {
    if (regCheck1.checked) {
        idCheck4.style.color = '#9FC088';
        check4 = true;
    } else {
        idCheck4.style.color = '#DB3C3C';
        check4 = false;
    }
}

regForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (check1 && check2 && check3 && check4) {
        socket.emit('userCreate', [regUsername.value, regPassword1.value]);
    }
});

socket.on('userCreated', function(args) {
    window.open("/login","_self");
});

socket.on('userCreatedFalse', function(args) {
    popupText.innerHTML = "Username is already used";
    popup.style.display = "block";
});