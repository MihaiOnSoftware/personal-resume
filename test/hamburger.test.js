const hamburgerToggle = require("../src/hamburger");

describe("hamburger", () => {
  const hamburgerDoc = `
    <a href="javascript:;" class="hamburger">
      <i class="fa fa-bars"></i>
    </a>`;

  beforeEach(() => {
    document.body.classList.remove('mobile-menu-open');
    document.body.innerHTML = '';
  });

  describe("createHamburgerHTML()", () => {
    it("creates hamburger HTML in provided container", () => {
      document.body.innerHTML = `<div class="hamburger-container"></div>`;

      const container = document.querySelector(".hamburger-container");
      hamburgerToggle.createHamburgerHTML(container);

      const hamburger = container.querySelector(".hamburger");
      const icon = hamburger.querySelector("i");

      expect(hamburger.href).toBe("javascript:;");
      expect(icon.classList).toContain("fa-bars");
    });
  });

  describe("toggleHamburger()", () => {
    beforeEach(() => {
      // Setup common DOM structure with backdrop and nav
      document.body.innerHTML =
        hamburgerDoc +
        `
        <div class="nav no-print">
            <a class="nav-item">Nav Item 1</a>
            <a class="nav-item">Nav Item 2</a>
        </div>
        <div class="mobile-menu-backdrop"></div>`;
    });

    it("toggles all nav-items to be visible if not visible", () => {
      const hamburger = document.querySelector(".hamburger");
      hamburgerToggle.toggleHamburger(hamburger);

      const navItems = document.getElementsByClassName("nav-item");
      const nav = document.querySelector('.nav');
      const backdrop = document.querySelector('.mobile-menu-backdrop');

      Array.prototype.forEach.call(navItems, (element) => {
        expect(element.classList).toContain("mobile-visible");
      });

      expect(nav.classList).toContain("mobile-menu-open");
      expect(backdrop.classList).toContain("active");
      expect(document.body.classList).toContain("mobile-menu-open");
    });

    it("toggles all nav-items to be invisible if visible", () => {
      document.body.innerHTML = `
        <a href="javascript:;" class="hamburger">
          <i class="fas fa-times"></i>
        </a>
        <div class="nav no-print mobile-menu-open">
            <a class="nav-item mobile-visible">Nav Item 1</a>
            <a class="nav-item mobile-visible">Nav Item 2</a>
        </div>
        <div class="mobile-menu-backdrop active"></div>`;

      // Set initial state
      document.body.classList.add('mobile-menu-open');

      const hamburger = document.querySelector(".hamburger");
      hamburgerToggle.toggleHamburger(hamburger);

      const navItems = document.getElementsByClassName("nav-item");
      const nav = document.querySelector('.nav');
      const backdrop = document.querySelector('.mobile-menu-backdrop');

      Array.prototype.forEach.call(navItems, (element) => {
        expect(element.classList).not.toContain("mobile-visible");
      });

      expect(nav.classList).not.toContain("mobile-menu-open");
      expect(backdrop.classList).not.toContain("active");
      expect(document.body.classList).not.toContain("mobile-menu-open");
    });

    it("won't toggle nav-items with mobile-invisible", () => {
      document.body.innerHTML =
        hamburgerDoc +
        `
        <div class="nav no-print">
            <a class="nav-item">Nav Item 1</a>
            <a class="nav-item mobile-invisible">Nav Item 2</a>
        </div>
        <div class="mobile-menu-backdrop"></div>`;

      const hamburger = document.querySelector(".hamburger");
      hamburgerToggle.toggleHamburger(hamburger);

      const navItems = Array.from(document.getElementsByClassName("nav-item"));

      const invisibleItems = navItems.filter((el) =>
        el.classList.contains("mobile-invisible"),
      );
      const visibleItems = navItems.filter(
        (el) => !el.classList.contains("mobile-invisible"),
      );

      invisibleItems.forEach((element) => {
        expect(element.classList).not.toContain("mobile-visible");
      });

      visibleItems.forEach((element) => {
        expect(element.classList).toContain("mobile-visible");
      });
    });

    it("changes the hamburger into a times", () => {
      const hamburger = document.querySelector(".hamburger");
      hamburgerToggle.toggleHamburger(hamburger);

      const hamburgerIcon = hamburger.getElementsByTagName("i")[0];

      expect(hamburgerIcon.className).toBe("fas fa-times");
    });

    it("changes the times back to hamburger", () => {
      document.body.innerHTML = `
        <a href="javascript:;" class="hamburger">
          <i class="fas fa-times"></i>
        </a>
        <div class="nav no-print mobile-menu-open">
            <a class="nav-item mobile-visible">Nav Item 1</a>
        </div>
        <div class="mobile-menu-backdrop active"></div>`;

      const hamburger = document.querySelector(".hamburger");
      hamburgerToggle.toggleHamburger(hamburger);

      const hamburgerIcon = hamburger.getElementsByTagName("i")[0];

      expect(hamburgerIcon.className).toBe("fa-bars fa");
    });
  });

  describe("closeMenu()", () => {
    it("closes menu when hamburger is open", () => {
      document.body.innerHTML = `
        <a href="javascript:;" class="hamburger">
          <i class="fas fa-times"></i>
        </a>
        <div class="nav no-print mobile-menu-open">
            <a class="nav-item mobile-visible">Nav Item 1</a>
        </div>
        <div class="mobile-menu-backdrop active"></div>`;

      document.body.classList.add('mobile-menu-open');

      hamburgerToggle.closeMenu();

      const navItems = document.getElementsByClassName("nav-item");
      const nav = document.querySelector('.nav');
      const backdrop = document.querySelector('.mobile-menu-backdrop');

      Array.prototype.forEach.call(navItems, (element) => {
        expect(element.classList).not.toContain("mobile-visible");
      });

      expect(nav.classList).not.toContain("mobile-menu-open");
      expect(backdrop.classList).not.toContain("active");
      expect(document.body.classList).not.toContain("mobile-menu-open");
    });

    it("does nothing when hamburger is already closed", () => {
      document.body.innerHTML = `
        <a href="javascript:;" class="hamburger">
          <i class="fa fa-bars"></i>
        </a>
        <div class="nav no-print">
            <a class="nav-item">Nav Item 1</a>
        </div>
        <div class="mobile-menu-backdrop"></div>`;

      hamburgerToggle.closeMenu();

      const navItems = document.getElementsByClassName("nav-item");
      const nav = document.querySelector('.nav');
      const backdrop = document.querySelector('.mobile-menu-backdrop');

      Array.prototype.forEach.call(navItems, (element) => {
        expect(element.classList).not.toContain("mobile-visible");
      });

      expect(nav.classList).not.toContain("mobile-menu-open");
      expect(backdrop.classList).not.toContain("active");
      expect(document.body.classList).not.toContain("mobile-menu-open");
    });
  });
});
