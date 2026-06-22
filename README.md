# Jump Quantum Website

This is an original static one-page website for Jump Quantum. It is built with plain HTML, CSS, and JavaScript, so it can be hosted directly on GitHub Pages.

## Edit Content

Most visible content lives in `content.js`.

Update these common fields:

- Company text and tagline: `brand`
- Navigation: `navigation`
- Hero title and buttons: `hero`
- Trading and technology cards: `capabilities`
- Markets: `markets.items`
- Recruiting cards: `careers.cards`
- Email links: `contact.links`
- Footer links: `footer.links`

The wordmark is editable HTML/CSS in `index.html` and `styles.css`. `Jump` is red and `Quantum` is black.

## Preview Locally

From this folder, run:

```bash
python -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

## Publish On GitHub Pages

1. Create a GitHub repository.
2. Upload these files to the repository root.
3. In GitHub, open Settings -> Pages.
4. Set the source to the default branch and root folder.
5. Save, then wait for GitHub to show the published URL.

## Assets

- `assets/jump-quantum-logo-source.png`: original logo image provided by the owner.
- `assets/jump-quantum-site-concept.png`: generated visual reference for this website direction.
