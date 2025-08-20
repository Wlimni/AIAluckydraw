# AIA Lucky Draw System 🎰

A professional, interactive lottery system designed for AIA Insurance sales incentive programs. Features spectacular animations, preset results, and real-time prize tracking.

![AIA Lucky Draw](https://img.shields.io/badge/AIA-Lucky%20Draw-red?style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

## 🎯 Features

### 🎮 Interactive Lottery System
- **9 Prize Blocks**: 6×$50, 2×$100, 1×$500 cash prizes
- **Real-time Animations**: Spectacular button explosions, light rays, and confetti
- **Golden Results Box**: Live counter updates with permanent glow effects
- **Player Management**: Support for 6 insurance sales workers with individual ticket counts

### 🎨 Visual Effects
- **Button Explosion**: 25 colorful bubble particles when starting lottery
- **Light Ray Explosions**: Dramatic red ray animations shooting to the sky
- **Confetti System**: Large emoji (32px) and ribbon confetti falling from top
- **Cash Animations**: Money emoji circles around total winnings (120px+ radius)
- **Permanent Glow**: Summary box glows continuously with golden effects

### 💼 Business Features
- **Preset Results**: Customizable predetermined outcomes for each worker
- **Ticket System**: Workers get tickets based on insurance sales numbers
- **Prize Tracking**: Real-time counter updates and total winnings calculation
- **Corporate Branding**: AIA logo with transparent background in top-right corner

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional, for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/AIAluckydraw.git
   cd AIAluckydraw
   ```

2. **Open in browser**
   ```bash
   # Option 1: Direct file opening
   open index.html
   
   # Option 2: Local server (recommended)
   python -m http.server 8000
   # Then visit http://localhost:8000
   ```

3. **Start using**
   - Select a player from the dropdown
   - Click "Draw All Tickets!" to begin the lottery
   - Enjoy the spectacular animations!

## 📁 Project Structure

```
aia-lucky-draw-wheel/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # All styling and animations
├── js/
│   └── sales-lottery.js    # Main lottery logic and animations
├── assets/
│   ├── pic/
│   │   └── aialogo.jpeg    # AIA corporate logo
│   └── audio/              # Sound effects (optional)
└── README.md               # This file
```

## 🎲 How It Works

### Player Configuration
Each worker has predefined tickets based on their sales performance:
- **John Smith**: 25 tickets
- **Mary Johnson**: 63 tickets  
- **David Lee**: 12 tickets
- **Sarah Wilson**: 45 tickets
- **Mike Brown**: 8 tickets
- **Lisa Davis**: 32 tickets

### Prize Distribution
- **$50 Cash Prize**: 67% probability (6/9 blocks)
- **$100 Cash Prize**: 22% probability (2/9 blocks)
- **$500 Cash Prize**: 11% probability (1/9 blocks)

### Preset Results System
The system uses predetermined results to ensure fair and controlled outcomes:

```javascript
// Example preset for John Smith (25 tickets)
'john-25': {
    '$50 Cash Prize': 20,   // 20x $50 = $1,000
    '$100 Cash Prize': 4,   // 4x $100 = $400  
    '$500 Cash Prize': 1    // 1x $500 = $500
}
// Total: $1,900 winnings
```

## 🎨 Customization

### Changing Player Data
Edit the `players` object in `sales-lottery.js`:
```javascript
this.players = {
    'new-player': { 
        name: 'New Player Name', 
        tickets: 30, 
        remaining: 30, 
        totalWinnings: 0 
    }
};
```

### Modifying Preset Results
Update the `presetResults` object:
```javascript
this.presetResults = {
    'new-player': {
        '$50 Cash Prize': 25,
        '$100 Cash Prize': 4,
        '$500 Cash Prize': 1
    }
};
```

### Styling Customization
Modify `styles.css` for:
- Color schemes
- Animation timing
- Visual effects intensity
- Layout adjustments

## 🎬 Animation Features

### Button Explosion
- 25 colorful bubble particles
- Red, gold, and white theme colors
- 360-degree explosion pattern
- Staggered timing for natural effect

### Light Ray Effects
- Dramatic red rays shooting to the sky
- Smooth 12-keyframe animations
- Pulsing red energy bursts
- 2-second excitement period

### Confetti System
- Large 32px emoji for high visibility
- Money and celebration themed
- Realistic physics with drift
- Multiple burst patterns

### Cash Animations
- 120px+ radius to avoid covering numbers
- Money emoji themed (💰💵💸💲)
- Circular explosion patterns
- Coordinated with total winnings updates

## 🏢 Corporate Integration

### AIA Branding
- Logo positioned in top-right corner
- Transparent background with glass-morphism
- Red accent colors matching AIA brand
- Professional typography and spacing

### Business Logic
- Insurance sales-based ticket allocation
- Guaranteed monetary prizes for every ticket
- Detailed prize tracking and reporting
- Enterprise-ready preset result system

## 🛠️ Technical Details

### Technologies Used
- **HTML5**: Semantic structure and accessibility
- **CSS3**: Advanced animations and glass-morphism effects
- **Vanilla JavaScript**: ES6+ classes and modern syntax
- **CSS Grid/Flexbox**: Responsive layout system

### Performance Optimizations
- Hardware-accelerated animations
- Efficient DOM manipulation
- Optimized confetti particle system
- Smooth 60fps animations

### Browser Compatibility
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the troubleshooting section below

## 🔧 Troubleshooting

### Common Issues

**Animation not working smoothly:**
- Ensure hardware acceleration is enabled in browser
- Close unnecessary browser tabs
- Update to latest browser version

**Confetti not appearing:**
- Check browser console for JavaScript errors
- Ensure all files are properly loaded
- Verify file paths are correct

**Logo not displaying:**
- Check if `assets/pic/aialogo.jpeg` exists
- Verify file permissions
- Ensure image file is not corrupted

## 📊 Statistics

- **Total Lines of Code**: ~1,200
- **Animation Keyframes**: 15+
- **Interactive Elements**: 9 prize blocks + UI controls
- **Preset Configurations**: 6 workers with custom results
- **Visual Effects**: 8 different animation systems

---

**Made with ❤️ for AIA Insurance Sales Team**

*Professional lottery system designed to incentivize and celebrate sales achievements.*