module.exports = {
  "content": [
    "./index.html",
    "./*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  "darkMode": "class",
  "theme": {
    "extend": {
      "fontFamily": {
        "sans": [
          "Inter",
          "sans-serif"
        ],
        "mono": [
          "JetBrains Mono",
          "monospace"
        ]
      },
      "colors": {
        "gray": {
          "750": "#2d3748",
          "850": "#1a202c",
          "950": "#0d1117"
        }
      }
    }
  }
};
