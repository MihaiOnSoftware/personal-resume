// resume.js

function toggleHamburger() {
  navItems = document.getElementsByClassName("nav-item");

  notInvisibleNavItems = Array.prototype.filter.call(navItems, function(element) {
    return !element.classList.contains("mobile-invisible");
  })

  Array.prototype.forEach.call(notInvisibleNavItems, function(element) {
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
