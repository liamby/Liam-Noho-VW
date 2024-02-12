// Show axis function
function showAxis(size, scene){
    var size = 1;
    var makeTextPlane = function (text, color, size) {
        var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, scene, true);
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color, "transparent", true);
        var plane = BABYLON.Mesh.CreatePlane("TextPlane", size, scene, true);
        plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", scene);
        plane.material.backFaceCulling = false;
        plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
        plane.material.diffuseTexture = dynamicTexture;
        return plane;
    };
    // x axis 
    var axisX = BABYLON.Mesh.CreateLines("axisX", [
        BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
        new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
    ], scene);
    axisX.color = new BABYLON.Color3(1, 0, 0);
    var xChar = makeTextPlane("X", "red", size / 10);
    xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);
    // y axis 
    var axisY = BABYLON.Mesh.CreateLines("axisY", [
        BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
        new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
    ], scene);
    axisY.color = new BABYLON.Color3(0, 1, 0);
    var yChar = makeTextPlane("Y", "green", size / 10);
    yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
    // z axis
    var axisZ = BABYLON.Mesh.CreateLines("axisZ", [
        BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
        new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
    ], scene);
    axisZ.color = new BABYLON.Color3(0, 0, 1);
    var zChar = makeTextPlane("Z", "blue", size / 10);
    zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
};  


// Function to visualize a 3D path along with tangent, normal, and binormal vectors
function showPath3D (path3d, size, scene) {
    size = size || 0.2;

    // Extract information from the provided 3D path
    var curve = path3d.getCurve();
    var tgts = path3d.getTangents();
    var norms = path3d.getNormals();
    var binorms = path3d.getBinormals();
    var vcTgt, vcNorm, vcBinorm;

    // Create the main curve line
    var line = BABYLON.MeshBuilder.CreateLines("curve", { points: curve }, scene);

    // Iterate through each point on the curve to visualize tangent, normal, and binormal vectors
    for (var i = 0; i < curve.length; i++) {
        // Create lines for tangent, normal, and binormal vectors at the current point
        var vcTgt = BABYLON.MeshBuilder.CreateLines("tgt" + i, { points: [curve[i], curve[i].add(tgts[i].scale(size))] }, scene);
        var vcNorm = BABYLON.MeshBuilder.CreateLines("norm" + i, { points: [curve[i], curve[i].add(norms[i].scale(size))] }, scene);
        var vcBinorm = BABYLON.MeshBuilder.CreateLines("binorm" + i, { points: [curve[i], curve[i].add(binorms[i].scale(size))] }, scene);

        // Assign colors to the vectors for visualization (Red for tangent, Green for normal, Blue for binormal)
        vcTgt.color = new BABYLON.Color3(1, 0, 0); // Red
        vcNorm.color = new BABYLON.Color3(0, 1, 0); // Green
        vcBinorm.color = new BABYLON.Color3(0, 0, 1); // Blue
    }
};


// Function to create a path for the camera to follow
function createCameraPath(framesPosition, isLoop) {

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


// Function to create target and cameraCart cubes. 
function createCarts(scene) {

    // Create Target Cube (red) & Follow cameraCart (grey)
    var columns = 6;  // 6 columns
    var rows = 1;  // 1 row
    var faceUV = new Array(6);
    
    //set all faces to same
    for (var i = 0; i < 6; i++) {
        faceUV[i] = new BABYLON.Vector4(i / columns, 0, (i + 1) / columns, 1 / rows);
    }
    
    //wrap set
    var options = {
        faceUV: faceUV,
        wrap: true,
        size: 0.2
    };

    // create cameraCart mesh and material
    var cameraCart = new BABYLON.MeshBuilder.CreateBox('cameraCart', options, scene);
    var mat = new BABYLON.StandardMaterial("mat", scene);
    mat.diffuseTexture = new BABYLON.Texture("img/boxFaces.jpg", scene);
    cameraCart.material = mat;
    
    // create target mesh and material
    var target = new BABYLON.MeshBuilder.CreateBox("target", { size: 0.1 }, scene);
    var targetMaterial = new BABYLON.StandardMaterial("target", scene)
    targetMaterial.emissiveColor = BABYLON.Color3.Red()
    target.material = targetMaterial

    return { cam: cameraCart, tar: target, };

}


// Function to animate the camera along the path called in render loop
function animateCamera(path3d, targetPositionIndex, debug) {

    // Adjust this factor to control the interpolation speed
    var cartSpeed = 0.05;
    var slerpSpeed = 0.05; 

    // Extract details of curve
    var tangents = path3d.getTangents();
    var normals = path3d.getNormals();
    var binormals = path3d.getBinormals();
    var points = path3d.getPoints();

    // Get details of curve at target index
    var tangent = tangents[targetPositionIndex];
    var binormal = binormals[targetPositionIndex];
    var normal = normals[targetPositionIndex];
    var splinePointPosition = points[targetPositionIndex];
    var splinePointCamRotation = BABYLON.Quaternion.FromLookDirectionRH(normal, binormal);
    
    if (debug == false) {
        // If camera Rotation Quaternion undefined
        if (!camera.rotationQuaternion) {
            camera.rotationQuaternion = new BABYLON.Quaternion();
        }
        else {
            // Interpolate camera position/rotation to spline point position/rotation
            camera.position = BABYLON.Vector3.Lerp(camera.position, splinePointPosition, cartSpeed);
            camera.rotationQuaternion = BABYLON.Quaternion.Slerp(camera.rotationQuaternion, splinePointCamRotation, slerpSpeed);
        }
    } 
    else {  // VISUALISE CARTS

        // If camera Rotation Quaternion undefined        
        if (!targetCart.rotationQuaternion && !cameraCart.rotationQuaternion) {
            targetCart.rotationQuaternion = new BABYLON.Quaternion();
            cameraCart.rotationQuaternion = new BABYLON.Quaternion();
        } else {
            // Move and rotate target and camera/cart along the spline
            targetCart.position = splinePointPosition;
            targetCart.rotationQuaternion = splinePointCamRotation;
            cameraCart.position = BABYLON.Vector3.Lerp(cameraCart.position, splinePointPosition, cartSpeed);
            cameraCart.rotationQuaternion = BABYLON.Quaternion.Slerp(cameraCart.rotationQuaternion, splinePointCamRotation, slerpSpeed);
        }
    }
}


// Main function that calls extracts KeyframePositions from filename, creates a path for the camera to follow. 
// Also shows path and carts for debugging 
// Attatches animateCamera to event triggered before rendering the scene. 
// Adds the Event listener for Scroll to the window. 
function createPathFromImport(filename, isLoop, debug, scene) {
    extractKeyframePositions(filename, scene)
        .then((framesPosition) => {

            // Create camera paths
            path3d = createCameraPath(framesPosition, isLoop);

            if (debug) {
                // Show path and axis
                // showPath3D(path3d, 0.5);    
                // showAxis(50, scene);
                // Create cart for visualisation 
                var {cam, tar} = createCarts(scene);
                cameraCart = cam;
                targetCart = tar;
            }

            // Add animateCamera to event triggered before rendering the scene. 
            scene.onBeforeRenderObservable.add(() => {
                 console.log("path3D:", path3d)
                 console.log("targetPositionIndex:", targetPositionIndex)
                animateCamera(path3d, targetPositionIndex, debug);
            });

            // Add the scroll event listener to window
            window.addEventListener("wheel", function (event) {
                console.log("SCROLL")
                // Update camera position based on scroll direction
                if (event.deltaY > 0) {
                    targetPositionIndex = (targetPositionIndex + 1) % path3d.getPoints().length;
                } else 
                {
                    // Use points.length - 1 to wrap around to the end when reaching the beginning 
                    targetPositionIndex = (targetPositionIndex - 1 + path3d.getPoints().length) % path3d.getPoints().length;
                }
            });
            
            return path3d;

        })
        .catch((error) => {
            console.error("Error in createPathFromImport:", error);
            return null;
        });
}


