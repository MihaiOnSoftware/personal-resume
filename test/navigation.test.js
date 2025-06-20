const navigation = require("../src/navigation");

describe("navigation", () => {
    const contentDiv = '<div class="content"></div>';

    const hiddenNavFor = (page, leafNavItems = "") => {
        const leafNav = leafNavItems
            ? `<div class="leaf-nav">${leafNavItems}</div>`
            : "";
        return `<div class="nav no-print" style="display: none;" data-current-page="${page}">${leafNav}</div>`;
    };

    const resumeSubNav = `
        <a class="nav-item small-text mobile-invisible trebut" href="#summary">Summary</a>
        <a class="nav-item small-text mobile-invisible trebut" href="#skills">Skills</a>
        <a class="nav-item small-text mobile-invisible trebut" href="#experience">Experience</a>
    `;

    const setupPage = (page, leafNavItems = "") => {
        document.body.innerHTML = contentDiv + hiddenNavFor(page, leafNavItems);
        navigation.autoInitializeNavigation();
    };

    const visibleNav = () => {
        const navs = document.querySelectorAll(".nav");
        return Array.from(navs).find((nav) => nav.style.display !== "none");
    };

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
            expect(socialLinks).toHaveLength(4);
            expect(socialLinks[0].href).toContain("linkedin");
            expect(socialLinks[1].href).toContain("twitter");
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
    });
});
