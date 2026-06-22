# Jump Quantum Single Page Website Design

## Goal

Build an original, editable, GitHub-ready one-page website for Jump Quantum, using the supplied logo direction and a premium quantitative-trading visual language.

## Brand Direction

- Brand name: Jump Quantum.
- Logo treatment in the website: `Jump` in deep red and `Quantum` in solid black.
- The supplied source logo is retained as a project asset, but the website uses an editable HTML/CSS wordmark so the `Quantum` word can remain black.
- Palette: white, near-black, graphite, deep red, and restrained light-gray linework.
- Tone: institutional, research-led, fast, technical, and serious.

## Page Structure

1. Sticky navigation with internal anchor links.
2. Hero section with brand message, calls to action, and abstract market-infrastructure visual.
3. Trading and technology capability section.
4. Asset-class section.
5. Culture and recruiting section.
6. Career-entry cards.
7. Contact and footer links.

## Content And Editing

All major visible text, links, contact emails, statistics, asset classes, and career cards live in `content.js`. The page renderer in `main.js` reads that content and fills the HTML. This keeps the site simple for GitHub Pages and easy to modify without a build step.

## Constraints

- Do not copy Jump Trading's text, logo, imagery, or page source.
- Do not imply affiliation with Jump Trading.
- Keep all content original and editable.
- Keep the site static so it can run on GitHub Pages.

## Verification

The site should be checked in the browser at desktop and mobile widths. Primary checks: page loads, sections render, nav links scroll to the right anchors, mobile menu opens and closes, contact links work, and there are no console errors.
