class BlocksLottery {
    constructor(blocksContainer, winnerElement) {
        this.blocksContainer = blocksContainer;
        this.winnerElement = winnerElement;
        this.blocks = this.blocksContainer.querySelectorAll('.block');
        this.isDrawing = false;
        this.drawDuration = 6000; // 6 seconds of smooth animation
        this.initialInterval = 30; // Very fast initial speed (30ms)
        this.finalInterval = 500; // Slow final speed (500ms) before lock-on
    }

    async startDraw() {
        if (this.isDrawing) return;
        
        this.isDrawing = true;
        this.winnerElement.textContent = '';
        this.clearPreviousWinner();
        
        // Show pre-draw animation on all blocks
        await this.showPreDrawAnimation();
        
        // Start the highlight animation
        await this.animateBlocks();
        
        // The winner is already selected in animateBlocks, so we get it from there
        const winner = this.preSelectedWinner;
        this.showWinner(winner);
        
        this.isDrawing = false;
    }

    startPreDrawingAnimation() {
        console.log('Starting pre-drawing animation');
        
        // Guard: Don't start if already running
        if (this.isPreDrawing || this.preDrawingInterval) {
            console.log('Pre-drawing animation already running, skipping start');
            return;
        }
        
        // Set flag to indicate pre-drawing is active
        this.isPreDrawing = true;
        
        // Add pre-drawing class to container
        this.blocksContainer.classList.add('pre-drawing');
        
        // Initialize pattern system with two highlights
        this.currentPatternIndex = 0;
        this.patternStepCount = 0;
        this.redHighlight1Index = 0;
        this.redHighlight2Index = 0;
        this.animationStartTime = Date.now();
        
        // Define multiple movement patterns - mix of single and dual red highlights
        this.movementPatterns = [
            // Beautiful fast patterns for first 5 seconds
            {
                type: 'dual',
                red1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 1, 2],  // Extended linear flow
                red2: [8, 7, 6, 5, 4, 3, 2, 1, 0, 8, 7, 6],  // Counter flow
                description: 'Beautiful Counter Flow',
                priority: 'beautiful'
            },
            {
                type: 'dual',
                red1: [4, 1, 7, 3, 5, 0, 8, 2, 6, 4],  // Diamond pattern
                red2: [0, 2, 6, 8, 1, 3, 7, 5, 4, 0],  // Star pattern
                description: 'Diamond Star Dance',
                priority: 'beautiful'
            },
            {
                type: 'dual',
                red1: [0, 1, 2, 5, 8, 7, 6, 3, 4, 1],  // Clockwise spiral
                red2: [4, 3, 6, 7, 8, 5, 2, 1, 0, 3],  // Counter spiral
                description: 'Mesmerizing Spiral',
                priority: 'beautiful'
            },
            {
                type: 'dual',
                red1: [0, 2, 4, 6, 8, 1, 3, 5, 7, 0],  // Alternating sweep
                red2: [1, 3, 5, 7, 0, 2, 4, 6, 8, 1],  // Offset sweep
                description: 'Hypnotic Weave',
                priority: 'beautiful'
            },
            
            // Normal patterns for after 5 seconds
            {
                type: 'single',
                red1: [0, 1, 2, 3, 4, 5, 6, 7, 8],  // Linear flow
                description: 'Linear Flow',
                priority: 'normal'
            },
            {
                type: 'single', 
                red1: [0, 1, 2, 5, 8, 7, 6, 3, 4],  // Border clockwise
                description: 'Border Clockwise',
                priority: 'normal'
            },
            {
                type: 'single',
                red1: [4, 1, 4, 3, 4, 5, 4, 7, 4, 0, 4, 2, 4, 6, 4, 8],  // Center focus
                description: 'Center Focus',
                priority: 'normal'
            },
            {
                type: 'dual',
                red1: [0, 1, 2, 3, 4, 5, 6, 7, 8],
                red2: [6, 7, 8, 0, 1, 2, 3, 4, 5],  // Chasing
                description: 'Chasing Dance',
                priority: 'normal'
            }
        ];
        
        // Start with beautiful fast animation for first 5 seconds
        this.startBeautifulPhase();
    }

    stopPreDrawingAnimation() {
        console.log('Stopping pre-drawing animation');
        
        // Clear the interval first
        if (this.preDrawingInterval) {
            clearInterval(this.preDrawingInterval);
            this.preDrawingInterval = null;
            console.log('Pre-drawing interval cleared');
        }
        
        // Set flag to false
        this.isPreDrawing = false;
        
        // Remove pre-drawing class from container
        if (this.blocksContainer) {
            this.blocksContainer.classList.remove('pre-drawing');
        }
        
        // Remove all pre-highlight classes from all blocks
        const allBlocks = this.blocksContainer.querySelectorAll('.block');
        allBlocks.forEach(block => {
            block.classList.remove('pre-highlight', 'pre-highlight-2');
        });
        
        console.log('Pre-drawing animation completely stopped and all highlights cleared');
    }

    movePreHighlightWithPattern() {
        // Remove highlight from all blocks
        this.blocks.forEach(block => block.classList.remove('pre-highlight', 'pre-highlight-2'));
        
        // Get current pattern
        const currentPattern = this.movementPatterns[this.currentPatternIndex];
        const elapsedTime = Date.now() - this.animationStartTime;
        const isBeautifulPhase = elapsedTime < 2500;
        
        console.log(`${currentPattern.description} (${currentPattern.type}) - Step ${this.patternStepCount} ${isBeautifulPhase ? '✨BEAUTIFUL✨' : '🎯NORMAL'}`);
        
        // Handle single or dual red highlights based on pattern type
        const red1Pattern = currentPattern.red1;
        
        if (this.patternStepCount < red1Pattern.length) {
            const red1Index = red1Pattern[this.patternStepCount];
            if (this.blocks[red1Index]) {
                this.blocks[red1Index].classList.add('pre-highlight');
            }
        }
        
        // Only add second red if this is a dual pattern
        if (currentPattern.type === 'dual' && currentPattern.red2) {
            const red2Pattern = currentPattern.red2;
            if (this.patternStepCount < red2Pattern.length) {
                const red2Index = red2Pattern[this.patternStepCount];
                if (this.blocks[red2Index] && red2Index !== red1Pattern[this.patternStepCount]) {
                    this.blocks[red2Index].classList.add('pre-highlight-2');
                }
            }
        }
        
        // Move to next step in current pattern
        this.patternStepCount++;
        
        // If we've completed the current pattern, switch to next pattern
        const maxLength = currentPattern.red2 ? 
            Math.max(red1Pattern.length, currentPattern.red2.length) : 
            red1Pattern.length;
            
        if (this.patternStepCount >= maxLength) {
            this.patternStepCount = 0;
            
            // Pattern switching logic based on phase
            if (isBeautifulPhase) {
                // During beautiful phase: cycle through beautiful patterns only
                const beautifulPatterns = this.movementPatterns.filter(p => p.priority === 'beautiful');
                const currentBeautifulIndex = beautifulPatterns.findIndex(p => p === currentPattern);
                const nextBeautifulIndex = (currentBeautifulIndex + 1) % beautifulPatterns.length;
                this.currentPatternIndex = this.movementPatterns.findIndex(p => p === beautifulPatterns[nextBeautifulIndex]);
            } else {
                // During normal phase: cycle through normal patterns only
                const normalPatterns = this.movementPatterns.filter(p => p.priority === 'normal');
                const currentNormalIndex = normalPatterns.findIndex(p => p === currentPattern);
                const nextNormalIndex = (currentNormalIndex + 1) % normalPatterns.length;
                this.currentPatternIndex = this.movementPatterns.findIndex(p => p === normalPatterns[nextNormalIndex]);
            }
            
            const nextPattern = this.movementPatterns[this.currentPatternIndex];
            console.log(`Switching to: ${nextPattern.description} (${nextPattern.type}) - ${nextPattern.priority?.toUpperCase()}`);
            
            // Add a brief pause between patterns - shorter for beautiful phase
            const pauseTime = isBeautifulPhase ? 300 : 1200; // Beautiful: 300ms, Normal: 1200ms
            setTimeout(() => {
                // Continue with next pattern after pause
            }, pauseTime);
        }
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

    startBeautifulPhase() {
        console.log('🌟 Starting BEAUTIFUL PHASE - Fast & Spectacular!');
        
        // Reset to beautiful patterns
        this.currentPatternIndex = 0;
        this.patternStepCount = 0;
        
        // Beautiful phase: Much faster, more spectacular timing
        this.preDrawingInterval = setInterval(() => {
            this.movePreHighlightWithPattern();
        }, 180); // Very fast: 180ms between moves for beautiful effect
        
        this.movePreHighlightWithPattern();
        
        // After 2.5 seconds, transition to normal phase
        setTimeout(() => {
            this.transitionToNormalPhase();
        }, 2500);
    }
    
    transitionToNormalPhase() {
        console.log('🎯 Transitioning to NORMAL PHASE - Relaxed Animation');
        
        // Clear the fast interval
        if (this.preDrawingInterval) {
            clearInterval(this.preDrawingInterval);
            this.preDrawingInterval = null;
        }
        
        // Reset to normal patterns (skip the beautiful ones)
        this.currentPatternIndex = 4; // Start from normal patterns
        this.patternStepCount = 0;
        
        // Normal phase: Slower, more relaxed timing
        this.preDrawingInterval = setInterval(() => {
            this.movePreHighlightWithPattern();
        }, 600); // Slower: 600ms between moves for normal phase
        
        this.movePreHighlightWithPattern();
    }
}

// Function to animate prize cells in a top-left to bottom-right sweep
function sweepPrizeBlocks() {
    const blocks = Array.from(document.querySelectorAll('.block'));
    if (!blocks.length) return 0;
    const n = blocks.length;
    const grid = Math.ceil(Math.sqrt(n));
    let delayMap = [];
    let maxDelay = 0;
    const colorMap = {
      '$20': 'rgba(66,165,245,0.55)',      // blue
      '$50': 'rgba(102,187,106,0.55)',     // green
      '$100': 'rgba(239,68,68,0.55)',      // red
      '$200': 'rgba(156,39,176,0.55)',     // purple
      '$500': 'rgba(249,115,22,0.55)',     // orange
      '$1000': 'rgba(255,215,0,0.65)'      // gold
    };
    function getPrizeValue(block) {
      const name = block.getAttribute('data-name') || '';
      if (name.includes('1000')) return '$1000';
      if (name.includes('500')) return '$500';
      if (name.includes('200')) return '$200';
      if (name.includes('100')) return '$100';
      if (name.includes('50')) return '$50';
      if (name.includes('20')) return '$20';
      return '$50';
    }
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / grid);
      const col = i % grid;
      const delay = (row + col) * 80;
      delayMap.push({ idx: i, delay });
      if (delay > maxDelay) maxDelay = delay;
    }
    delayMap.sort((a, b) => a.delay - b.delay || a.idx - b.idx);
    delayMap.forEach(({ idx, delay }) => {
      setTimeout(() => {
        const block = blocks[idx];
        const prize = getPrizeValue(block);
        if (prize === '$20' || prize === '$50') {
          // Only preview effect, no color class
          block.classList.add('prize-preview');
          setTimeout(() => {
            block.classList.remove('prize-preview');
          }, 420);
          return;
        }
        block.classList.add('prize-preview', 'prize-preview-' + prize.replace('$', ''));
        setTimeout(() => {
          block.classList.remove('prize-preview', 'prize-preview-' + prize.replace('$', ''));
        }, 420);
      }, delay);
    });
    const totalDuration = maxDelay + 420;
    setTimeout(() => {
      // Wait 1 second after preview animation, then call callback if present
      setTimeout(() => {
        if (typeof window.onSweepPrizeBlocksComplete === 'function') {
          window.onSweepPrizeBlocksComplete();
        }
      }, 1000);
    }, totalDuration);
    console.log(`Sweep animation started, duration: ${totalDuration}ms + 1s delay`);
    return totalDuration + 1000;
}