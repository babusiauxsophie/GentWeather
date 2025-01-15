let img;
let raincloudImg;
let sunImg;
let moonImg;

let temperature = "0°C"; // Set your desired temperature value here
let cloudCoverage = 100; // Set your desired cloud coverage percentage here (0-100)
let is_day = 1; // Set to 1 for day (sun), 0 for night (moon)
let precip_mm = 2.5; // Example precipitation level
let wind_kph = 20; // Wind speed (initialize to 0)

let raindrops = [];
let windLittleSound, windHardSound;

function preload() {
    img = loadImage('../public/assets/Gent.png');
    raincloudImg = loadImage('../public/assets/raincloud.png');
    sunImg = loadImage('../public/assets/sun.png');
    moonImg = loadImage('../public/assets/moon.png');
    soundFormats('mp3');
    windLittleSound = loadSound('../public/assets/wind-little.mp3');
    windHardSound = loadSound('../public/assets/wind-hard.mp3');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    noLoop();
    textFont('Arial');
    textSize(24);
    textAlign(RIGHT, TOP);
    fill(0, 0, 0);
    stroke(250);
    strokeWeight(1);

    // Display a message prompting the user to click
    textAlign(CENTER, CENTER);
    background(200);
    text("Click anywhere to start the simulation", width / 2, height / 2);

    // Add a user interaction handler to start audio and initialize the sketch
    window.addEventListener("click", startSimulation);
}

function draw() {
    let bgColor = getBackgroundColor(cloudCoverage, is_day);
    background(bgColor);

    displaySunOrMoon(is_day); // Draw the sun or moon

    displayRainclouds(cloudCoverage); // Draw clouds

    // Update and display raindrops
    for (let i = 0; i < raindrops.length; i++) {
        raindrops[i].fall();
        raindrops[i].show();
    }

    let imgAspect = img.width / img.height;
    let canvasAspect = width / height;

    let srcX, srcY, srcWidth, srcHeight;

    if (imgAspect > canvasAspect) {
        srcHeight = img.height;
        srcWidth = canvasAspect * srcHeight;
        srcX = (img.width - srcWidth) / 2;
        srcY = 0;
    } else {
        srcWidth = img.width;
        srcHeight = srcWidth / canvasAspect;
        srcX = 0;
        srcY = (img.height - srcHeight) / 2;
    }

    image(img, 0, 0, width, height, srcX, srcY, srcWidth, srcHeight);

    text(temperature, width - 20, 20);
}

function getBackgroundColor(cloudPercentage, isDay) {
    if (isDay) {
        if (cloudPercentage >= 80) {
            return color(169, 169, 169);
        } else if (cloudPercentage >= 50) {
            return lerpColor(color(135, 206, 250), color(169, 169, 169), (cloudPercentage - 50) / 50);
        } else {
            return color(135, 206, 250);
        }
    } else {
        if (cloudPercentage >= 80) {
            return color('#1c1f3b');
        } else if (cloudPercentage >= 50) {
            return lerpColor(color('#282c4d'), color('#253569'), (cloudPercentage - 50) / 50);
        } else {
            return color('#3c3f68');
        }
    }
}

function displaySunOrMoon(isDay) {
    let iconImg = isDay ? sunImg : moonImg;
    let iconSize = 100;
    image(iconImg, 20, 20, iconSize, iconSize);
}

function displayRainclouds(cloudPercentage) {
    let cloudImgSize = 300;
    let cloudCount = 0;

    if (cloudPercentage >= 80) {
        cloudCount = 6;
    } else if (cloudPercentage >= 50) {
        cloudCount = 3;
    } else if (cloudPercentage >= 20) {
        cloudCount = 2;
    }

    for (let i = 0; i < cloudCount; i++) {
        let xPosition, yPosition;

        if (cloudCount === 3) {
            if (i === 0) {
                xPosition = random(50, width / 3 - cloudImgSize);
            } else if (i === 1) {
                xPosition = random(width / 3 + 50, 2 * width / 3 - cloudImgSize);
            } else {
                xPosition = random(2 * width / 3 + 50, width - cloudImgSize - 50);
            }
            yPosition = -20;

        } else if (cloudCount === 6) {
            xPosition = random(50, width - cloudImgSize - 50);
            yPosition = random(20, height * 0.2);
        }

        image(raincloudImg, xPosition, yPosition, cloudImgSize, cloudImgSize);
    }
}

// Raindrop class
class Raindrop {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.length = random(10, 20);
    }

    fall() {
        this.y += this.speed;
        if (this.y > height) {
            this.y = random(-20, -100);
        }
    }

    show() {
        stroke(0, 0, 255);
        strokeWeight(2);
        line(this.x, this.y, this.x, this.y + this.length);
    }
}

// Initialize raindrops based on the precipitation level
function initializeRaindrops() {
    let numberOfRaindrops = 0;
    let dropSpeed = 0;

    if (precip_mm < 0.5) {
        numberOfRaindrops = 30;
        dropSpeed = 2;
    } else if (precip_mm >= 0.5 && precip_mm < 4) {
        numberOfRaindrops = 100;
        dropSpeed = 4;
    } else if (precip_mm >= 4 && precip_mm < 8) {
        numberOfRaindrops = 200;
        dropSpeed = 6;
    } else {
        numberOfRaindrops = 300;
        dropSpeed = 8;
    }

    for (let i = 0; i < numberOfRaindrops; i++) {
        let x = random(0, width);
        let y = random(-100, height);
        raindrops.push(new Raindrop(x, y, dropSpeed));
    }
}

function playWindSound(speed) {
    if (speed < 15) {
        // No sound for low wind speed
        return;
    } else if (speed >= 15 && speed < 29) {
        windLittleSound.setVolume(0.5);
        windLittleSound.loop();
    } else if (speed >= 29 && speed < 75) {
        windHardSound.setVolume(0.5);
        windHardSound.loop();
    } else if (speed >= 75) {
        windHardSound.setVolume(1.0);
        windHardSound.loop();
    }
}

function startSimulation() {
    // Remove the click listener
    window.removeEventListener("click", startSimulation);

    // Initialize raindrops based on precipitation
    initializeRaindrops();

    // Play wind sound based on wind speed
    playWindSound(wind_kph);

    // Start the sketch
    redraw();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    redraw();
}
