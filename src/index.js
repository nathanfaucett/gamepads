var has = require("has"),
    values = require("values"),
    environment = require("environment"),
    eventListener = require("event_listener"),
    EventEmitter = require("event_emitter"),
    requestAnimationFrame = require("request_animation_frame"),
    isSupported = require("./isSupported"),
    Gamepad = require("./Gamepad");


var window = environment.window,
    navigator = window.navigator,

    gamepads = new EventEmitter(),
    controllers = {};


gamepads.isSupported = isSupported;

gamepads.all = function() {
    return values(controllers);
};

gamepads.get = function(index) {
    return controllers[index];
};

gamepads.hasGamepad = hasGamepad;

function onGamepadConnected(e) {
    updateGamepad(e.index, e);
}

function onGamepadDisconnected(e) {
    removeGamepad(e.index, e);
}

function hasGamepad(index) {
    return has(controllers, index);
}

function updateGamepad(index, eventGamepad) {
    var gamepad;

    if (hasGamepad(index)) {
        controllers[index].update(eventGamepad);
    } else {
        gamepad = new Gamepad();
        gamepad.update(eventGamepad);
        controllers[index] = gamepad;
        gamepads.emitArg("connect", gamepad);
    }
}

function removeGamepad(index, eventGamepad) {
    var gamepad = gamepad;
    gamepad.disconnect(eventGamepad);
    gamepads.emitArg("disconnect", gamepad);
}

function getGamepads() {
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []),
        i = -1,
        il = gamepads.length - 1,
        gamepad;

    while (i++ < il) {
        gamepad = gamepads[i];

        if (gamepad) {
            updateGamepad(gamepad.index, gamepad);
        }
    }
}

function pollGamepads() {
    getGamepads();
    requestAnimationFrame(pollGamepads);
}

eventListener.on(window, "gamepadconnected", onGamepadConnected);
eventListener.on(window, "gamepaddisconnected", onGamepadDisconnected);

if (!("ongamepadconnected" in window)) {
    requestAnimationFrame(pollGamepads);
}


module.exports = gamepads;
