# GeoAI – Moisture Content & OMC Analyzer 🌍

A sleek, client-side web app for geotechnical engineers and students to calculate **Moisture Content**, run a full **Standard Proctor Compaction Test**, and automatically determine the **Optimum Moisture Content (OMC)** and **Maximum Dry Density (MDD)** using AI-assisted polynomial regression — all in the browser, with zero backend required.

![HTML](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?logo=chart.js&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

## 🔗 Live Demo

> Once deployed via GitHub Pages: `https://<your-username>.github.io/<repo-name>/`

---

## ✨ Features

- **Moisture Content Calculator** — quick `w = [(W2 - W3)/(W3 - W1)] × 100` computation from container weights.
- **Compaction Test Module**
  - Auto-calculates mould volume from height & diameter (`V = πr²h`).
  - Dynamic trial columns — add/remove compaction trials on the fly (minimum 3 required).
  - Live computation of bulk density, water content, and dry density per trial.
- **AI-Powered Curve Fitting**
  - Fits a 2nd-degree polynomial regression (Gauss-Jordan elimination) to your dry density vs. water content data.
  - Automatically detects the curve's peak to estimate **OMC** and **MDD**.
  - Visualized with an interactive **Chart.js** scatter + curve plot.
- **Auto-Generated Report**
  - Clean, printable summary report combining moisture content results and compaction analysis.
  - One-click **Print to PDF** via the browser print dialog.
- **Modern Glassmorphism UI** — animated gradient orbs, frosted glass cards, and a fully responsive layout.

---

## 🗂️ Project Structure

```
.
├── index.html      # App markup & view sections (Home, Moisture, Compaction, Report)
├── styles.css       # Glassmorphism styling, layout, responsive & print styles
├── app.js           # Calculation logic, dynamic table handling, regression & charting
└── README.md
```

---

## 🚀 Getting Started

### Option 1: Run locally
No build step or dependencies needed — it's plain HTML/CSS/JS.

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

Then simply open `index.html` in your browser, or serve it locally:

```bash
# Python 3
python -m http.server 8000
```

Visit `http://localhost:8000`.

### Option 2: Deploy with GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Under **Source**, select the `main` branch and `/ (root)` folder.
4. Save — your site will be live at `https://<your-username>.github.io/<repo-name>/` within a minute.

---

## 🧪 How to Use

1. **Moisture Content tab** — enter the weight of the empty container (W1), container + wet soil (W2), and container + dry soil (W3) → click **Calculate**.
2. **Compaction Test tab**
   - Enter mould height, diameter, and empty mould mass.
   - Add as many trial columns as needed (`+ Add Trial Column`).
   - Fill in mass of water added, mass of mould + compacted soil, and the water-content container readings for each trial.
   - Click **Analyze Data & Plot Graph** to fit the curve and reveal AI-predicted OMC/MDD.
3. **Generate Final Report** — produces a printable summary with all key results and the compaction curve chart.

---

## 🛠️ Tech Stack

- **HTML5 / CSS3** — semantic structure, CSS variables, glassmorphism design, print-specific stylesheet.
- **Vanilla JavaScript (ES6)** — DOM manipulation, dynamic table generation, custom polynomial regression (no external math library).
- **[Chart.js](https://www.chartjs.org/)** — compaction curve visualization (loaded via CDN).
- **Google Fonts** — [Outfit](https://fonts.google.com/specimen/Outfit) typeface.

---

## 📐 Engineering Formulas Used

| Calculation | Formula |
|---|---|
| Moisture Content (w) | `[(W2 − W3) / (W3 − W1)] × 100` |
| Mould Volume (V) | `π × r² × h` |
| Bulk Density (ρ) | `Mass of compacted soil / V` |
| Dry Density (ρd) | `ρ / (1 + w/100)` |
| OMC (peak of curve) | `x = −b / 2a` (from `y = ax² + bx + c`) |
| MDD | `y` value of curve at `x = OMC` |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute it.

---

## 🙋 Disclaimer

This tool is intended for educational and preliminary analysis purposes. Always verify results against standard geotechnical testing procedures (e.g., IS 2720 / ASTM D698) before use in professional or design work.
