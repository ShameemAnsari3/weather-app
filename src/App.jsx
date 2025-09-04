import { useState, useEffect } from "react";

const getWeatherIcon = (weatherCode) => {
  if (weatherCode === 0) return "fa-sun";
  if (weatherCode > 0 && weatherCode < 4) return "fa-cloud-sun";
  if (weatherCode >= 45 && weatherCode <= 48) return "fa-smog";
  if (weatherCode >= 51 && weatherCode <= 67) return "fa-cloud-rain";
  if (weatherCode >= 71 && weatherCode <= 77) return "fa-snowflake";
  if (weatherCode >= 80 && weatherCode <= 82) return "fa-cloud-showers-heavy";
  if (weatherCode >= 95 && weatherCode <= 99) return "fa-bolt";
  return "fa-cloud";
};

const getWeatherDescription = (weatherCode) => {
  const weatherDescriptions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return weatherDescriptions[weatherCode] || "Unknown";
};

export default function App() {
  const [city, setCity] = useState("London");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeatherData = async (cityName) => {
    setLoading(true);
    setError(null);

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          cityName
        )}&count=1&language=en&format=json`
      );
      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found. Please try another city name.");
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto`
      );
      const weatherJson = await weatherResponse.json();

      if (!weatherJson.current) {
        throw new Error("Weather data not available for this location.");
      }

      setWeatherData({
        city: name,
        country: country,
        ...weatherJson.current,
        units: weatherJson.current_units,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim() !== "") {
      fetchWeatherData(city.trim());
    }
  };

  useEffect(() => {
    fetchWeatherData(city);
  }, []);

  const formatDate = () => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date().toLocaleDateString("en-US", options);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Weather Now</h1>
        <p>Quick weather updates for outdoor enthusiasts</p>
      </div>

      <form onSubmit={handleSearch} className="search-container">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name..."
        />
        <button type="submit">
          <i className="fas fa-search"></i>
        </button>
      </form>

      {loading && (
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading weather data...</p>
        </div>
      )}

      {error && (
        <div className="error">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
        </div>
      )}

      {weatherData && !loading && !error && (
        <div className="weather-info">
          <h2 className="city-name">
            {weatherData.city}, {weatherData.country}
          </h2>
          <p className="date">{formatDate()}</p>

          <div className="temperature">
            {Math.round(weatherData.temperature_2m)}
            {weatherData.units?.temperature_2m || "°C"}
          </div>

          <div className="weather-description">
            <i
              className={`fas ${getWeatherIcon(
                weatherData.weather_code
              )} weather-icon`}
            ></i>
            <span>{getWeatherDescription(weatherData.weather_code)}</span>
          </div>

          <div className="weather-details">
            <div className="detail-card">
              <i className="fas fa-temperature-high"></i>
              <p>Feels Like</p>
              <h3>
                {Math.round(weatherData.apparent_temperature)}
                {weatherData.units?.apparent_temperature || "°C"}
              </h3>
            </div>

            <div className="detail-card">
              <i className="fas fa-tint"></i>
              <p>Humidity</p>
              <h3>
                {weatherData.relative_humidity_2m}
                {weatherData.units?.relative_humidity_2m || "%"}
              </h3>
            </div>

            <div className="detail-card">
              <i className="fas fa-wind"></i>
              <p>Wind Speed</p>
              <h3>
                {weatherData.wind_speed_10m}
                {weatherData.units?.wind_speed_10m || "km/h"}
              </h3>
            </div>

            <div className="detail-card">
              <i className="fas fa-cloud-rain"></i>
              <p>Precipitation</p>
              <h3>
                {weatherData.precipitation}
                {weatherData.units?.precipitation || "mm"}
              </h3>
            </div>
          </div>
        </div>
      )}

      <div className="footer">
        <p>Powered by Open-Meteo API</p>
      </div>
    </div>
  );
}
