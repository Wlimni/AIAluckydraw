document.addEventListener('DOMContentLoaded', () => {
    const blocksContainer = document.getElementById('blocks-container');
    const winnerElement = document.getElementById('winner');
    const drawButton = document.getElementById('draw-btn');
    const container = document.querySelector('.container');
    
    const blocksLottery = new BlocksLottery(blocksContainer, winnerElement);
    
    drawButton.addEventListener('click', async () => {
        if (blocksLottery.isDrawing) return;
        
        // Add visual feedback to container
        container.classList.add('drawing');
        
        drawButton.disabled = true;
        drawButton.textContent = 'Drawing...';
        
        await blocksLottery.startDraw();
        
        // Remove container glow
        setTimeout(() => {
            container.classList.remove('drawing');
        }, 1000);
        
        drawButton.disabled = false;
        drawButton.textContent = 'Start Lucky Draw!';
    });
});