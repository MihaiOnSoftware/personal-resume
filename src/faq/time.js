function localMihaiTime(timeProvider) {
  return timeProvider.getHours() + ":" + timeProvider.getMinutes();
}

function addLocalMihaiTime(localMihaiTime) {
  const time = localMihaiTime;
  const timeElement = document.getElementsByClassName("data-local-mihai-time");

  Array.prototype.forEach.call(timeElement, element => {
    element.textContent = time;
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports.localMihaiTime = localMihaiTime;
  module.exports.addLocalMihaiTime = addLocalMihaiTime;
} else {
  document.addEventListener(
    "DOMContentLoaded",
    function() {
      const time = localMihaiTime(new Date());
      addLocalMihaiTime(time);
    },
    false
  );
}
