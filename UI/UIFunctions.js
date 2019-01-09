// UIFunction.js

//Get min and max point of a spritevisual
global.getGraphicBounds = function (graphic, camera, inverseY) {
    var minPosWorld = new vec3(
        graphic.getTransform().getWorldPosition().x - graphic.getTransform().getWorldScale().x/2,
        (!inverseY)?graphic.getTransform().getWorldPosition().y + graphic.getTransform().getWorldScale().y/2:graphic.getTransform().getWorldPosition().y - graphic.getTransform().getWorldScale().y/2,
        graphic.getTransform().getWorldPosition().z
    );
    var maxPosWorld = new vec3(
        graphic.getTransform().getWorldPosition().x + graphic.getTransform().getWorldScale().x/2,
        (!inverseY)?graphic.getTransform().getWorldPosition().y - graphic.getTransform().getWorldScale().y/2:graphic.getTransform().getWorldPosition().y + graphic.getTransform().getWorldScale().y/2,
        graphic.getTransform().getWorldPosition().z
    );

    var minPos = camera.worldSpaceToScreenSpace(minPosWorld);
    var maxPos = camera.worldSpaceToScreenSpace(maxPosWorld);

    var bounds = {
        minPos:{
            x:minPos.x,
            y:minPos.y
        },
        maxPos:{
            x:maxPos.x,
            y:maxPos.y
        }
    }

    return bounds;
}

//Get min and max point of a sprite visual inclusing all its children
global.getObjectBounds = function(sceneObject,camera,excluded) {
    var bounds = {
        minPos:{
            x:null,
            y:null
        },
        maxPos:{
            x:null,
            y:null
        }
    }

    return getBoundsRecursive(bounds,sceneObject,camera,excluded);
}

function getBoundsRecursive(bounds, object, camera, excluded) {
    if(object == null) {
        return bounds;
    }

    //Check the bounds of the object
    if(object.getComponentCount("Component.SpriteVisual") > 0) {
        var excludeObject = false;
        
        if(excluded.length > 0) {
            for(var i = 0; i < excluded.length; i++) {
                if( excluded[i].getSceneObject().name == object.name && 
                    excluded[i].getSceneObject().getChildrenCount() == object.getChildrenCount() && 
                    excluded[i].getSceneObject().getParent().name == object.getParent().name) {
                    excludeObject = true;
                }
            }
        }

        if(!excludeObject) {
            var minX = object.getTransform().getWorldPosition().x - object.getTransform().getWorldScale().x/2;
            var maxX = object.getTransform().getWorldPosition().x + object.getTransform().getWorldScale().x/2;
            var minY = object.getTransform().getWorldPosition().y + object.getTransform().getWorldScale().y/2;
            var maxY = object.getTransform().getWorldPosition().y - object.getTransform().getWorldScale().y/2;

            //Increase bounds if they are bigger
            if(bounds.minPos.x > minX || bounds.minPos.x == null) bounds.minPos.x = minX;
            if(bounds.maxPos.x < maxX || bounds.maxPos.x == null) bounds.maxPos.x = maxX;
            if(bounds.minPos.y < minY || bounds.minPos.y == null) bounds.minPos.y = minY;
            if(bounds.maxPos.y > maxY || bounds.maxPos.y == null) bounds.maxPos.y = maxY;
        }
    }

    if(object.getChildrenCount() != 0) {
        for(var i = 0; i < object.getChildrenCount(); i++) {
            var child = object.getChild(i);
            if(child.name != "slice") {
                bounds = getBoundsRecursive(bounds, child, camera, excluded);
            }
        }
    }

    return bounds;
}

//Find the camera where the object is parented to
global.findParentCamera = function(sceneObject) {
    
    var object = sceneObject;
    var findCam = null;
    var stop = false;

    while(findCam == null && stop == false) {
        try {
            object = object.getParent();
            if(object.getComponentCount("Component.Camera") > 0) {
                findCam = object.getFirstComponent("Component.Camera");
                return findCam;
            }
        } catch(e) {}
    }

    print("[warning] could not find a camera for " + sceneObject.name);
    stop = true;
    return null;
}
