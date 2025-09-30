# Data Cleaning Web App

A React-based web app for cleaning and exploring messy datasets. Upload your files (CSV, Excel), preview them, and apply quick transformations before exporting clean data.

---

## 🚀 Getting Started

### Install dependencies

```bash
npm install
```

### Development server

```bash
npm start
```

Runs the app in development mode at [http://localhost:3000](http://localhost:3000).
The page reloads automatically when you make changes.

### Build for production

```bash
npm run build
```

Creates an optimized production build in the `/build` folder.

---

## 🛠️ Tech Stack

* **React** – Frontend framework
* **TailwindCSS** – Styling
* **PapaParse** – CSV parsing
* **xlsx** – Excel parsing/exporting
* **React Data Grid** – Data table handling
* **Lodash** – Utilities for transformations

---

## ⚙️ Features

* Upload CSV or Excel files
* Preview data in an interactive grid
* Handle missing values (drop, fill with mean/median/mode, etc.)
* Basic transformations (filtering, sorting, deduplication)
* Export cleaned dataset

---

## 📦 Installation Notes

If Tailwind/PostCSS setup breaks, reinstall specific versions:

```bash
npm uninstall tailwindcss postcss autoprefixer
npm install -D tailwindcss@3.4.14 postcss autoprefixer
```

---

## 🔮 Roadmap

* Advanced cleaning (outlier detection, normalization)
* AI-assisted data quality suggestions
* Multi-file handling and merging

---

## 🤝 Contributing

Pull requests are welcome. Open an issue for feature requests or bugs.

---

## 📄 License

MIT License
