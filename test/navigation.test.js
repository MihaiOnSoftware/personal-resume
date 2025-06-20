const navigation = require("../src/navigation");

describe("navigation", () => {
    beforeEach(() => {
        document.body.innerHTML = '<div class="content"></div>';
    });

    describe("renderNavigation()", () => {
        it("renders mobile menu with correct current page title", () => {
            const config = {
                currentPage: "About Me",
            };

            navigation.renderNavigation(config);

            const mobileNameTitle = document.querySelector(".mobile-name-title");
            expect(mobileNameTitle.textContent).toBe("About Me");
            expect(mobileNameTitle.classList).toContain("selected");
            expect(mobileNameTitle.classList).toContain("trebut");
        });

        it("renders root navigation with correct selected item", () => {
            const config = {
                currentPage: "Resume",
            };

            navigation.renderNavigation(config);

            const navItems = document.querySelectorAll(".root-nav .nav-item");
            expect(navItems).toHaveLength(5);

            const aboutMe = navItems[0];
            expect(aboutMe.textContent).toBe("About Me");
            expect(aboutMe.getAttribute("href")).toBe("index.html");
            expect(aboutMe.classList).not.toContain("selected");

            const resume = navItems[1];
            expect(resume.textContent).toBe("Resume");
            expect(resume.classList).toContain("selected");
            expect(resume.classList).toContain("mobile-invisible");
        });

        it("renders hamburger menu", () => {
            const config = {
                currentPage: "Contact",
            };

            navigation.renderNavigation(config);

            const hamburger = document.querySelector(".hamburger");
            expect(hamburger).toBeTruthy();
            expect(hamburger.getAttribute("href")).toBe("javascript:;");

            const icon = hamburger.querySelector("i");
            expect(icon.classList).toContain("fa");
            expect(icon.classList).toContain("fa-bars");
        });

        it("always renders social contact icons", () => {
            const config = {
                currentPage: "About Me",
            };

            navigation.renderNavigation(config);

            const contactDiv = document.querySelector(".contact");
            expect(contactDiv.classList).toContain("no-print");
            expect(contactDiv.classList).toContain("mobile-invisible");

            const socialLinks = contactDiv.querySelectorAll("a");
            expect(socialLinks).toHaveLength(4);

            // LinkedIn
            const linkedin = socialLinks[0];
            expect(linkedin.getAttribute("href")).toBe("http://ca.linkedin.com/in/m4popesc");
            expect(linkedin.querySelector("i").classList).toContain("fab");
            expect(linkedin.querySelector("i").classList).toContain("fa-linkedin");

            // Twitter
            const twitter = socialLinks[1];
            expect(twitter.getAttribute("href")).toBe("https://twitter.com/mihaionsoftware");
            expect(twitter.querySelector("i").classList).toContain("fab");
            expect(twitter.querySelector("i").classList).toContain("fa-twitter-square");

            // GitHub
            const github = socialLinks[2];
            expect(github.getAttribute("href")).toBe("https://github.com/MihaiOnSoftware");
            expect(github.querySelector("i").classList).toContain("fab");
            expect(github.querySelector("i").classList).toContain("fa-github-square");

            // Email
            const email = socialLinks[3];
            expect(email.getAttribute("href")).toBe("mailto:mihai@mihai.software");
            expect(email.querySelector("i").classList).toContain("fa");
            expect(email.querySelector("i").classList).toContain("fa-envelope");
        });

        it("renders additional leaf navigation items when provided", () => {
            const config = {
                currentPage: "Resume",
                additionalLeafNavItems: `
                    <a class="nav-item small-text mobile-invisible trebut" href="#summary">Summary</a>
                    <a class="nav-item small-text mobile-invisible trebut" href="#skills">Skills</a>
                    <a class="nav-item small-text mobile-invisible trebut" href="#experience">Experience</a>
                `,
            };

            navigation.renderNavigation(config);

            const subNavItems = document.querySelectorAll(".leaf-nav .nav-item.small-text");
            expect(subNavItems).toHaveLength(3);

            const summary = subNavItems[0];
            expect(summary.textContent).toBe("Summary");
            expect(summary.getAttribute("href")).toBe("#summary");
            expect(summary.classList).toContain("small-text");
            expect(summary.classList).toContain("mobile-invisible");
            expect(summary.classList).toContain("trebut");

            // Verify contact section is still present
            const contactDiv = document.querySelector(".contact");
            expect(contactDiv).toBeTruthy();
        });

        it("handles About Me page correctly (index.html case)", () => {
            const config = {
                currentPage: "About Me",
            };

            navigation.renderNavigation(config);

            const navItems = document.querySelectorAll(".root-nav .nav-item");
            const aboutMe = navItems[0];

            expect(aboutMe.textContent).toBe("About Me");
            expect(aboutMe.classList).toContain("selected");
            expect(aboutMe.classList).toContain("mobile-invisible");
            expect(aboutMe.hasAttribute("href")).toBe(false);
        });
    });

    describe("initNavigation()", () => {
        it("creates navigation container in content div", () => {
            navigation.initNavigation();

            const navContainer = document.querySelector(".nav.no-print");
            expect(navContainer).toBeTruthy();

            // Verify it's inside the content div
            const contentDiv = document.querySelector('.content');
            expect(contentDiv.contains(navContainer)).toBe(true);
        });

        it("sets up hamburger click event", () => {
            navigation.initNavigation();

            const hamburger = document.querySelector(".hamburger");
            expect(hamburger).toBeTruthy();

            // Check that clicking doesn't throw an error
            expect(() => hamburger.click()).not.toThrow();
        });
    });
}); 