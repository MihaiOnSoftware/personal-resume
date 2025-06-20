(function () {
  const moment = require("moment");

  function localMihaiTime(timeProvider) {
    const latenessTax = 15;
    timeProvider.add(latenessTax, "minutes");
    return timeProvider.format("HH:mm");
  }

  function addLocalMihaiTime(localMihaiTime, dom) {
    const time = localMihaiTime;
    const timeElements = dom.querySelectorAll("[data-local-mihai-time]");

    Array.prototype.forEach.call(timeElements, (element) => {
      element.textContent = time;
    });
  }

  module.exports.localMihaiTime = localMihaiTime;
  module.exports.addLocalMihaiTime = addLocalMihaiTime;

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      const time = localMihaiTime(moment());
      addLocalMihaiTime(time, document);
    },
    false,
  );
})();
