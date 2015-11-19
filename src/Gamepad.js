var createPool = require("create_pool"),
    EventEmitter = require("event_emitter"),
    isNullOrUndefined = require("is_null_or_undefined"),
    isNumber = require("is_number"),
    defaultMapping = require("./defaultMapping"),
    GamepadButton = require("./GamepadButton"),
    GamepadAxis = require("./GamepadAxis");


var reIdFirst = /^(\d+)\-(\d+)\-/,
    reIdParams = /\([^0-9]+(\d+)[^0-9]+(\d+)\)$/,
    GamepadPrototype;


function parseId(id) {
    if ((match = id.match(reIdFirst))) {
        return match[1] + "-" + match[2];
    } else if ((match = id.match(reIdParams))) {
        return match[1] + "-" + match[2];
    } else {
        return id;
    }
}


module.exports = Gamepad;


function Gamepad(id) {

    EventEmitter.call(this, -1);

    this.id = id;
    this.uid = parseId(id);
    this.index = null;
    this.connected = null;
    this.mapping = defaultMapping;
    this.timestamp = null;
    this.axes = new Array(4);
    this.buttons = new Array(16);
}
EventEmitter.extend(Gamepad);
createPool(Gamepad);
GamepadPrototype = Gamepad.prototype;

Gamepad.create = function(id) {
    return Gamepad.getPooled(id);
};

GamepadPrototype.destroy = function() {
    Gamepad.release(this);
    return this;
};

function releaseArray(array) {
    var i = array.length;

    while (i--) {
        array[i].destroy();
        array[i] = null;
    }
}

GamepadPrototype.destructor = function() {

    releaseArray(this.axes);
    releaseArray(this.buttons);

    return this;
};

function initArray(Class, array) {
    var i = array.length;

    while (i--) {
        array[i] = Class.create(i);
    }

    return array;
}

GamepadPrototype.init = function(e) {

    this.index = e.index;
    this.connected = e.connected;
    this.timestamp = e.timestamp;

    initArray(GamepadAxis, this.axes);
    initArray(GamepadButton, this.buttons);

    Gamepad_update(this, e.axes, e.buttons);

    return this;
};

GamepadPrototype.update = function(e) {

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
    this.uid = parseId(this.id);
    this.index = e.index;
    this.connected = false;
    this.mapping = defaultMapping;
    this.timestamp = e.timestamp;

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
        Gamepad_handleButton(_this, i, buttonsMapping[i], buttons, eventButtons, eventAxis);
    }

    i = -1;
    il = axesMapping.length - 1;
    while (i++ < il) {
        Gamepad_handleAxis(_this, i, axesMapping[i], axes, eventButtons, eventAxis);
    }
}

function Gamepad_handleButton(_this, index, map, buttons, eventButtons, eventAxis) {
    var mapIndex = map.index,
        isButton = map.type === 0,
        eventButton = isButton ? eventButtons[mapIndex] : eventAxis[mapIndex],
        isValueEvent, value, button, pressed;

    if (!isNullOrUndefined(eventButton)) {
        isValueEvent = isNumber(eventButton);
        value = isValueEvent ? eventButton : eventButton.value;
        button = buttons[index] || (buttons[index] = new GamepadButton(index));

        if (!isButton) {
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
            _this.emitArg("button", button);
        }
    }
}

function Gamepad_handleAxis(_this, index, map, axes, eventButtons, eventAxis) {
    var mapIndex = map.index,
        isButton = map.type === 0,
        eventButton = isButton ? eventButtons[mapIndex] : eventAxis[mapIndex],
        isValueEvent, value, button;

    if (!isNullOrUndefined(eventButton)) {
        isValueEvent = isNumber(eventButton);
        value = isValueEvent ? eventButton : eventButton.value;
        button = axes[index] || (axes[index] = new GamepadAxis(index));

        if (map.direction) {
            value *= map.direction;
        }

        if (button.update(value)) {
            _this.emitArg("axis", button);
        }
    }
}

GamepadPrototype.toJSON = function(json) {

    json = json || {};

    json.id = this.id;
    json.uid = this.uid;
    json.index = this.index;
    json.connected = this.connected;
    json.mapping = this.mapping;
    json.timestamp = this.timestamp;
    json.axes = eachToJSON(json.axes || [], this.axes);
    json.buttons = eachToJSON(json.buttons || [], this.buttons);

    return json;
};

GamepadPrototype.fromJSON = function(json) {

    this.id = json.id;
    this.uid = json.uid;
    this.index = json.index;
    this.connected = json.connected;
    this.mapping = json.mapping;
    this.timestamp = json.timestamp;
    eachFromJSON(this.axes, json.axes);
    eachFromJSON(this.buttons, json.buttons);

    return this;
};

function eachToJSON(json, array) {
    var i = -1,
        il = array.length - 1;

    while (i++ < il) {
        json[i] = array[i].toJSON(json[i]);
    }

    return json;
}

function eachFromJSON(array, json) {
    var i = -1,
        il = json.length - 1;

    while (i++ < il) {
        array[i].fromJSON(json[i]);
    }

    return array;
}
