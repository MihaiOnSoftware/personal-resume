// resume.test.js
const resume = require('../src/resume');

describe("toggleHamburger()", () => {
  it("toggles all nav-items to be visible if not visible", () => {
    document.body.innerHTML = `<div class="nav no-print">
        <a class="nav-item" style="display: none;">Nav Item 1</a>
        <a class="nav-item" style="display: none;">Nav Item 2</a>
    </div>`;

    resume.toggleHamburger();

    navItems = document.getElementsByClassName('nav-item');

    Array.prototype.forEach.call(navItems, function(element) {
        expect(element.classList).toContain('mobile-visible');
    });
  });

  it("toggles all nav-items to be invisible if visible", () => {
    document.body.innerHTML = `<div class="nav no-print">
        <a class="nav-item mobile-visible">Nav Item 1</a>
        <a class="nav-item mobile-visible">Nav Item 2</a>
    </div>`;

    resume.toggleHamburger();

    navItems = document.getElementsByClassName('nav-item');

    Array.prototype.forEach.call(navItems, function(element) {
        expect(element.classList).not.toContain('mobile-visible');
    });
  });
});
