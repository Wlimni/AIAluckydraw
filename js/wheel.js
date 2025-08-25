class BlocksLottery {
    constructor(blocksContainer, winnerElement, presetWinnerName = null) {
        this.blocksContainer = blocksContainer;
        this.winnerElement = winnerElement;
        this.blocks = this.blocksContainer.querySelectorAll('.block');
        this.isDrawing = false;
        this.drawDuration = 3000; // 3 seconds of animation
        this.highlightInterval = 150; // Speed of block highlighting
        this.presetWinnerName = presetWinnerName;
    }

    /**
     * Animate multiple red highlights moving fast, then gold shines on all winners at the end.
     * @param {Array} winnerBlocks - Array of blocks to be gold at the end
     * @param {number} redCount - Number of red highlights
     * @param {number} rounds - How many rounds to spin
     */
    async startMultiDraw(winnerBlocks, redCount = 2, rounds = 3) {
        if (this.isDrawing) return;
        this.isDrawing = true;
        this.winnerElement.textContent = '';
        this.clearPreviousWinner();

        // Animate multiple reds
        await this.animateMultipleRedsToWinners(winnerBlocks, redCount, rounds);

        // Show all winners
        winnerBlocks.forEach(block => block.classList.add('winner'));
        // Optionally, show winner text for all
        const names = winnerBlocks.map(b => b.getAttribute('data-name')).join(', ');
        this.winnerElement.textContent = `🎉 Winners: ${names}! 🎉`;
        this.showConfetti();
        this.isDrawing = false;
    }

    async animateMultipleRedsToWinners(winnerBlocks, redCount, rounds) {
        return new Promise(resolve => {
            const totalBlocks = this.blocks.length;
            let indices = [];
            for (let i = 0; i < redCount; i++) {
                indices.push(Math.floor((i * totalBlocks) / redCount));
            }
            const winnerIndices = winnerBlocks.map(b => Array.from(this.blocks).indexOf(b));
            let steps = totalBlocks * rounds + Math.max(...winnerIndices);
            const interval = 30;
            const step = () => {
                this.blocks.forEach(block => block.classList.remove('highlight', 'winner'));
                indices.forEach(idx => {
                    this.blocks[idx].classList.add('highlight');
                });
                // Move reds
                indices = indices.map(idx => (idx + 1) % totalBlocks);
                steps--;
                if (steps >= 0) {
                    setTimeout(step, interval);
                } else {
                    // Only winner blocks get gold
                    this.blocks.forEach((block, idx) => {
                        block.classList.remove('highlight', 'winner');
                        if (winnerIndices.includes(idx)) block.classList.add('winner');
                    });
                    resolve();
                }
            };
            step();
        });
    }

    async startDraw() {
        if (this.isDrawing) return;
        this.isDrawing = true;
        this.winnerElement.textContent = '';
        this.clearPreviousWinner();

        // Find the preset winner block (if any)
        let winnerBlock = null;
        if (this.presetWinnerName) {
            winnerBlock = Array.from(this.blocks).find(
                block => block.getAttribute('data-name') === this.presetWinnerName
            );
        }
        // Fallback to random if not found
        if (!winnerBlock) {
            winnerBlock = this.selectWinner();
        }

        // Red highlight moves fast for the whole animation, no gold until the end
        await this.animateRedFastToWinner(winnerBlock);

        this.showWinner(winnerBlock);
        this.isDrawing = false;
    }

    clearPreviousWinner() {
        this.blocks.forEach(block => {
            block.classList.remove('winner', 'highlight');
        });
    }

    async animateRedFastToWinner(winnerBlock) {
        // Red highlight moves fast, no gold, until the end where only winner gets gold
        return new Promise(resolve => {
            let currentIndex = 0;
            const winnerIndex = Array.from(this.blocks).indexOf(winnerBlock);
            let steps = this.blocks.length * 3 + winnerIndex; // 3+ rounds, end on winner
            const interval = 30; // even faster
            const step = () => {
                this.blocks.forEach(block => block.classList.remove('highlight', 'winner'));
                this.blocks[currentIndex].classList.add('highlight');
                currentIndex = (currentIndex + 1) % this.blocks.length;
                steps--;
                if (steps >= 0) {
                    setTimeout(step, interval);
                } else {
                    // Only winner gets gold
                    this.blocks.forEach((block, idx) => {
                        block.classList.remove('highlight', 'winner');
                        if (idx === winnerIndex) block.classList.add('winner');
                    });
                    resolve();
                }
            };
            step();
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
        // fallback random winner
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