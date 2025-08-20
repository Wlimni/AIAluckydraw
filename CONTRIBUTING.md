# Contributing to AIA Lucky Draw System

Thank you for your interest in contributing to the AIA Lucky Draw System! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues
1. **Check existing issues** first to avoid duplicates
2. **Use clear, descriptive titles** for bug reports
3. **Include steps to reproduce** the issue
4. **Provide browser and OS information**
5. **Add screenshots or videos** if helpful

### Suggesting Features
1. **Search existing feature requests** first
2. **Describe the problem** you're trying to solve
3. **Explain your proposed solution** in detail
4. **Consider the impact** on existing functionality

### Code Contributions

#### Prerequisites
- Basic knowledge of HTML5, CSS3, and JavaScript ES6+
- Understanding of CSS animations and transitions
- Familiarity with DOM manipulation
- Experience with Git and GitHub

#### Development Setup
1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/AIAluckydraw.git
   cd AIAluckydraw
   ```

2. **Create a development branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Start local development server**
   ```bash
   python -m http.server 8000
   # Visit http://localhost:8000
   ```

#### Code Style Guidelines

##### HTML
- Use semantic HTML5 elements
- Include proper ARIA attributes for accessibility
- Maintain proper indentation (2 spaces)
- Use descriptive IDs and classes

##### CSS
- Follow BEM naming convention where applicable
- Group related properties together
- Use CSS custom properties for repeated values
- Comment complex animations and calculations
- Maintain consistent indentation (2 spaces)

```css
/* Good example */
.lottery-block {
  background: linear-gradient(145deg, #ffffff, #f8f9fb);
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.lottery-block--highlighted {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 12px 32px rgba(248, 113, 113, 0.15);
}
```

##### JavaScript
- Use ES6+ features (classes, arrow functions, destructuring)
- Follow camelCase naming convention
- Add JSDoc comments for functions
- Use meaningful variable and function names
- Handle errors gracefully

```javascript
/**
 * Animates a realistic lottery draw with smooth transitions
 * @param {NodeList} blocks - The lottery blocks to animate
 * @param {string} targetPrize - The prize to land on
 * @param {number} drawNumber - Current draw number
 * @returns {Promise} Resolves when animation completes
 */
animateRealisticDraw(blocks, targetPrize, drawNumber = 1) {
  return new Promise((resolve) => {
    // Animation logic here
  });
}
```

#### Animation Guidelines
- Maintain 60fps performance
- Use `transform` and `opacity` for hardware acceleration
- Implement proper easing functions
- Add appropriate delays and durations
- Test on lower-end devices

#### Testing Your Changes
Before submitting, ensure:
- [ ] All animations work smoothly
- [ ] No JavaScript console errors
- [ ] Responsive design works on different screen sizes
- [ ] All lottery functions work correctly
- [ ] Performance is acceptable (no frame drops)

#### Pull Request Process

1. **Update documentation** if needed
2. **Test thoroughly** on multiple browsers
3. **Follow the pull request template**
4. **Write clear commit messages**

```bash
# Good commit messages
git commit -m "feat: add smooth transition to button explosion animation"
git commit -m "fix: resolve confetti positioning on mobile devices"
git commit -m "docs: update README with new animation features"
```

5. **Keep pull requests focused** on a single feature or fix

## 🎨 Design Principles

### Visual Consistency
- Maintain the red and gold color scheme
- Follow glass-morphism design patterns
- Ensure animations feel cohesive
- Preserve the professional enterprise appearance

### Performance First
- Prioritize smooth animations over complex effects
- Use efficient CSS selectors
- Minimize DOM manipulations
- Implement proper cleanup for dynamic elements

### Accessibility
- Maintain keyboard navigation
- Include proper ARIA labels
- Ensure sufficient color contrast
- Support screen readers where possible

## 🐛 Bug Report Template

```markdown
**Bug Description**
A clear description of what the bug is.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- Browser: [e.g. Chrome 95, Firefox 94]
- OS: [e.g. macOS, Windows 10]
- Screen Size: [e.g. 1920x1080, mobile]
```

## 💡 Feature Request Template

```markdown
**Feature Description**
Clear description of the feature you'd like to see.

**Problem Statement**
What problem does this feature solve?

**Proposed Solution**
How would you like this feature to work?

**Alternatives Considered**
Other solutions you've considered.

**Additional Context**
Any other context, mockups, or examples.
```

## 📝 Development Notes

### Key Files
- `index.html` - Main structure and player interface
- `css/styles.css` - All styling and animations
- `js/sales-lottery.js` - Core lottery logic and effects
- `assets/pic/aialogo.jpeg` - Corporate branding

### Important Functions
- `startBulkDraw()` - Initiates lottery sequence
- `explodeButton()` - Button explosion animation
- `showMassiveConfetti()` - Confetti celebration system
- `updateRealtimeCounter()` - Live counter updates

### Animation Systems
- Button explosion (25 particles)
- Light ray effects (red dramatic rays)
- Confetti system (large emoji + ribbons)
- Cash animations (circular money emoji)
- Permanent glow effects (golden box)

## 🏆 Recognition

Contributors will be recognized in:
- GitHub contributors list
- CHANGELOG.md for significant contributions
- README.md for major features

## 📞 Questions?

- Open a GitHub issue for development questions
- Check existing documentation first
- Review similar implementations in the codebase

---

**Thank you for contributing to the AIA Lucky Draw System!** 

Your contributions help make this lottery system more engaging and professional for insurance sales teams worldwide.
