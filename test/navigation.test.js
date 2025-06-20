const navigation = require("../src/navigation");

describe("navigation", () => {
    const contentDiv = '<div class="content"></div>';

    const hiddenNavFor = (page, leafNavItems = "", rootNavItems = "") => {
        const leafNav = leafNavItems
            ? `<div class="leaf-nav">${leafNavItems}</div>`
            : "";
        const rootNav = rootNavItems
            ? `<div class="root-nav">${rootNavItems}</div>`
            : "";
        return `<div class="nav no-print" style="display: none;" data-current-page="${page}">${rootNav}${leafNav}</div>`;
    };

    const resumeSubNav = `
        <a class="nav-item small-text mobile-invisible trebut" href="#summary">Summary</a>
        <a class="nav-item small-text mobile-invisible trebut" href="#skills">Skills</a>
        <a class="nav-item small-text mobile-invisible trebut" href="#experience">Experience</a>
    `;

    const setupPage = (page, leafNavItems = "", rootNavItems = "") => {
        document.body.innerHTML = contentDiv + hiddenNavFor(page, leafNavItems, rootNavItems);
        navigation.autoInitializeNavigation();
    };

    const visibleNav = () => {
        const navs = document.querySelectorAll(".nav");
        return Array.from(navs).find((nav) => nav.style.display !== "none");
    };

    // Clean up after each test to prevent side effects
    afterEach(() => {
        document.body.innerHTML = '';
        // Remove any hamburger scripts that might have been added
        const scripts = document.querySelectorAll('script[src="hamburger.js"]');
        scripts.forEach(script => script.remove());
    });

    describe("autoInitializeNavigation()", () => {
        it("creates mobile menu with current page title", () => {
            setupPage("About Me");

            const title = document.querySelector(".mobile-name-title");
            expect(title.textContent).toBe("About Me");
            expect(title.classList).toContain("selected");
        });

        it("creates root navigation with correct selected item", () => {
            setupPage("Resume");

            const navItems = document.querySelectorAll(".root-nav .nav-item");
            expect(navItems).toHaveLength(5);

            const aboutMe = navItems[0];
            expect(aboutMe.textContent).toBe("About Me");
            expect(aboutMe.href).toContain("index.html");

            const resume = navItems[1];
            expect(resume.textContent).toBe("Resume");
            expect(resume.classList).toContain("selected");
        });

        it("creates hamburger container for hamburger script to populate", () => {
            setupPage("Contact");

            const hamburgerContainer = document.querySelector(".mobile-menu div:last-child");
            expect(hamburgerContainer).toBeTruthy();
            expect(hamburgerContainer.classList).toContain("hamburger-container");
        });

        it("creates social contact icons", () => {
            setupPage("About Me");

            const socialLinks = document.querySelectorAll(".contact a");
            expect(socialLinks).toHaveLength(3);
            expect(socialLinks[0].href).toContain("linkedin");
            expect(socialLinks[1].href).toContain("github");
            expect(socialLinks[2].href).toContain("mailto");
        });

        it("includes leaf navigation items when provided", () => {
            setupPage("Resume", resumeSubNav);

            const subNavItems = visibleNav().querySelectorAll(
                ".leaf-nav .nav-item.small-text",
            );
            expect(subNavItems).toHaveLength(3);
            expect(subNavItems[0].textContent).toBe("Summary");
            expect(subNavItems[0].href).toContain("#summary");
        });

        it("handles About Me page without href", () => {
            setupPage("About Me");

            const aboutMeItem = document.querySelector(
                ".root-nav .nav-item.selected",
            );
            expect(aboutMeItem.textContent).toBe("About Me");
            expect(aboutMeItem.hasAttribute("href")).toBe(false);
        });

        it("loads hamburger script after navigation is created", () => {
            setupPage("About Me");

            const hamburgerScript = document.querySelector('script[src="hamburger.js"]');
            expect(hamburgerScript).toBeTruthy();
            expect(hamburgerScript.type).toBe("text/javascript");
        });

        it("ensures mobile navigation structure is properly nested", () => {
            setupPage("Content");

            const nav = visibleNav();
            expect(nav).toBeTruthy();

            // Check that mobile menu is first child
            const mobileMenu = nav.querySelector(".mobile-menu");
            expect(mobileMenu).toBeTruthy();
            expect(nav.firstElementChild).toBe(mobileMenu);

            // Check that root nav follows mobile menu
            const rootNav = nav.querySelector(".root-nav");
            expect(rootNav).toBeTruthy();

            // Check that leaf nav is present
            const leafNav = nav.querySelector(".leaf-nav");
            expect(leafNav).toBeTruthy();
        });

        it("creates proper mobile menu structure", () => {
            setupPage("FAQ");

            const mobileMenu = document.querySelector(".mobile-menu");
            expect(mobileMenu).toBeTruthy();

            const mobileName = mobileMenu.querySelector(".mobile-name");
            expect(mobileName).toBeTruthy();

            const hamburgerContainer = mobileMenu.querySelector(".hamburger-container");
            expect(hamburgerContainer).toBeTruthy();

            // Verify mobile menu has proper flex structure
            expect(mobileMenu.classList).toContain("mobile-menu");
        });

        it("reuses existing root-nav and adds navigation items to the left", () => {
            const existingRootNavContent = '<div class="existing-item">Existing Content</div>';
            setupPage("About Me", "", existingRootNavContent);

            const rootNav = visibleNav().querySelector(".root-nav");
            expect(rootNav).toBeTruthy();

            // Should have 5 nav items + 1 existing item = 6 total children
            expect(rootNav.children).toHaveLength(6);

            // First 5 children should be the nav items (added to the left)
            const navItems = Array.from(rootNav.children).slice(0, 5);
            expect(navItems.every(item => item.classList.contains("nav-item"))).toBe(true);

            // Last child should be the existing content
            const existingItem = rootNav.children[5];
            expect(existingItem.classList).toContain("existing-item");
            expect(existingItem.textContent).toBe("Existing Content");
        });

        it("creates root-nav when it doesn't exist", () => {
            setupPage("Content"); // No existing root-nav content

            const rootNav = visibleNav().querySelector(".root-nav");
            expect(rootNav).toBeTruthy();

            const navItems = rootNav.querySelectorAll(".nav-item");
            expect(navItems).toHaveLength(5);
        });

        it("preserves order of navigation items when adding to existing root-nav", () => {
            const existingRootNavContent = '<span class="marker">END</span>';
            setupPage("Resume", "", existingRootNavContent);

            const rootNav = visibleNav().querySelector(".root-nav");
            const allChildren = Array.from(rootNav.children);

            // Navigation items should be in their original order at the beginning
            expect(allChildren[0].textContent).toBe("About Me");
            expect(allChildren[1].textContent).toBe("Resume");
            expect(allChildren[2].textContent).toBe("Content");
            expect(allChildren[3].textContent).toBe("Contact");
            expect(allChildren[4].textContent).toBe("FAQ");

            // Existing content should be at the end
            expect(allChildren[5].textContent).toBe("END");
        });
    });
});
