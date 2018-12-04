//@input bool isGlobalPercentage
//@input Component.ScriptComponent percentageScript {"showIf":"isGlobalPercentage", "showIfValue":"false"}
//@input string percentageVariable
//@ui {"widget":"separator"}
//@input float timeToDoCallback {"widget":"slider", "min":"0", "max":"1","step":"0.01"}
//@ui {"widget":"group_start", "label":"Callback Bigger"}
    //@input bool isGlobalBigger {"label":"Is Global"}
    //@input Component.ScriptComponent functionScriptBigger {"label":"Function Script", "showIf":"isGlobalBigger", "showIfValue":"false"}
    //@input string functionNameBigger {"label":"Function Name"}
//@ui {"widget":"group_end"}
//@ui {"widget":"group_start", "label":"Callback Less"}
    //@input bool isGlobalLess {"label":"Is Global"}
    //@input Component.ScriptComponent functionScriptLess {"label":"Function Script", "showIf":"isGlobalLess", "showIfValue":"false"}
    //@input string functionNameLess {"label":"Function Name"}
//@ui {"widget":"group_end"}

var didCallback = false;

var timePercentage;// = global.timePercentage;

function checkCallback() {
    if(timePercentage >= script.timeToDoCallback) {
        if(didCallback == false) {
            didCallback = true;

            if(script.isGlobalBigger) {
                global[script.functionNameBigger]();
            } else {
                script.functionScriptBigger.api[script.functionNameBigger]();
            }
        }
    } else {
        if(didCallback == true) {
            didCallback = false;

            if(script.isGlobalLess) {
                global[script.functionNameLess]();
            } else {
                script.functionScriptLess.api[script.functionNameLess]();
            }
        }
    }
}

var event = script.createEvent("UpdateEvent");
event.bind(function (eventData)
{
    if(script.isGlobalPercentage) {
        timePercentage = global[script.percentageVariable];
    } else {
        timePercentage = script.percentageScript.api[script.percentageVariable];
    }
    timePercentage = global.timePercentage;
    checkCallback();
});
