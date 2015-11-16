var GamepadButtonPrototype = GamepadButton.prototype;


module.exports = GamepadButton;


function GamepadButton(index) {
    this.index = index;
    this.pressed = false;
    this.value = 0.0;
}

GamepadButtonPrototype.update = function(pressed, value) {
    var changed = value !== this.value;

    this.pressed = pressed;
    this.value = value;

    return changed;
};
