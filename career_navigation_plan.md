# Career Navigation Implementation Plan

## Overview
This plan implements a sticky year navigation feature for the career experience section Using red-green-blue TDD methodology from @tdd.md, and quality standards from @quality.md. The feature will appear when users scroll to the experience section and provide quick navigation to specific job entries.

## Blueprint Analysis

### Current State Assessment
- ✅ Experience section exists with id="experience"
- ✅ Job anchor IDs already exist: #nulogy, #shopify, #caseware, #garner, #moh, #eui, #alpha
- ✅ CSS classes exist: mono, green, small-text
- ✅ Green timeline styling exists: border-left: 2px solid #bada55
- ✳️ Missing: Navigation HTML structure, CSS positioning, JavaScript functionality

### Required Components
1. **HTML Structure** - Navigation container with year links
2. **CSS Styling** - Sticky positioning, visual alignment with timeline
3. **JavaScript Functionality** - Scroll detection, show/hide logic
4. **Smooth Scrolling** - CSS scroll-behavior enhancement

## Implementation Phases

### Phase 1: Foundation (Steps 1-3)
Create basic HTML structure and CSS foundation without JavaScript

### Phase 2: Styling (Steps 4-6)
Implement sticky positioning and visual alignment

### Phase 3: Functionality (Steps 7-9)
Add JavaScript scroll detection and show/hide behavior

### Phase 4: Enhancement (Steps 10-12)
Add smooth scrolling and final polish

## Detailed Step Breakdown

### Step 1: Create Navigation HTML Structure
- **Size**: Small - Add 10 lines of HTML
- **Risk**: Low - Static HTML addition
- **Dependencies**: None
- **Testable**: DOM structure verification

### Step 2: Basic Navigation CSS
- **Size**: Small - Add 15 lines of CSS
- **Risk**: Low - Basic styling
- **Dependencies**: Step 1 (HTML structure)
- **Testable**: CSS class application

### Step 3: Year Link Styling
- **Size**: Small - Add 10 lines of CSS
- **Risk**: Low - Text and link styling
- **Dependencies**: Step 2 (basic CSS)
- **Testable**: Link appearance and hover states

### Step 4: Sticky Positioning
- **Size**: Medium - Add 20 lines of CSS
- **Risk**: Medium - Positioning complexity
- **Dependencies**: Step 3 (styled links)
- **Testable**: Sticky behavior verification

### Step 5: Timeline Alignment
- **Size**: Medium - Add 15 lines of CSS
- **Risk**: Medium - Visual alignment
- **Dependencies**: Step 4 (sticky positioning)
- **Testable**: Visual position relative to green line

### Step 6: Responsive Adjustments
- **Size**: Small - Add 10 lines of CSS
- **Risk**: Low - Media queries
- **Dependencies**: Step 5 (aligned positioning)
- **Testable**: Mobile/desktop behavior

### Step 7: Scroll Detection JavaScript
- **Size**: Medium - Add 25 lines of JS
- **Risk**: Medium - Event handling
- **Dependencies**: Step 6 (complete CSS)
- **Testable**: Scroll event detection

### Step 8: Show/Hide Logic
- **Size**: Medium - Add 20 lines of JS
- **Risk**: Medium - DOM manipulation
- **Dependencies**: Step 7 (scroll detection)
- **Testable**: Visibility toggle behavior

### Step 9: Experience Section Detection
- **Size**: Small - Add 15 lines of JS
- **Risk**: Low - Element position calculation
- **Dependencies**: Step 8 (show/hide logic)
- **Testable**: Section boundary detection

### Step 10: Smooth Scrolling CSS
- **Size**: Small - Add 5 lines of CSS
- **Risk**: Low - CSS property addition
- **Dependencies**: Step 9 (complete JS)
- **Testable**: Smooth scroll behavior

### Step 11: Click Handling
- **Size**: Small - Add 10 lines of JS
- **Risk**: Low - Event delegation
- **Dependencies**: Step 10 (smooth scrolling)
- **Testable**: Click navigation behavior

### Step 12: Final Polish and Cleanup
- **Size**: Small - Refactor 5-10 lines
- **Risk**: Low - Code cleanup
- **Dependencies**: Step 11 (complete functionality)
- **Testable**: All features working together

## Testing Strategy

### Unit Tests
- CSS class application
- JavaScript utility functions
- DOM manipulation functions

### Integration Tests
- Scroll event handling
- Show/hide behavior
- Navigation clicking

### Visual Tests
- Sticky positioning
- Timeline alignment
- Responsive behavior

### End-to-End Tests
- Complete user workflow
- Cross-browser compatibility
- Mobile device testing

## Risk Assessment

### Low Risk (Steps 1-3, 6, 9-12)
- Static HTML/CSS additions
- Simple JavaScript functions
- Well-established patterns

### Medium Risk (Steps 4-5, 7-8)
- Sticky positioning complexity
- Scroll event performance
- Visual alignment challenges

### Mitigation Strategies
- Incremental testing after each step
- Fallback CSS for older browsers
- Performance optimization for scroll events
- Visual regression testing

## Success Metrics

### Functional
- Navigation appears when scrolling to experience section
- All year links navigate to correct job sections
- Sticky positioning maintains 50px from top
- Smooth scrolling works in supported browsers

### Visual
- Navigation aligns with green timeline
- Styling matches existing site aesthetic
- Responsive behavior on mobile devices

### Performance
- Scroll events don't impact page performance
- Navigation transitions are smooth
- No layout shifts during show/hide

## File Structure Impact

### New Files
- None (all changes to existing files)

### Modified Files
- `src/resume.html` - Add navigation HTML
- `src/resume.css` - Add navigation CSS
- `src/navigation.js` - Add career navigation logic

### Dependencies
- Existing CSS classes (mono, green, small-text)
- Existing anchor IDs in job sections
- Existing JavaScript structure in navigation.js

---

# TDD Implementation Prompts

## Step 1: Create Navigation HTML Structure

```
Using quality standards from @quality.md, implement the basic HTML structure for the career navigation feature.

**Note: We do not test static HTML/CSS code - tests are only for dynamic JavaScript functionality.**

**Implementation:**
Add the HTML structure to `src/resume.html` immediately after the opening of the experience section:
- Create a div with class "career-nav" and initial style="display: none"
- Add 7 anchor links with the following mapping:
  - 2020 → #nulogy
  - 2018 → #shopify  
  - 2017 → #caseware
  - 2014 → #garner
  - 2013 → #moh
  - 2011 → #eui
  - 2008 → #alpha
- Use existing CSS classes: mono, green, small-text on each link

**BLUE Phase - Refactor and Clean Up:**
- Follow all BLUE phase cleanup rules from @tdd.md
- Ensure proper HTML indentation
- Verify semantic HTML structure
- Remove any duplicate or unused code
- Check that existing functionality is not broken
- Update TODO.md: Mark Step 1 as completed and add any implementation notes

Test the implementation by opening the resume in a browser and using developer tools to verify the navigation structure exists but is hidden.
```

## Step 2: Basic Navigation CSS

```
Using quality standards from @quality.md, implement the basic CSS styling for the career navigation.

**Note: We do not test static HTML/CSS code - tests are only for dynamic JavaScript functionality.**

**Implementation:**
Add CSS to `src/resume.css`:
- Style .career-nav with basic positioning (position: absolute initially)
- Style .career-nav a with the existing mono, green, small-text appearance
- Add proper spacing between navigation links (margin or padding)
- Set appropriate z-index to ensure navigation appears above other content
- Add cursor: pointer for better UX

**BLUE Phase - Refactor and Clean Up:**
- Follow all BLUE phase cleanup rules from @tdd.md
- Consolidate similar CSS rules
- Ensure consistent naming conventions
- Remove any redundant styles
- Verify CSS validates correctly
- Test that styling matches existing site aesthetic
- Update TODO.md: Mark Step 2 as completed and add any implementation notes

Verify the implementation by temporarily removing display: none from the HTML to see the basic styled navigation.
```

## Step 3: Year Link Styling

```
Using quality standards from @quality.md, enhance the visual styling of the year links.

**Note: We do not test static HTML/CSS code - tests are only for dynamic JavaScript functionality.**

**Implementation:**
Enhance the CSS in `src/resume.css`:
- Add hover effects using the existing .hover-green pattern
- Ensure minimum click target size (44px recommended for accessibility)
- Add padding around links for better usability
- Style active/focus states for keyboard navigation
- Ensure color contrast meets accessibility guidelines

**BLUE Phase - Refactor and Clean Up:**
- Follow all BLUE phase cleanup rules from @tdd.md
- Extract common hover patterns if duplicated
- Optimize CSS selectors for performance
- Remove any conflicting styles
- Test keyboard navigation functionality
- Verify hover states work correctly
- Update TODO.md: Mark Step 3 as completed and add any implementation notes

Test the styling by temporarily showing the navigation and interacting with the links.
```

## Step 4: Sticky Positioning

```
Using quality standards from @quality.md, implement sticky positioning for the career navigation.

**Note: We do not test static HTML/CSS code - tests are only for dynamic JavaScript functionality.**

**Implementation:**
Update CSS in `src/resume.css`:
- Change .career-nav from position: absolute to position: sticky
- Set top: 50px for the sticky offset
- Ensure proper positioning context within the experience section
- Add appropriate width and height constraints
- Handle edge cases where sticky positioning might fail

**BLUE Phase - Refactor and Clean Up:**
- Follow all BLUE phase cleanup rules from @tdd.md
- Test sticky positioning in different browsers
- Add fallback styles for browsers that don't support sticky
- Optimize positioning calculations
- Remove any layout-breaking CSS
- Verify no scrollbar issues are introduced
- Update TODO.md: Mark Step 4 as completed and add any implementation notes

Test by scrolling through the resume page to verify sticky behavior (though navigation won't show until JavaScript is added).
```

## Step 5: Timeline Alignment

```
Using quality standards from @quality.md, align the navigation with the green timeline.

**Note: We do not test static HTML/CSS code - tests are only for dynamic JavaScript functionality.**

**Implementation:**
Refine CSS positioning in `src/resume.css`:
- Position navigation to align with the green border-left: 2px solid #bada55
- Use precise left positioning to overlay the timeline
- Implement even vertical spacing between year links
- Ensure navigation doesn't break the timeline visual continuity

**BLUE Phase - Refactor and Clean Up:**
- Follow all BLUE phase cleanup rules from @tdd.md
- Fine-tune positioning values for pixel-perfect alignment  
- Test alignment with different font sizes
- Verify the green line remains visible through/around the navigation
- Ensure responsive behavior maintains alignment
- Remove any hardcoded values where possible
- Update TODO.md: Mark Step 5 as completed and add any implementation notes

Visually test alignment by temporarily showing the navigation and comparing with the timeline.
```

## Step 6: Responsive Adjustments

```
Using quality standards from @quality.md, add responsive behavior for the career navigation.

**Note: We do not test static HTML/CSS code - tests are only for dynamic JavaScript functionality.**

**Implementation:**
Add responsive CSS to `src/resume.css`:
- Add media queries for mobile devices (max-width: 615px to match existing pattern)
- Adjust navigation positioning for smaller screens
- Ensure touch-friendly interaction areas
- Consider whether navigation should be hidden or repositioned on mobile

**BLUE Phase - Refactor and Clean Up:**
- Follow all BLUE phase cleanup rules from @tdd.md
- Consolidate media queries with existing responsive styles
- Test on actual mobile devices
- Optimize for different screen orientations
- Remove any redundant responsive rules
- Verify print styles don't interfere with navigation
- Update TODO.md: Mark Step 6 as completed and add any implementation notes

Test responsive behavior using browser developer tools and actual mobile devices.
```

## Step 7: Scroll Detection JavaScript

```
Using red-green-blue TDD methodology from @tdd.md, and quality standards from @quality.md, implement scroll event detection functionality.

**RED Phase - Write Failing Tests:**
Create tests in `test/career-navigation.test.js` to verify:
1. Scroll event listener is properly attached to window
2. Scroll handler function is called when scrolling occurs
3. Current scroll position is accurately calculated
4. Throttling or debouncing prevents excessive event firing

**GREEN Phase - Make Tests Pass:**
Add JavaScript to `src/navigation.js`:
- Create a scroll event listener on window
- Implement a scroll handler function that calculates current scroll position
- Add throttling to optimize performance (limit to ~16ms for 60fps)
- Store scroll position in a variable for use by other functions

**BLUE Phase - Refactor and Clean Up:**
- Follow all BLUE phase cleanup rules from @tdd.md
- Extract scroll position calculation into a separate function
- Optimize event listener performance
- Add error handling for edge cases
- Remove any console.log statements used for debugging
- Ensure scroll handler doesn't impact page performance
- Update TODO.md: Mark Step 7 as completed and add any implementation notes

Test scroll detection by adding temporary console.log statements to verify the handler fires correctly.
```

## Step 8: Show/Hide Logic

```
Using red-green-blue TDD methodology from @tdd.md, and quality standards from @quality.md, implement the navigation show/hide functionality.

**RED Phase - Write Failing Tests:**
Add tests to verify:
1. Navigation is hidden by default
2. showCareerNav() function makes navigation visible
3. hideCareerNav() function makes navigation hidden
4. Visibility changes are smooth and don't cause layout shifts

**GREEN Phase - Make Tests Pass:**
Add functions to `src/navigation.js`:
- Create showCareerNav() function that removes display: none
- Create hideCareerNav() function that adds display: none
- Implement smooth transitions using CSS or JavaScript
- Ensure functions handle cases where navigation element doesn't exist

**BLUE Phase - Refactor and Clean Up:**
- Follow all BLUE phase cleanup rules from @tdd.md
- Combine show/hide logic into a single toggleCareerNav(isVisible) function
- Add CSS transitions for smooth appearance/disappearance
- Remove duplicate DOM queries by caching navigation element
- Add defensive programming for missing DOM elements
- Test function reliability under various conditions
- Update TODO.md: Mark Step 8 as completed and add any implementation notes

Test show/hide functionality by manually calling functions in browser console.
```

## Step 9: Experience Section Detection

```
Using red-green-blue TDD methodology from @tdd.md, and quality standards from @quality.md, implement detection of when the experience section is in view.

**RED Phase - Write Failing Tests:**
Create tests to verify:
1. Function correctly identifies when experience section is visible
2. Navigation shows when experience section enters viewport
3. Navigation hides when scrolling away from experience section
4. Detection works with different viewport sizes

**GREEN Phase - Make Tests Pass:**
Add functionality to `src/navigation.js`:
- Create isExperienceSectionVisible() function using getBoundingClientRect()
- Integrate section detection with scroll handler
- Show navigation when experience section is visible
- Hide navigation when outside experience section boundaries

**BLUE Phase - Refactor and Clean Up:**
- Follow all BLUE phase cleanup rules from @tdd.md
- Optimize boundary calculations for performance
- Add buffer zones for smoother show/hide behavior
- Extract magic numbers into named constants
- Handle edge cases (very short experience section, etc.)
- Ensure detection works reliably across browsers
- Update TODO.md: Mark Step 9 as completed and add any implementation notes

Test by scrolling through the page and verifying navigation appears/disappears at the right times.
```

## Step 10: Smooth Scrolling CSS

```
Using quality standards from @quality.md, implement smooth scrolling for anchor navigation.

**Note: We do not test static HTML/CSS code - tests are only for dynamic JavaScript functionality.**

**Implementation:**
Add CSS to `src/resume.css`:
- Add scroll-behavior: smooth to html element
- Ensure smooth scrolling doesn't conflict with existing styles
- Test that smooth scrolling works with career navigation links

**BLUE Phase - Refactor and Clean Up:**
- Verify smooth scrolling doesn't cause performance issues
- Consider adding CSS feature detection or polyfill for older browsers
- Test smooth scrolling across different page lengths
- Ensure accessibility considerations (respect prefers-reduced-motion)
- Remove any conflicting scroll-related CSS
- Update TODO.md: Mark Step 10 as completed and add any implementation notes

Test smooth scrolling by clicking navigation links and verifying smooth animation.
```

## Step 11: Click Handling

```
Using red-green-blue TDD methodology from @tdd.md, and quality standards from @quality.md, implement click handling for navigation links.

**RED Phase - Write Failing Tests:**
Create tests to verify:
1. Click events are properly handled on navigation links
2. Clicking a year navigates to the correct job section
3. Click handling works with both mouse and keyboard
4. Navigation remains visible after clicking

**GREEN Phase - Make Tests Pass:**
Add click handling to `src/navigation.js`:
- Add event listeners to navigation links (using event delegation)
- Ensure default anchor behavior works with smooth scrolling
- Handle keyboard navigation (Enter key)
- Maintain navigation visibility after navigation

**BLUE Phase - Refactor and Clean Up:**
- Follow all BLUE phase cleanup rules from @tdd.md
- Use event delegation for better performance
- Add accessibility improvements (ARIA labels, focus management)
- Remove any duplicate event handlers
- Test keyboard navigation thoroughly
- Ensure click handling doesn't interfere with other site functionality
- Update TODO.md: Mark Step 11 as completed and add any implementation notes

Test click handling by using the navigation to jump between job sections.
```

## Step 12: Final Polish and Cleanup

```
Using red-green-blue TDD methodology from @tdd.md, and quality standards from @quality.md, finalize the career navigation implementation.

**RED Phase - Write Failing Tests:**
Create comprehensive integration tests:
1. Complete user workflow from scroll to click navigation
2. Navigation behavior under edge cases (fast scrolling, resize, etc.)
3. No memory leaks or performance degradation
4. Accessibility compliance (screen readers, keyboard navigation)

**GREEN Phase - Make Tests Pass:**
Final refinements across all files:
- Optimize JavaScript performance (remove unnecessary DOM queries)
- Fine-tune CSS for pixel-perfect alignment
- Add browser compatibility fixes
- Implement any missing accessibility features

**BLUE Phase - Refactor and Clean Up:**
- Follow all BLUE phase cleanup rules from @tdd.md
- Remove all debugging code and comments
- Extract any repeated code into functions
- Optimize file sizes (minification considerations)
- Run all tests to ensure complete functionality
- Update documentation and add code comments where helpful
- Verify no console errors or warnings
- Test complete feature across multiple browsers and devices
- Update TODO.md: Mark Step 12 as completed, move all completed items to "Completed Items" section, and add final implementation summary

Perform final testing of the complete career navigation feature to ensure it meets all requirements from the specification.
```

---

## Implementation Notes

- Each step should be implemented completely before moving to the next
- Tests are only written for dynamic JavaScript functionality, not static HTML/CSS
- All JavaScript tests must pass before moving to the next step
- Regular commits after each completed step with descriptive commit messages
- Visual testing should be performed for HTML/CSS changes
- Performance testing should be conducted for scroll-related functionality 