(function () {
  const HAMBURGER_HTML = '<a class="hamburger" href="javascript:;"><i class="fa fa-bars"></i></a>';

  const getBackdrop = () => document.querySelector('.mobile-menu-backdrop');

  const getVisibleNavItems = () => {
    const navItems = document.getElementsByClassName("nav-item");
    return Array.from(navItems).filter(item => !item.classList.contains("mobile-invisible"));
  };

  const isMenuOpen = (hamburgerIcon) => hamburgerIcon?.classList.contains("fa-times");

  const toggleIcon = (icon) => {
    icon.classList.toggle("fa-bars");
    icon.classList.toggle("fa");
    icon.classList.toggle("fas");
    icon.classList.toggle("fa-times");
  };

  const toggleNavItemsVisibility = (isOpen, navItems) => {
    const action = isOpen ? 'add' : 'remove';
    navItems.forEach(item => item.classList[action]("mobile-visible"));
  };

  const toggleMenuClasses = (isOpen) => {
    const action = isOpen ? 'add' : 'remove';

    document.querySelector('.nav')?.classList[action]("mobile-menu-open");
    getBackdrop()?.classList[action]("active");
    document.body.classList[action]("mobile-menu-open");
  };

  const setMenuState = (isOpen, navItems) => {
    toggleNavItemsVisibility(isOpen, navItems);
    toggleMenuClasses(isOpen);
  };

  function closeMenu() {
    const hamburger = document.querySelector('.hamburger');
    const hamburgerIcon = hamburger.getElementsByTagName("i")[0];
    if (isMenuOpen(hamburgerIcon)) {
      toggleHamburger(hamburger);
    }
  }

  function toggleHamburger(hamburger) {
    const hamburgerIcon = hamburger.getElementsByTagName("i")[0];
    const menuCurrentlyOpen = isMenuOpen(hamburgerIcon);
    const visibleNavItems = getVisibleNavItems();

    toggleIcon(hamburgerIcon);
    setMenuState(!menuCurrentlyOpen, visibleNavItems);
  }

  function addHamburgerEventListener(container) {
    const hamburger = container.querySelector(".hamburger");
    hamburger.addEventListener("click", () => toggleHamburger(hamburger), false);
  }

  function createHamburgerHTML(container) {
    container.innerHTML = HAMBURGER_HTML;
    addHamburgerEventListener(container);
  }

  function addBackdropEventListener() {
    getBackdrop()?.addEventListener('click', closeMenu);
  }

  function autoInitializeHamburgers() {
    const containers = document.querySelectorAll(".hamburger-container");
    containers.forEach(container => createHamburgerHTML(container));
    addBackdropEventListener();
  }

  module.exports.toggleHamburger = toggleHamburger;
  module.exports.createHamburgerHTML = createHamburgerHTML;
  module.exports.closeMenu = closeMenu;

  autoInitializeHamburgers();
})();
