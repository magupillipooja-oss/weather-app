const searchButton = document.getElementById("search-button");
const searchInput= document.querySelector(".search-bar");
const apiKey = "5fefb8f8435194b54c38db7c18b4c16c"

searchButton.addEventListener("click", function () {
    const city = searchInput.value;
    getWeather(city);
});

async function getWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    
    const response = await fetch(url);
    const data = await response.json();

    if(data.cod === '404') {
        document.getElementById("error-message").innerText= 'City not found, please try again';
    } else {
        document.getElementById("city-name").innerText = data.name;
        document.getElementById("temperature").innerText = data.main.temp + " °C";
        document.getElementById("weather-description").innerText = data.weather[0].description;
        document.getElementById("feels-like").innerText = data.main.feels_like + " °C";
        document.getElementById("wind-speed").innerText = data.wind.speed + "km/h";
        document.getElementById("humidity").innerText = data.main.humidity + "%";
        document.getElementById("pressure").innerText = data.main.pressure + "hPa";
    }

    console.log(data);

};

window.onload = function() {
    navigator.geolocation.getCurrentPosition(function(position){
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        getWeatherByCoords(lat, lon);
    });
};

async function getWeatherByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();

    if(data.cod === '404') {
        document.getElementById("error-message").innerText= 'City not found, please try again';
    } else {
        document.getElementById("city-name").innerText = data.name;
        document.getElementById("temperature").innerText = data.main.temp + " °C";
        document.getElementById("weather-description").innerText = data.weather[0].description;
        document.getElementById("feels-like").innerText = data.main.feels_like + " °C";
        document.getElementById("wind-speed").innerText = data.wind.speed + "km/h";
        document.getElementById("humidity").innerText = data.main.humidity + "%";
        document.getElementById("pressure").innerText = data.main.pressure + "hPa";
    }

    console.log(data);
}
