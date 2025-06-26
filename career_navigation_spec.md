# Resume Career Navigation Enhancement Specification

## Overview
Add a sticky year navigation feature to the career experience section of the resume to improve navigation through job history.

## Requirements

### Core Functionality
- **Trigger**: Navigation appears when user scrolls to the career experience section (element with id "experience")
- **Behavior**: Sticky positioning at 50px from top of viewport
- **Content**: Display start years for each job position as clickable navigation links
- **Interaction**: Smooth scroll to corresponding job section when year is clicked

### Year Labels and Targets
The following years should be displayed, linking to their corresponding job sections:

| Year | Company | Anchor Link |
|------|---------|-------------|
| 2020 | Nulogy Inc. | #nulogy |
| 2018 | Shopify | #shopify |
| 2017 | CaseWare | #caseware |
| 2014 | Garner Distributed Workflow | #garner |
| 2013 | Ministry of Health and Long-Term Care | #moh |
| 2011 | Eu & I | #eui |
| 2008 | Alpha Global IT | #alpha |

### Visual Design

#### Positioning
- **Initial State**: Hidden/not visible until career section is reached
- **Sticky Position**: Fixed at 50px from top of viewport once triggered
- **Horizontal Position**: Overlapping the green timeline line on the left side of the career section
- **Vertical Spacing**: Even spacing between year labels (not proportional to content length)

#### Styling
- **Font Classes**: `mono green small-text` (consistent with existing site styles)
- **Click Target**: Year text plus padding around it for better usability
- **Background**: None (plain text over green line for simplicity)
- **Alignment**: Center-aligned on the green timeline line

### Technical Implementation

#### CSS Requirements
```css
/* Enable smooth scrolling for anchor links */
html {
  scroll-behavior: smooth;
}

/* Sticky navigation container */
.career-nav {
  position: sticky;
  top: 50px;
  /* Additional positioning and styling */
}
```

#### HTML Structure
- Create navigation container with year links
- Each year should be wrapped in an anchor tag linking to existing job section IDs
- Use existing CSS classes: `mono`, `green`, `small-text`

### Responsive Behavior
- **Desktop**: Full functionality as specified
- **Mobile**: Same functionality initially (may require adjustment based on testing)
- **Future Consideration**: May need mobile-specific tweaks after implementation

### Browser Compatibility
- CSS `scroll-behavior: smooth` is supported in modern browsers
- Fallback: Regular anchor link jumping for older browsers

### Dependencies
- Existing anchor IDs in job sections (already present)
- Existing CSS classes: `mono`, `green`, `small-text`
- Green timeline line styling (already implemented)

## Implementation Notes

### Phase 1 (Initial Implementation)
1. Create sticky navigation HTML structure
2. Style with specified classes and positioning
3. Implement smooth scroll CSS
4. Test on desktop and mobile

### Phase 2 (Potential Refinements)
- Mobile-specific adjustments if needed
- Fine-tune positioning offset if 50px doesn't work optimally
- Visual tweaks based on user testing

## Testing Checklist
- [ ] Navigation appears when scrolling to career section
- [ ] Navigation sticks at 50px from top
- [ ] All year links navigate to correct job sections
- [ ] Smooth scrolling works (where supported)
- [ ] Click targets are appropriately sized
- [ ] Works on desktop browsers
- [ ] Works on mobile devices
- [ ] Maintains visual consistency with site design

## Success Criteria
- Users can quickly navigate between different job periods
- Feature maintains the site's clean, minimal aesthetic
- Navigation enhances usability without cluttering the interface
- Implementation is simple and maintainable 