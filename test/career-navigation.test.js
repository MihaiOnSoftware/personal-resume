/**
 * Tests for Career Navigation Feature
 * Step 1: Create Navigation HTML Structure
 */

const fs = require('fs');
const path = require('path');

describe('Career Navigation HTML Structure', () => {
    let resumeHtml;
    let careerNav;

    beforeAll(() => {
        const resumePath = path.join(__dirname, '../src/resume.html');
        resumeHtml = fs.readFileSync(resumePath, 'utf8');
    });

    beforeEach(() => {
        document.documentElement.innerHTML = resumeHtml;
        careerNav = document.querySelector('.career-nav');
    });

    afterEach(() => {
        document.documentElement.innerHTML = '';
        careerNav = null;
    });

    test('career navigation container exists with class "career-nav"', () => {
        expect(careerNav).toBeTruthy();
    });

    test('container contains exactly 7 year links', () => {
        const yearLinks = careerNav.querySelectorAll('a');
        expect(yearLinks).toHaveLength(7);
    });

    test('each year link has correct href attribute matching job anchor IDs', () => {
        const yearLinks = careerNav.querySelectorAll('a');
        const expectedHrefs = ['#nulogy', '#shopify', '#caseware', '#garner', '#moh', '#eui', '#alpha'];

        yearLinks.forEach((link, index) => {
            expect(link.getAttribute('href')).toBe(expectedHrefs[index]);
        });
    });

    test('each year link contains correct year text', () => {
        const yearLinks = careerNav.querySelectorAll('a');
        const expectedYears = ['2020', '2018', '2017', '2014', '2013', '2011', '2008'];

        yearLinks.forEach((link, index) => {
            expect(link.textContent.trim()).toBe(expectedYears[index]);
        });
    });

    test('navigation is initially hidden', () => {
        expect(careerNav.style.display).toBe('none');
    });

    test('year links have required CSS classes', () => {
        const yearLinks = careerNav.querySelectorAll('a');

        yearLinks.forEach(link => {
            expect(link.classList.contains('mono')).toBe(true);
            expect(link.classList.contains('green')).toBe(true);
            expect(link.classList.contains('small-text')).toBe(true);
        });
    });
}); 