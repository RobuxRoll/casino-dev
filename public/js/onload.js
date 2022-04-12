function checkLoggedIn () {
    if (isLoggedIn) {
        window.open("/profile","_self");
    }
}

function uncheckLoggedIn () {
    if (!isLoggedIn) {
        window.open("/register","_self");
    }
}

function checkBody () {
    document.getElementsByTagName('body')[0].style.overflow = "hidden";
}