// UIFunction.js

//Get min and max point of a spritevisual
script.api.getGraphicBounds = function (graphic, camera) {
    var minPosWorld = new vec3(
        graphic.getTransform().getWorldPosition().x - graphic.getTransform().getWorldScale().x/2,
        graphic.getTransform().getWorldPosition().y + graphic.getTransform().getWorldScale().y/2,
        graphic.getTransform().getWorldPosition().z
    );
    var maxPosWorld = new vec3(
        graphic.getTransform().getWorldPosition().x + graphic.getTransform().getWorldScale().x/2,
        graphic.getTransform().getWorldPosition().y - graphic.getTransform().getWorldScale().y/2,
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
