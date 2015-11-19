var createPool = require("create_pool");


var GamepadButtonPrototype;


module.exports = GamepadButton;


function GamepadButton(index) {
    this.index = index;
    this.pressed = false;
    this.value = 0.0;
}
createPool(GamepadButton);
GamepadButtonPrototype = GamepadButton.prototype;

GamepadButton.create = function(index) {
    return GamepadButton.getPooled(index);
};

GamepadButtonPrototype.destroy = function() {
    GamepadButton.release(this);
    return this;
};

GamepadButtonPrototype.update = function(pressed, value) {
    var changed = value !== this.value;

    this.pressed = pressed;
    this.value = value;

    return changed;
};

GamepadButtonPrototype.toJSON = function(json) {

    json = json || {};

    json.index = this.index;
    json.pressed = this.pressed;
    json.value = this.value;

    return json;
};

GamepadButtonPrototype.fromJSON = function(json) {

    this.index = json.index;
    this.pressed = json.pressed;
    this.value = json.value;

    return this;
};
