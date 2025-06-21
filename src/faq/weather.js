(function () {
  const weather = (weatherApi) => {
    const weatherDescriptionElement = weatherApi.description.then(
      (description) =>
        `<div class="weather-description"><p>` + description + `</p></div>`,
    );

    const weatherIconElement = weatherApi.description.then((description) => {
      return weatherApi.iconUrl.then(
        (iconUrl) =>
          `<div class="weather-icon"><img class="weather-image" src="` +
          iconUrl +
          `" alt="` +
          description +
          ` icon"/></div>`,
      );
    });

    return {
      description: weatherDescriptionElement.then(stripNewlines),
      icon: weatherIconElement.then(stripNewlines),
    };
  };

  const stripNewlines = (string) => {
    return string.replace(/\r?\n|\r/g, "");
  };

  const addWeather = (weather) => {
    Array.prototype.forEach.call(
      document.getElementsByClassName("weather"),
      (weatherElement) => {
        weather.description.then((descriptionElement) =>
          weatherElement.insertAdjacentHTML("beforeend", descriptionElement),
        );
        weather.icon.then((iconElement) =>
          weatherElement.insertAdjacentHTML("beforeend", iconElement),
        );
      },
    );
  };

  /**
   * Fetches weather data from the server API
   * @param {Function} fetch - The fetch function to use for making HTTP requests
   * @returns {Object} Weather data with description and iconUrl promises
   */
  const weatherApi = (fetch) => {
    const serverWeatherResponse = fetch('/api/weather')
      .then((data) => data.json());

    return {
      description: serverWeatherResponse.then(
        (weather) => weather.description,
      ),
      iconUrl: serverWeatherResponse.then(
        (weather) => weather.iconUrl,
      ),
    };
  };

  module.exports.weather = weather;
  module.exports.addWeather = addWeather;
  module.exports.weatherApi = weatherApi;

  // Only initialize in browser environment, not during testing
  if (typeof document !== 'undefined') {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        const weatherData = weather(weatherApi(fetch));
        const weatherElements = document.getElementsByClassName("weather");
        Array.prototype.forEach.call(weatherElements, (element) =>
          addWeather(weatherData, element),
        );
      },
      true,
    );
  }
})();
