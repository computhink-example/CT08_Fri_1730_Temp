// ====================================================
// Canvas and layout variables
// ====================================================

// Width of the webcam/game area.
let cameraWidth = 800;

// Height of the webcam/game area.
let cameraHeight = 450;

// Width of each side panel.
let sidePanelWidth = 220;

// Total canvas width = left panel + webcam area + right panel.
let totalCanvasWidth = cameraWidth + sidePanelWidth * 2;

// x-position where the webcam area starts.
let cameraX = sidePanelWidth;

// x-position of the left panel.
let leftPanelX = 0;
let leftPanelCenterX = sidePanelWidth / 2;

// x-position of the right panel.
let rightPanelX = sidePanelWidth + cameraWidth;
let rightPanelCenterX = rightPanelX + sidePanelWidth / 2;

// Setup variables
let video;
let bodyPose; // ML Model
let detectedPeople = []; // Array to store people the model detects

// Game variables
let skeletonColour;
let player1Colour;
let player2Colour;
let player1Person = null;
let player2Person = null;
let poseArray = [];
let currentPose = null;

// Game assets
let bothHandsUpImg;
let leftHandUpImg;
let rightHandUpImg;
let handsOnHeadImg;
let tPoseImg;

// ====================================================
// Preload
// ====================================================

function preload(){
    // Load the Body Pose model
    bodyPose = ml5.bodyPose("MoveNet", { flipped: true });

    // Load assets
    bothHandsUpImg = loadImage("assets/poseBattle_bothHandsUp.png");
    leftHandUpImg = loadImage("assets/poseBattle_leftHandUp.png");
    rightHandUpImg = loadImage("assets/poseBattle_rightHandUp.png");
    handsOnHeadImg = loadImage("assets/poseBattle_handsOnHead.png");
    tPoseImg = loadImage("assets/poseBattle_tpose.png");
}

// ====================================================
// Setup
// ====================================================

// setup() runs once at the start.
function setup() {
    // Set up Canvas
    new Canvas(totalCanvasWidth, cameraHeight);

    // Set up webcam video
    let constraints = {
        video: {
            width: cameraWidth,
            height: cameraHeight,
            aspectRatio: cameraWidth / cameraHeight
        },
        audio: false,
        flipped: true
    };
    video = createCapture(constraints);
    video.hide();

    // Give video feed to model to start detecting
    // Send result to gotPeople function
    bodyPose.detectStart(video, gotPeople);

    // Set up text.
    textAlign(CENTER, CENTER);

    // Set game variables
    skeletonColour = color(255, 255, 0); // color(r, g, b)
    player1Colour = color(255, 0, 0);
    player2Colour = color(0, 0, 255);

    // Set up poses
    setupPoseArray();
    currentPose = poseArray[0];
}


// ====================================================
// Main draw loop
// ====================================================

// draw() runs again and again.
function draw() {
    // Clear the canvas with a dark background.
    background(30);
    // Draw the side panels.
    drawUIPanel();
    // Draw the middle line that separates Player 1 and Player 2 areas.
    drawMiddleLine();

    // Draw webcam video
    image(video, cameraX, 0, cameraWidth, cameraHeight);

    // Draw debug info
    // drawDetectionStatus();

    // Draw a skeleton for all detected people
    // drawAllSkeletons();

    // Find and draw player1 and player2
    findPlayers();
    drawPlayerSkeletons();

    // Draw game info
    drawGameUI();
    drawPlayerStatus();
}

// ====================================================
// Draw side UI panels
// ====================================================

// Draws the left and right UI panels.
function drawUIPanel() {
    // Remove outlines.
    noStroke();

    // Set panel colour.
    fill(20);

    // Draw left panel.
    rect(leftPanelX, 0, sidePanelWidth, cameraHeight);

    // Draw right panel.
    rect(rightPanelX, 0, sidePanelWidth, cameraHeight);

    // Set divider line colour.
    stroke(255, 180);

    // Set divider line thickness.
    strokeWeight(2);

    // Draw line between left panel and webcam.
    line(sidePanelWidth, 0, sidePanelWidth, cameraHeight);

    // Draw line between webcam and right panel.
    line(rightPanelX, 0, rightPanelX, cameraHeight);
}


// ====================================================
// Draw middle divider line
// ====================================================

// Draws the vertical line that separates Player 1 and Player 2.
function drawMiddleLine() {
    // Set line colour to white with transparency.
    stroke(255, 180);

    // Set line thickness.
    strokeWeight(2);

    // Draw the middle line inside the webcam area.
    line(width / 2, 0, width / 2, cameraHeight);
}

// ====================================================
// Pose Functions
// ====================================================

// results parameter received from the model
function gotPeople(results) {
    // Store results into array
    detectedPeople = results;
}

// Draws debug info on screen and console
function drawDetectionStatus() {
    // Set up text
    fill(0);
    textSize(24);
    text("People Detected: " + detectedPeople.length, width / 2, height * 0.1);
    console.log(detectedPeople);
}

// Check confidence of each keypoint
function pointIsReady(point) {
    // Check if point exists
    if (point === null | point === undefined) {
        return false;
    }

    if (point.confidence > 0.25) {
        return true;
    } else {
        return false;
    }
}

// Draw line between two body points
function drawBodyLine(point1, point2) {
    if (pointIsReady(point1) && pointIsReady(point2)) {
        line(point1.x + cameraX, point1.y, point2.x + cameraX, point2.y); // line(x pos 1, y pos 1, x pos 2, y pos 2)
    }
}

// Draw circle on body point
function drawBodyPoint(point) {
    if (pointIsReady(point)) {
        circle(point.x + cameraX, point.y, 10); // circle(x pos, y pos, diameter)
    }
}

// Draws one person's skeleton.
function drawSkeleton(person, skeletonColor) {
    // Set skeleton line colour.
    stroke(skeletonColor);

    // Set skeleton line thickness.
    strokeWeight(3);

    // Draw shoulder line.
    drawBodyLine(person.left_shoulder, person.right_shoulder);

    // Draw left upper arm.
    drawBodyLine(person.left_shoulder, person.left_elbow);

    // Draw left lower arm.
    drawBodyLine(person.left_elbow, person.left_wrist);

    // Draw right upper arm.
    drawBodyLine(person.right_shoulder, person.right_elbow);

    // Draw right lower arm.
    drawBodyLine(person.right_elbow, person.right_wrist);

    // Draw left body side.
    drawBodyLine(person.left_shoulder, person.left_hip);

    // Draw right body side.
    drawBodyLine(person.right_shoulder, person.right_hip);

    // Draw hip line.
    drawBodyLine(person.left_hip, person.right_hip);

    // Remove outlines for the body point circles.
    noStroke();

    // Set circle colour.
    fill(skeletonColor);

    // Draw important body points.
    drawBodyPoint(person.nose);
    drawBodyPoint(person.left_shoulder);
    drawBodyPoint(person.right_shoulder);
    drawBodyPoint(person.left_elbow);
    drawBodyPoint(person.right_elbow);
    drawBodyPoint(person.left_wrist);
    drawBodyPoint(person.right_wrist);
    drawBodyPoint(person.left_hip);
    drawBodyPoint(person.right_hip);
}

// Draw all detected people's skeletons
function drawAllSkeletons() {
    // Loop through detectedPeople
    for (let i = 0; i < detectedPeople.length; i++) {
        // For each detected person call drawSkeleton
        let person = detectedPeople[i];
        drawSkeleton(person, skeletonColour);
    }
}

// Check positions of each person and assign player1 and player2
function findPlayers() {
    // Reset player1 and player2
    player1Person = null;
    player2Person = null;

    // Checking which person is closest to player1CenterX and player2CenterX
    let closestPlayer1Distance = Number.MAX_VALUE;
    let closestPlayer2Distance = Number.MAX_VALUE;

    // Center x pos of left, right and middle
    let player1CenterX = cameraWidth / 4 + cameraX;
    let player2CenterX = cameraWidth / 4 * 3 + cameraX;
    let middleX = cameraWidth / 2 + cameraX;

     // Loop through detectedPeople
    for (let i = 0; i < detectedPeople.length; i++) {
        // For each detected person call drawSkeleton
        let person = detectedPeople[i];
        let nose = person.nose;

        // Check if nose is detected confidently
        if (pointIsReady(nose)) {
            // Get x pos of nose
            let noseX = nose.x + cameraX;
            // console.log(noseX);

            // Check if it is on the left
            if (noseX < middleX) {
                let distanceFromPlayer1Center = abs(noseX - player1CenterX);
                // Update who is closest to player1CenterX and assign player1
                if (distanceFromPlayer1Center < closestPlayer1Distance) {
                    closestPlayer1Distance = distanceFromPlayer1Center;
                    player1Person = person;
                    console.log("Found P1");
                }
            } else {
                // If it is on the right
                let distanceFromPlayer2Center = abs(noseX - player2CenterX);
                // Update who is closest to player2CenterX and assign player2
                if (distanceFromPlayer2Center < closestPlayer2Distance) {
                    closestPlayer2Distance = distanceFromPlayer2Center;
                    player2Person = person;
                    console.log("Found P2");
                }
            }
        }
    }
}

// Draw player1 and player2 skeleton
function drawPlayerSkeletons() {
    // Check if player1 or player2 exists
    if (player1Person !== null) {
        drawSkeleton(player1Person, player1Colour);
    }
    if (player2Person !== null) {
        drawSkeleton(player2Person, player2Colour);
    }
}

// Function to add poses into array
function setupPoseArray() {
    poseArray = [
        // Store pose info in object (python dictionary)
        {
            name: "Both Hands Up",
            image: bothHandsUpImg,
            id: "bothHandsUp"
        },
        {
            name: "Left Hand Up",
            image: leftHandUpImg,
            id: "leftHandUp"
        },
        {
            name: "Right Hand Up",
            image: rightHandUpImg,
            id: "rightHandUp"
        },
        {
            name: "Hands on Head",
            image: handsOnHeadImg,
            id: "handsOnHead"
        },
        {
            name: "T Pose",
            image: tPoseImg,
            id: "tPose"
        }
    ]
}

// Function to draw game info
function drawGameUI() {
    // Stop function if there is no current pose
    if (currentPose === null || currentPose === undefined) {
        return;
    }

    // Draw pose name
    fill(200, 20, 200);
    textSize(28);
    text(currentPose.name, width / 2, height * 0.2); // (str, x pos, y pos)

    // Draw pose image
    imageMode(CENTER);
    image(currentPose.image, width / 2, height * 0.7, 230, 230); // (image, x pos, y pos, width, height)
    // Reset to default alignment
    imageMode(CORNER);
}

// Function to draw player1 and player2 info
function drawPlayerStatus() {
    // Text settings
    textSize(28);
    noStroke(); // Remove text outline
    // stroke(0);
    // strokeWeight(10);

    if (player1Person !== null) {
        fill(player1Colour);
        text("Detected", leftPanelCenterX, height * 0.5);
    } else {
        fill(player1Colour);
        text("Not detected", leftPanelCenterX, height * 0.5);
    }

    if (player2Person !== null) {
        fill(player2Colour);
        text("Detected", rightPanelCenterX, height * 0.5);
    } else {
        fill(player2Colour);
        text("Not detected", rightPanelCenterX, height * 0.5);
    }
}