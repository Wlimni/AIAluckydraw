class BlocksLottery {
    constructor(blocksContainer, winnerElement) {
        this.blocksContainer = blocksContainer;
        this.winnerElement = winnerElement;
        this.blocks = this.blocksContainer.querySelectorAll('.block');
        this.isDrawing = false;
        this.drawDuration = 6000; // 6 seconds of smooth animation
        this.initialInterval = 30; // Very fast initial speed (30ms)
        this.finalInterval = 500; // Slow final speed (500ms) before lock-on
        
        // Try to load audio files (optional - will fail silently if not found)
        this.audioEnabled = true;
        try {
            this.spinSound = new Audio('assets/audio/spin.mp3');
            this.winSound = new Audio('assets/audio/win.mp3');
            this.spinSound.volume = 0.3;
            this.winSound.volume = 0.5;
        } catch (e) {
            this.audioEnabled = false;
        }
    }

    async startDraw() {
        if (this.isDrawing) return;
        
        this.isDrawing = true;
        this.winnerElement.textContent = '';
        this.clearPreviousWinner();
        
        // Show pre-draw animation on all blocks
        await this.showPreDrawAnimation();
        
        // Play spin sound if available
        if (this.audioEnabled && this.spinSound) {
            this.spinSound.currentTime = 0;
            this.spinSound.play().catch(() => {});
        }
        
        // Start the highlight animation
        await this.animateBlocks();
        
        // The winner is already selected in animateBlocks, so we get it from there
        const winner = this.preSelectedWinner;
        this.showWinner(winner);
        
        this.isDrawing = false;
    }

    async showPreDrawAnimation() {
        return new Promise(resolve => {
            // Add pre-draw animation to all blocks
            this.blocks.forEach(block => {
                block.classList.add('pre-draw');
            });
            
            // Let the animation play for 3 seconds, then remove it
            setTimeout(() => {
                this.blocks.forEach(block => {
                    block.classList.remove('pre-draw');
                });
                resolve();
            }, 3000); // 3 seconds to match the CSS animation duration
        });
    }

    clearPreviousWinner() {
        this.blocks.forEach(block => {
            block.classList.remove('winner', 'highlight');
        });
    }

    async animateBlocks() {
        return new Promise(resolve => {
            const startTime = Date.now();
            const winner = this.selectWinner(); // Pre-select winner for smooth targeting
            this.preSelectedWinner = winner; // Store for use in startDraw
            let currentInterval = this.initialInterval;
            let lastHighlightedIndex = -1;
            
            const ultraSmoothHighlight = () => {
                // Remove highlight from all blocks
                this.blocks.forEach(block => block.classList.remove('highlight'));
                
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / this.drawDuration, 1);
                
                if (progress < 1) {
                    // Ultra-smooth deceleration using a very gentle exponential curve
                    // This creates a very gradual slowdown from 30ms to 500ms
                    const smoothProgress = 1 - Math.exp(-progress * 2.5); // Gentle exponential
                    currentInterval = this.initialInterval + (smoothProgress * (this.finalInterval - this.initialInterval));
                    
                    // Keep it completely random until the very end (95%)
                    let targetIndex;
                    if (progress > 0.95) {
                        // Final 5% - start gravitating towards winner area
                        const finalPhase = (progress - 0.95) / 0.05; // 0 to 1 in final 5%
                        const shouldTargetWinner = Math.random() < finalPhase * 0.7;
                        
                        if (shouldTargetWinner) {
                            const winnerIndex = Array.from(this.blocks).indexOf(winner);
                            // Still some randomness around winner area
                            const nearbyIndices = [
                                (winnerIndex - 1 + this.blocks.length) % this.blocks.length,
                                winnerIndex,
                                (winnerIndex + 1) % this.blocks.length
                            ];
                            targetIndex = nearbyIndices[Math.floor(Math.random() * nearbyIndices.length)];
                        } else {
                            targetIndex = Math.floor(Math.random() * this.blocks.length);
                        }
                    } else {
                        // Main phase: completely random for maximum suspense
                        targetIndex = Math.floor(Math.random() * this.blocks.length);
                    }
                    
                    // Avoid highlighting the same block twice in a row
                    if (targetIndex === lastHighlightedIndex) {
                        targetIndex = (targetIndex + 1) % this.blocks.length;
                    }
                    
                    lastHighlightedIndex = targetIndex;
                    this.blocks[targetIndex].classList.add('highlight');
                    
                    setTimeout(ultraSmoothHighlight, currentInterval);
                } else {
                    // Animation complete - final precision targeting
                    this.finalPrecisionTargeting(winner).then(resolve);
                }
            };
            
            ultraSmoothHighlight();
        });
    }

    async finalPrecisionTargeting(winner) {
        return new Promise(resolve => {
            let targetingCount = 0;
            const maxTargeting = 3; // Only 3 final precision highlights
            
            const precisionLockOn = () => {
                this.blocks.forEach(block => block.classList.remove('highlight'));
                
                if (targetingCount < maxTargeting) {
                    const winnerIndex = Array.from(this.blocks).indexOf(winner);
                    
                    // Final precision targeting with minimal near-misses
                    let targetIndex;
                    if (targetingCount === 0 && Math.random() < 0.4) {
                        // First attempt: 40% chance for a near-miss
                        const offset = Math.random() < 0.5 ? -1 : 1;
                        targetIndex = (winnerIndex + offset + this.blocks.length) % this.blocks.length;
                    } else if (targetingCount === 1 && Math.random() < 0.2) {
                        // Second attempt: 20% chance for a near-miss
                        const offset = Math.random() < 0.5 ? -1 : 1;
                        targetIndex = (winnerIndex + offset + this.blocks.length) % this.blocks.length;
                    } else {
                        // Lock onto winner (guaranteed on final attempt)
                        targetIndex = winnerIndex;
                    }
                    
                    this.blocks[targetIndex].classList.add('highlight');
                    targetingCount++;
                    
                    // Slow, deliberate timing for precision phase - shortened
                    const precisionDelay = 300 + (targetingCount * 100); // 300ms, 400ms, 500ms (reduced from 600+200)
                    setTimeout(precisionLockOn, precisionDelay);
                } else {
                    // Final dramatic pause before winner reveal - very short now
                    setTimeout(() => {
                        this.blocks.forEach(block => block.classList.remove('highlight'));
                        resolve();
                    }, 10); // Reduced from 800ms to 100ms (0.1 second)
                }
            };
            
            precisionLockOn();
        });
    }

    selectWinner() {
        const randomIndex = Math.floor(Math.random() * this.blocks.length);
        return this.blocks[randomIndex];
    }

    showWinner(winnerBlock) {
        // Clear all highlights
        this.blocks.forEach(block => block.classList.remove('highlight'));
        
        // First, show the winner with intense red highlight (dramatic reveal)
        setTimeout(() => {
            winnerBlock.classList.add('highlight', 'winner-reveal');
            
            // After showing red highlight, transition to golden winner
            setTimeout(() => {
                winnerBlock.classList.remove('highlight', 'winner-reveal');
                winnerBlock.classList.add('winner');
                
                // Show winner text with animation
                const winnerName = winnerBlock.getAttribute('data-name');
                this.winnerElement.textContent = `🎉 Winner: ${winnerName}! 🎉`;
                
                // Play win sound if available
                if (this.audioEnabled && this.winSound) {
                    this.winSound.currentTime = 0;
                    this.winSound.play().catch(() => {});
                }
                
                // Show confetti after a short delay
                setTimeout(() => {
                    this.showConfetti();
                }, 3);
                
            }, 400); // Reduced from 800ms to 400ms for quicker transition
            
        }, 300); // Initial pause before revealing
    }

    showConfetti() {
        const confettiContainer = document.getElementById('confetti-container');
        confettiContainer.innerHTML = '';
        confettiContainer.style.display = 'block';

        // Get winner block position for targeted confetti
        const winnerBlock = document.querySelector('.block.winner');
        const winnerRect = winnerBlock ? winnerBlock.getBoundingClientRect() : null;
        
        // Calculate position relative to the confetti container
        const containerRect = confettiContainer.getBoundingClientRect();
        const winnerCenterX = winnerRect ? (winnerRect.left - containerRect.left + winnerRect.width / 2) : window.innerWidth / 2;
        const winnerCenterY = winnerRect ? (winnerRect.top - containerRect.top + winnerRect.height / 2) : window.innerHeight / 2;
        
        console.log('Winner position:', { winnerCenterX, winnerCenterY, winnerRect, containerRect });

        const colors = [
            '#ec1c24', '#ffd700', '#42A5F5', '#66BB6A',
            '#FF69B4', '#00E5FF', '#FFD700', '#8D6E63', 
            '#00C853', '#ff6b35', '#9c27b0', '#e91e63',
            '#ff9800', '#4caf50', '#2196f3', '#9e9e9e',
            '#f44336', '#ffeb3b', '#795548', '#607d8b'
        ];

        // Create ribbons released from winner cell
        if (winnerRect) {
            for (let i = 0; i < 20; i++) {
                const ribbon = document.createElement('div');
                ribbon.className = 'confetti';
                
                // Test with intentional left bias - using fixed positioning
                const testLeftBias = winnerCenterX - 10; // Reduced from 30px to 10px
                ribbon.style.left = `${testLeftBias}px`;
                ribbon.style.top = `${winnerCenterY}px`;
                ribbon.style.position = 'fixed';
                
                // Explosive outward drift from winner - better distribution
                const angle = (i / 20) * 360 + (Math.random() - 0.5) * 30; // Add some randomness
                const distance = 120 + Math.random() * 180;
                const driftX = Math.cos(angle * Math.PI / 180) * distance;
                const driftY = Math.sin(angle * Math.PI / 180) * distance * 0.5; // Less vertical spread
                
                ribbon.style.setProperty('--drift-x', `${driftX}px`);
                ribbon.style.setProperty('--drift-y', `${driftY}px`);
                
                // Special winner ribbons - larger and more prominent
                const width = 12 + Math.random() * 16;
                const height = 25 + Math.random() * 35;
                ribbon.style.width = `${width}px`;
                ribbon.style.height = `${height}px`;
                
                // Use gold and red colors for winner ribbons
                const winnerColors = ['#ffd700', '#ec1c24', '#ffb347', '#ff6b35'];
                const color1 = winnerColors[Math.floor(Math.random() * winnerColors.length)];
                const color2 = winnerColors[Math.floor(Math.random() * winnerColors.length)];
                ribbon.style.background = `linear-gradient(45deg, ${color1}, ${color2})`;
                
                ribbon.style.opacity = 0.9;
                ribbon.style.animationDelay = `${Math.random() * 0.8}s`; // Slower start
                ribbon.style.animationDuration = `${4 + Math.random() * 2}s`; // Much slower duration
                ribbon.style.zIndex = '10000';
                
                // Custom animation for winner ribbons
                ribbon.style.animation = `confetti-winner-explode ${4 + Math.random() * 2}s linear forwards`;
                
                confettiContainer.appendChild(ribbon);
            }
        }

        // Create cash emojis from winner cell
        if (winnerRect) {
            for (let i = 0; i < 8; i++) {
                const cash = document.createElement('div');
                cash.className = 'confetti cash-emoji';
                cash.textContent = '💰';
                
                // Test with intentional left bias
                const testLeftBias = winnerCenterX - 10; // Reduced from 30px to 10px
                cash.style.left = `${testLeftBias}px`;
                cash.style.top = `${winnerCenterY}px`;
                cash.style.position = 'fixed';
                
                // Random outward direction - better distribution
                const angle = (i / 8) * 360 + (Math.random() - 0.5) * 45;
                const distance = 80 + Math.random() * 120;
                const driftX = Math.cos(angle * Math.PI / 180) * distance;
                const driftY = Math.sin(angle * Math.PI / 180) * distance * 0.4;
                
                cash.style.setProperty('--drift-x', `${driftX}px`);
                cash.style.setProperty('--drift-y', `${driftY}px`);
                
                cash.style.fontSize = `${20 + Math.random() * 15}px`;
                cash.style.opacity = 0.9;
                cash.style.animationDelay = `${Math.random() * 0.5}s`;
                cash.style.animationDuration = `${5 + Math.random() * 1.5}s`; // Much slower
                cash.style.zIndex = '10001';
                cash.style.animation = `confetti-winner-explode ${5 + Math.random() * 1.5}s linear forwards`;
                
                confettiContainer.appendChild(cash);
            }
            
            // Add some dollar bill emojis too
            for (let i = 0; i < 6; i++) {
                const dollar = document.createElement('div');
                dollar.className = 'confetti cash-emoji';
                dollar.textContent = '💵';
                
                // Test with intentional left bias
                const testLeftBias = winnerCenterX - 10; // Reduced from 30px to 10px
                dollar.style.left = `${testLeftBias}px`;
                dollar.style.top = `${winnerCenterY}px`;
                dollar.style.position = 'fixed';
                
                // Random outward direction
                const angle = (i / 6) * 360 + (Math.random() - 0.5) * 60;
                const distance = 60 + Math.random() * 100;
                const driftX = Math.cos(angle * Math.PI / 180) * distance;
                const driftY = Math.sin(angle * Math.PI / 180) * distance * 0.3;
                
                dollar.style.setProperty('--drift-x', `${driftX}px`);
                dollar.style.setProperty('--drift-y', `${driftY}px`);
                
                dollar.style.fontSize = `${18 + Math.random() * 12}px`;
                dollar.style.opacity = 0.9;
                dollar.style.animationDelay = `${Math.random() * 0.6}s`;
                dollar.style.animationDuration = `${5.5 + Math.random() * 1.5}s`; // Much slower
                dollar.style.zIndex = '10001';
                dollar.style.animation = `confetti-winner-explode ${5.5 + Math.random() * 1.5}s linear forwards`;
                
                confettiContainer.appendChild(dollar);
            }
        }

        // Create a massive amount of confetti for spectacular effect
        for (let i = 0; i < 150; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // Add sparkle effect to some confetti
            if (i % 3 === 0) {
                confetti.classList.add('sparkle');
            }

            // Test with intentional left bias for regular confetti too
            const screenWidth = window.innerWidth;
            const leftBias = (Math.random() * screenWidth) - 150; // Increased from 50px to 150px left bias
            confetti.style.left = `${leftBias}px`;
            confetti.style.position = 'fixed';

            // Enhanced horizontal drift with more variety
            const drift = (-200 + Math.random() * 360);
            confetti.style.setProperty('--drift', `${drift}px`);

            // More variable sizes for dynamic effect
            const sizeType = Math.random();
            let width, height;
            
            if (sizeType < 0.2) { // Tiny pieces
                width = 4 + Math.random() * 6;
                height = 10 + Math.random() * 10;
            } else if (sizeType < 0.5) { // Small pieces
                width = 8 + Math.random() * 10;
                height = 15 + Math.random() * 20;
            } else if (sizeType < 0.8) { // Medium pieces
                width = 12 + Math.random() * 15;
                height = 20 + Math.random() * 25;
            } else { // Large pieces
                width = 18 + Math.random() * 20;
                height = 30 + Math.random() * 30;
            }
            
            confetti.style.width = `${width}px`;
            confetti.style.height = `${height}px`;
            
            // Enhanced color selection with gradients
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            // Add gradient effects to many pieces
            if (Math.random() > 0.4) {
                const color2 = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.background = `linear-gradient(45deg, ${color}, ${color2})`;
            } else {
                confetti.style.background = color;
            }
            
            confetti.style.opacity = 0.7 + Math.random() * 0.3;
            confetti.style.animationDelay = `${Math.random() * 2}s`;
            confetti.style.animationDuration = `${3 + Math.random() * 2}s`;

            confettiContainer.appendChild(confetti);
        }

        // Create many more special star-shaped confetti
        for (let i = 0; i < 30; i++) {
            const star = document.createElement('div');
            star.className = 'confetti sparkle';
            star.style.left = `${Math.random() * 100}%`;
            star.style.setProperty('--drift', `${(-100 + Math.random() * 200)}px`);
            star.style.width = '10px';
            star.style.height = '10px';
            star.style.background = colors[Math.floor(Math.random() * 5)]; // Use brighter colors for stars
            star.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
            star.style.animationDelay = `${Math.random() * 1.5}s`;
            star.style.animationDuration = '4s';
            
            confettiContainer.appendChild(star);
        }

        // Create circular confetti pieces
        for (let i = 0; i < 40; i++) {
            const circle = document.createElement('div');
            circle.className = 'confetti';
            circle.style.left = `${Math.random() * 100}%`;
            circle.style.setProperty('--drift', `${(-120 + Math.random() * 240)}px`);
            
            const size = 8 + Math.random() * 16;
            circle.style.width = `${size}px`;
            circle.style.height = `${size}px`;
            circle.style.borderRadius = '50%';
            circle.style.background = colors[Math.floor(Math.random() * colors.length)];
            circle.style.animationDelay = `${Math.random() * 1}s`;
            circle.style.animationDuration = `${3.5 + Math.random() * 1.5}s`;
            
            confettiContainer.appendChild(circle);
        }

        // Clean up confetti after animation
        setTimeout(() => {
            confettiContainer.style.display = 'none';
            confettiContainer.innerHTML = '';
        }, 7000); // Longer cleanup time for more confetti
    }
}