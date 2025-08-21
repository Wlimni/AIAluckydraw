// Drawing Page Logic
class DrawingPage {
    constructor() {
        this.playerData = null;
        this.init();
    }
    
    init() {
        this.loadPlayerData();
        this.setupEventListeners();
        this.updatePlayerInfo();
    }
    
    loadPlayerData() {
        const storedData = localStorage.getItem('selectedPlayer');
        if (!storedData) {
            // If no player data, redirect back to selection
            window.location.href = 'index.html';
            return;
        }
        
        this.playerData = JSON.parse(storedData);
    }
    
    setupEventListeners() {
        // Back to selection button
        document.getElementById('back-to-selection').addEventListener('click', () => {
            this.goBackToSelection();
        });
        
        // Modify the new draw button to go back to selection
        document.addEventListener('click', (e) => {
            if (e.target.id === 'new-draw-btn') {
                this.goBackToSelection();
            }
        });
    }
    
    updatePlayerInfo() {
        if (!this.playerData) return;
        
        const playerNameElement = document.getElementById('player-name');
        const remainingTicketsElement = document.getElementById('remaining-tickets');
        
        if (playerNameElement) {
            playerNameElement.textContent = `${this.playerData.name} (${this.playerData.regionName || 'Selected Region'})`;
        }
        
        if (remainingTicketsElement) {
            remainingTicketsElement.textContent = `${this.playerData.tickets}/${this.playerData.tickets}`;
        }
        
        // Wait for sales lottery to be ready (should be initialized by app.js)
        const updateSalesLottery = () => {
            if (window.salesLottery) {
                console.log('Updating player data in sales lottery');
                window.salesLottery.updatePlayerTickets(this.playerData.tickets);
                console.log('Player data updated in sales lottery');
            } else {
                console.log('Sales lottery not ready, retrying...');
                setTimeout(updateSalesLottery, 100);
            }
        };
        
        // Wait for blocks lottery to be ready, then start pre-animation
        const startPreAnimation = () => {
            if (window.blocksLottery && window.blocksLottery.startPreDrawingAnimation) {
                console.log('Starting pre-drawing animation for selected player');
                window.blocksLottery.startPreDrawingAnimation();
            } else {
                console.log('Blocks lottery not ready, retrying...');
                setTimeout(startPreAnimation, 100);
            }
        };
        
        // Start both systems with proper timing
        setTimeout(updateSalesLottery, 300);
        setTimeout(startPreAnimation, 500);
    }
    
    goBackToSelection() {
        // Clear stored player data
        localStorage.removeItem('selectedPlayer');
        
        // Navigate back to selection page
        window.location.href = 'index.html';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DrawingPage();
});
