# AIA Lucky Draw System 🎰

<p align="center">
    <img src="assets/pic/aialogo.jpeg" alt="AIA Logo" width="120" />
</p>

<p align="center">
    <img src="https://img.shields.io/badge/AIA-Lucky%20Draw-red?style=for-the-badge">
    <img src="https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript">
    <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white">
    <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white">
</p>

---

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional, for development)

### Installation
Clone the repository:

```bash
git clone https://github.com/yourusername/AIAluckydraw.git
cd AIAluckydraw
```

### Open in browser

**Option 1: Direct file opening**
```bash
open index.html
```

**Option 2: Local server (recommended)**
```bash
python -m http.server 8000
# Then visit http://localhost:8000
```

### Start using
- Select a player from the dropdown
- Click "Draw All Tickets!" to begin the lottery
- Enjoy the spectacular animations!


---

## 📁 Project Structure


```
aia-lucky-draw-wheel/
├── index.html                  # Main selection page (Step 1 & 2)
├── drawing.html                # Drawing/lottery animation page
├── css/
│   └── styles.css              # All styling, themes, and animations
├── js/
│   ├── app.js                  # Page initialization and integration
│   ├── blocks.js               # Block animation and highlight logic
│   ├── drawing-page.js         # Drawing page player logic
│   ├── player-selection.js     # Two-step selection, search, filter, navigation
│   └── sales-lottery.js        # Main lottery logic, preset results, state
├── assets/
│   ├── pic/
│   │   ├── aialogo.jpeg        # AIA corporate logo
│   └── info/
│       ├── 20250811 Lucky Money for Special Districts_Final.xlsm  # Master Excel (source data)
│       └── extracted_data.json # Preset results, group/player/prize data
├── simple_extract.py           # Script to extract data from Excel to JSON
├── README.md                   # This file
└── ... (other docs, configs)
```

---

A professional, interactive lottery system for AIA Insurance sales incentive programs. Features spectacular animations, preset results, and perfectly reliable prize tracking.

![AIA Lucky Draw](https://img.shields.io/badge/AIA-Lucky%20Draw-red?style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)


## ✨ Features

- **Two-Step Selection Process**: 
    - **Step 1**: Select a Family/Group (with search/filter and statistics)
    - **Step 2**: Select an Agent/Player (with search, filter, and pagination)
- **Group-Specific Prize Pools**: Each group/family has its own prize block layout, as defined in the code and `drawing.html`.
- **Preset & Customizable Results**: All results and prize distributions are loaded from `extracted_data.json`, generated from the master Excel file. The system is fully data-driven and can be customized for any event or group structure.
- **Modern, Responsive UI/UX**: 
    - Glassmorphism, gradients, and advanced CSS keyframes
    - Mobile-friendly and accessible
    - Corporate branding (AIA logo, color themes)
- **Rich Animations**: 
    - Confetti, button explosion, block highlight, and pre-draw patterns
    - Animated prize block sweeps and winner reveals
- **Stateful Navigation**: 
    - Returning from the drawing page brings you back to Step 2 with the last family/group preselected
    - State is managed via `localStorage` for seamless user experience
- **Technical Stack**: 
    - HTML5, CSS3, Vanilla JS (ES6+)
    - Modular JS: `sales-lottery.js`, `blocks.js`, `app.js`, `drawing-page.js`, `player-selection.js`
    - Data: `extracted_data.json` (generated from Excel)
    - All assets and styles are self-contained

---


---

## 🕹️ How It Works

1. **Player Selection (`index.html`)**
        - **Step 1**: Choose a Family/Group from a searchable, filterable list. Each group shows total workers and tickets.
        - **Step 2**: Choose an Agent/Player from the selected group. Search, filter, and pagination are supported for large groups.
        - **Proceed**: After selecting a player, click "Proceed to Drawing!" to move to the drawing page.

2. **Drawing Page (`drawing.html`)**
        - **Prize Blocks**: The prize block layout is determined by the selected group (see `drawing.html` for group-specific layouts).
        - **Draw Animation**: Press the draw button to animate all tickets and reveal prizes in sequence, with confetti and fireworks.
        - **Results Summary**: After the draw, a summary of all prizes and total winnings is shown.
        - **Navigation**: "Draw Another Player" or "Back to Selection" returns you to Step 2, with the last family/group preselected.

3. **Data & Customization**
        - All group, player, and prize data is loaded from `extracted_data.json`, which is generated from the master Excel file using `simple_extract.py`.
        - Prize pools and layouts for each group are defined in `drawing.html` and can be customized as needed.

---


---

## 🛠️ Customization & Extensibility

- **To update groups/players/prizes**: Edit the Excel file and regenerate `extracted_data.json` using `simple_extract.py`.
- **To change prize layouts**: Edit the `prizeSets` object in `drawing.html`.
- **To change UI/UX**: Edit `css/styles.css` and the relevant HTML/JS files.

---


---

## 🧩 Technical Overview

- **HTML**: `index.html` (selection UI), `drawing.html` (drawing UI)
- **CSS**: `css/styles.css` (all theming, responsive design, and animations)
- **JS**:
    - `player-selection.js`: Handles two-step selection, search, filter, pagination, and navigation logic
    - `drawing-page.js`: Handles player info, navigation, and pre-animation on drawing page
    - `sales-lottery.js`: Main lottery logic, preset result loading, sequential animation, state, and counters
    - `blocks.js`: Block animation and highlight logic
    - `app.js`: Page initialization and integration
- **Data**: `extracted_data.json` (all group/player/prize data)
- **Assets**: AIA logo, fonts, and images in `assets/`

---


---

## 🎲 Example Prize Block Layouts (from `drawing.html`)

Prize blocks are defined per group, e.g.:

```js
const prizeSets = {
    group1: [
        { name: "$50 Cash Prize", display: "$50 Cash" },
        { name: "$100 Cash Prize", display: "💵 $100 Cash" },
        ...
    ],
    group24: [...],
    group25: [...],
    // ...
    default: [...]
};
```

---


---

## 🏁 Running & Customizing

1. Open `index.html` in a browser to start the selection process.
2. Select a family/group, then an agent/player, and proceed to the drawing page.
3. To update data, regenerate `extracted_data.json` using the provided Python script and your Excel file.
4. All UI/UX and logic can be customized via the modular JS and CSS files.

---


---

## 🙌 Credits

- Developed for AIA Corporate Solutions
- UI/UX: Modern, glassmorphism, responsive, and event-ready
- Animations: Confetti, fireworks, button explosion, and more
- Data-driven, fully customizable, and suitable for real-world events
