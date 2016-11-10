var has = require("@nathanfaucett/has"),
    environment = require("@nathanfaucett/environment"),
    eventListener = require("@nathanfaucett/event_listener"),
    EventEmitter = require("@nathanfaucett/event_emitter"),
    requestAnimationFrame = require("@nathanfaucett/request_animation_frame"),
    isSupported = require("./isSupported"),
    defaultMapping = require("./defaultMapping"),
    Gamepad = require("./Gamepad");


var window = environment.window,
    navigator = window.navigator,

    gamepads = new EventEmitter(),
    mapping = {
        "default": defaultMapping
    },
    IS_POLLING = false,
    ACTIVE_CONTROLLERS = 0,
    POLL_ID = null,
    CONTROLLERS = [];


gamepads.isSupported = isSupported;

gamepads.setMapping = function(id, mappings) {
    mapping[id] = mappings;
};

gamepads.all = function() {
    return CONTROLLERS.slice();
};

gamepads.getActiveCount = function() {
    return ACTIVE_CONTROLLERS;
};

gamepads.get = function(index) {
    return CONTROLLERS[index];
};

gamepads.hasGamepad = hasGamepad;
gamepads.hasMapping = hasMapping;

function onGamepadConnected(e) {
    var gamepad = e.gamepad;

    if (!IS_POLLING) {
        startPollingGamepads();
    }

    updateGamepad(gamepad.index, gamepad);
}

function onGamepadDisconnected(e) {
    var gamepad = e.gamepad;

    removeGamepad(gamepad.index, gamepad);

    if (ACTIVE_CONTROLLERS === 0 && IS_POLLING) {
        stopPollingGamepads();
    }
}

function hasGamepad(index) {
    return !!CONTROLLERS[index];
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
        gamepad = CONTROLLERS[index];

        if (gamepad.update(eventGamepad)) {
            gamepads.emitArg("update", gamepad);
        }
    } else {
        gamepad = Gamepad.create(eventGamepad.id);

        gamepad.setMapping(getMapping(gamepad.uid));
        gamepad.init(eventGamepad);

        CONTROLLERS[index] = gamepad;
        ACTIVE_CONTROLLERS += 1;

        gamepads.emitArg("connect", gamepad);
    }
}

function removeGamepad(index, eventGamepad) {
    var gamepad = CONTROLLERS[index];

    if (gamepad) {
        CONTROLLERS.splice(index, 1);
        ACTIVE_CONTROLLERS -= 1;

        gamepad.disconnect(eventGamepad);
        gamepads.emitArg("disconnect", gamepad);
        gamepad.destroy();
    }
}

function getGamepads() {
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (
            navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []
        ),
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
    if (!IS_POLLING) {
        IS_POLLING = true;
        POLL_ID = requestAnimationFrame(pollGamepads);
    }
}

function stopPollingGamepads() {
    if (IS_POLLING) {
        IS_POLLING = false;
        requestAnimationFrame.cancel(POLL_ID);
    }
}

function pollGamepads() {
    getGamepads();
    POLL_ID = requestAnimationFrame(pollGamepads);
}


if (isSupported) {
    eventListener.on(window, "gamepadconnected", onGamepadConnected);
    eventListener.on(window, "gamepaddisconnected", onGamepadDisconnected);

    if (!("ongamepadconnected" in window)) {
        startPollingGamepads();
    }
}


module.exports = gamepads;