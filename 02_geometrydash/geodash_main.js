//player box
let player; // Player sprite
let box;    // Player sprite image
let bg;     // Background image

// game variables
const TILE_SIZE = 50;

// world building groups
let tileMap1;
let ground;     // Ground sprite group
let spikes;     // Spike sprite group
let orbs;        // Orb sprite group
let finishLine; // Finish line sprite group

// image sprites
let spike;

// menu


// sound assets


function preload() {
    box = loadImage("assets/cube.png");
    bg = loadImage("assets/geobg.png");
    spike = loadImage("assets/spike.png");

    tileMap1 = loadStrings("stages/tiles1.txt");
}

function setup() {
    new Canvas(700, 600);   // (width, height)
    world.gravity.y = 32;

    // Player sprite
    player = new Sprite(TILE_SIZE, TILE_SIZE, TILE_SIZE, TILE_SIZE);  // (x, y, width, height)
    player.img = box;
    player.friction = 0;
    player.bounciness = 0;
    player.collider = "dynamic";

    // Spawn point [x, y]
    startCoordinate = [TILE_SIZE, height - TILE_SIZE];
    player.x = startCoordinate[0];
    player.y = startCoordinate[1];

    // Ground sprite group
    ground = new Group();
    ground.tile = "g";  // "g" represents a ground tile
    ground.w = TILE_SIZE;   // Width
    ground.h = TILE_SIZE;   // Height
    ground.color = "black"; // Tile colour
    ground.stroke = "white";    // Outline colour
    ground.collider = "static"; // Cannot move

    // Spikes sprite group
    spikes = new Group();
    spikes.tile = "s";
    spikes.img = spike;
    spikes.collider = "static";

    // Orbs sprite group
    orbs = new Group();
    orbs.tile = "o";
    orbs.d = 24;    // Diameter
    orbs.color = "#f5d402";
    orbs.stroke = "white";
    orbs.collider = "static"; // Cannot move

    // Finish line sprite group
    finishLine = new Group();
    finishLine.tile = "f";
    finishLine.w = TILE_SIZE;
    finishLine.h = height * 2;
    finishLine.color = "#f59402";
    finishLine.stroke = "black";
    finishLine.collider = "static";
    finishLine.visible = true; // Show or hide

    // Create map using tile map and sprite groups
    new Tiles(tileMap1, 0, 0, TILE_SIZE, TILE_SIZE);    // (map, x, y, width, height)
}

function draw() {
    clear();    // Clear the previous frame before drawing
    image(bg, 0, 0, 800, 600);  // (image, x, y, width, height)

    // Camera movement
    if (player.x >= width / 2) {
        // Follow player when it reaches the middle
        camera.x = player.x;
    } else {
        camera.x = width / 2;
    }
    
    // Player movement
    player.vel.x = 5;

    if (kb.presses("space") || mouse.presses("left")) {
        player.vel.y = -10; // Jump
    }
}
