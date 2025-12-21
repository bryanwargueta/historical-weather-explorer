//Element References
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const updateBtn = document.getElementById("updateBtn");
const variableSelect = document.getElementById("variableSelect");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const statusMessage = document.getElementById("statusMessage");
const chartContainer = document.getElementById("chartContainer");

let weatherChart = null;
let cachedWeatherData = null;
let map;
let marker;

// Log searches
async function logSearchToServer(searchData) {
  try {
    await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(searchData),
    });
  } catch (err) {
    console.error("Failed to log search:", err);
  }
}

// Search History
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

let searchHistory = [];

// Render search history
function renderHistory() {
  historyList.innerHTML = "";

  searchHistory.forEach((city) => {
    const li = document.createElement("li");
    li.textContent = city;
    li.addEventListener("click", () => {
      cityInput.value = city;
      searchBtn.click();
    });
    historyList.appendChild(li);
  });
}

// Add to history
function addToHistory(city) {
  if (!city || searchHistory.includes(city)) return;
  searchHistory.unshift(city); // Adds to the top of the list
  if (searchHistory.length > 10) searchHistory.pop();
  renderHistory();
}

// Clear history
clearHistoryBtn.addEventListener("click", () => {
  searchHistory = [];
  renderHistory();
});

//Leaflet
function initializeMap(lat, lon) {
  if (!map) {
    map = L.map("map").setView([lat, lon], 16);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    marker = L.marker([lat, lon]).addTo(map);
  } else {
    map.setView([lat, lon], 16);
    marker.setLatLng([lat, lon]);
  }
}

//Set Default Date Range
//Open-Meteo has a 5 day delay
function setDefaultDates() {
  const today = new Date();
  today.setDate(today.getDate() - 5);

  const endDate = today.toISOString().split("T")[0];

  const startDateObj = new Date(today);
  startDateObj.setDate(startDateObj.getDate() - 7);
  const startDate = startDateObj.toISOString().split("T")[0];

  startDateInput.value = startDate;
  endDateInput.value = endDate;
}

setDefaultDates();

//Geocoding API
async function getCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    city
  )}&count=1`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("City not found.");
  }

  return {
    latitude: data.results[0].latitude,
    longitude: data.results[0].longitude,
  };
}

//Historical Weather API
async function fetchWeatherData(lat, lon) {
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  const url = `
https://archive-api.open-meteo.com/v1/archive
?latitude=${lat}
&longitude=${lon}
&start_date=${startDate}
&end_date=${endDate}
&hourly=temperature_2m,precipitation,windspeed_10m
&timezone=auto
`;

  const response = await fetch(url);
  return await response.json();
}

//Chart Rendering
function renderChart(variable) {
  if (!cachedWeatherData) return;

  chartContainer.style.display = "block";

  const labels = cachedWeatherData.hourly.time;
  const data = cachedWeatherData.hourly[variable];

  const labelMap = {
    temperature_2m: "Temperature (°C)",
    precipitation: "Precipitation (mm)",
    windspeed_10m: "Wind Speed (km/h)",
  };

  if (weatherChart) {
    weatherChart.destroy();
  }

  weatherChart = new Chart(document.getElementById("weatherChart"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: labelMap[variable],
          data: data,
        },
      ],
    },
  });
}

//Search by City
searchBtn.addEventListener("click", async () => {
  if (!cityInput.value.trim()) {
    statusMessage.textContent = "Please enter a city name.";
    return;
  }

  try {
    statusMessage.textContent = "Loading weather data...";

    const coords = await getCoordinates(cityInput.value);

    initializeMap(coords.latitude, coords.longitude);

    cachedWeatherData = await fetchWeatherData(
      coords.latitude,
      coords.longitude
    );

    addToHistory(cityInput.value.trim());

    logSearchToServer({
      city: cityInput.value.trim(),
      latitude: coords.latitude,
      longitude: coords.longitude,
      variable: variableSelect.value,
      date_start: startDateInput.value,
      date_end: endDateInput.value,
    });

    renderChart(variableSelect.value);
    statusMessage.textContent = "Weather data loaded successfully.";
  } catch (error) {
    statusMessage.textContent = error.message;
  }
});

//Use My Location
locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    statusMessage.textContent = "Geolocation is not supported by your browser.";
    return;
  }

  statusMessage.textContent = "Getting your location...";

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        initializeMap(lat, lon);

        cachedWeatherData = await fetchWeatherData(lat, lon);
        renderChart(variableSelect.value);
        statusMessage.textContent = "Weather data loaded successfully.";
      } catch (error) {
        statusMessage.textContent = "Unable to retrieve weather data.";
      }
    },
    () => {
      statusMessage.textContent = "Location access denied.";
    }
  );
});

//Update Chart on Variable Change
variableSelect.addEventListener("change", () => {
  renderChart(variableSelect.value);
});

//Update Chart Button
updateBtn.addEventListener("click", () => {
  if (cityInput.value.trim()) {
    searchBtn.click();
  } else {
    statusMessage.textContent =
      "Please search for a city or use your location first.";
  }
});
