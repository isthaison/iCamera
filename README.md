# iCamera Web

A modern web-based camera app built with React, TypeScript, and Vite.

## Features

- Photo and video capture
- Multiple camera modes (Photo, Video, Slow Motion, Timelapse, Vision AI, Pro, Night)
- Advanced filters and effects
- Burst mode
- Location tagging
- PWA support with offline caching
- Gemini AI vision analysis with QR code detection and text recognition
- Pro mode with manual exposure, zoom, shutter speed (1ms-30s), and ISO controls (hardware-dependent)
- Enhanced night mode with longer exposure simulation

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy to GitHub Pages

The project is configured for automatic deployment to GitHub Pages via GitHub Actions.

1. Push to the `main` branch
2. Go to Repository Settings > Pages
3. Select "Deploy from a branch" and choose `gh-pages`
4. The site will be available at `https://<username>.github.io/iCamera/`

## Environment Variables

Create a `.env` file for API keys:

```
API_KEY=your_gemini_api_key
```
