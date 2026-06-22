# Jump Quantum Website

This is an original multi-page static website for Jump Quantum. It is built with plain HTML, CSS, and JavaScript, so it can be hosted directly on GitHub Pages.

## Pages

- `index.html`: home page
- `trading.html`: trading approach
- `technology.html`: technology platform
- `people.html`: people and culture
- `careers.html`: careers
- `contact.html`: contact form and email links

## Edit Content

Most visible content lives in `content.js`.

Update these common fields:

- Brand name and short description: `brand`
- Header navigation: `nav`
- Header careers button: `headerCta`
- Home page sections: `home`
- Subpage content: `pages.trading`, `pages.technology`, `pages.people`, `pages.careers`, `pages.contact`
- Footer columns and social links: `footer`

The header wordmark is editable HTML/CSS in `main.js` and `styles.css`. `Jump` is red and `Quantum` is black in the primary header.

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

- `assets/jump-quantum-logo-source.png`: original logo image provided by the owner.
- `assets/jump-quantum-site-concept.png`: visual reference for the website direction.
- `assets/hero-market-structure.png`: extracted market visual used in hero sections.
- `assets/people-trading-floor.png`: extracted office and trading floor visual.
