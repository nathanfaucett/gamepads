var has = require("has"),
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
        "default": defaultMapping
    },
    polling = false,
    activeControllers = 0,
    pollId = null,
    controllers = [];


gamepads.isSupported = isSupported;

gamepads.setMapping = function(id, mappings) {
    mapping[id] = mappings;
};

gamepads.all = function() {
    return controllers.slice();
};

gamepads.getActiveCount = function() {
    return activeControllers;
};

gamepads.get = function(index) {
    return controllers[index];
};

gamepads.hasGamepad = hasGamepad;
gamepads.hasMapping = hasMapping;

function onGamepadConnected(e) {
    var gamepad = e.gamepad;

    if (!polling) {
        startPollingGamepads();
    }

    updateGamepad(gamepad.index, gamepad);
}

function onGamepadDisconnected(e) {
    var gamepad = e.gamepad;

    removeGamepad(gamepad.index, gamepad);

    if (activeControllers === 0 && polling) {
        stopPollingGamepads();
    }
}

function hasGamepad(index) {
    return !!controllers[index];
}

function hasMapping(id) {
    return has(mapping, id);
}

function getMapping(id) {
    return hasMapping(id) ? mapping[id] : defaultMapping;
}

function updateGamepad(index, eventGamepad) {
    var gamepad;

    if (hasGamepad(index)) {
        controllers[index].update(eventGamepad);
    } else {
        gamepad = new Gamepad(eventGamepad.id);

        gamepad.setMapping(getMapping(gamepad.uid));
        gamepad.init(eventGamepad);

        controllers[index] = gamepad;
        activeControllers += 1;

        gamepads.emitArg("connect", gamepad);
    }
}

function removeGamepad(index, eventGamepad) {
    var gamepad = controllers[index];

    if (gamepad) {
        controllers.splice(index, 1);
        activeControllers -= 1;

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

function startPollingGamepads() {
    if (!polling) {
        polling = true;
        pollId = requestAnimationFrame(pollGamepads);
    }
}

function stopPollingGamepads() {
    if (polling) {
        polling = false;
        requestAnimationFrame.cancel(pollId);
    }
}

function pollGamepads() {
    getGamepads();
    pollId = requestAnimationFrame(pollGamepads);
}


eventListener.on(window, "gamepadconnected", onGamepadConnected);
eventListener.on(window, "gamepaddisconnected", onGamepadDisconnected);


if (!("ongamepadconnected" in window)) {
    startPollingGamepads();
}


module.exports = gamepads;
