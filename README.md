# Jump Qutaris Website

This is an original multi-page static website for Jump Qutaris. It is built with plain HTML, CSS, and JavaScript, so it can be hosted directly on GitHub Pages.

## Pages

- `index.html`: home page
- `trading.html`: trading approach
- `technology.html`: technology platform
- `people.html`: people and culture
- `careers.html`: careers
- `contact.html`: contact form and email links
- `privacy-policy.html`: privacy policy
- `terms-of-use.html`: terms of use
- `cookie-policy.html`: cookie policy

## Edit Content

Most visible content lives in `content.js`.

Update these common fields:

- Brand name and short description: `brand`
- Header navigation: `nav`
- Header careers button: `headerCta`
- Home page sections: `home`
- Subpage content: `pages.trading`, `pages.technology`, `pages.people`, `pages.careers`, `pages.contact`, `pages.privacy`, `pages.terms`, `pages.cookie`
- Footer columns and social links: `footer`

The header logo uses `assets/jump-qutaris-logo.png`, and the black footer uses `assets/jump-qutaris-logo-footer.png`. Logo sizing is controlled in `styles.css`.

## Preview Locally

From this folder, run:

```bash
npm start
```

Then open:

```text
http://localhost:4173
```

You can still use `python -m http.server 4173` for a quick static preview, but Railway uses the Node start command above.

## Deploy On Railway

Railway will detect `package.json` and run:

```bash
npm start
```

The included `server.js` listens on `0.0.0.0:$PORT`, which is the port Railway provides for public networking.

## Publish On GitHub Pages

1. Create a GitHub repository.
2. Upload these files to the repository root.
3. In GitHub, open Settings -> Pages.
4. Set the source to the default branch and root folder.
5. Save, then wait for GitHub to show the published URL.

## Assets

- `assets/jump-qutaris-logo.png`: transparent company logo used in the header.
- `assets/jump-qutaris-logo-footer.png`: transparent footer logo with light Qutaris text for the black footer.
- `assets/qutara-home-hero.webp`: homepage Qutara AI intelligence core visual.
- `assets/qutara-company-evolution.webp`: company page visual for the shift from human research to AI trading.
- `assets/qutara-technology-platform.webp`: technology page Qutara platform architecture visual.
- `assets/qutara-leadership-strategy.webp`: leadership page strategy room visual.
- `assets/qutara-research-lab.webp`: research page AI financial research visual.
- `assets/qutara-team-workspace.webp`: team and operations workspace visual.
- `assets/qutara-contact-network.webp`: contact page client connection network visual.
- `assets/favicon.png`, `assets/favicon-32.png`, `assets/apple-touch-icon.png`: browser tab and touch icons generated from the current logo.
