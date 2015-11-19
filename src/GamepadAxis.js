var createPool = require("create_pool");


var GamepadAxisPrototype;


module.exports = GamepadAxis;


function GamepadAxis(index) {
    this.index = index;
    this.value = 0.0;
}
createPool(GamepadAxis);
GamepadAxisPrototype = GamepadAxis.prototype;

GamepadAxis.create = function(index) {
    return GamepadAxis.getPooled(index);
};

GamepadAxisPrototype.destroy = function() {
    GamepadAxis.release(this);
    return this;
};

GamepadAxisPrototype.update = function(value) {
    var changed = Math.abs(value - this.value) > 0.01;

    this.value = value;

    return changed;
};

GamepadAxisPrototype.toJSON = function(json) {

    json = json || {};

    json.index = this.index;
    json.value = this.value;

    return json;
};

GamepadAxisPrototype.fromJSON = function(json) {

    this.index = json.index;
    this.value = json.value;

    return this;
};
