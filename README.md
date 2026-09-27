# Girish IDE — AI Website Builder

Describe a website in plain English — Girish IDE generates the code for you. A free, client-side AI website builder powered by Google's Gemini models, with a Monaco-based code editor, live preview, and dark/light themes.

> Bring your own Gemini API key to generate code — everything runs in your browser, no account, no server.

**Built by Girish Lade** — https://ladestack.in

## Features

- **Prompt-to-website generation** — describe the site you want; the app sends the prompt to Gemini (gemini-2.5-pro) and produces ready-to-use HTML/CSS/JS.
- **Monaco code editor** — VS Code-grade editing (syntax highlighting, autocomplete) embedded right in the page.
- **Live preview pane** — see the generated website render instantly as you iterate.
- **Prompt enhancement** — an "Enhance" button that expands a rough idea into a detailed, high-quality build prompt before generation.
- **Update mode** — keep the current code and ask for targeted changes instead of regenerating from scratch.
- **Prompt & code history** — every prompt and generated result is saved (localStorage) so you can revisit earlier versions.
- **Dark / light theme** — one-click theme toggle, persisted across visits.
- **About page** — project info at `about.html`.
- **Zero build step** — plain HTML, CSS, and JavaScript; open and run.

## Tech stack

- HTML5, CSS3, vanilla JavaScript (ES6 classes)
- Monaco Editor 0.44.0 (CDN: unpkg)
- Google Gemini API (`gemini-2.5-pro`) via REST — `fetch`, no SDK needed

## Quick start

The site is fully static — just serve it over HTTP (the Monaco CDN loader needs a real origin).

```bash
# Python 3 (recommended)
python -m http.server 8000
# then open http://localhost:8000

# or with Node
npx http-server -p 8000
```

On Windows, double-click `start-server.bat` and pick option 1–4.

## API key setup

`script.js` calls the Gemini API with an API key. Replace the placeholder value in the `WebsiteBuilder` constructor with your own key from [Google AI Studio](https://aistudio.google.com/):

```js
this.apiKey = '<redacted>'; // your Gemini API key
```

> Never publish a real key in a public repo — keep keys in a local-only copy and rotate any key that has ever been committed.

## Project structure

```
India/
├── index.html    # main app: prompt input, Monaco editor, live preview
├── about.html    # project/about page
├── styles.css    # full UI styling, dark/light themes
├── script.js     # WebsiteBuilder app logic, Gemini integration, history
├── start-server.bat          # Windows launcher (python/node/http options)
└── Gemini_Generated_Image_cw7rh8cw7rh8cw7r.png  # app logo
```

## Deployment

100% static — deploy anywhere that serves static files:

- **GitHub Pages**: enable Pages on the `gh-pages` branch, or
  `python3 ~/workspace/github-publicize/bin/gh-pages-push.py . girishlade111/India gh-pages "deploy: static site"`
- **Cloudflare Pages / Netlify / Vercel**: drop the folder in, no build command needed.

No environment variables are read at runtime (the API key is set in `script.js`); no build step, no backend, no database.

## Notes

- The generated code runs in the preview iframe inside your browser — nothing leaves the device except the API call to Gemini.
- Prompt/code history is stored in `localStorage`, so it stays on your machine.

## Credit

Built by Girish Lade — https://ladestack.in
