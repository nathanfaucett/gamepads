var gamepads = require("../..");


global.gamepads = gamepads;


gamepads.on("connect", function(gamepad) {
    gamepad.on("button", function(button) {
        console.log(button);
    });
    gamepad.on("axis", function(axis) {
        console.log(axis);
    });
});
