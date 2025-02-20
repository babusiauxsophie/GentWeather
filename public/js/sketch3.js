let weatherData = {};
let icons = {};
let canvasHeight;
let topMargin = 200;

function preload() {
    icons.iconCloudy = loadImage('/GentWeather/public/assets/icon-cloudy.png');
    icons.iconLightRain = loadImage('../public/assets/icon-light-rain.png');
    icons.iconMoon = loadImage('/GentWeather/public/assets/icon-moon.png');
    icons.iconNoRain = loadImage('/GentWeather/public/assets/icon-no--rain.png');
    icons.iconRain = loadImage('/GentWeather/public/assets/icon-rain.png');
    icons.iconSnow = loadImage('/GentWeather/public/assets/icon-snow.png');
    icons.iconSun = loadImage('/GentWeather/public/assets/icon-sun.png');
    icons.iconWind = loadImage('/GentWeather/public/assets/icon-wind.png');
}

function setup() {
    adjustCanvasHeight();
    createCanvas(windowWidth, canvasHeight);
    textSize(16);
    textAlign(CENTER);
    fetchWeatherData();
}

function windowResized() {
    adjustCanvasHeight();
    resizeCanvas(windowWidth, canvasHeight);
    drawWeatherData();
}

function adjustCanvasHeight() {
    let boxHeight = 215;
    let margin = 20;
    let rows;
    let cols = 1;
    if (windowWidth > 768) cols = 3;
    if (windowWidth > 1200) cols = 6;

    if (windowWidth > 1200) {
        rows = Math.ceil(24 / cols);
    } else if (windowWidth > 768) {
        rows = Math.ceil(24 / cols);
    } else {
        rows = Math.ceil(7 / cols);
    }
    canvasHeight = rows * (boxHeight + margin) + 100 + topMargin; 
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

function fetchWeatherData() {
    fetch('https://api.weatherapi.com/v1/forecast.json?key=acdd62ff08054cb9b2e111932222112&q=Ghent&days=1&aqi=no&alerts=no')
        .then(response => response.json())
        .then(data => {
            weatherData = data;
            let currentDate = new Date();
            let currentHour = currentDate.getHours();
            let currentTemp = weatherData.forecast.forecastday[0].hour[currentHour].temp_c;
            let gentTempElement = document.getElementById('gent-temp');
            gentTempElement.textContent = `Gent: ${currentTemp}°C`;

            drawWeatherData();
        })
        .catch(error => console.error('Error fetching data:', error));
}

function drawWeatherData() {
    let currentDate = new Date();
    let currentHour = currentDate.getHours();
    let forecast = weatherData.forecast.forecastday[0].hour;
    let currentHourData = forecast[currentHour];
    let cloudCoverage = currentHourData.cloud;
    let isDay = currentHourData.is_day === 1;

    console.log(`Current hour data: Time: ${currentHourData.time.split(' ')[1]}, Temp: ${currentHourData.temp_c}°C, Cloud Coverage: ${cloudCoverage}%, Precipitation: ${currentHourData.precip_mm} mm, Wind Speed: ${currentHourData.wind_kph} km/h, isDay: ${isDay ? "Day" : "Night"}`);

    let bgColor = getBackgroundColor(cloudCoverage, isDay);

    background(bgColor);

    let boxWidth = 155;
    let boxHeight = 215;
    let margin = 20;

    let cols = 1;
    if (windowWidth > 768) cols = 3;
    if (windowWidth > 1200) cols = 6;

    let maxWidth = cols * (boxWidth + margin) - margin;
    let xOffset = (windowWidth - maxWidth) / 2;
    let y = topMargin;

    let startIdx = currentHour;

    let numDataPoints = 24;
    if (windowWidth <= 768) {
        numDataPoints = 7;
    }

    let interval = Math.floor(24 / numDataPoints);

    for (let i = 0; i < numDataPoints; i++) {
        let hourData = forecast[(startIdx + i * interval) % forecast.length];

        let temp = hourData.temp_c;
        cloudCoverage = hourData.cloud;
        let precip = hourData.precip_mm;
        let windSpeed = hourData.wind_kph;
        isDay = hourData.is_day === 1;

        let icon;
        if (precip === 0) {
            icon = cloudCoverage > 30 ? icons.iconCloudy : icons.iconNoRain;
        } else if (precip <= 3) {
            icon = icons.iconLightRain;
        } else {
            icon = icons.iconRain;
        }
        if (temp < 0 && precip > 0) icon = icons.iconSnow;
        if (windSpeed > 70) icon = icons.iconWind;

        let dayNightIcon = isDay ? icons.iconSun : icons.iconMoon;

        let col = i % cols;
        let row = Math.floor(i / cols);
        let x = xOffset + col * (boxWidth + margin);

        push();
        fill(255);
        stroke(0, 0, 0, 50);
        rect(x, y + row * (boxHeight + margin), boxWidth, boxHeight, 15);
        pop();

        let iconWidth = 50;
        let boxX = x + boxWidth / 2;
        let boxY = y + row * (boxHeight + margin);

        image(icon, boxX - iconWidth / 2, boxY + 10, iconWidth, iconWidth);
        image(dayNightIcon, boxX - 12.5, boxY + boxHeight - 60, 25, 25);

        fill(0);
        text(`Tijd: ${hourData.time.split(' ')[1]}`, boxX, boxY + 70);
        text(`Temperatuur: ${temp}°C`, boxX, boxY + 90);
        text(`Bewolking: ${cloudCoverage}%`, boxX, boxY + 110);
        text(`Regen: ${precip} mm`, boxX, boxY + 130);
        text(`Wind: ${windSpeed} km/h`, boxX, boxY + 150);
    }
}
