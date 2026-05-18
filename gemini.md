Project: Professional Boarding Pass PWA (ZXing Edition)
Goal: Build a robust, offline-capable PWA to scan PDF417 boarding passes using ZXing-js/library and Tailwind CSS.

1. Directory Structure
index.html (UI & App Shell)

app.js (ZXing Logic & Camera Control)

sw.js (Service Worker for Offline Caching)

manifest.json (PWA Manifest)

.github/workflows/deploy.yml (Auto-deploy to GitHub Pages)

2. Technical Specifications
A. Core Library (ZXing)
Use @zxing/library via UMD/CDN for easy integration without a complex bundler.

Focus on BrowserPDF417Reader class for maximum performance.

Implementation logic:

Initialize BrowserPDF417Reader.

Use decodeFromVideoDevice to link camera feed to a <video> element.

Set a high frame rate or scanning frequency for snappy detection.

B. UI/UX Design (Tailwind CSS)
Visual Feedback: Create a "Scanning Box" with an animated laser line.

Result Overlay: When scanned, show a modal or drawer containing:

Passenger Name

Departure & Destination (Highlighted/Prominent)

Flight, Seat, Date & Boarding Time Info

Raw Data (for debugging)

Responsive: Optimized for mobile portrait view.

C. BCBP Parsing Logic
Implement a parser for the IATA 791 standard:

Extract Name (Characters 2-21)

Extract Departure (Characters 30-32)

Extract Destination (Characters 33-35)

Extract Flight Number (Characters 36-43)

Extract Julian Date (Characters 44-46)

Extract Seat (Characters 48-51)

Extract Boarding Time (Characters 80-83, if present)

D. PWA & GitHub Pages
Base URL: Ensure all paths are relative (./) to support username.github.io/repo-name/.

Cache Assets: Include ZXing library and Tailwind CSS URLs in sw.js to ensure the scanner works in airplane mode.

3. Implementation Instructions for Gemini CLI
Generate index.html: Create a layout with a <video> element and a styled overlay.

Generate app.js:

Initialize ZXing.BrowserPDF417Reader.

Implement camera device selection (prefer back/environment camera).

Add the expanded IATA parsing function.

Generate sw.js: Use a Cache-First strategy for all scripts and CSS.

Generate manifest.json: Define icons and standalone display mode.

Generate Deployment Script: Create .github/workflows/deploy.yml using actions/deploy-pages.

4. Refinement Prompt
"Make sure to handle camera permissions gracefully with a user-friendly message. If the PDF417 is blurry, add a CSS filter or a hint for the user to move the camera closer. Highlight the Departure and Destination fields in the result UI for better readability."