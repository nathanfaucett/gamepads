var $ = require("jquery"),
    MadCatz = require("./MadCatz"),
    gamepads = require("../..");

global.gamepads = gamepads;


gamepads.setMapping("Mad Catz, Inc. MadCatz GamePad (Vendor: 0738 Product: 4716)", MadCatz);
gamepads.setMapping("0738-4716-Mad Catz Wired Xbox 360 Controller", MadCatz);


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


gamepads.on("connect", function(gamepad) {
    var index = gamepad.index,
        id = "gamepad-" + index,
        element = $("#template").first().clone();
    
    console.log(gamepad.id);
    
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
            elLabel = element.find(".labels label[for=" + domAxisMappings1[axis.index] + "]");
    
        if (axis.index % 2 === 0) {
            elButton.css("margin-left", (axis.value * 25) + "px");
        } else {
            elButton.css("margin-top", (axis.value * 25) + "px");
        }

        elLabel.text(axis.value.toFixed(2));
    });
});

gamepads.on("disconnect", function(gamepad) {
    var index = gamepad.index,
        id = "gamepad-" + index,
        element = $("#" + id);

    $("#" + id).remove();
});
