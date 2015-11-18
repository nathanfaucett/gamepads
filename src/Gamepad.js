var EventEmitter = require("event_emitter"),
    isNullOrUndefined = require("is_null_or_undefined"),
    isNumber = require("is_number"),
    defaultMapping = require("./defaultMapping"),
    GamepadButton = require("./GamepadButton");


var GamepadPrototype;


module.exports = Gamepad;


function Gamepad() {

    EventEmitter.call(this, -1);

    this.id = null;
    this.index = null;
    this.connected = null;
    this.mapping = defaultMapping;
    this.timestamp = null;
    this.axes = new Array(4);
    this.buttons = new Array(16);
}
EventEmitter.extend(Gamepad);
GamepadPrototype = Gamepad.prototype;

GamepadPrototype.update = function(e) {

    this.id = e.id;
    this.index = e.index;
    this.connected = e.connected;
    this.timestamp = e.timestamp;

    Gamepad_update(this, e.axes, e.buttons);

    return this;
};

GamepadPrototype.setMapping = function(mapping) {
    this.mapping = mapping;
    return this;
};

GamepadPrototype.disconnect = function(e) {

    this.id = e.id;
    this.index = e.index;
    this.connected = false;
    this.mapping = defaultMapping;
    this.timestamp = e.timestamp;

    this.axes.length = 0;
    this.buttons.length = 0;

    this.emitArg("disconnect", this);
    this.removeAllListeners();

    return this;
};

function Gamepad_update(_this, eventAxis, eventButtons) {
    var mapping = _this.mapping,
        buttonsMapping = mapping.buttons,
        axesMapping = mapping.axes,

        buttons = _this.buttons,
        axes = _this.axes,

        i, il;

    i = -1;
    il = buttonsMapping.length - 1;
    while (i++ < il) {
        Gamepad_handleButton(_this, i, buttons, buttonsMapping[i], eventButtons, eventAxis, true);
    }

    i = -1;
    il = axesMapping.length - 1;
    while (i++ < il) {
        Gamepad_handleButton(_this, i, axes, axesMapping[i], eventButtons, eventAxis, false);
    }
}

function Gamepad_handleButton(_this, index, buttons, map, eventButtons, eventAxis, isButtonMapping) {
    var mapIndex = map.index,
        isButton = map.type === 0,
        eventButton = isButton ? eventButtons[mapIndex] : eventAxis[mapIndex],
        isValueEvent, value, button, pressed;

    if (!isNullOrUndefined(eventButton)) {
        isValueEvent = isNumber(eventButton);
        value = isValueEvent ? eventButton : eventButton.value;
        button = buttons[index] || (buttons[index] = new GamepadButton(index));

        if (isButtonMapping && !isButton) {
            if (map.full) {
                value = (1.0 + value) / 2.0;
            } else {
                if (map.direction === 1) {
                    value = value < 0.0 ? 0.0 : value;
                } else {
                    value = value > 0.0 ? 0.0 : -value;
                }
            }
        }

        pressed = isValueEvent ? value !== 0.0 : eventButton.pressed;

        if (button.update(pressed, value)) {
            _this.emitArg(isButtonMapping ? "button" : "axis", button);
        }

        buttons[index] = button;
    }
}
