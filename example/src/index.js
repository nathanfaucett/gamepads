var $ = require("jquery"),
    MadCatz = require("./MadCatz"),
    gamepads = require("../..");


var connected = 0;


global.gamepads = gamepads;

gamepads.setMapping("0738-4716", MadCatz);


$("#no-gamepads-connected").addClass("visible");

if (!gamepads.isSupported) {
    $("#no-gamepad-support").addClass("visible");
}


var domMappings = [
    "button-1",
    "button-2",
    "button-3",
    "button-4",
    "button-left-shoulder-top",
    "button-right-shoulder-top",
    "button-left-shoulder-bottom",
    "button-right-shoulder-bottom",
    "button-select",
    "button-start",
    "stick-1",
    "stick-2",
    "button-dpad-top",
    "button-dpad-bottom",
    "button-dpad-left",
    "button-dpad-right",
    "button-special"
];

var domAxisMappings0 = [
    "stick-1",
    "stick-2"
];

var domAxisMappings1 = [
    "stick-1-axis-x",
    "stick-1-axis-y",
    "stick-2-axis-x",
    "stick-2-axis-y"
];

var axisMappings = [
    0, 0,
    0, 0
];


gamepads.on("connect", function(gamepad) {
    var index = gamepad.index,
        id = "gamepad-" + index,
        element = $("#template").first().clone();
        
    element.attr("id", id);
    element.find(".index").html(index);

    $("#gamepads").append(element);

    gamepad.on("button", function(button) {
        var elButton = element.find(".buttons div[name=" + domMappings[button.index] + "]"),
            elLabel = element.find(".labels label[for=" + domMappings[button.index] + "]");

        if (button.pressed) {
            elButton.addClass("pressed");
        } else {
            elButton.removeClass("pressed");
        }

        elLabel.text(button.value.toFixed(2));
    });
    
    gamepad.on("axis", function(axis) {
        var elButton = element.find(".buttons div[name=" + domAxisMappings0[(axis.index < 2 ? 0 : 1)] + "]"),
            elLabel = element.find(".labels label[for=" + domAxisMappings1[axis.index] + "]"),
            x, y, angle;
    
        axisMappings[axis.index] = axis.value;
        
        if (axis.index % 2 === 0) {
            x = axisMappings[axis.index];
            y = axisMappings[axis.index + 1];
        } else {
            x = axisMappings[axis.index - 1];
            y = axisMappings[axis.index];
        }
        
        angle = Math.atan2(y, x);
        x = Math.cos(angle) * Math.abs(x);
        y = Math.sin(angle) * Math.abs(y);
    
        elButton.css("margin-left", (x * 25) + "px");
        elButton.css("margin-top", (y * 25) + "px");

        elLabel.text(axis.value.toFixed(2));
    });

    if (connected === 0) {
        $("#no-gamepads-connected").removeClass("visible");
    }

    connected += 1;
});

gamepads.on("disconnect", function(gamepad) {
    var index = gamepad.index,
        id = "gamepad-" + index,
        element = $("#" + id);

    $("#" + id).remove();

    connected -= 1;

    if (connected === 0) {
        $("#no-gamepads-connected").addClass("visible");
    }
});
