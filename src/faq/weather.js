(function() {
  const weather = weatherApi => {
    const weatherDescriptionElement = weatherApi.description.then(
      description =>
        `<div class="weather-description"><p>` + description + `</p></div>`,
    );

    const weatherIconElement = weatherApi.description.then(description => {
      return weatherApi.iconUrl.then(
        iconUrl =>
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

  const stripNewlines = string => {
    return string.replace(/\r?\n|\r/g, "");
  };

  const addWeather = weather => {
    Array.prototype.forEach.call(
      document.getElementsByClassName("weather"),
      weatherElement => {
        weather.description.then(descriptionElement =>
          weatherElement.insertAdjacentHTML("beforeend", descriptionElement),
        );
        weather.icon.then(iconElement =>
          weatherElement.insertAdjacentHTML("beforeend", iconElement),
        );
      },
    );
  };

  const openWeatherApi = fetch => {
    const northYorkId = "6091104";
    const apiKey = "259ee1f96a30418ed0d3967bfb304494";
    const openWeatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?id=${northYorkId}&appid=${apiKey}`;
    const currentNorthYorkWeather = fetch(openWeatherApiUrl)
      .then(data => data.json())
      .then(body => body.weather[0]);

    const iconId = currentNorthYorkWeather.then(weather => weather.icon);

    return {
      description: currentNorthYorkWeather.then(weather => weather.description),
      iconUrl: iconId.then(
        iconId => `http://openweathermap.org/img/wn/${iconId}.png`,
      ),
    };
  };

  module.exports.weather = weather;
  module.exports.addWeather = addWeather;
  module.exports.openWeatherApi = openWeatherApi;

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      const weatherData = weather(openWeatherApi(fetch));
      const weatherElements = document.getElementsByClassName("weather");
      Array.prototype.forEach.call(weatherElements, element =>
        addWeather(weatherData, element),
      );
    },
    true,
  );
})();
