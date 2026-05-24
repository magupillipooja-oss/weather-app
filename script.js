const searchButton = document.getElementById("search-button");
const searchInput= document.querySelector(".search-bar");
const apiKey = "5fefb8f8435194b54c38db7c18b4c16c";
let currentLat = null;
let currentLon = null;

 searchButton.addEventListener("click", function () {
    const city = searchInput.value;
    getWeather(city);
});

 async function getWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    
    const response = await fetch(url);
    const data = await response.json();

    if(data.cod === '404') {
        errorMessage("City not found. Please try again!");
    } else {
        displayWeather(data);
        getForecast(data.name);
        getUVIndex(data.coord.lat, data.coord.lon);
    }
    console.log(data);
};

  function errorMessage(message) {
    const error = document.getElementById("error-message");
     error.innerText = message;
     error.style.display = "block";

     setTimeout(function() {
        error.style.display = "none";
     }, 3000);
}

 window.onload = function() {
    navigator.geolocation.getCurrentPosition(function(position){
        const currentLat = position.coords.latitude;
        const currentLon = position.coords.longitude;
        getWeatherByCoords(currentLat, currentLon);
    });
};

 async function getWeatherByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();

    if(data.cod === '404') {
         errorMessage("City not found. Please try again!");
    } else {
        displayWeather(data);
        getForecast(data.name);
        getUVIndex(lat, lon);
    }
    console.log(data);
};

 function displayWeather(data) {
     document.getElementById("city-name").innerText =  data.name ;
        document.getElementById("temperature").innerText = data.main.temp + " °C";
        document.getElementById("feels-like").innerText = "Feels like: " + data.main.feels_like + " °C";
         const desc = data.weather[0].description;
         const formatted = desc.charAt(0).toUpperCase() + desc.slice(1);
          document.getElementById("weather-description").innerText= "🌤️" + formatted;
       // document.getElementById("weather-description").innerText = data.weather[0].description;
        document.getElementById("wind-speed").innerText = "Speed: " +data.wind.speed + "km/h";
        document.getElementById("wind-gust").innerText = "Gust: " + data.wind.gust + "km/h";
        //wind direction label
        const deg = data.wind.deg;
         let direction = ""
         if(deg < 45) direction = "N";
         else if(deg<90) direction = "NE";
         else if(deg<135) direction = "E"
         else if(deg<180) direction = "SE"
         else if(deg<225) direction="S";
         else if(deg<270) direction = "SW";
         else if(deg<315) direction = "W";
         else direction = "NW";
        document.getElementById("wind-direction").innerText = "Direction: " + data.wind.deg +"°" + direction;
        //humidity with comfort label
        let comfort = "";
        if(data.main.humidity < 30) comfort = "Dry";
        else if(data.main.humidity < 60) comfort = "comfortable";
        else if(data.main.humidity < 80) comfort="Humid"
        else comfort = "High Humid";
        document.getElementById("humidity").innerText = data.main.humidity + "% - " + comfort;
        //humidity statement
        let humidityMessage = "";
if(data.main.humidity < 30) humidityMessage = 
  "The air is quite dry. Consider using a humidifier or stay hydrated";
else if(data.main.humidity < 60) humidityMessage =
  " Humidity is at a comfortable level. Pleasant conditions outside!";
else if(data.main.humidity < 80) humidityMessage = 
  "It's getting humid. You may feel slightly uncomfortable outside."  
else humidityMessage=
  "Very high humidity. It will feel hotter than it actually is outside";
        document.getElementById("humidity-message").innerText = humidityMessage;
  
        //pressure label
        let pressureStatus = "";
        let pressureMessage = "";

        if(data.main.pressure < 980) {
            pressureStatus = "Very Low";
            pressureMessage = "Stormy weather likely.";
        }
        else if(data.main.pressure< 1000) {
            pressureStatus = "Low";
            pressureMessage = "Expect cloudy or rainy conditions.";
        }
        else if(data.main.pressure < 1020) {
            pressureStatus = "Normal";
            pressureMessage = "Stable weather condition.";
        }
        else if(data.main.pressure < 1040) {
            pressureStatus = "High";
            pressureMessage = "Clear and sunny weather expected."
        }
        else {
            pressureStatus = "Very High";
            pressureMessage = "Exceptionally clear conditions.";
        }

        document.getElementById("pressure").innerText = data.main.pressure + "hPa- " + pressureStatus;
        document.getElementById("pressure-message").innerText = pressureMessage;
        const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
        const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();
        document.getElementById("sunrise").innerText = " Sunrise: " + sunrise;
        document.getElementById("sunset").innerText = " Sunset: " + sunset;

        sunArcGraph(data.sys.sunrise, data.sys.sunset);
        windCompassGraph(data.wind.deg);
        
};

 async function getForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();
    console.log(data.list[0]);
    const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));

    const container = document.getElementById("forecast-container");
     container.innerHTML = "";
    
     container.innerHTML = "<p class='forecast-title' >5 Day Forecast</p>";
     dailyData.forEach(function(day) {
        const div = document.createElement("div");
         div.classList.add("forecast-day");
         div.innerHTML = `
          <p>${day.dt_txt.slice(0, 10)}</p>
          <p>${day.main.temp} °C</p>
          <p>${day.weather[0].description}</p>
          `;
          container.appendChild(div);
     });
}


function sunArcGraph(sunrise, sunset) {
    const canvas = document.getElementById("sunArc");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0,0, canvas.width, canvas.height);

    const now = Date.now() / 1000;
    //current time in seconds
    const sunPosition = (now - sunrise) / (sunset -sunrise);
    const clampedSunPosition = Math.min(Math.max(sunPosition, 0), 1);

    const centerX = canvas.width / 2;
    const centerY = canvas.height-10;
    const radius = 120;

     //code for background semi-circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 0);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 4;
    ctx.stroke();

     //code for sun's position on the semi-circle
    const startAngle = Math.PI;
    const endAngle = Math.PI + (clampedSunPosition * Math.PI);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle= "rgb(30, 33, 170)";
    ctx.lineWidth = 4;
    ctx.stroke();

    //arc for sun position
    const sunAngle = Math.PI + (clampedSunPosition * Math.PI);
    const sunX = centerX + radius* Math.cos(sunAngle);
    const sunY = centerY + radius*Math.sin(sunAngle);
    ctx.font = "20px Arial";
    ctx.fillText("☀️", sunX - 10, sunY + 10);
}

async function getUVIndex(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    let uvLevel = "";
    if(data.value < 2) uvLevel = "Low";
    else if(data.value < 5) uvLevel = "Moderate";
    else if(data.value < 7) uvLevel = "High";
    else if(data.value < 10) uvLevel = "Very High";
    else uvLevel = "Extreme";

    document.getElementById("uv-index").innerText = 
      "UV Index: " + data.value + "-" + uvLevel;
}

function windCompassGraph(degree) {
   const canvas = document.getElementById("windCompass");
   const ctx = canvas.getContext("2d");
   ctx.clearRect(0,0, canvas.width, canvas.height)

   const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 50;
    //compass outer circle code
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgb(5, 6, 83)";
    ctx.lineWidth = 2;
    ctx.stroke();
    //compass  N S E W labels code
    ctx.fillStyle= "rgb(5,6,83)";
    ctx.font = "bold 12px Arial";
    ctx.fillText("N", centerX - 5, centerY - radius +15);
    ctx.fillText("S", centerX - 5, centerY + radius - 5);
    ctx.fillText("E", centerX + radius - 15, centerY + 5);
    ctx.fillText("W", centerX - radius + 5, centerY + 5);
    //arrow pointer code
    const angle = (degree - 90) * (Math.PI/180);
    const arrowLength = 35;

    const endX = centerX + arrowLength* Math.cos(angle);
    const endY = centerY + arrowLength* Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.stroke();
    //center dot code
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4,0,2*Math.PI);
    ctx.fillStyle="white";
    ctx.fill();

}
