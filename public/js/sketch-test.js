let img;
let raincloudImg;
let sunImg;
let moonImg;

let temperature = "0°C"; // Set your desired temperature value here
let cloudCoverage = 100;   // Set your desired cloud coverage percentage here (0-100)
let is_day = 1;           // Set to 1 for day (sun), 0 for night (moon)
let precip_mm = 2.5; // Example precipitation level (change this to simulate different rainfall intensity)

let raindrops = [];

function preload() {
    img = loadImage('../public/assets/Gent.png');
    raincloudImg = loadImage('../public/assets/raincloud.png');
    sunImg = loadImage('../public/assets/sun.png');
    moonImg = loadImage('../public/assets/moon.png');
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

    // Initialize raindrops based on precipitation
    initializeRaindrops();
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
        // Daytime colors
        if (cloudPercentage >= 80) {
            return color(169, 169, 169); // Dark grey for 80-100% clouds
        } else if (cloudPercentage >= 50) {
            return lerpColor(color(135, 206, 250), color(169, 169, 169), (cloudPercentage - 50) / 50); // Gradual transition from sky blue to grey
        } else {
            return color(135, 206, 250); // Sky blue for 0-50% clouds
        }
    } else {
        // Nighttime colors
        if (cloudPercentage >= 80) {
            return color('#1c1f3b'); // Darkest for 80-100% clouds
        } else if (cloudPercentage >= 50) {
            return lerpColor(color('#282c4d'), color('#253569'), (cloudPercentage - 50) / 50); // Gradual transition from darkest to second darkest
        } else {
            return color('#3c3f68'); // Standard for 0-50% clouds
        }
    }
}

function displaySunOrMoon(isDay) {
    let iconImg = isDay ? sunImg : moonImg; // Choose sun or moon based on is_day
    let iconSize = 100; // Set the size of the sun/moon
    image(iconImg, 20, 20, iconSize, iconSize); // Draw the icon in the upper-left corner
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
            this.y = random(-20, -100); // Reset raindrop to top of canvas
        }
    }

    show() {
        stroke(0, 0, 255); // Blue color for raindrops
        strokeWeight(2);
        line(this.x, this.y, this.x, this.y + this.length); // Draw a line for the raindrop
    }
}

// Initialize raindrops based on the precipitation level
function initializeRaindrops() {
    let numberOfRaindrops = 0;
    let dropSpeed = 0;

    // Determine the intensity and number of raindrops based on precipitation
    if (precip_mm < 0.5) {
        numberOfRaindrops = 30; // Slight rain
        dropSpeed = 2;
    } else if (precip_mm >= 0.5 && precip_mm < 4) {
        numberOfRaindrops = 100; // Moderate rain
        dropSpeed = 4;
    } else if (precip_mm >= 4 && precip_mm < 8) {
        numberOfRaindrops = 200; // Heavy rain
        dropSpeed = 6;
    } else {
        numberOfRaindrops = 300; // Very heavy rain
        dropSpeed = 8;
    }

    // Generate raindrops at random positions
    for (let i = 0; i < numberOfRaindrops; i++) {
        let x = random(0, width);
        let y = random(-100, height);
        raindrops.push(new Raindrop(x, y, dropSpeed));
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    redraw();
}
