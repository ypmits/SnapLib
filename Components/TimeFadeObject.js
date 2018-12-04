//@input bool isGlobalPercentage
//@input Component.ScriptComponent percentageScript {"showIf":"isGlobalPercentage", "showIfValue":"false"}
//@input string percentageVariable
//@ui {"widget":"separator"}
//@input string objectType {"widget":"combobox", "values":[{"label":"faceMask", "value":"faceMask"}, {"label":"eyeColor", "value":"eyeColor"},{"label":"sprite", "value":"sprite"},{"label":"post effect", "value":"posteffect"}]}
//input Asset.Material material {"showIf":"objectType", "showIfValue":"material"}
//@input vec2[] timeValueDictionary

var timePercentage = global.timePercentage;
var fadeObject;

// Get the object
switch(script.objectType) {
    case "faceMask":
        fadeObject = script.getSceneObject().getFirstComponent("Component.FaceMaskVisual");
    break;
    case "eyeColor":
        fadeObject = script.getSceneObject().getFirstComponent("Component.EyeColorVisual");
    break;
    case "sprite":
        fadeObject = script.getSceneObject().getFirstComponent("Component.SpriteVisual");
    break;
    case "posteffect":
        fadeObject = script.getSceneObject().getFirstComponent("Component.PostEffectVisual");
    break;
    default:
        print("<ERROR> component not found of type: " + script.objectType);
    break;
}

//Lerp Function
Math.lerp = function (value1, value2, amount) {
	amount = amount < 0 ? 0 : amount;
	amount = amount > 1 ? 1 : amount;
	return value1 + (value2 - value1) * amount;
};

//Calculate local percentage methods
function checkObjectPercentage() {
    var previousValue = new vec2(0,0);
    var nextValue = new vec2(1,0);

    //Find closest points on timeline
    for(var i = 0; i < script.timeValueDictionary.length; i++) {
        //Get previous point
        if((script.timeValueDictionary[i].x < timePercentage || (script.timeValueDictionary[i].x == timePercentage && timePercentage != 1)) && script.timeValueDictionary[i].x >= previousValue.x) {
            previousValue = script.timeValueDictionary[i];
        }
        //GetNextPoint
        if((script.timeValueDictionary[i].x > timePercentage || (script.timeValueDictionary[i].x == timePercentage && timePercentage == 1)) && script.timeValueDictionary[i].x <= nextValue.x) {
            nextValue = script.timeValueDictionary[i];
        }
    }

    //Calculate the local time between the points
    var timeDif = nextValue.x - previousValue.x;
    var localTimePercentage = (timePercentage - previousValue.x) / timeDif;
    var opacityValue = Math.lerp(previousValue.y,nextValue.y,localTimePercentage)

    fadeObject.mainPass.baseColor = new vec4(1,1,1,opacityValue);
}

//#region Events
var event = script.createEvent("UpdateEvent");
event.bind(function (eventData)
{
    timePercentage = global.timePercentage;
    checkObjectPercentage();
});
//#endregion