var environment = require("@nathanfaucett/environment");


var navigator = environment.window.navigator;


module.exports = !!(
    navigator.getGamepads ||
    navigator.gamepads ||
    navigator.webkitGamepads ||
    navigator.webkitGetGamepads
);
