const weather = require("../../src/faq/weather");

describe("weather", () => {
  const description = "light intensity drizzle";
  const iconUrl = "http://openweathermap.org/img/wn/09d.png";

  const mockWeatherApi = {
    description: Promise.resolve(description),
    iconUrl: Promise.resolve(iconUrl),
  };

  const weatherDescriptionElement = `<div class="weather-description"><p>${description}</p></div>`;
  const weatherIconElement = `<div
 class="weather-icon">
<img
 class="weather-image"
 src="${iconUrl}"
 alt="${description} icon"
/></div>`.replace(/\r?\n|\r/g, "");

  describe("weather", () => {
    it("correctly forms the weather description", () => {
      return weather
        .weather(mockWeatherApi)
        .description.then(result =>
          expect(result).toBe(weatherDescriptionElement)
        );
    });

    it("correctly forms the weather icon", () => {
      return weather
        .weather(mockWeatherApi)
        .icon.then(result => expect(result).toBe(weatherIconElement));
    });
  });
  describe("addWeather", () => {
    const fakeWeather = {
      description: Promise.resolve(weatherDescriptionElement),
      icon: Promise.resolve(weatherIconElement),
    };

    it("adds the weather description element to the dom", async () => {
      document.body.innerHTML = `
      <div class="weather"></div>
        `;
      const weatherElement = document.getElementsByClassName("weather")[0];
      weather.addWeather(fakeWeather, weatherElement);
      await fakeWeather.description.resolve;

      const weatherDescription = weatherElement.getElementsByClassName(
        "weather-description"
      )[0].firstChild;
      expect(weatherDescription.textContent).toBe(description);
    });

    it("adds the weather icon element to the dom", async () => {
      document.body.innerHTML = `
        <div class="weather"></div>
          `;
      const weatherElement = document.getElementsByClassName("weather")[0];
      weather.addWeather(fakeWeather, weatherElement);
      await fakeWeather.icon.resolve;

      const weatherIcon = weatherElement.getElementsByClassName(
        "weather-icon"
      )[0].firstChild;
      expect(weatherIcon.getAttribute("src")).toBe(iconUrl);
      expect(weatherIcon.getAttribute("alt")).toBe(description + " icon");
    });
  });

  describe("openWeatherApi", () => {
    const exampleOwaResult = {
      coord: { lon: -0.13, lat: 51.51 },
      weather: [
        {
          id: 300,
          main: "Drizzle",
          description: "light intensity drizzle",
          icon: "09d",
        },
      ],
      base: "stations",
      main: {
        temp: 280.32,
        pressure: 1012,
        humidity: 81,
        temp_min: 279.15,
        temp_max: 281.15,
      },
      visibility: 10000,
      wind: { speed: 4.1, deg: 80 },
      clouds: { all: 90 },
      dt: 1485789600,
      sys: {
        type: 1,
        id: 5091,
        message: 0.0103,
        country: "GB",
        sunrise: 1485762037,
        sunset: 1485794875,
      },
      id: 2643743,
      name: "London",
      cod: 200,
    };
    const fakeFetcher = () =>
      Promise.resolve({
        json: () => Promise.resolve(exampleOwaResult),
      });

    it("gets the current weather description", () => {
      return weather
        .openWeatherApi(fakeFetcher)
        .description.then(result => expect(result).toBe(description));
    });

    it("gets the current weather icon", () => {
      return weather
        .openWeatherApi(fakeFetcher)
        .iconUrl.then(result => expect(result).toBe(iconUrl));
    });
  });
});
