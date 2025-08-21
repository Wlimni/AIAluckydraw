document.addEventListener('DOMContentLoaded', () => {
    const blocksContainer = document.getElementById('blocks-container');
    const winnerElement = document.getElementById('winner');
    const container = document.querySelector('.container');
    
    // Clean up any residual classes from previous sessions
    const blocks = document.querySelectorAll('.block');
    blocks.forEach(block => {
        block.classList.remove('highlight', 'rolling', 'golden-win', 'fast-draw', 'slow-draw', 'pre-highlight', 'pre-highlight-2');
    });
    if (blocksContainer) {
        blocksContainer.classList.remove('drawing', 'pre-drawing');
    }
    
    // Only create BlocksLottery for pre-drawing animation, not for actual drawing
    const blocksLottery = new BlocksLottery(blocksContainer, winnerElement);
    
    // Make BlocksLottery available globally so SalesLottery can communicate with it
    window.blocksLottery = blocksLottery;
    
    // Start pre-drawing animation when page loads
    console.log('Page loaded, starting pre-drawing animation');
    if (blocksLottery.startPreDrawingAnimation) {
        blocksLottery.startPreDrawingAnimation();
    } else {
        console.error('startPreDrawingAnimation method not found');
    }
    
    // Add a "New Player" button or similar to restart pre-animation
    document.addEventListener('keydown', (e) => {
        if (e.key === ' ' && !window.salesLottery?.isDrawing) { // Spacebar to refresh for new player
            blocksLottery.startPreDrawingAnimation();
        }
    });
});