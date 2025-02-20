let img;
let raincloudImg;
let sunImg;
let moonImg;

let temperature = 0;
let cloudCoverage = 0;
let is_day = 0;
let precip_mm = 0;
let raindrops = [];
let cloudPositions = [];
let windSoundLittle, windSoundHard;
let currentWindSpeed = 0;

const weatherAPI = "https://api.weatherapi.com/v1/current.json?key=acdd62ff08054cb9b2e111932222112&q=Ghent&aqi=no";

function preload() {
    img = loadImage('/GentWeather/public/assets/Gent.png');
    raincloudImg = loadImage('/GentWeather/public/assets/raincloud.png');
    sunImg = loadImage('/GentWeather/public/assets/sun.png');
    moonImg = loadImage('/GentWeather/public/assets/moon.png');
    soundFormats('mp3');
    windSoundLittle = loadSound('/GentWeather/public/assets/wind-little.mp3');
    windSoundHard = loadSound('/GentWeather/public/assets/wind-hard.mp3');
}

document.addEventListener("DOMContentLoaded", function () {
    if (!localStorage.getItem('popupShown')) {
        const overlay = document.getElementById('overlay');
        const popup = document.getElementById('popup');
        const startButton = document.getElementById('startButton');
        overlay.style.display = "block";
        popup.style.display = "block";

        startButton.addEventListener('click', function () {
            overlay.style.display = "none";
            popup.style.display = "none";
            localStorage.setItem('popupShown', 'true');
            if (typeof startSimulation === "function") {
                startSimulation();
            }
        });
    } else {
        startSimulation();
    }
});

function startSimulation() {
    const canvasHeight = windowHeight;
    createCanvas(windowWidth, canvasHeight);
    textFont('Arial');
    textSize(48);
    textAlign(RIGHT, TOP);
    fill(0, 0, 0);
    stroke(250);
    strokeWeight(1);

    initializeRaindrops();
    initializeCloudPositions(cloudCoverage);

    fetchWeatherData();
    setInterval(fetchWeatherData, 60000);
}

function fetchWeatherData() {
    fetch(weatherAPI)
        .then(response => response.json())
        .then(data => {
            console.log("Raw weather data fetched:", data);
            temperature = data.current.temp_c;
            cloudCoverage = data.current.cloud;
            is_day = data.current.is_day;
            precip_mm = data.current.precip_mm;
            currentWindSpeed = data.current.wind_kph;

            console.log("Temperature (C):", temperature);
            console.log("Cloud coverage (%):", cloudCoverage);
            console.log("Is day (1 for day, 0 for night):", is_day);
            console.log("Precipitation (mm):", precip_mm);
            console.log("Current wind speed (kph):", currentWindSpeed);

            initializeRaindrops();
            initializeCloudPositions(cloudCoverage);
            playWindSound(currentWindSpeed);
        })
        .catch(error => console.error("Error fetching weather data: ", error));
}

function playWindSound(windSpeed) {
    windSoundLittle.stop();
    windSoundHard.stop();

    console.log("Wind speed:", windSpeed);

    if (windSpeed < 10) {
        console.log("Playing wind-little sound (very quiet)");
        if (!windSoundLittle.isPlaying()) {
            windSoundLittle.setVolume(0.1);
            windSoundLittle.loop();
        }
    }
    else if (windSpeed >= 10 && windSpeed < 29) {
        console.log("Playing wind-little sound");
        if (!windSoundLittle.isPlaying()) {
            windSoundLittle.setVolume(0.5);
            windSoundLittle.loop();
        }
    }
    else if (windSpeed >= 29 && windSpeed < 75) {
        console.log("Playing wind-hard sound (strong wind)");
        if (!windSoundHard.isPlaying()) {
            windSoundHard.setVolume(0.7);
            windSoundHard.loop();
        }
    }
    else if (windSpeed >= 75) {
        console.log("Playing wind-hard sound (very strong wind)");
        if (!windSoundHard.isPlaying()) {
            windSoundHard.setVolume(1.0);
            windSoundHard.loop();
        }
    }
}

function draw() {
    let bgColor = getBackgroundColor(cloudCoverage, is_day);
    background(bgColor);

    displaySunOrMoon(is_day);
    displayRainclouds();

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
    blendMode(OVERLAY);

    for (let i = 0; i < raindrops.length; i++) {
        raindrops[i].fall();
        raindrops[i].show();
    }

    blendMode(BLEND);

    let tempElement = document.getElementById('gent-temp');
    if (tempElement) {
        tempElement.innerText = `Gent: ${temperature}°C`;
    }
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

function initializeRaindrops() {
    raindrops = [];

    if (precip_mm > 0) {
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
}

function initializeCloudPositions(cloudPercentage) {
    let cloudCount = 0;
    if (cloudPercentage >= 80) {
        cloudCount = 6;
    } else if (cloudPercentage >= 50) {
        cloudCount = 3;
    } else if (cloudPercentage >= 20) {
        cloudCount = 2;
    }
    cloudPositions = [];

    for (let i = 0; i < cloudCount; i++) {
        let xPosition, yPosition;
        if (cloudCount === 3) {
            if (i === 0) {
                xPosition = random(50, width / 3 - 300);
            } else if (i === 1) {
                xPosition = random(width / 3 + 50, 2 * width / 3 - 300);
            } else {
                xPosition = random(2 * width / 3 + 50, width - 300 - 50);
            }
            yPosition = -20;
        } else if (cloudCount === 6) {
            xPosition = random(50, width - 300 - 50);
            yPosition = random(20, height * 0.2);
        }
        cloudPositions.push({ x: xPosition, y: yPosition });
    }
}

function displayRainclouds() {
    let cloudImgSize = 300;
    for (let i = 0; i < cloudPositions.length; i++) {
        let position = cloudPositions[i];
        image(raincloudImg, position.x, position.y, cloudImgSize, cloudImgSize);
    }
}

class Raindrop {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.length = random(10, 20);
        this.isSnow = temperature < 0;
    }

    fall() {
        this.y += this.speed;
        if (this.y > height) {
            this.y = random(-20, -100);
        }
    }

    show() {
        if (this.isSnow) {
            fill(255);
            noStroke();
            ellipse(this.x, this.y, this.length, this.length);
        } else {
            stroke(0, 0, 255);
            strokeWeight(2);
            line(this.x, this.y, this.x, this.y + this.length);
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    initializeRaindrops();
    initializeCloudPositions(cloudCoverage);
}
