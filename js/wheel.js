class BlocksLottery {
    constructor(blocksContainer, winnerElement) {
        this.blocksContainer = blocksContainer;
        this.winnerElement = winnerElement;
        this.blocks = this.blocksContainer.querySelectorAll('.block');
        this.isDrawing = false;
        this.drawDuration = 3000; // 3 seconds of animation
        this.highlightInterval = 150; // Speed of block highlighting
    }

    async startDraw() {
        if (this.isDrawing) return;
        
        this.isDrawing = true;
        this.winnerElement.textContent = '';
        this.clearPreviousWinner();
        
        // Start the highlight animation
        await this.animateBlocks();
        
        // Select winner
        const winner = this.selectWinner();
        this.showWinner(winner);
        
        this.isDrawing = false;
    }

    clearPreviousWinner() {
        this.blocks.forEach(block => {
            block.classList.remove('winner', 'highlight');
        });
    }

    async animateBlocks() {
        return new Promise(resolve => {
            let currentIndex = 0;
            let cycles = 0;
            const totalCycles = Math.floor(this.drawDuration / (this.blocks.length * this.highlightInterval));
            
            const highlightNext = () => {
                // Remove highlight from all blocks
                this.blocks.forEach(block => block.classList.remove('highlight'));
                
                // Highlight current block
                this.blocks[currentIndex].classList.add('highlight');
                
                // Move to next block
                currentIndex = (currentIndex + 1) % this.blocks.length;
                
                // Check if we completed a cycle
                if (currentIndex === 0) {
                    cycles++;
                }
                
                // Continue animation or resolve
                if (cycles < totalCycles) {
                    // Gradually slow down the animation
                    const slowdownFactor = 1 + (cycles / totalCycles) * 2;
                    setTimeout(highlightNext, this.highlightInterval * slowdownFactor);
                } else {
                    // Final random highlights before stopping
                    this.finalRandomHighlights().then(resolve);
                }
            };
            
            highlightNext();
        });
    }

    async finalRandomHighlights() {
        return new Promise(resolve => {
            let remainingHighlights = 5;
            const finalHighlight = () => {
                this.blocks.forEach(block => block.classList.remove('highlight'));
                
                if (remainingHighlights > 0) {
                    const randomIndex = Math.floor(Math.random() * this.blocks.length);
                    this.blocks[randomIndex].classList.add('highlight');
                    remainingHighlights--;
                    
                    const delay = 200 + (5 - remainingHighlights) * 100;
                    setTimeout(finalHighlight, delay);
                } else {
                    resolve();
                }
            };
            
            finalHighlight();
        });
    }

    selectWinner() {
        const randomIndex = Math.floor(Math.random() * this.blocks.length);
        return this.blocks[randomIndex];
    }

    showWinner(winnerBlock) {
        // Clear all highlights
        this.blocks.forEach(block => block.classList.remove('highlight'));
        
        // Mark winner
        winnerBlock.classList.add('winner');
        
        // Show winner text
        const winnerName = winnerBlock.getAttribute('data-name');
        this.winnerElement.textContent = `🎉 Winner: ${winnerName}! 🎉`;
        
        // Show confetti
        this.showConfetti();
    }

    showConfetti() {
        const confettiContainer = document.getElementById('confetti-container');
        confettiContainer.innerHTML = '';
        confettiContainer.style.display = 'block';

        const colors = [
            '#ec1c24', '#ffcc00', '#42A5F5', '#66BB6A',
            '#FF69B4', '#00E5FF', '#FFD700', '#8D6E63', '#00C853'
        ];

        // Create confetti
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';

            // Random position across screen
            const left = Math.random() * 100;
            confetti.style.left = `${left}vw`;

            // Random horizontal drift
            const drift = (-80 + Math.random() * 160);
            confetti.style.setProperty('--drift', `${drift}px`);

            // Random size
            const width = 8 + Math.random() * 12;
            const height = 20 + Math.random() * 20;
            confetti.style.width = `${width}px`;
            confetti.style.height = `${height}px`;
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.opacity = 0.7 + Math.random() * 0.3;
            confetti.style.animationDelay = `${Math.random() * 1}s`;
            confetti.style.animationDuration = `4s`;

            confettiContainer.appendChild(confetti);
        }

        // Clean up confetti after animation
        setTimeout(() => {
            confettiContainer.style.display = 'none';
            confettiContainer.innerHTML = '';
        }, 5000);
    }
}