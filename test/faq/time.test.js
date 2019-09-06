const time = require("../../src/faq/time");

describe("loclaMihaiTime", () => {
  it("returns the time given a Date object", () => {
    const date = new Date("Fri Sep 6 13:40:18 EDT 2019");
    const result = time.localMihaiTime(date);
    expect(result).toEqual("13:40");
  });
});

describe("addLocalMihaiTimeOnLoad", () => {
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
