# Jump Quantum Single Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an original, editable, static one-page Jump Quantum website that can be uploaded to GitHub Pages.

**Architecture:** Use static HTML/CSS/JavaScript with no build step. Store editable site copy and links in `content.js`, render repeated sections in `main.js`, and keep visual styling in `styles.css`.

**Tech Stack:** HTML, CSS, vanilla JavaScript, GitHub Pages-compatible static hosting.

---

### Task 1: Project Shell And Content

**Files:**
- Create: `index.html`
- Create: `content.js`
- Create: `main.js`
- Create: `styles.css`
- Create: `README.md`
- Use: `assets/jump-quantum-logo-source.png`
- Use: `assets/jump-quantum-site-concept.png`

- [ ] **Step 1: Create the static HTML shell**

Create semantic sections for navigation, hero, capabilities, markets, culture, careers, contact, and footer. Include `content.js` before `main.js`.

- [ ] **Step 2: Create editable content data**

Put brand name, nav links, hero copy, metrics, capability cards, markets, career cards, contact emails, and footer links into `content.js`.

- [ ] **Step 3: Render content with vanilla JavaScript**

Use `main.js` to populate the page from `window.SITE_CONTENT`, wire the mobile menu, smooth internal navigation, and update the current year.

- [ ] **Step 4: Style the page**

Use `styles.css` to implement the white, black, graphite, and red brand system, responsive layout, motion, and accessible focus states.

- [ ] **Step 5: Document editing and publishing**

Write `README.md` with quick editing instructions and GitHub Pages publishing steps.

### Task 2: Browser Verification

**Files:**
- Verify: `index.html`, `content.js`, `main.js`, `styles.css`

- [ ] **Step 1: Serve locally**

Run a local static server from the project root.

- [ ] **Step 2: Check desktop render**

Open the local URL, confirm the page is not blank, nav links work, mobile menu is hidden, and console errors are absent.

- [ ] **Step 3: Check mobile render**

Use a mobile viewport, confirm the layout does not overflow and the mobile menu opens/closes.

- [ ] **Step 4: Fix visible issues**

Adjust CSS or JS until the page renders cleanly at both widths.

### Task 3: GitHub Preparation

**Files:**
- Create: `.gitignore`
- Use: project root files

- [ ] **Step 1: Ignore local-only files**

Add `.superpowers/` and temporary artifacts to `.gitignore`.

- [ ] **Step 2: Initialize Git**

Create a local repository and make an initial commit.

- [ ] **Step 3: Prepare GitHub upload**

Create or connect a GitHub repository when account access and repository visibility are confirmed.
