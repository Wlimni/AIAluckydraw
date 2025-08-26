console.log('App.js initializing...');

document.addEventListener('DOMContentLoaded', () => {
    const blocksContainer = document.getElementById('blocks-container');
    const winnerElement = document.getElementById('winner');
    const container = document.querySelector('.container');

    console.log('Blocks container found:', !!blocksContainer);
    console.log('Winner element found:', !!winnerElement);

    if (!blocksContainer) {
        console.log('No blocks container found - not a lottery page');
        return;
    }

    const blocks = document.querySelectorAll('.block');
    console.log('Found', blocks.length, 'blocks');

    blocks.forEach(block => {
        block.classList.remove('highlight', 'rolling', 'golden-win', 'fast-draw', 'slow-draw', 'pre-highlight', 'pre-highlight-2');
    });
    if (blocksContainer) {
        blocksContainer.classList.remove('drawing', 'pre-drawing');
    }

    console.log('Creating BlocksLottery...');
    if (typeof BlocksLottery === 'function') {
        let blocksLottery = new BlocksLottery(blocksContainer, winnerElement);
        window.blocksLottery = blocksLottery;
        window.setBlocksLotteryPresetWinner = function(name) {
            blocksLottery = new BlocksLottery(blocksContainer, winnerElement, name);
            window.blocksLottery = blocksLottery;
            return blocksLottery;
        };
        console.log('BlocksLottery set on window object, with preset winner setter');
    } else {
        console.error('BlocksLottery class is not defined');
        return;
    }

    const isDrawingPage = localStorage.getItem('selectedPlayer');

    if (isDrawingPage && typeof SalesLottery === 'function') {
        console.log('Drawing page detected - initializing SalesLottery');
        window.salesLottery = new SalesLottery();
        console.log('SalesLottery initialized for drawing page');
    } else if (isDrawingPage) {
        console.error('SalesLottery class is not defined');
    } else {
        console.log('Selection page detected - starting pre-drawing animation');
        if (window.blocksLottery.startPreDrawingAnimation) {
            window.blocksLottery.startPreDrawingAnimation();
        } else {
            console.error('startPreDrawingAnimation method not found');
        }
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === ' ' && !window.salesLottery?.isDrawing) {
            console.log('Spacebar pressed - restarting pre-animation');
            window.blocksLottery.startPreDrawingAnimation();
        }
    });
});