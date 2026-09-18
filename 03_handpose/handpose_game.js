//=========================================
// Variables
//=========================================
let handPose;   // ML5 Model
let videoW = 640;
let videoH = 480;
let hands = [];

// Game sprites
let fingerTip;
let balloon;
let leftWall, rightWall, topWall, botWall;

// Game variable
let gameStart = false;
let gameOver = false;
let score = 0;
let cooldown = 500; // 1000 ms = 1 second

// Sounds
let bounceSound;
let gameOverSound;

//=========================================
// Code
//=========================================

function preload() {
    // Model settings
    let options = {
        flipped: true,
        runtime: "tfjs",
        modelType: "full",
        detectorModeUrl: undefined,
        landmarkModeUrl: undefined
    }

    // Load the model
    handPose = ml5.handPose(options);

    // Load sound
    bounceSound = createAudio("assets/LowBoing.mp3");
    gameOverSound = createAudio("assets/DunDunn.mp3");
}

function setup() {
    new Canvas(videoW, videoH);
    world.gravity.y = 5;

    // Setup webcam video
    let constraints = {
        video : {
            mandatory: {
                minWidth: videoW,
                minHeight: videoH
            },
            optional: [{ minFrameRate: 60 }],
        },
        audio: false,
        flipped: true
    };

    video = createCapture(constraints);
    video.size(videoW, videoH);
    video.hide();
    // Send video to the model to start detecting hands
    handPose.detectStart(video, gotHands);

    // Game sprites
    fingerTip = new Sprite();
    fingerTip.width = 60;
    fingerTip.height = 60;
    fingerTip.collider = "none";
    fingerTip.color = "rgba(255, 255, 0, 0.1)";
    fingerTip.visible = false;

    balloon = new Sprite();
    balloon.diameter = 80;
    balloon.collider = "none";
    balloon.color = "rgb(255, 0, 0)";
    balloon.stroke = "rgb(100, 0, 0)";
    balloon.strokeWeight = 5;
    balloon.x = width / 2;
    balloon.y = height * 0.2;

    leftWall = new Sprite();
    leftWall.x = 0;
    leftWall.y = height / 2;
    leftWall.width = 5;
    leftWall.height = height;
    leftWall.collider = "static";
    leftWall.visible = false;

    rightWall = new Sprite();
    rightWall.x = width;
    rightWall.y = height / 2;
    rightWall.width = 5;
    rightWall.height = height;
    rightWall.collider = "static";

    topWall = new Sprite();
    topWall.x = width / 2;
    topWall.y = 0;
    topWall.width = width;
    topWall.height = 5;
    topWall.collider = "static";

    botWall = new Sprite();
    botWall.x = width / 2;
    botWall.y = height;
    botWall.width = width;
    botWall.height = 5;
    botWall.collider = "static";
}

function draw() {
    // Draw webcam video and clear screen
    image(video, 0, 0, videoW, videoH);

    // Show start menu
    if (gameStart === false) {
        // Title
        textAlign(CENTER, CENTER); // horizontal & vertical alignment
        textSize(40);
        fill("rgb(0, 255, 20)");
        text("Bounce the Ball", width * 0.5, height * 0.5); // text(string, x, y)
        
        // Instructions
        textSize(32);
        fill("rgb(0, 200, 20)");
        text("Use your Index Finger to Bounce the Ball", width * 0.5, height * 0.6);
        text("Press Space to start", width * 0.5, height * 0.7);
    } else {
        if (gameOver === true) {
            // Game over menu
            textAlign(CENTER, CENTER); // horizontal & vertical alignment
            textSize(40);
            fill("rgb(255, 50, 0)");
            text("Game Over!", width * 0.5, height * 0.5); // text(string, x, y)
        
            textSize(32);
            fill("rgb(255, 20, 20)");
            text("Press Space to Restart", width * 0.5, height * 0.6);
        } else {
            // Check if model detects a hand
            if (hands.length > 0) {
                // console.log(hands);
    
                // Set keypoint to index finger tip position
                let currentHand = hands[0];
                let keypoint = currentHand.keypoints[8];
                // circle(keypoint.x, keypoint.y, 10);   // (x pos, y pos, diameter)
    
                // Make sprite follow finger tip
                fingerTip.x = keypoint.x;
                fingerTip.y = keypoint.y;
                fingerTip.visible = true;
                fingerTip.collider = "kinematic";
            } else {
                // Hide sprite if there are no hands
                fingerTip.visible = false;
                fingerTip.collider = "none";
            }
    
            // Check collision
            if (balloon.collides(botWall)) {
                // Game over
                gameOver = true;
                // Hide sprites
                balloon.collider = "none";
                balloon.visible = false;
                fingerTip.collider = "none";
                fingerTip.visible = false;

                gameOverSound.play();
            }

            // Bounce cooldown
            if (cooldown > 0) {
                // deltaTime = time since last frame
                cooldown -= deltaTime;
            }
            if (balloon.collides(fingerTip) && cooldown <= 0) {
                // Increment score
                score++;
                // Reset cooldown
                cooldown = 500;

                bounceSound.play();
            }

            // Display score
            textAlign(LEFT, CENTER);
            textSize(32);
            fill("rgb(255, 255, 0)");
            text("Score: " + score, width * 0.02, height * 0.1);
        }
    }
}

//=========================================
// Function Created
//=========================================

function gotHands(results) {
    // Model detects hand and saves the output here
    hands = results;
}

function keyPressed() {
    // Start game key
    if (key === " ") {
        // Reset game state
        gameStart = true;
        gameOver = false;
        score = 0;

        // Set sprite properties
        fingerTip.collider = "kinematic"; // No physics but can move through code
        fingerTip.visible = true;

        balloon.collider = "dynamic";
        balloon.visible = true;
        balloon.bounciness = 1;
        balloon.mass = 5;
        balloon.drag = 0.1;
        balloon.x = width / 2;
        balloon.y = height * 0.2;
        // Reset momentum
        balloon.vel.x = 0;
        balloon.vel.y = 0;
    }
}