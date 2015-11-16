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
