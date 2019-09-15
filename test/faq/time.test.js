const time = require("../../src/faq/time");
const moment = require("moment");

describe("time", () => {
  describe("loclaMihaiTime", () => {
    it("returns the time +15 min given a moment object", () => {
      const date = moment("2019-09-06 13:40:00");
      const result = time.localMihaiTime(date);
      expect(result).toEqual("13:55");
    });

    it("can handle returning on the hour", () => {
      const date = moment("2019-09-06 13:45:00");
      const result = time.localMihaiTime(date);
      expect(result).toEqual("14:00");
    });
  });

  it("sets the local mihai time on all nodes with data-local-mihai-time", () => {
    document.body.innerHTML = `
        <p id="first" class="data-not-local-mihai-time"></p>
        <p id="second" class="data-local-mihai-time"></p>`;
    time.addLocalMihaiTime("13:40");
    const first = document.getElementById("first");
    const second = document.getElementById("second");
    expect(first.textContent).toEqual("");
    expect(second.textContent).toEqual("13:40");
  });
});
