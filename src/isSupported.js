var environment = require("environment");


var navigator = environment.window.navigator;


module.exports = !!(navigator.webkitGetGamepads || navigator.webkitGamepads);
