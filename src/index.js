var has = require("has"),
    values = require("values"),
    environment = require("environment"),
    eventListener = require("event_listener"),
    EventEmitter = require("event_emitter"),
    requestAnimationFrame = require("request_animation_frame"),
    isSupported = require("./isSupported"),
    defaultMapping = require("./defaultMapping"),
    Gamepad = require("./Gamepad");


var window = environment.window,
    navigator = window.navigator,

    gamepads = new EventEmitter(),
    mapping = {
        defaultMapping: defaultMapping
    },
    controllers = {};


gamepads.isSupported = isSupported;

gamepads.setMapping = function(id, mappings) {
    mapping[id] = mappings;
};

gamepads.all = function() {
    return values(controllers);
};

gamepads.get = function(index) {
    return controllers[index];
};

gamepads.hasGamepad = hasGamepad;

function onGamepadConnected(e) {
    var gamepad = e.gamepad;
    updateGamepad(gamepad.index, gamepad);
}

function onGamepadDisconnected(e) {
    var gamepad = e.gamepad;
    removeGamepad(gamepad.index, gamepad);
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
        gamepad.setMapping(mapping[eventGamepad.id] || defaultMapping);
        gamepad.update(eventGamepad);
        controllers[index] = gamepad;
        gamepads.emitArg("connect", gamepad);
    }
}

function removeGamepad(index, eventGamepad) {
    var gamepad = controllers[index];

    if (gamepad) {
        gamepad.disconnect(eventGamepad);
        gamepads.emitArg("disconnect", gamepad);
    }
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
