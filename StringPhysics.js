// Define a function to create strings in a scene
function makeStrings(strings) {

    // Enable ammo.js physics
    scene.enablePhysics(new BABYLON.Vector3(0, 0, 0), new BABYLON.AmmoJSPlugin(false));

    // Create a data structure for strings
    var stringsList = [
        {
            name: "chord1",
            topCoordinate: new BABYLON.Vector3(-0.6 -2, 5.24, 5),
            bottomCoordinate: new BABYLON.Vector3(-0.6 -2, 3.4, 5),
            audioFile: "one"
        },
        {
            name: "chord2",
            topCoordinate: new BABYLON.Vector3(-0.4 -2, 5.24, 5),
            bottomCoordinate: new BABYLON.Vector3(-0.4 -2, 3.4, 5),
            audioFile: "two"
        },
        {
            name: "chord3",
            topCoordinate: new BABYLON.Vector3(-0.2 -2, 5.24, 5),
            bottomCoordinate: new BABYLON.Vector3(-0.2 -2, 3.4, 5),
            audioFile: "three"
        },
        {
            name: "chord4",
            topCoordinate: new BABYLON.Vector3(0-2, 5.24, 5),
            bottomCoordinate: new BABYLON.Vector3(0-2, 3.4, 5),
            audioFile: "four"
        },
        {
            name: "chord5",
            topCoordinate: new BABYLON.Vector3(0.2 -2, 5.24, 5),
            bottomCoordinate: new BABYLON.Vector3(0.2 -2, 3.4, 5),
            audioFile: "five"
        },
        {
            name: "chord6",
            topCoordinate: new BABYLON.Vector3(0.4 -2, 5.24, 5),
            bottomCoordinate: new BABYLON.Vector3(0.4 -2, 3.4, 5),
            audioFile: "six"
        },
        {
            name: "chord7",
            topCoordinate: new BABYLON.Vector3(0.6 -2, 5.24, 5),
            bottomCoordinate: new BABYLON.Vector3(0.6 -2, 3.4, 5),
            audioFile: "seven"
        },
    ];

    // Initialize Rope Material
    var ropeMat = new BABYLON.StandardMaterial("White Material", scene);
    ropeMat.diffuseColor = BABYLON.Color3.White();
    ropeMat.metallic = 1;
    ropeMat.roughness = 0.02;

    // Loop through each string in the data structure
    for (var i = 0; i < stringsList.length; i++) {
        let currStr = stringsList[i];

        // Create an arm (invisible) for the string
        currStr.arm = BABYLON.MeshBuilder.CreateBox(currStr.name + "arm", { width: .001, depth: .001, height: .001 }, scene);
        currStr.arm.position = currStr.topCoordinate;
        currStr.arm.physicsImpostor = new BABYLON.PhysicsImpostor(currStr.arm, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0, restitution: 0 }, scene);

        // Define points for the string's shape
        var nbPoints = 15;
        currStr.myPoints = [];
        for (var j = 0; j < nbPoints; j++) {
            currStr.myPoints.push(currStr.topCoordinate, new BABYLON.Vector3(currStr.bottomCoordinate.x, currStr.bottomCoordinate.y * j / nbPoints, currStr.bottomCoordinate.z));
        }

        // Define the shape of the string
        currStr.myShape = [];
        var radius = 0.015;
        for (var k = 0; k < 2 * Math.PI; k += Math.PI / 8) {
            currStr.myShape.push(new BABYLON.Vector3(Math.cos(k), Math.sin(k), 0).scale(radius));
        }

        // Create the rope from the defined shape and points
        currStr.rope = BABYLON.MeshBuilder.ExtrudeShape(currStr.name + "mat", { shape: currStr.myShape, path: currStr.myPoints }, scene);
        currStr.rope.material = ropeMat;

        // Enable physics for the rope
        currStr.rope.physicsImpostor = new BABYLON.PhysicsImpostor(currStr.rope, BABYLON.PhysicsImpostor.RopeImpostor, { shape: currStr.myShape, path: currStr.myPoints }, scene);
        currStr.rope.physicsImpostor.velocityIterations = 10;
        currStr.rope.physicsImpostor.positionIterations = 25;
        currStr.rope.physicsImpostor.stiffness = 100;

        // Attach the rope to the arm and sphere
        currStr.rope.physicsImpostor.addHook(currStr.arm.physicsImpostor, 0, 1);

        // Create a sphere (indicator) for the string
        currStr.sphere = BABYLON.MeshBuilder.CreateSphere(currStr.name + "sphere", { diameter: .001, segments: 5 }, scene);
        currStr.sphere.position = currStr.bottomCoordinate;

        // Enable physics for the sphere
        currStr.sphere.physicsImpostor = new BABYLON.PhysicsImpostor(currStr.sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 0 }, scene);
        currStr.rope.physicsImpostor.addHook(currStr.sphere.physicsImpostor, 1, 1);

        // Add action to the rope on pointer over event
        currStr.rope.actionManager = new BABYLON.ActionManager(scene);
        currStr.rope.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function () {
            // Hide rope, move sphere and arm, play audio, then revert changes after delay
            currStr.rope.visibility = false;
            currStr.sphere.position.x += .2;
            currStr.arm.position.x += .2;
            var one = document.getElementById(currStr.audioFile);
            one.currentTime = 0;
            one.play();

            setTimeout(function () {
                currStr.sphere.position.x -= .2;
                currStr.arm.position.x -= .2;
                currStr.isSphereMoving = false;
                currStr.rope.visibility = true;
            }, 10); // Adjust the delay time as needed (in milliseconds)
        }));

        // Move the sphere down by 3 units on the y-axis
        currStr.sphere.position.addInPlace(new BABYLON.Vector3(0, -3, 0));
    }
    console.log(stringsList); // Output the list of created strings for debugging
}