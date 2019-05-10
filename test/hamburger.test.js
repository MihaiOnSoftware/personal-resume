// resume.test.js
const hamburger = require("../src/hamburger");

describe("toggleHamburger()", () => {
  const hamburgerDoc = `
  <a href="javascript:;" onclick="toggleHamburger(this)" class="hamburger">
    <i class="fa fa-bars"></i>
  </a>`;

  it("toggles all nav-items to be visible if not visible", () => {
    document.body.innerHTML = hamburgerDoc + `
    <div class="nav no-print">
        <a class="nav-item">Nav Item 1</a>
        <a class="nav-item">Nav Item 2</a>
    </div>`;

    hamburger.toggleHamburger(hamburger());

    navItems = document.getElementsByClassName("nav-item");

    Array.prototype.forEach.call(navItems, function(element) {
      expect(element.classList).toContain("mobile-visible");
    });
  });

  it("toggles all nav-items to be invisible if visible", () => {
    document.body.innerHTML = `
    <a href="javascript:;" onclick="toggleHamburger(this)" class="hamburger">
      <i class="fas fa-times"></i>
    </a>
    <div class="nav no-print">
        <a class="nav-item mobile-visible">Nav Item 1</a>
        <a class="nav-item mobile-visible">Nav Item 2</a>
    </div>`;

    hamburger.toggleHamburger(hamburger());

    navItems = document.getElementsByClassName("nav-item");

    Array.prototype.forEach.call(navItems, function(element) {
      expect(element.classList).not.toContain("mobile-visible");
    });
  });

  it("won't toggle nav-items with mobile-invisible", () => {
    document.body.innerHTML = hamburgerDoc + `
    <div class="nav no-print">
        <a class="nav-item">Nav Item 1</a>
        <a class="nav-item mobile-invisible">Nav Item 2</a>
    </div>
    `;

    hamburger.toggleHamburger(hamburger());

    navItems = document.getElementsByClassName("nav-item");

    Array.prototype.forEach.call(navItems, function(element) {
      if (element.classList.contains("mobile-invisible")) {
        expect(element.classList).not.toContain("mobile-visible");
      } else {
        expect(element.classList).toContain("mobile-visible");
      }
    });
  });

  it("changes the hamburger into a times", () => {
    document.body.innerHTML = hamburgerDoc + `
    <div class="nav no-print">
        <a class="nav-item" style="display: none;">Nav Item 1</a>
        <a class="nav-item" style="display: none;">Nav Item 2</a>
    </div>
    `;

    hamburger.toggleHamburger(hamburger());

    navItems = document.getElementsByClassName("nav-item");
    hamburgerIcon = hamburger().getElementsByTagName('i')[0]

    expect(hamburgerIcon.className).toBe("fas fa-times")
  });

  function hamburger() {
    return document.getElementsByClassName("hamburger")[0];
  }
});
