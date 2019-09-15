(function() {
  function toggleHamburger(hamburger) {
    const hamburgerIcon = hamburger.getElementsByTagName("i")[0];
    const hamburgerOpen = hamburgerIcon.classList.contains("fa-times");
    toggleHamburgerIcon(hamburgerIcon);

    const navItems = document.getElementsByClassName("nav-item");

    const notInvisibleNavItems = Array.prototype.filter.call(
      navItems,
      element => {
        return !element.classList.contains("mobile-invisible");
      }
    );

    Array.prototype.forEach.call(notInvisibleNavItems, element => {
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

  module.exports.toggleHamburger = toggleHamburger;

  document.addEventListener("DOMContentLoaded", () =>
    Array.prototype.forEach.call(
      document.getElementsByClassName("hamburger"),
      element =>
        element.addEventListener("click", () => toggleHamburger(element), false)
    )
  );
})();
