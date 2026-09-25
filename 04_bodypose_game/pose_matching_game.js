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

// x-position of the right panel.
let rightPanelX = sidePanelWidth + cameraWidth;

// Setup variables
let video;
let bodyPose; // ML Model
let detectedPeople = []; // Array to store people the model detects

// Game variables
let skeletonColour;

// ====================================================
// Preload
// ====================================================

function preload(){
    // Load the Body Pose model
    bodyPose = ml5.bodyPose("MoveNet", { flipped: true });
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
    drawDetectionStatus();
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

// Draw circle on body point
function drawBodyPoint(point) {
    circle(point.x, point.y, 10); // circle(x pos, y pos, diameter)
}

// Draws one person's skeleton.
function drawSkeleton(person, skeletonColor) {
    // Set skeleton line colour.
    stroke(skeletonColour);

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
    fill(skeletonColour);

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