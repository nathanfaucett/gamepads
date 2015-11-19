var GamepadAxisPrototype = GamepadAxis.prototype;


module.exports = GamepadAxis;


function GamepadAxis(index) {
    this.index = index;
    this.value = 0.0;
}

GamepadAxisPrototype.update = function(value) {
    var changed = value !== this.value;

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
