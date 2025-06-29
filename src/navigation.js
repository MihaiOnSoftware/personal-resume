(function () {
    const NAV_ITEMS = [
        { text: "About Me", href: "index.html", page: "About Me" },
        { text: "Resume", href: "resume.html", page: "Resume" },
        { text: "Content", href: "content.html", page: "Content" },
        { text: "Contact", href: "contact.html", page: "Contact" },
        { text: "FAQ", href: "faq.html", page: "FAQ" },
    ];

    const SOCIAL_LINKS_HTML = `
        <a class="hover-green" href="http://ca.linkedin.com/in/m4popesc"><i class="fab fa-linkedin fa-2x"></i></a>
        <a class="hover-green" href="https://github.com/MihaiOnSoftware"><i class="fab fa-github-square fa-2x"></i></a>
        <a class="hover-green" href="mailto:mihai@mihai.software"><i class="fas fa-envelope fa-2x"></i></a>
    `;

    function elem(tag, className = "", attrs = {}) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        Object.assign(el, attrs);
        return el;
    }

    function createMobileMenu(currentPage) {
        const mobileMenu = elem("div", "mobile-menu");

        const mobileName = elem("div", "mobile-name");
        mobileName.appendChild(
            elem("a", "mobile-name-title selected trebut", {
                href: "#",
                textContent: currentPage,
            }),
        );

        const hamburgerContainer = elem("div", "hamburger-container");

        mobileMenu.appendChild(mobileName);
        mobileMenu.appendChild(hamburgerContainer);

        return mobileMenu;
    }

    function populateRootNav(rootNav, currentPage) {
        // Get reference to the first existing child (if any)
        const firstChild = rootNav.firstChild;

        NAV_ITEMS.forEach((item) => {
            const isSelected = item.page === currentPage;
            const className = isSelected
                ? "nav-item trebut selected mobile-invisible"
                : "nav-item trebut";
            const navItem = elem("a", className, { textContent: item.text });

            if (!isSelected) {
                navItem.href = item.href;
            }

            // Insert before the first existing child (or at the end if no children)
            rootNav.insertBefore(navItem, firstChild);
        });
    }

    function createContactSection() {
        const contactDiv = elem("div", "contact no-print mobile-invisible");
        contactDiv.innerHTML = SOCIAL_LINKS_HTML;
        return contactDiv;
    }

    function addToContent(navContainer) {
        const contentDiv = document.querySelector(".content");
        if (contentDiv) {
            contentDiv.insertBefore(navContainer, contentDiv.firstChild);
        } else {
            document.body.insertBefore(navContainer, document.body.firstChild);
        }
    }

    function loadHamburgerScript() {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "hamburger.js";
        document.head.appendChild(script);
    }

    function autoInitializeNavigation() {
        const hiddenNav = document.querySelector(".nav");
        const currentPage = hiddenNav.getAttribute("data-current-page");

        const navContainer = hiddenNav.cloneNode(true);
        navContainer.style.display = "";

        // Build complete navigation structure
        navContainer.insertBefore(
            createMobileMenu(currentPage),
            navContainer.firstChild,
        );

        const leafNav = navContainer.querySelector(".leaf-nav");
        let rootNav = navContainer.querySelector(".root-nav");

        if (!rootNav) {
            rootNav = elem("div", "root-nav");
            navContainer.insertBefore(rootNav, leafNav || null);
        }

        populateRootNav(rootNav, currentPage);

        if (!leafNav) {
            navContainer.appendChild(elem("div", "leaf-nav"));
        }

        const finalLeafNav = navContainer.querySelector(".leaf-nav");
        finalLeafNav.appendChild(createContactSection());

        addToContent(navContainer);

        // Load hamburger functionality after navigation is created
        loadHamburgerScript();
    }

    module.exports.autoInitializeNavigation = autoInitializeNavigation;

    // Auto-initialize navigation when DOM is loaded
    document.addEventListener("DOMContentLoaded", autoInitializeNavigation);
})();
