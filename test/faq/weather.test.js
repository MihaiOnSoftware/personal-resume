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
        .description.then((result) =>
          expect(result).toBe(weatherDescriptionElement),
        );
    });

    it("correctly forms the weather icon", () => {
      return weather
        .weather(mockWeatherApi)
        .icon.then((result) => expect(result).toBe(weatherIconElement));
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
        "weather-description",
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

      const weatherIcon =
        weatherElement.getElementsByClassName("weather-icon")[0].firstChild;
      expect(weatherIcon.getAttribute("src")).toBe(iconUrl);
      expect(weatherIcon.getAttribute("alt")).toBe(description + " icon");
    });
  });

  describe("weatherApi", () => {
    const serverWeatherResult = {
      description: "light intensity drizzle",
      iconId: "09d",
      iconUrl: "http://openweathermap.org/img/wn/09d.png",
    };

    const fakeFetcher = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(serverWeatherResult),
      }),
    );

    beforeEach(() => {
      fakeFetcher.mockClear();
    });

    it("calls the server weather endpoint", () => {
      weather.weatherApi(fakeFetcher);
      expect(fakeFetcher).toHaveBeenCalledWith('/api/weather');
    });

    it("gets the current weather description", () => {
      return weather
        .weatherApi(fakeFetcher)
        .description.then((result) => expect(result).toBe(description));
    });

    it("gets the current weather icon", () => {
      return weather
        .weatherApi(fakeFetcher)
        .iconUrl.then((result) => expect(result).toBe(iconUrl));
    });
  });
});
