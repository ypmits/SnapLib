// ScreenAligner.js
//@input Component.Camera camera
//@input bool scaleWithScreen = true
//@input string scaleWith = width {"widget":"combobox", "values":[{"label":"Width", "value":"width"}, {"label":"Height", "value":"height"}]}
//@input float scale = 0.1 {"widget":"slider","min":"0","max":"1","step":"0.01"}
//@input vec2 screenPosition
//@input vec2 objectPivot = {0.5,0.5}


//@ui {"widget":"group_start", "label":"object"}
    //@input bool useAutoScale = true;
    //@input vec2 objectSize = {1,1} {"showIf":"useAutoScale", "showIfValue":"false"}
    //@input Component.SpriteVisual[] excludeSprites
//@ui {"widget":"group_end"}
//@ui {"widget":"group_start", "label":"editor"}
    //@input bool drawEditor = false
    //@input Asset.ObjectPrefab areaPrefab
    //@input Asset.ObjectPrefab pivotPrefab
//@ui {"widget":"group_end"}

var camera = script.camera;

if(script.camera == null) {
    camera = global.findParentCamera(script.getSceneObject());
}

var scale = script.getSceneObject().getTransform().getWorldScale();
var bounds;
var worldBounds;

function PositionObject() {
    var scaleRatio = 1;
    var object = script.getSceneObject();
    var width = bounds.maxPos.x - bounds.minPos.x;
    var height = bounds.minPos.y - bounds.maxPos.y;
    var x = (bounds.maxPos.x + bounds.minPos.x)/2 - object.getTransform().getWorldPosition().x;
    var y = (bounds.maxPos.y+bounds.minPos.y)/2 - object.getTransform().getWorldPosition().y;

    

    if(script.scaleWithScreen) {
        var screenBounds = {
            minPos: camera.worldSpaceToScreenSpace(new vec3(bounds.minPos.x,bounds.minPos.y,script.getTransform().getWorldPosition().z)),
            maxPos: camera.worldSpaceToScreenSpace(new vec3(bounds.maxPos.x,bounds.maxPos.y,script.getTransform().getWorldPosition().z))
        }
        var screenWidth = screenBounds.maxPos.x - screenBounds.minPos.x;
        var screenHeight = screenBounds.maxPos.y - screenBounds.minPos.y;

        switch(script.scaleWith) {
            case "width":
                scaleRatio = script.scale/screenWidth;
            break;
            case "height":
                scaleRatio = script.scale/screenHeight;
            break;
            default:
                print("ERROR!: Please select a 'scale with' parameter")
        }
        object.getTransform().setWorldScale(new vec3(scale.x * scaleRatio, scale.y * scaleRatio, 1));
    }

    //Position object to screen position
    var worldPos = camera.screenSpaceToWorldSpace(script.screenPosition,0);
    worldPos.x -= width * scaleRatio * (script.objectPivot.x - 0.5) + x * scaleRatio;
    worldPos.y -= height * scaleRatio * (1 - script.objectPivot.y - 0.5) + y * scaleRatio;
    worldPos.z = object.getTransform().getWorldPosition().z;

    object.getTransform().setWorldPosition(worldPos);
}

function DrawDebugLayers() {
    var area = script.areaPrefab.instantiate(script.getSceneObject());
    var pivot = script.pivotPrefab.instantiate(script.getSceneObject());

    var width = bounds.maxPos.x - bounds.minPos.x;
    var height = bounds.minPos.y - bounds.maxPos.y;
    var x = (bounds.maxPos.x + bounds.minPos.x)/2;
    var y = (bounds.maxPos.y+bounds.minPos.y)/2;

    //Scale area and pivot
    area.getTransform().setWorldScale(new vec3(width,height,1));
    pivot.getTransform().setWorldScale(new vec3(1,1,1));

    //Position area
    area.getTransform().setWorldPosition(new vec3(x,y,0));

    //Position pivot
    var pivotPos = new vec3(x,y,0);
    pivotPos.x += width * (script.objectPivot.x - 0.5);
    pivotPos.y += height * (1 - script.objectPivot.y - 0.5);
    pivotPos.z += 1;
    pivot.getTransform().setWorldPosition(pivotPos);
}

var delayedEvent = script.createEvent("DelayedCallbackEvent");
delayedEvent.bind(function(eventData)
{
    if(script.useAutoScale) {
        bounds = global.getObjectBounds(script.getSceneObject(),camera,script.excludeSprites);
    } else {
        bounds = {
            minPos:{
                x:script.getTransform().getWorldPosition().x-script.objectSize.x/2,
                y:script.getTransform().getWorldPosition().y+script.objectSize.y/2
            },
            maxPos:{
                x:script.getTransform().getWorldPosition().x+script.objectSize.x/2,
                y:script.getTransform().getWorldPosition().y-script.objectSize.y/2
            }
        }
    }
    
    if(script.drawEditor) {
        DrawDebugLayers();
    }

    PositionObject();
});

delayedEvent.reset(.1);