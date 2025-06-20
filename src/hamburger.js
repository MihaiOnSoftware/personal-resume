(function () {
  const HAMBURGER_HTML = '<a class="hamburger" href="javascript:;"><i class="fa fa-bars"></i></a>';

  function toggleHamburger(hamburger) {
    const hamburgerIcon = hamburger.getElementsByTagName("i")[0];
    const hamburgerOpen = hamburgerIcon.classList.contains("fa-times");
    toggleHamburgerIcon(hamburgerIcon);

    const navItems = document.getElementsByClassName("nav-item");

    const notInvisibleNavItems = Array.prototype.filter.call(
      navItems,
      (element) => {
        return !element.classList.contains("mobile-invisible");
      },
    );

    Array.prototype.forEach.call(notInvisibleNavItems, (element) => {
      const classes = element.classList;
      if (hamburgerOpen && classes.contains("mobile-visible")) {
        classes.remove("mobile-visible");
      } else {
        classes.add("mobile-visible");
      }
    });
  }

  function toggleHamburgerIcon(hamburgerIcon) {
    hamburgerIcon.classList.toggle("fa-bars");
    hamburgerIcon.classList.toggle("fa");
    hamburgerIcon.classList.toggle("fas");
    hamburgerIcon.classList.toggle("fa-times");
  }

  function addHamburgerEventListener(container) {
    const hamburger = container.querySelector(".hamburger");
    hamburger.addEventListener("click", () => toggleHamburger(hamburger), false);
  }

  function createHamburgerHTML(container) {
    container.innerHTML = HAMBURGER_HTML;
    addHamburgerEventListener(container);
  }

  module.exports.toggleHamburger = toggleHamburger;
  module.exports.createHamburgerHTML = createHamburgerHTML;

  function autoInitializeHamburgers() {
    const containers = document.querySelectorAll(".hamburger-container");
    containers.forEach(container => createHamburgerHTML(container));
  }

  autoInitializeHamburgers();
})();
