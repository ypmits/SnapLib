//9Slicing.js
//@input Component.Camera camera
//@input vec2 cutsHorizontal = {0.3,0.7}
//@input vec2 cutsVertical = {0.3,0.7}
//@input float scale {"widget":"slider", "min":"1", "max":"10.0", "step":"0.01"}

//@ui {"widget":"separator"}
//@input Asset.ObjectPrefab slicePrefab

var camera = script.camera;

if(script.camera == null) {
    camera = global.findParentCamera(script.getSceneObject());
}

var frame = 0;
var spawned = false;

var bounds;
var objects = [];
var scale = script.scale * 10;
var graphic = script.getSceneObject().getFirstComponent("Component.SpriteVisual");
var sprite = script.getSceneObject().getFirstComponent("Component.SpriteVisual").mainPass.baseTex;
var material = script.getSceneObject().getFirstComponent("Component.SpriteVisual").mainMaterial;

//Spawn all slices and position them correctly
function SpawnSlicedSprites() {
    for(var i = 0; i < objects.length; i++) {
        objects[i].getSceneObject().destroy();
    }
    objects = [];

    
    var newGraphic;
    var worldBounds = {
        minPos: camera.screenSpaceToWorldSpace(new vec2(bounds.minPos.x,bounds.minPos.y),0),
        maxPos: camera.screenSpaceToWorldSpace(new vec2(bounds.maxPos.x,bounds.maxPos.y),0),
    }

    var maxScaleY = (worldBounds.minPos.y - worldBounds.maxPos.y)/(script.cutsHorizontal.x + (1-script.cutsHorizontal.y));
    var maxScaleX = (worldBounds.maxPos.x - worldBounds.minPos.x)/(script.cutsVertical.x + (1-script.cutsVertical.y));
    var maxScale = (maxScaleX>maxScaleY)?maxScaleY:maxScaleX;
    if(maxScale < scale) scale = maxScale;
    
    var verticalGraphicLength = (script.cutsHorizontal.y - script.cutsHorizontal.x) * scale;
    var verticalSize = worldBounds.minPos.y - worldBounds.maxPos.y - script.cutsHorizontal.x * scale - (1-script.cutsHorizontal.y) * scale;
    var numberOfVerticalGraphics = Math.round(verticalSize/verticalGraphicLength);
    if(numberOfVerticalGraphics < 1) numberOfVerticalGraphics = 1;

    var horizontalGraphicLength = (script.cutsVertical.y - script.cutsVertical.x) * scale;
    var horizontalSize = worldBounds.maxPos.x - worldBounds.minPos.x - script.cutsVertical.x * scale - (1-script.cutsVertical.y) * scale;
    var numberOfHorizontalGraphics = Math.round(horizontalSize/horizontalGraphicLength);
    if(numberOfHorizontalGraphics < 1) numberOfHorizontalGraphics = 1;

    if(numberOfVerticalGraphics > 15 || numberOfHorizontalGraphics > 15) {
        print("WARNING: 9slicing has to spawn too many sprites, try to increase the scale");
        return;
    }
    
    //#region SpawnCorners
        //Left Top Corner
        newGraphic = SpawnPreparedGraphic();
        newGraphic.getTransform().setWorldScale(new vec3(script.cutsVertical.x * scale,script.cutsHorizontal.x * scale,1));
        newGraphic.getTransform().setWorldPosition(new vec3(worldBounds.minPos.x + script.cutsVertical.x * scale/2,worldBounds.minPos.y - script.cutsHorizontal.x * scale/2,script.getSceneObject().getTransform().getWorldPosition().z));
        newGraphic.mainPass.uv2Scale = new vec2(script.cutsVertical.x,script.cutsHorizontal.x);
        newGraphic.mainPass.uv2Offset = new vec2(0,1-script.cutsHorizontal.x);
        
        //Right Top Corner
        newGraphic = SpawnPreparedGraphic();
        newGraphic.getTransform().setWorldScale(new vec3((1-script.cutsVertical.y) * scale,script.cutsHorizontal.x * scale,1));
        newGraphic.getTransform().setWorldPosition(new vec3(worldBounds.maxPos.x - (1-script.cutsVertical.y) * scale/2,worldBounds.minPos.y - script.cutsHorizontal.x * scale/2,script.getSceneObject().getTransform().getWorldPosition().z));
        newGraphic.mainPass.uv2Scale = new vec2(1-script.cutsVertical.y,script.cutsHorizontal.x);
        newGraphic.mainPass.uv2Offset = new vec2(script.cutsVertical.y,1-script.cutsHorizontal.x);

        //Left Bottom Corner
        newGraphic = SpawnPreparedGraphic();
        newGraphic.getTransform().setWorldScale(new vec3(script.cutsVertical.x * scale,(1-script.cutsHorizontal.y) * scale,1));
        newGraphic.getTransform().setWorldPosition(new vec3(worldBounds.minPos.x + script.cutsVertical.x * scale/2,worldBounds.maxPos.y + (1-script.cutsHorizontal.y) * scale/2,script.getSceneObject().getTransform().getWorldPosition().z));
        newGraphic.mainPass.uv2Scale = new vec2(script.cutsVertical.x,1-script.cutsHorizontal.y);
        newGraphic.mainPass.uv2Offset = new vec2(0,0);

        //Right Bottom Corner
        newGraphic = SpawnPreparedGraphic();
        newGraphic.getTransform().setWorldScale(new vec3((1-script.cutsVertical.y) * scale,(1-script.cutsHorizontal.y) * scale,1));
        newGraphic.getTransform().setWorldPosition(new vec3(worldBounds.maxPos.x - (1-script.cutsVertical.y) * scale/2,worldBounds.maxPos.y + (1-script.cutsHorizontal.y) * scale/2,script.getSceneObject().getTransform().getWorldPosition().z));
        newGraphic.mainPass.uv2Scale = new vec2(1-script.cutsVertical.y,1-script.cutsHorizontal.y);
        newGraphic.mainPass.uv2Offset = new vec2(script.cutsVertical.y,0);
    //#endregion
    //#region SpawnSides

        //Spawn Top Sides
        for(var i = 0; i < numberOfHorizontalGraphics; i++) {
            newGraphic = SpawnPreparedGraphic();
            newGraphic.getTransform().setWorldScale(new vec3((script.cutsVertical.y - script.cutsVertical.x) * scale * (horizontalSize/horizontalGraphicLength)/numberOfHorizontalGraphics,script.cutsHorizontal.x * scale,1));
            newGraphic.getTransform().setWorldPosition(new vec3(worldBounds.minPos.x + (i*2+1)*((script.cutsVertical.y - script.cutsVertical.x)/numberOfHorizontalGraphics * scale * (horizontalSize/horizontalGraphicLength)/2) + script.cutsVertical.x * scale, worldBounds.minPos.y - script.cutsHorizontal.x * scale/2,script.getSceneObject().getTransform().getWorldPosition().z));
            newGraphic.mainPass.uv2Scale = new vec2(script.cutsVertical.y - script.cutsVertical.x,script.cutsHorizontal.x);
            newGraphic.mainPass.uv2Offset = new vec2(script.cutsVertical.x,1-script.cutsHorizontal.x);
        }

        //Spawn Bottom Sides
        for(var i = 0; i < numberOfHorizontalGraphics; i++) {
            newGraphic = SpawnPreparedGraphic();
            newGraphic.getTransform().setWorldScale(new vec3((script.cutsVertical.y - script.cutsVertical.x) * scale * (horizontalSize/horizontalGraphicLength)/numberOfHorizontalGraphics,(1-script.cutsHorizontal.y) * scale,1));
            newGraphic.getTransform().setWorldPosition(new vec3(worldBounds.minPos.x + (i*2+1)*((script.cutsVertical.y - script.cutsVertical.x)/numberOfHorizontalGraphics * scale * (horizontalSize/horizontalGraphicLength)/2) + script.cutsVertical.x * scale, worldBounds.maxPos.y + (1-script.cutsHorizontal.y) * scale/2,script.getSceneObject().getTransform().getWorldPosition().z));
            newGraphic.mainPass.uv2Scale = new vec2(script.cutsVertical.y - script.cutsVertical.x,1-script.cutsHorizontal.y);
            newGraphic.mainPass.uv2Offset = new vec2(script.cutsVertical.x,0);
        }

        //Spawn Left Sides
        for(var i = 0; i < numberOfVerticalGraphics; i++) {
            newGraphic = SpawnPreparedGraphic();
            newGraphic.getTransform().setWorldScale(new vec3(script.cutsVertical.x * scale, (script.cutsHorizontal.y - script.cutsHorizontal.x) * scale * (verticalSize/verticalGraphicLength)/numberOfVerticalGraphics,1));
            newGraphic.getTransform().setWorldPosition(new vec3(worldBounds.minPos.x + script.cutsVertical.x * scale/2, worldBounds.maxPos.y + (i*2+1)*((script.cutsHorizontal.y - script.cutsHorizontal.x)/numberOfVerticalGraphics * scale * (verticalSize/verticalGraphicLength)/2) + script.cutsHorizontal.x * scale, script.getSceneObject().getTransform().getWorldPosition().z));
            newGraphic.mainPass.uv2Scale = new vec2(script.cutsVertical.x,script.cutsHorizontal.y - script.cutsHorizontal.x);
            newGraphic.mainPass.uv2Offset = new vec2(0,1-script.cutsHorizontal.y);
        }

        //Spawn Right Sides
        for(var i = 0; i < numberOfVerticalGraphics; i++) {
            newGraphic = SpawnPreparedGraphic();
            newGraphic.getTransform().setWorldScale(new vec3((1-script.cutsVertical.y) * scale, (script.cutsHorizontal.y - script.cutsHorizontal.x) * scale * (verticalSize/verticalGraphicLength)/numberOfVerticalGraphics,1));
            newGraphic.getTransform().setWorldPosition(new vec3(worldBounds.maxPos.x - (1-script.cutsVertical.y) * scale/2, worldBounds.maxPos.y + (i*2+1)*((script.cutsHorizontal.y - script.cutsHorizontal.x)/numberOfVerticalGraphics * scale * (verticalSize/verticalGraphicLength)/2) + script.cutsHorizontal.x * scale, script.getSceneObject().getTransform().getWorldPosition().z));
            newGraphic.mainPass.uv2Scale = new vec2(1-script.cutsVertical.y,script.cutsHorizontal.y - script.cutsHorizontal.x);
            newGraphic.mainPass.uv2Offset = new vec2(script.cutsVertical.y,1-script.cutsHorizontal.y);
        }
        
        //Spawn Center
        for(var x = 0; x < numberOfHorizontalGraphics; x++) {
            for(var y = 0; y < numberOfVerticalGraphics; y++) {
                newGraphic = SpawnPreparedGraphic();
                newGraphic.getTransform().setWorldScale(new vec3((script.cutsVertical.y - script.cutsVertical.x) * scale * (horizontalSize/horizontalGraphicLength)/numberOfHorizontalGraphics, (script.cutsHorizontal.y - script.cutsHorizontal.x) * scale * (verticalSize/verticalGraphicLength)/numberOfVerticalGraphics,1));
                newGraphic.getTransform().setWorldPosition(new vec3(worldBounds.minPos.x + (x*2+1)*((script.cutsVertical.y - script.cutsVertical.x)/numberOfHorizontalGraphics * scale * (horizontalSize/horizontalGraphicLength)/2) + script.cutsVertical.x * scale, worldBounds.maxPos.y + (y*2+1)*((script.cutsHorizontal.y - script.cutsHorizontal.x)/numberOfVerticalGraphics * scale * (verticalSize/verticalGraphicLength)/2) + script.cutsHorizontal.x * scale, script.getSceneObject().getTransform().getWorldPosition().z));
                newGraphic.mainPass.uv2Scale = new vec2(script.cutsVertical.y - script.cutsVertical.x,script.cutsHorizontal.y - script.cutsHorizontal.x);
                newGraphic.mainPass.uv2Offset = new vec2(script.cutsVertical.x,script.cutsHorizontal.x);
            }
        }
        //#endregion

    script.getSceneObject().getFirstComponent("Component.SpriteVisual").enabled = false;
}

//Spawn sprite slice prefab
function SpawnPreparedGraphic(graphic) {
    var slice = script.slicePrefab.instantiate(script.getSceneObject());
    var spriteVisual = slice.getFirstComponent("Component.SpriteVisual");
    spriteVisual.clearMaterials();
    spriteVisual.addMaterial(material.clone());
    spriteVisual.mainPass.baseTex = sprite;
    spriteVisual.mainPass.baseColor = new vec4(1,1,1,1);

    var renderOrder = script.getSceneObject().getFirstComponent("Component.SpriteVisual").getRenderOrder();
    spriteVisual.setRenderOrder(renderOrder);

    objects.push(spriteVisual);

    return spriteVisual;
}

//Copy the color of the origional sprite visual to the sliced sprite visual
function RecolorSlicedSprites() {
    for(var i = 0; i < objects.length; i++) {
        objects[i].mainPass.baseColor = graphic.mainPass.baseColor;
    }
}

//#region Events
var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(function (eventData)
{
    RecolorSlicedSprites();

    if(spawned == false) {
        if(frame >= 1) {
            bounds = global.getGraphicBounds(graphic, camera);
            SpawnSlicedSprites();
            spawned = true;
        }

        frame++;
    }
});
//#endregion