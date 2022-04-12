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