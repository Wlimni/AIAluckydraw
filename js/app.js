document.addEventListener('DOMContentLoaded', () => {
    const blocksContainer = document.getElementById('blocks-container');
    const winnerElement = document.getElementById('winner');
    const container = document.querySelector('.container');
    
    console.log('App.js initializing...');
    console.log('Blocks container found:', !!blocksContainer);
    console.log('Winner element found:', !!winnerElement);
    
    if (!blocksContainer) {
        console.log('No blocks container found - not a lottery page');
        return;
    }
    
    // Clean up any residual classes from previous sessions
    const blocks = document.querySelectorAll('.block');
    console.log('Found', blocks.length, 'blocks');
    
    blocks.forEach(block => {
        block.classList.remove('highlight', 'rolling', 'golden-win', 'fast-draw', 'slow-draw', 'pre-highlight', 'pre-highlight-2');
    });
    if (blocksContainer) {
        blocksContainer.classList.remove('drawing', 'pre-drawing');
    }
    
    // Only create BlocksLottery for pre-drawing animation, not for actual drawing
    console.log('Creating BlocksLottery...');
    // Allow preset winner name to be set later
    let blocksLottery = new BlocksLottery(blocksContainer, winnerElement);
    window.blocksLottery = blocksLottery;
    window.setBlocksLotteryPresetWinner = function(name) {
        // Re-create BlocksLottery with new preset winner
        blocksLottery = new BlocksLottery(blocksContainer, winnerElement, name);
        window.blocksLottery = blocksLottery;
        return blocksLottery;
    };
    console.log('BlocksLottery set on window object, with preset winner setter');
    
    // Check if we're on the drawing page (has player data) or selection page
    const isDrawingPage = localStorage.getItem('selectedPlayer');
    
    if (isDrawingPage) {
        console.log('Drawing page detected - initializing SalesLottery');
        // Initialize SalesLottery for drawing page
        window.salesLottery = new SalesLottery();
        console.log('SalesLottery initialized for drawing page');
        // Don't start pre-animation here, let drawing-page.js handle it
    } else {
        console.log('Selection page detected - starting pre-drawing animation');
        // Start pre-drawing animation when page loads (for selection page)
        if (blocksLottery.startPreDrawingAnimation) {
            blocksLottery.startPreDrawingAnimation();
        } else {
            console.error('startPreDrawingAnimation method not found');
        }
    }
    
    // Add a "New Player" button or similar to restart pre-animation
    document.addEventListener('keydown', (e) => {
        if (e.key === ' ' && !window.salesLottery?.isDrawing) { // Spacebar to refresh for new player
            console.log('Spacebar pressed - restarting pre-animation');
            blocksLottery.startPreDrawingAnimation();
        }
    });
});