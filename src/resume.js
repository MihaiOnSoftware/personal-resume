// resume.js

function toggleHamburger() {
  navItems = document.getElementsByClassName("nav-item");

  Array.prototype.forEach.call(navItems, function(element) {
    classes = element.classList;
    if (classes.contains("mobile-visible")) {
      classes.remove("mobile-visible");
    } else {
      classes.add("mobile-visible");
    }
  });
}

if (typeof module !== 'undefined') {
  module.exports.toggleHamburger = toggleHamburger;
}
