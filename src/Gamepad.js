var EventEmitter = require("event_emitter"),
    isNumber = require("is_number"),
    GamepadAxis = require("./GamepadAxis"),
    GamepadButton = require("./GamepadButton");


var GamepadPrototype;


module.exports = Gamepad;


function Gamepad() {

    EventEmitter.call(this, -1);

    this.id = null;
    this.index = null;
    this.connected = null;
    this.mapping = null;
    this.timestamp = null;
    this.axes = [];
    this.buttons = [];
}
EventEmitter.extend(Gamepad);
GamepadPrototype = Gamepad.prototype;

GamepadPrototype.update = function(e) {

    this.id = e.id;
    this.index = e.index;
    this.connected = e.connected;
    this.mapping = e.mapping;
    this.timestamp = e.timestamp;

    copyAxes(this, this.axes, e.axes);
    copyButtons(this, this.buttons, e.buttons);

    return this;
};

GamepadPrototype.disconnect = function(e) {

    this.id = e.id;
    this.index = e.index;
    this.connected = false;
    this.mapping = e.mapping;
    this.timestamp = e.timestamp;

    this.axes.length = 0;
    this.buttons.length = 0;

    this.emitArg("disconnect", this);
    this.removeAllListeners();

    return this;
};

function copyAxes(gamepad, a, b) {
    var length = b.length,
        i = -1,
        il = length - 1,
        axis, value;

    a.length = length;

    while (i++ < il) {
        axis = a[i] || (a[i] = new GamepadAxis(i));
        value = b[i];

        if (axis.update(value)) {
            gamepad.emitArg("axis", axis);
        }
    }
}

function copyButtons(gamepad, a, b) {
    if (isNumber(b[0])) {
        return copyButtonsOld(gamepad, a, b);
    } else {
        return copyButtonsNew(gamepad, a, b);
    }
}

function copyButtonsOld(gamepad, a, b) {
    var length = b.length,
        i = -1,
        il = length - 1,
        button, bButton;

    a.length = length;

    while (i++ < il) {
        button = a[i] || (a[i] = new GamepadButton(i));
        bButton = b[i];

        if (button.update(bButton !== 0.0, bButton)) {
            gamepad.emitArg("button", button);
        }
    }
}

function copyButtonsNew(gamepad, a, b) {
    var length = b.length,
        i = -1,
        il = length - 1,
        button, bButton;

    a.length = length;

    while (i++ < il) {
        button = a[i] || (a[i] = new GamepadButton(i));
        bButton = b[i];

        if (button.update(bButton.pressed, bButton.value)) {
            gamepad.emitArg("button", button);
        }
    }
}
