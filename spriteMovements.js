function createPs(emitter, ps, color1, color2, colorDead) {
    
    ps.particleTexture = new BABYLON.Texture("/assets/flare.png", scene);

    ps.minSize = 0.1;
    ps.maxSize = 0.3;
    ps.minLifeTime = Infinity;
    ps.maxLifeTime = Infinity;
    ps.minEmitPower = 0.2;
    ps.maxEmitPower = 0.5;

    ps.minAngularSpeed = 0;
    ps.maxAngularSpeed = Math.PI;
    
    ps.emitter = emitter.getPoints()[0];

    ps.emitRate = 50;
    ps.updateSpeed = 0.02;
    ps.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

    ps.color1 = color1;
    ps.color2 = color2;
    ps.colorDead = colorDead;

    ps.direction1 = new BABYLON.Vector3(0, 1, 0);
    ps.direction2 = new BABYLON.Vector3(0, 1, 0);
    ps.minEmitBox = new BABYLON.Vector3(-0.4, -0.4, -0.4);
    ps.maxEmitBox = new BABYLON.Vector3(0.4, 0.4, 0.4);
    
    ps.updateFunction = update.bind(ps, Math, emitter)
    
    ps.start();
}


function update(math, emitter, particles) {
	for (var index=0; index < particles.length; ++index) {
		var particle = particles[index];
		particle.age += this._scaledUpdateSpeed;

        particle.colorStep.scaleToRef(this._scaledUpdateSpeed, this._scaledColorStep);
        particle.color.addInPlace(this._scaledColorStep);
        if (particle.color.a < 0) particle.color.a = 0;
        particle.angle += particle.angularSpeed * this._scaledUpdateSpeed;
        
        let length = emitter.getPoints().length;
        let posIndex = math.floor(particle.age*10)%length;
        if (posIndex!==length-1){
            particle.direction = (emitter.getPoints()[posIndex+1].subtract(emitter.getPoints()[posIndex])).scale(10.);
        } else {
            particle.direction = (emitter.getPoints()[0].subtract(emitter.getPoints()[posIndex])).scale(10.);
        }
        particle.direction.scaleToRef(this._scaledUpdateSpeed, this._scaledDirection);
        particle.position.addInPlace(this._scaledDirection);
    }
}


// Function to create a path for the camera to follow
function createPath(framesPosition, isLoop) {

    // Define the scaling factor (e.g., 0.5 for half size)
    var scale = 0.5;
    var height = 0.5;


    // Create a new array for scaled points
    var scaledFramesPosition = framesPosition.map(point => point.scale(scale).add(new BABYLON.Vector3(0, height, 0)));

    // Create a cubic Bezier curve and extract its points
    var catmullRomVectors = BABYLON.Curve3.CreateCatmullRomSpline(
        scaledFramesPosition,
        1, // number of points added between frames. 
        isLoop
    );

    var points = catmullRomVectors.getPoints();

    // Create a 3D path from the extracted points and visualize it with tangent, normal, and binormal vectors
    var path3d = new BABYLON.Path3D(points);

    return path3d;
}


// Function to import camera path from file and create a 3D path
function extractKeyframePositions(filename, scene) {

    return new Promise((resolve, reject) => {
        // Load the GLTF file and add the loaded mesh to the scene
        BABYLON.SceneLoader.Append("./assets/", filename, scene, function (loadedScene) {
            
            // Assuming the loaded GLTF file contains a sphere with animations
            const sphere = loadedScene.meshes.find(mesh => mesh.name === "Sphere001");
            sphere.visibility = 0;
            
            // Array to store position and rotation values at each frame
            var framesPosition = [];

            // Check if the sphere is found
            if (sphere) {
    
                // Get the animation group from the loaded scene
                const animationGroup = loadedScene.animationGroups.find(group => group.name === "All Animations");
                console.log("animationGroup: ", animationGroup);
    
                // Check if the animation group is found
                if (animationGroup) {
                    
                // Get the animation keyframes
                const targetedAnim = animationGroup.targetedAnimations[0];
                const keyFrames = targetedAnim.animation.getKeys();
                
                // Iterate through keyframes and capture positions
                keyFrames.forEach((keyFrame) => {
                    // Store the position value in the array
                    var keyFrameData = keyFrame.value.clone();

                    // Babylon.js and 3DSMAX have different World Coordinates, so multiply x by -1 
                    framesPosition.push(new BABYLON.Vector3(keyFrameData.x * -1, keyFrameData.y, keyFrameData.z));
                });

                } else { console.log("No Animation Group named 'All Animations' in Camera.gltf") }
            
            } else { console.log("No Sphere001 object in Camera.gltf") }

            console.log("framesPosition Inside: ", framesPosition);
            
            // Resolve the promise with framesPosition when done
            resolve(framesPosition);
        
        });
    });
};


function createSpritePathFromImport(filename, isLoop, debug, scene) {
    extractKeyframePositions(filename, scene)
        .then((framesPosition) => {

            // Create camera paths
            path3d = createPath(framesPosition, isLoop);

            // sprite path
            var color1 = new BABYLON.Color4(0.67, 0.78, 1, 0.43);
            var color2 = new BABYLON.Color4(0.08, 0.64, 0.91, 0.5);
            var colorDead = new BABYLON.Color4(0, 0.5, 0, 0.1);        

            // Define the scaling factor (e.g., 0.5 for half size)
            var scale = 0.4;
            var height = 1;

            // Create a new array for scaled points
            framesPosition = framesPosition.map(point => point.scale(scale).add(new BABYLON.Vector3(0, height, 0)));

            var framesPosition = framesPosition.filter(function (element, index) {
                return index % 10 === 0;
            });

            const catmullRomH = BABYLON.Curve3.CreateCatmullRomSpline(framesPosition,20);

            BABYLON.Scene.MaxDeltaTime = 90;

            var numParts = 1000;
            createPs(catmullRomH, new BABYLON.ParticleSystem("ps1", numParts, scene), color1, color2, colorDead);
            let catmullRomSplineH = BABYLON.Mesh.CreateLines("catmullRomH", catmullRomH.getPoints(), scene);

            // if(debug){
            //     BABYLON.Mesh.CreateLines("catmullRomH", catmullRomH.getPoints(), scene);
            // }
        })
        .catch((error) => {
            console.error("Error in createPathFromImport:", error);
            return null;
        });
}

    
