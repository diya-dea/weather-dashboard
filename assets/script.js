const apiKey = "36ffcb2a3d344859a0de7fb2dee4b1b3";

const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const searchInput = document.getElementById("searchInput");
const searchedCities = document.getElementById("searchedCities");

const currentWeatherContainer = document.getElementById("cityCondition");
const pickedCity = document.getElementById("pickedCity");
const weatherIcon = document.getElementById("weatherIcon");
const forecastContainer = document.getElementById("forecastContainer");
const fiveDayFieldset = document.getElementById("fiveDayFieldset");

const today = document.getElementById("today");
var now = moment();
today.textContent = now.format("dddd, Do MMM, YYYY");

var userInputArr = JSON.parse(localStorage.getItem("savedCities")) || [];
var lastSearchedCity = userInputArr.at(-1) || "Tokyo";

displayRecentSearches();
getCurrentWeather(lastSearchedCity);

searchBtn.addEventListener("click", function (event) {
    event.preventDefault();
    if (searchInput.value === '' || !isNaN(searchInput.value)) {
        alert('Please Enter a City.');
        return;
    } else if (searchInput.value) {
        saveRecentSearches();
        getCurrentWeather(searchInput.value);
    }
    searchInput.value = "";
});

clearBtn.addEventListener("click", function () {
    userInputArr = [];
    localStorage.removeItem("savedCities");
    searchedCities.innerText = "";
});

function saveRecentSearches() {
    var userSearchInput = searchInput.value;
    userInputArr.push(userSearchInput);
    localStorage.setItem("savedCities", JSON.stringify(userInputArr));
    displayRecentSearches();
}

function displayRecentSearches() {
    searchedCities.innerHTML = "";
    const recentFiveSearch = userInputArr.slice(-5);
    recentFiveSearch.forEach(function (item) {
        const cityBtn = document.createElement("button");
        cityBtn.textContent = item;
        cityBtn.style.textTransform = "capitalize";
        cityBtn.setAttribute("class", "btn");
        searchedCities.appendChild(cityBtn);

        cityBtn.addEventListener("click", function (event) {
            getCurrentWeather(event.target.textContent);
        });
    });
}

function getCurrentWeather(cityName) {
    fiveDayFieldset.style.display = "block";
    let searchUrl = `https://api.weatherbit.io/v2.0/current?city=${cityName}&key=${apiKey}`;

    fetch(searchUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then((data) => {
            currentWeatherContainer.innerHTML = "";
            pickedCity.textContent = cityName;
            pickedCity.style.textTransform = "capitalize";

            const lat = data.data[0].lat;
            const lon = data.data[0].lon;

            getFiveWeather(lat, lon);

            const iconId = data.data[0].weather.icon;
            weatherIcon.setAttribute("src", `https://www.weatherbit.io/static/img/icons/${iconId}.png`);

            const temperatureEl = document.createElement("h2");
            temperatureEl.textContent = `${Math.round(data.data[0].temp)}°C`;
            currentWeatherContainer.appendChild(temperatureEl);

            const otherInfoDiv = document.createElement("div");
            otherInfoDiv.style.display = "flex";
            otherInfoDiv.style.flexDirection = "row";
            otherInfoDiv.style.flexWrap = "wrap";

            const windEl = document.createElement("span");
            windEl.textContent = `Wind: ${Math.round(data.data[0].wind_spd * 3.6)}km/h`;
            otherInfoDiv.appendChild(windEl);

            const humidityEl = document.createElement("span");
            humidityEl.textContent = `Humidity: ${Math.round(data.data[0].rh)}%`;
            otherInfoDiv.appendChild(humidityEl);

            currentWeatherContainer.appendChild(otherInfoDiv);

        }).catch(error => {
            console.error(error);
            currentWeatherContainer.innerHTML = "";
            fiveDayFieldset.style.display = "none";
            pickedCity.textContent = "City Cannot be Found :(";
            weatherIcon.setAttribute("src", "./assets/error.png");
        });
}

function getFiveWeather(lat, lon) {
    let searchUrl = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${apiKey}`;

    fetch(searchUrl)
        .then((response) => response.json())
        .then((data) => {
            forecastContainer.innerHTML = "";
            for (let i = 1; i < 6; i++) {
                let divEl = document.createElement("div");
                divEl.style.display = "flex";
                divEl.style.flexDirection = "column";

                const dayEl = document.createElement("p");
                const iconEl = document.createElement("img");
                const tempEl = document.createElement("p");
                const windEl = document.createElement("p");
                const humidEl = document.createElement("p");

                const dayDt = data.data[i].valid_date;
                dayEl.textContent = new Date(dayDt).toLocaleString("en-AU", { weekday: 'long', day: 'numeric' });

                tempEl.textContent = `${Math.round(data.data[i].temp)}°C`;
                windEl.textContent = `${Math.round(data.data[i].wind_spd)}km/h`;
                humidEl.textContent = `${data.data[i].rh}%`;

                const iconId = data.data[i].weather.icon;
                iconEl.setAttribute("src", `https://www.weatherbit.io/static/img/icons/${iconId}.png`);

                divEl.appendChild(dayEl);
                divEl.appendChild(iconEl);
                divEl.appendChild(tempEl);
                divEl.appendChild(windEl);
                divEl.appendChild(humidEl);

                forecastContainer.appendChild(divEl);
            }
        }).catch(error => {
            console.error(error);
        });
}

function getCurrentUV(data) {
    const uvEl = document.createElement("p");
    const currentUV = data.data[0].uv;
    uvEl.textContent = `UV: ${currentUV}`;
    currentWeatherContainer.appendChild(uvEl);

    if (currentUV < 3) {
        uvEl.classList.add("uv-low");
    } else if (currentUV >= 3 && currentUV < 6) {
        uvEl.classList.add("uv-moderate");
    } else if (currentUV >= 6 && currentUV < 8) {
        uvEl.classList.add("uv-high");
    } else if (currentUV >= 8 && currentUV < 11) {
        uvEl.classList.add("uv-veryHigh");
    } else {
        uvEl.classList.add("uv-extreme");
    }
}
