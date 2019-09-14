(function() {
  const moment = require("moment");

  function localMihaiTime(timeProvider) {
    const latenessTax = 15;
    timeProvider.add(latenessTax, "minutes");
    return timeProvider.format("H:mm");
  }

  function addLocalMihaiTime(localMihaiTime) {
    const time = localMihaiTime;
    const timeElement = document.getElementsByClassName(
      "data-local-mihai-time"
    );

    Array.prototype.forEach.call(timeElement, element => {
      element.textContent = time;
    });
  }

  module.exports.localMihaiTime = localMihaiTime;
  module.exports.addLocalMihaiTime = addLocalMihaiTime;

  document.addEventListener(
    "DOMContentLoaded",
    function() {
      const time = localMihaiTime(moment());
      addLocalMihaiTime(time);
    },
    false
  );
})();
