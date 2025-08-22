// Sales Lottery System for AIA Insurance
class SalesLottery {
    constructor() {
        // Initialize players from comprehensive area configuration
        this.players = this.generatePlayersFromAreas();
        
        this.currentPlayer = null;
        this.isDrawing = false;
        
        // Track individual worker results for detailed reporting
        this.workerResults = {};
        
        // PRESET RESULTS - Configure exactly what each worker wins across all areas!
        // Structure: 'area-worker-tickets': { prize_distribution }
        this.presetResults = this.generateComprehensivePresetResults();
        
        // Set to true to use preset results, false for random
        this.usePresetResults = true;
        
        // Updated prize distribution to match actual HTML block layout
        this.prizeDistribution = {
            '$50 Cash Prize': { weight: 67, value: 50 },   // 6 blocks out of 9 = 66.7%
            '$100 Cash Prize': { weight: 22, value: 100 }, // 2 blocks out of 9 = 22.2%  
            '$500 Cash Prize': { weight: 11, value: 500 }  // 1 block out of 9 = 11.1%
        };
        
        this.initializeEvents();
    }
    
    initializeEvents() {
        const playerSelect = document.getElementById('player-select');
        const drawBtn = document.getElementById('draw-btn');
        const newDrawBtn = document.getElementById('new-draw-btn');
        
        // Only add player select listener if the element exists (selection page)
        if (playerSelect) {
            playerSelect.addEventListener('change', (e) => {
                // Prevent player selection changes during drawing
                if (this.isDrawing) {
                    e.preventDefault();
                    return;
                }
                this.selectPlayer(e.target.value);
            });
        }
        
        // Only add draw button listener if it exists (drawing page)
        if (drawBtn) {
            drawBtn.addEventListener('click', () => {
            console.log('=== DRAW BUTTON CLICKED ===');
            console.log('Current player:', this.currentPlayer);
            console.log('Players object:', this.players);
            console.log('Is drawing:', this.isDrawing);
            console.log('Window.blocksLottery available:', !!window.blocksLottery);
            
            // Double-check: if no current player, try to get from localStorage
            if (!this.currentPlayer) {
                console.log('No current player set, trying to load from localStorage...');
                const playerData = JSON.parse(localStorage.getItem('selectedPlayer') || '{}');
                console.log('Player data from localStorage:', playerData);
                
                if (playerData.id) {
                    console.log('Found player in localStorage, setting up...');
                    this.players[playerData.id] = {
                        name: playerData.name,
                        tickets: playerData.tickets,
                        remaining: playerData.tickets,
                        totalWinnings: 0
                    };
                    this.currentPlayer = playerData.id;
                    console.log('Emergency setup complete, currentPlayer:', this.currentPlayer);
                } else {
                    console.log('No valid player data found');
                    console.log('Available players:', Object.keys(this.players));
                    alert('Please select a player first!');
                    return;
                }
            }
            
            if (this.isDrawing) {
                console.log('Already drawing, ignoring click');
                return;
            }
            
            console.log('Draw button clicked - attempting to stop pre-drawing animation');
            
            // Stop pre-drawing animation immediately when draw starts
            if (window.blocksLottery && window.blocksLottery.stopPreDrawingAnimation) {
                console.log('Calling stopPreDrawingAnimation...');
                window.blocksLottery.stopPreDrawingAnimation();
                console.log('stopPreDrawingAnimation called');
            } else {
                console.warn('blocksLottery or stopPreDrawingAnimation method not found on window object');
            }
            
            console.log('Starting bulk draw...');
            this.startBulkDraw();
            });
        }
        
        // Only add new draw button listener if it exists (drawing page)
        if (newDrawBtn) {
            newDrawBtn.addEventListener('click', () => {
                // Prevent resetting during drawing
                if (this.isDrawing) return;
                this.resetForNewDraw();
            });
        }
    }
    
    // Method to update player tickets dynamically from selection page
    updatePlayerTickets(ticketCount) {
        // Create a dynamic player if we're on the drawing page
        const playerData = JSON.parse(localStorage.getItem('selectedPlayer') || '{}');
        console.log('updatePlayerTickets called with:', ticketCount);
        console.log('Player data from localStorage:', playerData);
        
        if (playerData.id) {
            this.players[playerData.id] = {
                name: playerData.name,
                tickets: ticketCount,
                remaining: ticketCount,
                totalWinnings: 0
            };
            
            // Auto-select this player
            this.currentPlayer = playerData.id;
            console.log('Set currentPlayer to:', this.currentPlayer);
            console.log('Players object:', this.players);
            
            this.updatePlayerDisplay();
            
            // Enable the draw button but let CSS animation handle timing
            const drawBtn = document.getElementById('draw-btn');
            if (drawBtn) {
                drawBtn.style.display = 'block';
                drawBtn.style.visibility = 'visible';
                drawBtn.disabled = false;
                // Remove manual opacity/transform overrides to let CSS animation work
            }
        }
    }
    
    updatePlayerDisplay() {
        if (!this.currentPlayer) return;
        
        const player = this.players[this.currentPlayer];
        document.getElementById('player-name').textContent = player.name;
        document.getElementById('remaining-tickets').textContent = player.remaining;
    }
    
    selectPlayer(playerId) {
        if (!playerId) {
            this.currentPlayer = null;
            document.getElementById('player-name').textContent = 'Select Player';
            document.getElementById('remaining-tickets').textContent = '';
            // Hide button when no player selected
            document.getElementById('draw-btn').style.display = 'none';
            document.getElementById('results-summary').classList.add('hidden');
            document.getElementById('winner').textContent = ''; // Clear winner message
            return;
        }
        
        this.currentPlayer = playerId;
        const player = this.players[playerId];
        document.getElementById('player-name').textContent = player.name;
        document.getElementById('remaining-tickets').textContent = player.remaining;
        
        // Only show draw button for NEW players (who haven't drawn yet)
        if (this.workerResults[playerId]) {
            // Player has already drawn - show results, hide button
            const results = this.workerResults[playerId];
            this.displayPreviousResults(results);
            document.getElementById('draw-btn').style.display = 'none';
            document.getElementById('winner').textContent = '';
        } else {
            // NEW player - show button, hide results
            document.getElementById('results-summary').classList.add('hidden');
            document.getElementById('draw-btn').style.display = 'block';
            document.getElementById('draw-btn').disabled = player.remaining <= 0;
            document.getElementById('winner').textContent = '';
            
            // Only start pre-drawing animation if it's not already running
            if (window.blocksLottery && window.blocksLottery.startPreDrawingAnimation) {
                // Check if pre-drawing is already active
                if (!window.blocksLottery.isPreDrawing) {
                    setTimeout(() => {
                        window.blocksLottery.startPreDrawingAnimation();
                    }, 100); // Small delay to ensure DOM updates
                } else {
                    console.log('Pre-drawing animation already running, not restarting');
                }
            }
        }
    }
    
    startBulkDraw() {
        console.log('=== START BULK DRAW ===');
        
        if (!this.currentPlayer || this.isDrawing) {
            console.log('Cannot start draw - no player or already drawing');
            return;
        }
        
        const player = this.players[this.currentPlayer];
        if (player.remaining <= 0) {
            console.log('No tickets remaining');
            return;
        }
        
        // Stop pre-drawing animation immediately
        if (window.blocksLottery && window.blocksLottery.stopPreDrawingAnimation) {
            window.blocksLottery.stopPreDrawingAnimation();
        }
        
        this.isDrawing = true;
        
        // Initialize counters and get preset results
        this.initializeDrawingState(player);
        
        // Start drawing sequence
        this.startDrawingSequence();
    }

    initializeDrawingState(player) {
        // Reset continuous movement system
        this.continuousMovementActive = false;
        this.remainingPrizes = [];
        this.currentPrizeIndex = 0;
        
        // Get predetermined results based on preset or random
        this.actualResults = this.getActualWinningResults(player.tickets);
        
        console.log(`🎯 Drawing for ${player.name}: ${player.tickets} tickets`);
        console.log(`📋 Results to animate (exact order):`, this.actualResults);
        
        // Initialize real-time counters (start from zero, increment with each golden shine)
        this.prizeCounts = {};
        Object.keys(this.prizeDistribution).forEach(prize => {
            this.prizeCounts[prize] = 0;
        });
        this.ticketsDrawnCount = 0;
        this.totalWinnings = 0;
        
        // Setup UI
        this.setupDrawingUI();
    }

    setupDrawingUI() {
        // Disable controls and update UI
        this.disableControlsDuringDrawing();
        
        // Start button explosion animation
        const drawButton = document.getElementById('draw-btn');
        this.explodeButton(drawButton);
        
        // Setup visual effects
        document.querySelector('.container').classList.add('light-rays', 'drawing');
        
        // Initialize results summary
        setTimeout(() => {
            document.getElementById('draw-btn').style.display = 'none';
            document.getElementById('results-summary').classList.remove('hidden');
            this.displayLiveCounters();
        }, 800);
        
        // Clear winner text
        document.getElementById('winner').textContent = '';
    }

    startDrawingSequence() {
        // Remove light rays after initial excitement
        setTimeout(() => {
            document.querySelector('.container').classList.remove('light-rays');
        }, 2000);
        
        // Start the actual prize drawing animations - PROPER LOTTERY STYLE
        setTimeout(() => {
            document.getElementById('results-summary').classList.add('drawing');
            this.startProperLotteryAnimation();
        }, 2000);
    }
    
    startProperLotteryAnimation() {
        console.log(`� Starting PROPER LOTTERY ANIMATION for ${this.actualResults.length} tickets`);
        
        // Initialize lottery state with debugging
        this.completedDraws = 0;
        this.currentTicketIndex = 0;
        this.isAnimatingLottery = true;
        this.missedShines = 0;
        this.animationErrors = [];
        this.expectedResults = this.getResultsBreakdown();
        this.falseGoldenShines = 0; // Track accidental golden shines
        this.goldenShineLocked = true; // CRITICAL: Lock all golden shines by default
        this.authorizedWinningBlock = null; // Only this block can have golden shine
        
        console.log(`🎰 Starting PROPER LOTTERY ANIMATION for ${this.actualResults.length} tickets`);
        console.log(`📋 Expected results breakdown:`, this.expectedResults);
        console.log(`🔒 GOLDEN SHINE LOCKED: No blocks can shine until authorized`);
        
        // Start monitoring system to prevent false golden shines
        this.startGoldenShineMonitor();
        
        // Start the lottery sequence
        this.executeNextLotteryDraw();
    }
    
    // Monitor for accidental golden shines - SIMPLIFIED for clean system
    startGoldenShineMonitor() {
        console.log('🛡️ Starting CLEAN Golden Shine Monitor');
        
        this.monitorInterval = setInterval(() => {
            if (!this.isAnimatingLottery) {
                clearInterval(this.monitorInterval);
                return;
            }
            
            // SIMPLE CHECK: Only remove unauthorized golden shines
            const allBlocks = document.querySelectorAll('.block');
            
            allBlocks.forEach((block, index) => {
                if (block.classList.contains('golden-win')) {
                    // If golden shine is locked OR this isn't the authorized block
                    if (this.goldenShineLocked || block !== this.authorizedWinningBlock) {
                        console.warn(`🧹 CLEAN REMOVAL: Unauthorized golden shine on block ${index}`);
                        block.classList.remove('golden-win');
                        block.removeAttribute('data-golden-protected');
                        block.removeAttribute('data-ticket-number');
                        this.falseGoldenShines++;
                    }
                }
            });
        }, 100); // Less frequent checking for cleaner performance
    }
    
    getResultsBreakdown() {
        const breakdown = {};
        this.actualResults.forEach(prize => {
            breakdown[prize] = (breakdown[prize] || 0) + 1;
        });
        return breakdown;
    }
    
    executeNextLotteryDraw() {
        if (this.currentTicketIndex >= this.actualResults.length) {
            console.log('🏁 All lottery draws completed!');
            setTimeout(() => {
                this.completeDrawing();
            }, 1000);
            return;
        }
        
        const ticketNumber = this.currentTicketIndex + 1;
        const targetPrize = this.actualResults[this.currentTicketIndex];
        
        console.log(`� LOTTERY DRAW #${ticketNumber}: Drawing for ${targetPrize}`);
        
        // Create a proper lottery draw for this ticket
        this.performSingleLotteryDraw(targetPrize, ticketNumber).then(() => {
            // Counter is updated DURING the golden shine, not here
            // Move to next ticket with proper interval
            this.currentTicketIndex++;
            
            // Schedule next draw - authentic lottery pacing
            const nextDelay = this.calculateNextDrawDelay();
            setTimeout(() => {
                this.executeNextLotteryDraw();
            }, nextDelay);
        });
    }
    
    calculateNextDrawDelay() {
        // MUCH FASTER pacing - reduce all delays significantly
        const remainingTickets = this.actualResults.length - this.currentTicketIndex;
        
        if (remainingTickets > 20) {
            return 300; // Very fast for large draws (was 800)
        } else if (remainingTickets > 10) {
            return 400; // Fast (was 1200)
        } else if (remainingTickets > 5) {
            return 500; // Medium (was 1500)
        } else {
            return 600; // Still reasonable for final tickets (was 2000)
        }
    }
    
    performSingleLotteryDraw(targetPrize, ticketNumber) {
        return new Promise((resolve) => {
            console.log(`🎲 Performing lottery draw ${ticketNumber} for ${targetPrize}`);
            
            const blocks = document.querySelectorAll('.block');
            
            // *** SAFETY CHECK: Clean all blocks before starting new draw ***
            blocks.forEach(block => {
                if (!block.hasAttribute('data-golden-protected')) {
                    block.classList.remove('highlight', 'golden-win', 'pre-highlight', 'rolling', 'fast-draw', 'slow-draw');
                }
            });
            console.log(`🧹 SAFETY: All blocks cleaned before draw ${ticketNumber}`);
            
            // Find matching blocks for this prize
            const matchingBlocks = Array.from(blocks).filter(block => 
                block.getAttribute('data-name') === targetPrize
            );
            
            if (matchingBlocks.length === 0) {
                console.warn(`No blocks found for ${targetPrize}`);
                resolve();
                return;
            }
            
            // Choose winning block with distribution logic
            const winningBlock = this.chooseWinningBlock(matchingBlocks, targetPrize, this.currentTicketIndex);
            
            console.log(`🎯 SELECTED WINNER: Block with prize "${targetPrize}" for draw ${ticketNumber}`);
            
            // *** CRITICAL: Set this as the ONLY authorized block for golden shine ***
            this.authorizedWinningBlock = winningBlock;
            console.log(`🔐 AUTHORIZED: Only this specific block can have golden shine for draw ${ticketNumber}`);
            
            // Start authentic lottery animation
            this.animateProperLottery(blocks, winningBlock, ticketNumber).then(() => {
                // Clear authorization after animation completes
                this.authorizedWinningBlock = null;
                console.log(`🔓 CLEARED: Authorization cleared after draw ${ticketNumber}`);
                resolve();
            });
        });
    }
    
    animateProperLottery(blocks, winningBlock, ticketNumber) {
        return new Promise((resolve) => {
            console.log(`🎰 Starting CLEAN path animation for ticket ${ticketNumber}`);
            
            // CLEAN SIMPLE ANIMATION: Red moves in path, golden shines appear at right moments
            this.performPathBasedAnimation(blocks, winningBlock, ticketNumber).then(() => {
                console.log(`✅ CLEAN path animation complete for ticket ${ticketNumber}`);
                resolve();
            }).catch((error) => {
                console.error(`❌ Animation error for ticket ${ticketNumber}:`, error);
                this.animationErrors.push({ ticket: ticketNumber, error: error.message });
                resolve(); // Still resolve to continue
            });
        });
    }
    
    // CONTINUOUS RED MOVEMENT: 2 reds move randomly and draw prizes when they hit them
    performPathBasedAnimation(blocks, winningBlock, ticketNumber) {
        return new Promise((resolve) => {
            console.log(`🛤️ Starting continuous red movement animation`);
            
            // If this is the first draw, initialize the continuous movement system
            if (!this.continuousMovementActive) {
                this.initializeContinuousMovement(blocks);
            }
            
            // Wait for this specific prize to be drawn by the moving reds
            this.waitForPrizeDrawn(winningBlock, ticketNumber).then(() => {
                resolve();
            });
        });
    }
    
    // Initialize continuous movement of 2 red highlights
    initializeContinuousMovement(blocks) {
        if (this.continuousMovementActive) return;
        
        console.log('🔴 Initializing continuous red movement system');
        
        this.continuousMovementActive = true;
        this.totalBlocks = blocks.length;
        this.blocks = blocks;
        
        // Create tracking for what prizes still need to be drawn
        this.remainingPrizes = [...this.actualResults]; // Copy of all prizes to draw
        this.currentPrizeIndex = 0;
        
        // Initialize red positions randomly
        this.redPosition1 = Math.floor(Math.random() * this.totalBlocks);
        this.redPosition2 = Math.floor(Math.random() * this.totalBlocks);
        
        // Ensure different starting positions
        while (this.redPosition2 === this.redPosition1) {
            this.redPosition2 = (this.redPosition2 + Math.floor(this.totalBlocks / 3)) % this.totalBlocks;
        }
        
        console.log(`🔴 Red highlights initialized at positions: ${this.redPosition1}, ${this.redPosition2}`);
        console.log(`🎯 Total prizes to draw: ${this.remainingPrizes.length}`);
        
        // Start continuous movement
        this.startContinuousRedMovement();
    }
    
    // Continuous movement of red highlights
    startContinuousRedMovement() {
        const moveReds = () => {
            if (!this.continuousMovementActive || this.remainingPrizes.length === 0) {
                console.log('🛑 Stopping red movement - all prizes drawn');
                this.stopContinuousMovement();
                return;
            }
            
            // Clean all highlights first
            this.blocks.forEach(block => {
                if (!block.hasAttribute('data-final-winner')) {
                    block.classList.remove('highlight');
                }
            });
            
            // Move red highlights at different speeds
            const speed1 = 1; // Slow red
            const speed2 = 2; // Fast red
            
            // Random direction changes occasionally
            if (Math.random() < 0.1) { // 10% chance to change direction
                speed1 *= (Math.random() < 0.5 ? 1 : -1);
            }
            if (Math.random() < 0.15) { // 15% chance for fast red
                speed2 *= (Math.random() < 0.5 ? 1 : -1);
            }
            
            this.redPosition1 = (this.redPosition1 + speed1 + this.totalBlocks) % this.totalBlocks;
            this.redPosition2 = (this.redPosition2 + speed2 + this.totalBlocks) % this.totalBlocks;
            
            // Apply red highlights
            if (!this.blocks[this.redPosition1].hasAttribute('data-final-winner')) {
                this.blocks[this.redPosition1].classList.add('highlight');
            }
            if (!this.blocks[this.redPosition2].hasAttribute('data-final-winner')) {
                this.blocks[this.redPosition2].classList.add('highlight');
            }
            
            // Check if either red hit a block that needs to draw the current prize
            this.checkForPrizeDrawing();
            
            // Continue movement with random timing
            const delay = 80 + Math.random() * 60; // 80-140ms between moves
            setTimeout(moveReds, delay);
        };
        
        moveReds();
    }
    
    // Check if reds hit blocks that should trigger prize drawing
    checkForPrizeDrawing() {
        if (this.remainingPrizes.length === 0) return;
        
        const currentPrizeNeeded = this.remainingPrizes[0]; // Next prize to draw
        
        // Check both red positions
        const red1Block = this.blocks[this.redPosition1];
        const red2Block = this.blocks[this.redPosition2];
        
        const red1Prize = red1Block.getAttribute('data-name');
        const red2Prize = red2Block.getAttribute('data-name');
        
        // If either red is on a block that matches the current needed prize
        if (red1Prize === currentPrizeNeeded || red2Prize === currentPrizeNeeded) {
            const triggerBlock = (red1Prize === currentPrizeNeeded) ? red1Block : red2Block;
            const redPosition = (red1Prize === currentPrizeNeeded) ? this.redPosition1 : this.redPosition2;
            
            console.log(`✨ RED HIT TARGET: Position ${redPosition} hit ${currentPrizeNeeded}!`);
            
            // Remove this prize from remaining list
            this.remainingPrizes.shift();
            const ticketNumber = this.currentPrizeIndex + 1;
            this.currentPrizeIndex++;
            
            // Trigger golden shine immediately
            this.triggerCleanGoldenShine(triggerBlock, ticketNumber, currentPrizeNeeded);
        }
    }
    
    // Wait for a specific prize to be drawn by the continuous system
    waitForPrizeDrawn(winningBlock, ticketNumber) {
        return new Promise((resolve) => {
            const prizeName = winningBlock.getAttribute('data-name');
            console.log(`⏳ Waiting for ${prizeName} to be drawn by moving reds...`);
            
            // Check periodically if this prize has been drawn
            const checkInterval = setInterval(() => {
                // Check if this prize is no longer in the remaining list
                const prizeStillNeeded = this.remainingPrizes.includes(prizeName);
                
                if (!prizeStillNeeded) {
                    console.log(`✅ Prize ${prizeName} has been drawn!`);
                    clearInterval(checkInterval);
                    resolve();
                }
                
                // Safety timeout in case something goes wrong
                if (this.currentPrizeIndex >= this.actualResults.length) {
                    console.log(`🔄 All prizes drawn, resolving ${prizeName}`);
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100); // Check every 100ms
        });
    }
    
    // Stop continuous movement when all prizes are drawn
    stopContinuousMovement() {
        console.log('� Stopping continuous red movement');
        this.continuousMovementActive = false;
        
        // Clean up red highlights
        if (this.blocks) {
            this.blocks.forEach(block => {
                if (!block.hasAttribute('data-final-winner')) {
                    block.classList.remove('highlight');
                }
            });
        }
    }
    
    // CLEAN GOLDEN SHINE: Simple, reliable, well-displayed
    triggerCleanGoldenShine(winningBlock, ticketNumber, prizeName) {
        console.log(`🌟 CLEAN GOLDEN SHINE: ${prizeName} (Ticket #${ticketNumber})`);
        
        // Authorize this exact moment for golden shine
        this.goldenShineLocked = false;
        this.authorizedWinningBlock = winningBlock;
        
        // Apply golden shine with full visibility
        winningBlock.classList.add('golden-win');
        winningBlock.setAttribute('data-golden-protected', 'true');
        winningBlock.setAttribute('data-ticket-number', ticketNumber);
        
        // Update counter immediately
        console.log(`📊 IMMEDIATE COUNT UPDATE: ${prizeName}`);
        this.updatePrizeCounter(prizeName);
        
        // Celebration effect
        this.showMiniCelebration(winningBlock);
        
        // Golden shine duration: exactly 0.5 seconds, uninterrupted
        setTimeout(() => {
            // Clean up golden shine
            winningBlock.classList.remove('golden-win');
            winningBlock.removeAttribute('data-golden-protected');
            winningBlock.removeAttribute('data-ticket-number');
            
            // Mark as completed to protect from future cleanup
            winningBlock.setAttribute('data-final-winner', 'true');
            
            // Re-lock golden shine system
            this.goldenShineLocked = true;
            this.authorizedWinningBlock = null;
            
            console.log(`✅ CLEAN GOLDEN SHINE COMPLETED: ${prizeName}`);
        }, 500); // Exactly 0.5 seconds
    }
    
    performLotterySpinning(blocks, duration) {
        return new Promise((resolve) => {
            console.log('🌪️ Phase 1: Fast spinning phase');
            
            const startTime = Date.now();
            let currentIndex = Math.floor(Math.random() * blocks.length);
            
            const fastSpin = () => {
                const elapsed = Date.now() - startTime;
                
                if (elapsed < duration) {
                    // *** ULTRA-AGGRESSIVE CLEANUP: Remove ALL animation classes including golden-win ***
                    blocks.forEach(block => {
                        // ALWAYS remove golden-win during spinning phase (it should never be there)
                        block.classList.remove('highlight', 'golden-win', 'pre-highlight', 'rolling', 'fast-draw', 'slow-draw');
                        // Also remove protection markers during animation phases
                        if (!block.hasAttribute('data-final-winner')) { // Don't touch completed winners
                            block.removeAttribute('data-golden-protected');
                            block.removeAttribute('data-ticket-number');
                        }
                    });
                    
                    // Add ONLY highlight to current block (NEVER golden-win during animation)
                    const currentBlock = blocks[currentIndex];
                    if (!currentBlock.hasAttribute('data-final-winner')) { // Don't touch completed winners
                        currentBlock.classList.add('highlight');
                    }
                    
                    // Move to next block (fast random movement)
                    currentIndex = (currentIndex + 1) % blocks.length;
                    
                    // Fast speed with variation - MUCH FASTER
                    const speed = 40 + Math.random() * 30; // 40-70ms (was 80-120ms)
                    setTimeout(fastSpin, speed);
                } else {
                    resolve();
                }
            };
            
            fastSpin();
        });
    }
    
    performGradualSlowdown(blocks, duration) {
        return new Promise((resolve) => {
            console.log('🐌 Phase 2: Gradual slowdown phase');
            
            const startTime = Date.now();
            let currentIndex = Math.floor(Math.random() * blocks.length);
            let initialSpeed = 60; // Faster initial (was 120)
            let finalSpeed = 200; // Faster final (was 400)
            
            const slowingSpin = () => {
                const elapsed = Date.now() - startTime;
                const progress = elapsed / duration;
                
                if (progress < 1) {
                    // *** ULTRA-AGGRESSIVE CLEANUP: Remove ALL animation classes including golden-win ***
                    blocks.forEach(block => {
                        // ALWAYS remove golden-win during slowdown phase (it should never be there)
                        block.classList.remove('highlight', 'golden-win', 'pre-highlight', 'rolling', 'fast-draw', 'slow-draw');
                        // Also remove protection markers during animation phases
                        if (!block.hasAttribute('data-final-winner')) { // Don't touch completed winners
                            block.removeAttribute('data-golden-protected');
                            block.removeAttribute('data-ticket-number');
                        }
                    });
                    
                    // Add ONLY highlight to current block (NEVER golden-win during animation)
                    const currentBlock = blocks[currentIndex];
                    if (!currentBlock.hasAttribute('data-final-winner')) { // Don't touch completed winners
                        currentBlock.classList.add('highlight');
                    }
                    
                    // Move to next block
                    currentIndex = (currentIndex + 1) % blocks.length;
                    
                    // Gradually slow down
                    const currentSpeed = initialSpeed + (progress * (finalSpeed - initialSpeed));
                    setTimeout(slowingSpin, currentSpeed);
                } else {
                    resolve();
                }
            };
            
            slowingSpin();
        });
    }
    
    performTargetSelection(blocks, winningBlock, duration) {
        return new Promise((resolve) => {
            console.log('🎯 Phase 3: Target selection phase');
            
            const winningIndex = Array.from(blocks).indexOf(winningBlock);
            let targetingAttempts = 0;
            const maxAttempts = 3;
            
            const targetingSequence = () => {
                if (targetingAttempts >= maxAttempts) {
                    resolve();
                    return;
                }
                
                // *** ULTRA-AGGRESSIVE CLEANUP: Remove ALL animation classes including golden-win ***
                blocks.forEach(block => {
                    // ALWAYS remove golden-win during targeting phase (it should never be there)
                    block.classList.remove('highlight', 'golden-win', 'pre-highlight', 'rolling', 'fast-draw', 'slow-draw');
                    // Also remove protection markers during animation phases
                    if (!block.hasAttribute('data-final-winner')) { // Don't touch completed winners
                        block.removeAttribute('data-golden-protected');
                        block.removeAttribute('data-ticket-number');
                    }
                });
                
                let targetIndex;
                
                if (targetingAttempts === maxAttempts - 1) {
                    // Final attempt: definitely hit the winner
                    targetIndex = winningIndex;
                } else {
                    // Earlier attempts: might miss nearby
                    const missChance = 0.3 - (targetingAttempts * 0.1);
                    if (Math.random() < missChance) {
                        // Near miss
                        const offset = Math.random() < 0.5 ? -1 : 1;
                        targetIndex = (winningIndex + offset + blocks.length) % blocks.length;
                    } else {
                        targetIndex = winningIndex;
                    }
                }
                
                // Add ONLY highlight to target (NEVER golden-win during targeting!)
                const targetBlock = blocks[targetIndex];
                if (!targetBlock.hasAttribute('data-final-winner')) { // Don't touch completed winners
                    targetBlock.classList.add('highlight'); // Only highlight, NEVER golden-win
                }
                
                targetingAttempts++;
                
                // Faster dramatic pause between attempts
                const pauseDuration = 200 + (targetingAttempts * 50); // Reduced from 400+100
                setTimeout(targetingSequence, pauseDuration);
            };
            
            targetingSequence();
        });
    }
    
    performWinnerReveal(winningBlock, duration) {
        return new Promise((resolve) => {
            console.log('🌟 Phase 4: Winner reveal phase');
            
            const prizeName = winningBlock.getAttribute('data-name');
            const ticketNumber = this.currentTicketIndex + 1;
            
            // *** CRITICAL: STRICT CLEANUP - Remove ALL animation classes from ALL blocks ***
            const allBlocks = document.querySelectorAll('.block');
            allBlocks.forEach(block => {
                // Only clean blocks that are NOT already golden-protected from previous draws
                if (!block.hasAttribute('data-golden-protected')) {
                    block.classList.remove('highlight', 'golden-win', 'pre-highlight', 'rolling', 'fast-draw', 'slow-draw');
                }
            });
            
            console.log(`🎯 STRICT VERIFICATION: Only block with prize "${prizeName}" should get golden shine`);
            console.log(`🔒 Winning block ID: ${winningBlock.id || 'no-id'}, data-name: ${prizeName}`);
            
            // Dramatic pause before golden reveal
            setTimeout(() => {
                // *** SUPER STRICT: Verify this is the EXACT winning block before applying golden shine ***
                const blockPrizeName = winningBlock.getAttribute('data-name');
                if (blockPrizeName !== prizeName) {
                    console.error(`❌ BLOCK MISMATCH: Expected ${prizeName}, but block has ${blockPrizeName}`);
                    this.animationErrors.push({ 
                        ticket: ticketNumber, 
                        error: `Block mismatch: expected ${prizeName}, got ${blockPrizeName}`,
                        prize: prizeName 
                    });
                    resolve();
                    return;
                }
                
                // *** VERIFY AUTHORIZATION: Is this the authorized winning block? ***
                if (winningBlock !== this.authorizedWinningBlock) {
                    console.error(`❌ AUTHORIZATION MISMATCH: Block is not the authorized winner for this draw!`);
                    this.animationErrors.push({ 
                        ticket: ticketNumber, 
                        error: `Block not authorized for golden shine`,
                        prize: prizeName 
                    });
                    resolve();
                    return;
                }
                
                // *** DOUBLE CHECK: Ensure no other blocks have golden-win class ***
                allBlocks.forEach((block, index) => {
                    if (block !== winningBlock && block.classList.contains('golden-win')) {
                        console.error(`❌ FALSE GOLDEN SHINE DETECTED on block ${index}: ${block.getAttribute('data-name')}`);
                        block.classList.remove('golden-win'); // Force remove
                        block.removeAttribute('data-golden-protected'); // Force remove protection
                        this.falseGoldenShines++;
                    }
                });
                
                // *** UNLOCK GOLDEN SHINE FOR THIS EXACT MOMENT ***
                console.log(`🔓 UNLOCKING: Golden shine authorized for block: ${prizeName}`);
                this.goldenShineLocked = false;
                
                // *** SAFE GOLDEN WINNER REVEAL - Only on verified winning block ***
                console.log(`✅ VERIFIED: Applying golden shine to authorized block: ${prizeName}`);
                winningBlock.classList.add('golden-win');
                winningBlock.setAttribute('data-golden-protected', 'true');
                winningBlock.setAttribute('data-ticket-number', ticketNumber);
                
                console.log(`🏆 GOLDEN WINNER REVEALED: ${prizeName} (Ticket #${ticketNumber})`);
                console.log(`⏰ Golden shine started at: ${Date.now()}`);
                
                // *** CRITICAL: Update counter IMMEDIATELY when golden shine appears ***
                console.log(`🔥 INSTANT COUNTER UPDATE: ${prizeName} at golden shine start`);
                this.updatePrizeCounter(prizeName);
                
                // Force DOM refresh to ensure counter update is visible
                document.getElementById('results-summary').offsetHeight; // Force reflow
                
                // Verify the shine is visible
                const shineCheck = setTimeout(() => {
                    if (!winningBlock.classList.contains('golden-win')) {
                        console.error(`❌ MISSED SHINE DETECTED: ${prizeName} (Ticket #${ticketNumber})`);
                        this.missedShines++;
                        this.animationErrors.push({ 
                            ticket: ticketNumber, 
                            error: 'Golden shine disappeared prematurely',
                            prize: prizeName 
                        });
                    }
                }, 100);
                
                // Mini celebration for this win
                this.showMiniCelebration(winningBlock);
                
                // Golden shine duration - exactly 0.5 seconds with verification
                setTimeout(() => {
                    clearTimeout(shineCheck);
                    
                    // *** LOCK GOLDEN SHINE AGAIN ***
                    console.log(`🔒 RE-LOCKING: Golden shine locked again after draw ${ticketNumber}`);
                    this.goldenShineLocked = true;
                    
                    // Verify golden shine completion
                    if (winningBlock.getAttribute('data-golden-protected') === 'true') {
                        winningBlock.classList.remove('golden-win');
                        winningBlock.removeAttribute('data-golden-protected');
                        winningBlock.removeAttribute('data-ticket-number');
                        
                        // Mark as completed winner to protect from cleanup
                        winningBlock.setAttribute('data-final-winner', 'true');
                        
                        console.log(`✨ GOLDEN SHINE COMPLETED: ${prizeName} (Ticket #${ticketNumber})`);
                        console.log(`⏰ Golden shine ended at: ${Date.now()}`);
                        
                        // Immediate verification that the counter will be updated
                        console.log(`🔢 About to update counter for: ${prizeName}`);
                        resolve();
                    } else {
                        console.error(`❌ PROTECTION MARKER MISSING: ${prizeName} (Ticket #${ticketNumber})`);
                        this.animationErrors.push({ 
                            ticket: ticketNumber, 
                            error: 'Protection marker was removed unexpectedly',
                            prize: prizeName 
                        });
                        resolve();
                    }
                }, 500); // Exactly 0.5 seconds
                
            }, 100); // Reduced dramatic pause
        });
    }

    // Add missing showMiniCelebration method for proper lottery animation
    showMiniCelebration(winningBlock) {
        if (!winningBlock) return;
        
        // Create a small celebration effect around the winning block
        const rect = winningBlock.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Create small sparkles around the winning block
        for (let i = 0; i < 8; i++) {
            const sparkle = document.createElement('div');
            sparkle.style.position = 'fixed';
            sparkle.style.left = centerX + 'px';
            sparkle.style.top = centerY + 'px';
            sparkle.style.width = '6px';
            sparkle.style.height = '6px';
            sparkle.style.background = '#FFD700';
            sparkle.style.borderRadius = '50%';
            sparkle.style.pointerEvents = 'none';
            sparkle.style.zIndex = '1000';
            
            // Random direction for sparkle
            const angle = (i / 8) * 2 * Math.PI;
            const distance = 30 + Math.random() * 20;
            const endX = centerX + Math.cos(angle) * distance;
            const endY = centerY + Math.sin(angle) * distance;
            
            sparkle.style.transition = 'all 0.6s ease-out';
            
            document.body.appendChild(sparkle);
            
            // Animate sparkle
            setTimeout(() => {
                sparkle.style.left = endX + 'px';
                sparkle.style.top = endY + 'px';
                sparkle.style.opacity = '0';
                sparkle.style.transform = 'scale(0.3)';
            }, 50);
            
            // Remove sparkle
            setTimeout(() => {
                if (document.body.contains(sparkle)) {
                    document.body.removeChild(sparkle);
                }
            }, 700);
        }
    }

    chooseWinningBlock(matchingBlocks, targetPrize, prizeIndex) {
        console.log(`🎯 Choosing block for ${targetPrize} (prize #${prizeIndex + 1})`);
        
        // EVEN DISTRIBUTION LOGIC for multiple blocks of same prize type
        if (targetPrize === '$50 Cash Prize') {
            // 6 blocks for $50 - distribute evenly using round-robin
            const blockIndex = prizeIndex % matchingBlocks.length;
            const selectedBlock = matchingBlocks[blockIndex];
            console.log(`💰 $50 prize distributed to block ${blockIndex + 1}/${matchingBlocks.length}`);
            return selectedBlock;
        }
        
        if (targetPrize === '$100 Cash Prize') {
            // 2 blocks for $100 - alternate between them
            const blockIndex = prizeIndex % matchingBlocks.length;
            const selectedBlock = matchingBlocks[blockIndex];
            console.log(`💵 $100 prize distributed to block ${blockIndex + 1}/${matchingBlocks.length}`);
            return selectedBlock;
        }
        
        // For $500 prize (1 block), always use the only one
        console.log(`💎 $500 prize using the only block`);
        return matchingBlocks[0];
    }

    updatePrizeCounter(prize) {
        console.log(`🔢 COUNTER UPDATE STARTED for: ${prize}`);
        console.log(`⏰ Counter update timestamp: ${Date.now()}`);
        console.log(`📊 Current counts before update:`, JSON.stringify(this.prizeCounts));
        
        try {
            // Validate prize name
            if (!prize || typeof prize !== 'string') {
                console.error(`❌ INVALID PRIZE NAME: ${prize}`);
                return false;
            }
            
            // Validate prize exists in distribution
            if (!this.prizeDistribution[prize]) {
                console.error(`❌ PRIZE NOT IN DISTRIBUTION: ${prize}`);
                return false;
            }
            
            // SIMPLE AND RELIABLE: Each call represents exactly one golden shine
            this.prizeCounts[prize]++;
            this.ticketsDrawnCount++;
            this.totalWinnings += this.prizeDistribution[prize].value;
            
            console.log(`✨ Prize counted: ${prize} (${this.prizeCounts[prize]}), Total tickets: ${this.ticketsDrawnCount}/${this.actualResults.length}, Winnings: $${this.totalWinnings}`);
            console.log(`📊 Updated counts:`, JSON.stringify(this.prizeCounts));
            
            // Update UI immediately with error handling
            console.log(`🖼️ About to update UI display for: ${prize}`);
            const uiUpdateSuccess = this.updateCounterDisplay(prize);
            
            if (!uiUpdateSuccess) {
                console.error(`❌ UI UPDATE FAILED for: ${prize}`);
                return false;
            }
            
            console.log(`✅ COUNTER UPDATE COMPLETE for: ${prize}`);
            return true;
            
        } catch (error) {
            console.error(`❌ COUNTER UPDATE ERROR for ${prize}:`, error);
            this.animationErrors.push({ 
                ticket: this.currentTicketIndex + 1, 
                error: `Counter update failed: ${error.message}`,
                prize: prize 
            });
            return false;
        }
    }

    updateCounterDisplay(prize) {
        console.log(`🖼️ UI UPDATE STARTED for: ${prize}`);
        console.log(`⏰ UI update timestamp: ${Date.now()}`);
        
        try {
            let updateSuccess = true;
            
            // Update tickets drawn
            const ticketsElement = document.getElementById('tickets-drawn');
            if (ticketsElement) {
                console.log(`📊 Updating tickets drawn: ${this.ticketsDrawnCount}`);
                ticketsElement.textContent = this.ticketsDrawnCount;
                this.animateCounterUpdate(ticketsElement);
            } else {
                console.error(`❌ tickets-drawn element not found!`);
                updateSuccess = false;
            }
            
            // Update specific prize counter
            const counterId = `counter-${prize.replace(/\s+/g, '-').replace(/\$/g, '')}`;
            console.log(`🎯 Looking for counter element: ${counterId}`);
            const counterElement = document.getElementById(counterId);
            if (counterElement) {
                const countSpan = counterElement.querySelector('.count');
                if (countSpan) {
                    console.log(`💰 Updating ${prize} counter: ${this.prizeCounts[prize]}`);
                    countSpan.textContent = this.prizeCounts[prize];
                    this.animateCounterUpdate(countSpan);
                } else {
                    console.error(`❌ .count span not found in ${counterId}!`);
                    updateSuccess = false;
                }
            } else {
                console.error(`❌ Counter element ${counterId} not found!`);
                updateSuccess = false;
            }
            
            // Update total winnings
            const totalElement = document.getElementById('total-amount');
            if (totalElement) {
                console.log(`💵 Updating total winnings: $${this.totalWinnings.toLocaleString()}`);
                totalElement.textContent = `${this.totalWinnings.toLocaleString()}`;
                this.animateCounterUpdate(totalElement);
                this.showCashAnimation(totalElement);
            } else {
                console.error(`❌ total-amount element not found!`);
                updateSuccess = false;
            }
            
            if (updateSuccess) {
                console.log(`✅ UI Updated Successfully - ${prize}: ${this.prizeCounts[prize]}, Total tickets: ${this.ticketsDrawnCount}`);
            }
            
            return updateSuccess;
            
        } catch (error) {
            console.error(`❌ UI UPDATE ERROR for ${prize}:`, error);
            return false;
        }
    }

    animateCounterUpdate(element) {
        // Immediate visual feedback with colorful theme animation
        element.style.transition = 'all 0.4s ease-out';
        element.style.transform = 'scale(1.2)';
        element.style.background = 'linear-gradient(45deg, #ffd700, #ffb347, #ff6b9d, #feca57)'; // Gold, orange, pink, yellow
        element.style.backgroundSize = '400% 400%';
        element.style.animation = 'gradientShift 0.6s ease-in-out';
        element.style.borderRadius = '20px';
        element.style.padding = '8px 16px';
        element.style.color = '#fff';
        element.style.fontWeight = 'bold';
        element.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.6)'; // Golden glow
        element.style.zIndex = '25'; // Bring to front during animation
        
        setTimeout(() => {
            element.style.transform = 'scale(1.05)'; // Slightly larger than original
            element.style.background = '#dc2626'; // Back to red color
            element.style.animation = '';
            element.style.padding = '6px 14px';
            element.style.color = '#fff';
            element.style.boxShadow = '0 2px 8px rgba(220, 38, 38, 0.4)'; // Red glow
            element.style.zIndex = '15';
        }, 400);
        
        setTimeout(() => {
            element.style.transform = 'scale(1)'; // Back to normal size
            element.style.boxShadow = '0 2px 8px rgba(220, 38, 38, 0.3)'; // Subtle red glow
        }, 600);
    }

    displayLiveCounters() {
        const prizeCountsDiv = document.getElementById('prize-counts');
        prizeCountsDiv.innerHTML = '';
        
        // Create counter displays for all prizes WITH CURRENT VALUES
        Object.keys(this.prizeDistribution).forEach(prize => {
            const prizeItem = document.createElement('div');
            prizeItem.className = 'prize-item';
            prizeItem.id = `counter-${prize.replace(/\s+/g, '-').replace(/\$/g, '')}`;
            
            // Use current count values instead of hardcoded 0
            const currentCount = this.prizeCounts[prize] || 0;
            prizeItem.innerHTML = `
                <div class="prize-name">${prize}</div>
                <div class="prize-count"><span class="count">${currentCount}</span></div>
            `;
            prizeCountsDiv.appendChild(prizeItem);
        });
        
        // Use current values instead of hardcoded 0
        document.getElementById('total-amount').textContent = this.totalWinnings ? this.totalWinnings.toLocaleString() : '0';
        document.getElementById('tickets-drawn').textContent = this.ticketsDrawnCount || '0';
        
        console.log(`🖼️ displayLiveCounters: Showing current values - Tickets: ${this.ticketsDrawnCount}, Winnings: $${this.totalWinnings}`);
    }

    completeDrawing() {
        console.log('🏁 Drawing complete!');
        console.log(`📊 Final counts: ${JSON.stringify(this.prizeCounts)}`);
        console.log(`🎫 Total tickets drawn: ${this.ticketsDrawnCount}/${this.actualResults.length}`);
        console.log(`💰 Total winnings: $${this.totalWinnings.toLocaleString()}`);
        
        // COMPREHENSIVE ERROR CHECKING
        console.log('\n=== ANIMATION VERIFICATION ===');
        console.log(`🔍 Expected results:`, this.expectedResults);
        console.log(`🔍 Actual counts:`, this.prizeCounts);
        
        // Check for mismatches
        let hasErrors = false;
        Object.keys(this.expectedResults).forEach(prize => {
            const expected = this.expectedResults[prize];
            const actual = this.prizeCounts[prize] || 0;
            if (expected !== actual) {
                console.error(`❌ MISMATCH: ${prize} - Expected: ${expected}, Actual: ${actual}`);
                hasErrors = true;
            } else {
                console.log(`✅ CORRECT: ${prize} - ${actual}/${expected}`);
            }
        });
        
        if (this.missedShines > 0) {
            console.error(`❌ MISSED SHINES: ${this.missedShines}`);
            hasErrors = true;
        }
        
        if (this.falseGoldenShines > 0) {
            console.error(`❌ FALSE GOLDEN SHINES: ${this.falseGoldenShines}`);
            hasErrors = true;
        }
        
        if (this.animationErrors.length > 0) {
            console.error(`❌ ANIMATION ERRORS: ${this.animationErrors.length}`);
            this.animationErrors.forEach(error => {
                console.error(`  - Ticket ${error.ticket}: ${error.error} (${error.prize})`);
            });
            hasErrors = true;
        }
        
        if (!hasErrors) {
            console.log('🎉 ALL ANIMATIONS AND COUNTS VERIFIED SUCCESSFULLY!');
        }
        console.log('=== END VERIFICATION ===\n');
        
        // Stop the golden shine monitor
        this.isAnimatingLottery = false;
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            console.log('🛡️ Golden Shine Monitor stopped');
        }
        
        // Stop continuous movement system
        this.stopContinuousMovement();
        
        // Update player data
        const player = this.players[this.currentPlayer];
        player.remaining = 0;
        player.totalWinnings += this.totalWinnings;
        
        // Store results
        this.workerResults[this.currentPlayer] = {
            playerName: player.name,
            ticketsUsed: player.tickets,
            totalWinnings: this.totalWinnings,
            prizeBreakdown: { ...this.prizeCounts },
            individualPrizes: [...this.actualResults],
            animationErrors: this.animationErrors,
            missedShines: this.missedShines
        };
        
        // Update remaining tickets display
        document.getElementById('remaining-tickets').textContent = '0';
        
        // Show massive celebration
        this.showMassiveConfetti();
        setTimeout(() => this.showSideFireworks(), 500);
        
        // Cleanup and reset
        setTimeout(() => {
            document.querySelector('.container').classList.remove('drawing');
            document.getElementById('results-summary').classList.remove('drawing');
            this.enableControlsAfterDrawing();
            this.isDrawing = false;
        }, 2000);
    }
    
    // Initialize real-time counters that update as golden flashes appear
    initializeRealtimeCounters() {
        // This method is deprecated - using displayLiveCounters instead
        this.displayLiveCounters();
    }
    
    // Update counter when a golden flash appears (with realistic delay and effect)
    updateRealtimeCounter(prizeName) {
        // This method is deprecated - using updatePrizeCounter instead
        this.updatePrizeCounter(prizeName);
    }
    
    // Get actual winning results for realistic animation
    getActualWinningResults(ticketCount) {
        const winningPrizes = [];
        
        if (this.usePresetResults && this.presetResults[this.currentPlayer]) {
            const preset = this.presetResults[this.currentPlayer];
            console.log(`🎯 Using preset results for player: ${this.currentPlayer}`);
            console.log(`📋 Preset data:`, preset);
            
            // Create array of actual winning prizes from preset
            Object.entries(preset).forEach(([prize, count]) => {
                console.log(`Adding ${count}x ${prize} to results`);
                for (let i = 0; i < count; i++) {
                    winningPrizes.push(prize);
                }
            });
            
            console.log(`🎪 Total prizes to animate: ${winningPrizes.length}`);
            
            // Shuffle the prizes for random order during animation
            return this.shuffleArray([...winningPrizes]);
        } else {
            console.log(`🎲 Using random results for player: ${this.currentPlayer}`);
            if (!this.presetResults[this.currentPlayer]) {
                console.warn(`⚠️ No preset found for ${this.currentPlayer}. Available presets:`, Object.keys(this.presetResults).slice(0, 5));
            }
            // For random mode, generate prizes normally
            for (let i = 0; i < ticketCount; i++) {
                winningPrizes.push(this.getWeightedRandomPrize());
            }
            return winningPrizes;
        }
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    processBulkResults() {
        // This method is deprecated - logic moved to completeDrawing()
        this.completeDrawing();
    }
    
    drawAllTickets(ticketCount) {
        const results = [];
        const prizeCount = {};
        
        // Initialize prize counts
        Object.keys(this.prizeDistribution).forEach(prize => {
            prizeCount[prize] = 0;
        });
        
        // Check if we should use preset results
        if (this.usePresetResults && this.presetResults[this.currentPlayer]) {
            console.log(`Using preset results for ${this.players[this.currentPlayer].name}`);
            
            const preset = this.presetResults[this.currentPlayer];
            
            // Add preset prizes to results
            Object.entries(preset).forEach(([prize, count]) => {
                for (let i = 0; i < count; i++) {
                    const value = this.prizeDistribution[prize].value;
                    results.push({ prize, value });
                    prizeCount[prize]++;
                }
            });
            
        } else {
            // Use random weighted distribution (original method)
            console.log(`Using random results for ${this.players[this.currentPlayer].name}`);
            
            for (let i = 0; i < ticketCount; i++) {
                const prize = this.getWeightedRandomPrize();
                const value = this.prizeDistribution[prize].value;
                
                results.push({ prize, value });
                prizeCount[prize]++;
            }
        }
        
        return results.map(result => ({
            ...result,
            counts: prizeCount
        }));
    }
    
    displayResults(results, playerName, ticketsUsed, totalWinnings) {
        // This method is deprecated - using displayLiveCounters and direct updates
        console.log('displayResults called but logic moved to real-time updates');
    }
    
    // Display previous results when switching back to a player who has already drawn
    displayPreviousResults(workerResult) {
        const resultsBox = document.getElementById('results-summary');
        const prizeCountsDiv = document.getElementById('prize-counts');
        
        // Display prize counts from previous draw
        prizeCountsDiv.innerHTML = '';
        Object.entries(workerResult.prizeBreakdown).forEach(([prize, count]) => {
            if (count > 0) {
                const prizeItem = document.createElement('div');
                prizeItem.className = 'prize-item';
                
                prizeItem.innerHTML = `
                    <div class="prize-name">${prize}</div>
                    <div class="prize-count"><span class="count">${count}</span></div>
                `;
                prizeCountsDiv.appendChild(prizeItem);
            }
        });
        
        // Update totals (no double $)
        document.getElementById('total-amount').textContent = `${workerResult.totalWinnings.toLocaleString()}`;
        document.getElementById('tickets-drawn').textContent = workerResult.ticketsUsed;
        
        // Show results box
        resultsBox.classList.remove('hidden');
    }
    
    // Disable controls during drawing to prevent interference
    disableControlsDuringDrawing() {
        const playerSelect = document.getElementById('player-select');
        const newDrawBtn = document.getElementById('new-draw-btn');
        
        // Hide the animated arrows when drawing starts
        const leftArrow = document.querySelector('.left-arrow');
        const rightArrow = document.querySelector('.right-arrow');
        
        if (leftArrow) {
            leftArrow.style.display = 'none';
        }
        if (rightArrow) {
            rightArrow.style.display = 'none';
        }
        
        // IMMEDIATELY update remaining tickets to 0 when drawing starts
        const player = this.players[this.currentPlayer];
        if (player) {
            player.remaining = 0;
            document.getElementById('remaining-tickets').textContent = '0';
        }
        
        // Disable player selection dropdown
        if (playerSelect) {
            playerSelect.disabled = true;
            playerSelect.style.opacity = '0.5';
            playerSelect.style.cursor = 'not-allowed';
        }
        
        // Disable "Draw another player" button
        if (newDrawBtn) {
            newDrawBtn.disabled = true;
            newDrawBtn.style.opacity = '0.5';
            newDrawBtn.style.cursor = 'not-allowed';
            newDrawBtn.style.background = '#9ca3af'; // Grey background
            newDrawBtn.style.borderColor = '#9ca3af';
        }
    }
    
    // Re-enable controls after drawing is complete
    enableControlsAfterDrawing() {
        const playerSelect = document.getElementById('player-select');
        const newDrawBtn = document.getElementById('new-draw-btn');
        
        // Note: Arrows remain hidden permanently after drawing starts
        // They will not reappear even after drawing completes
        
        // Clean up all animation classes from all blocks
        const blocks = document.querySelectorAll('.block');
        blocks.forEach(block => {
            block.classList.remove('highlight', 'rolling', 'golden-win', 'fast-draw', 'slow-draw', 'pre-highlight', 'pre-highlight-2');
            // Clean up any remaining protection markers
            block.removeAttribute('data-golden-protected');
        });
        
        // Clean up container classes
        const container = document.getElementById('blocks-container');
        if (container) {
            container.classList.remove('drawing', 'pre-drawing');
        }
        
        // Re-enable player selection dropdown
        if (playerSelect) {
            playerSelect.disabled = false;
            playerSelect.style.opacity = '1';
            playerSelect.style.cursor = 'pointer';
        }
        
        // Re-enable "Draw another player" button
        if (newDrawBtn) {
            newDrawBtn.disabled = false;
            newDrawBtn.style.opacity = '1';
            newDrawBtn.style.cursor = 'pointer';
            newDrawBtn.style.background = ''; // Reset to original style
            newDrawBtn.style.borderColor = '';
        }
        
        console.log('All drawing animations and classes cleaned up');
    }
    
    resetForNewDraw() {
        // First ensure all animations and drawing state is cleaned up
        this.enableControlsAfterDrawing();
        
        document.getElementById('results-summary').classList.add('hidden');
        document.getElementById('winner').textContent = ''; // Clear winner message together
        
        // Show draw button again and enable it
        document.getElementById('draw-btn').style.display = 'block';
        document.getElementById('draw-btn').disabled = false;
        
        // Reset player selection
        document.getElementById('player-select').value = '';
        this.selectPlayer('');
        
        // Start pre-drawing animation for new draw session only if not already running
        if (window.blocksLottery && window.blocksLottery.startPreDrawingAnimation) {
            if (!window.blocksLottery.isPreDrawing) {
                setTimeout(() => {
                    window.blocksLottery.startPreDrawingAnimation();
                }, 200); // Small delay to ensure cleanup is complete
            }
        }
    }
    
    showMassiveConfetti() {
        const container = document.getElementById('confetti-container');
        if (!container) {
            console.error('Confetti container not found!');
            return;
        }
        
        console.log('Creating massive confetti celebration...');
        const colors = ['#FFD700', '#FFA500', '#FF6347', '#32CD32', '#1E90FF', '#FF1493', '#9370DB', '#00FA9A'];
        const emojis = ['💰', '💵', '💸', '🎉', '⭐', '✨', '🏆', '💎', '🎊']; // Removed 🥳
        
        // Reduced amount but bigger pieces for cleaner effect
        for (let burst = 0; burst < 4; burst++) { // Keep 4 bursts
            setTimeout(() => {
                for (let i = 0; i < 20; i++) { // Keep 20 pieces per burst
                    setTimeout(() => {
                        const confetti = document.createElement('div');
                        confetti.className = 'confetti';
                        
                        if (Math.random() < 0.25) { // Fewer emojis (was 0.5 = 50%, now 25%)
                            confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                            confetti.style.fontSize = '32px'; // Smaller emojis (was 48px)
                        } else {
                            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                            confetti.style.width = '18px'; // Keep colored circles same size
                            confetti.style.height = '18px';
                            confetti.style.borderRadius = '50%';
                        }
                        
                        // Random starting positions across the top
                        confetti.style.left = Math.random() * window.innerWidth + 'px';
                        confetti.style.top = '-40px';
                        confetti.style.setProperty('--drift', `${(Math.random() - 0.5) * 400}px`);
                        confetti.style.animation = 'confetti-fall 7s linear forwards';
                        
                        container.appendChild(confetti);
                        
                        setTimeout(() => {
                            if (confetti.parentNode) {
                                confetti.remove();
                            }
                        }, 7000);
                    }, i * 60);
                }
            }, burst * 400);
        }
        
        console.log('Massive confetti created!');
    }
    
    // Create firework animation at specified coordinates
    createFirework(x, y, size = 'medium') {
        const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#FF1493', '#00FA9A'];
        const sparkleCount = size === 'small' ? 40 : size === 'medium' ? 60 : 80; // More sparkles for large
        const maxDistance = size === 'small' ? 120 : size === 'medium' ? 160 : 200; // Bigger radius for large
        
        // Create much bigger center burst - more transparent
        const centerBurst = document.createElement('div');
        centerBurst.style.position = 'fixed';
        centerBurst.style.left = x + 'px';
        centerBurst.style.top = y + 'px';
        centerBurst.style.width = size === 'large' ? '30px' : '20px';
        centerBurst.style.height = size === 'large' ? '30px' : '20px';
        centerBurst.style.background = 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,215,0,0.08) 30%, rgba(255,107,107,0.05) 60%, transparent 100%)'; // Even more transparent
        centerBurst.style.borderRadius = '50%';
        centerBurst.style.zIndex = '1000';
        centerBurst.style.pointerEvents = 'none';
        centerBurst.style.boxShadow = '0 0 30px rgba(255,215,0,0.2), 0 0 50px rgba(255,107,107,0.15)'; // More transparent glow
        centerBurst.style.animation = 'firework-center 0.6s ease-out forwards';
        
        document.body.appendChild(centerBurst);
        
        // Create sparkles with both circles AND curved lines for realistic firework effect
        for (let i = 0; i < sparkleCount; i++) {
            setTimeout(() => {
                const angle = (i / sparkleCount) * 2 * Math.PI + (Math.random() - 0.5) * 0.4;
                const distance = (Math.random() * 0.8 + 0.4) * maxDistance;
                const duration = 1500 + Math.random() * 700;
                
                // Create both circle sparkle AND curved line trail
                this.createSparkleWithTrail(x, y, angle, distance, duration, colors, size);
                
            }, i * 6); // Faster stagger for more explosive effect
        }
        
        // Remove center burst
        setTimeout(() => {
            if (document.body.contains(centerBurst)) {
                document.body.removeChild(centerBurst);
            }
        }, 700);
    }
    
    // Create simple larger sparkle - no complex tail for better performance
    createSparkleWithTrail(centerX, centerY, angle, distance, duration, colors, size) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Create MAIN sparkle circle - larger but simple
        const sparkle = document.createElement('div');
        sparkle.style.position = 'fixed';
        sparkle.style.left = centerX + 'px';
        sparkle.style.top = centerY + 'px';
        sparkle.style.width = '10px'; // Nice size but not too heavy
        sparkle.style.height = '10px';
        sparkle.style.background = color;
        sparkle.style.borderRadius = '50%';
        sparkle.style.zIndex = '999';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.transition = `all ${duration}ms ease-out`;
        
        document.body.appendChild(sparkle);
        
        // Simple movement - no complex tail
        setTimeout(() => {
            const spreadMultiplier = 1.5;
            const endX = centerX + Math.cos(angle) * distance * spreadMultiplier;
            const endY = centerY + Math.sin(angle) * distance * spreadMultiplier - Math.random() * 40;
            
            // Simple move and fade
            sparkle.style.left = endX + 'px';
            sparkle.style.top = endY + 'px';
            sparkle.style.opacity = '0';
            sparkle.style.transform = 'scale(0.3)';
        }, 30);
        
        // Quick cleanup
        setTimeout(() => {
            if (document.body.contains(sparkle)) {
                document.body.removeChild(sparkle);
            }
        }, duration);
    }
    
    // Fireworks spread out across the screen - more separated
    showSideFireworks() {
        console.log('Starting spread out fireworks!');
        
        // Left side area fireworks
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const startX = 50 + Math.random() * 150; // Start from left area
                const startY = window.innerHeight - 100; // Start from bottom
                const targetX = window.innerWidth * 0.2 + Math.random() * 250; // Spread in left area
                const targetY = 100 + Math.random() * 300; // Various heights
                
                this.launchFirework(startX, startY, targetX, targetY);
            }, i * 1200); // More time between fireworks
        }
        
        // Center area fireworks
        for (let i = 0; i < 2; i++) {
            setTimeout(() => {
                const startX = window.innerWidth * 0.4 + Math.random() * (window.innerWidth * 0.2); // Center area
                const startY = window.innerHeight - 100;
                const targetX = window.innerWidth * 0.4 + Math.random() * (window.innerWidth * 0.2); // Stay in center
                const targetY = 120 + Math.random() * 250;
                
                this.launchFirework(startX, startY, targetX, targetY);
            }, i * 1500 + 600); // Offset timing
        }
        
        // Right side area fireworks
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const startX = window.innerWidth - 200 + Math.random() * 150; // Start from right area
                const startY = window.innerHeight - 100;
                const targetX = window.innerWidth * 0.7 + Math.random() * 250; // Spread in right area
                const targetY = 100 + Math.random() * 300; // Various heights
                
                this.launchFirework(startX, startY, targetX, targetY);
            }, i * 1200 + 800); // Different timing from left side
        }
    }
    
    // Launch a firework that flies from start point to target point then explodes
    launchFirework(startX, startY, targetX, targetY) {
        // Create the flying firework projectile - much thicker and more visible
        const projectile = document.createElement('div');
        projectile.style.position = 'fixed';
        projectile.style.left = startX + 'px';
        projectile.style.top = startY + 'px';
        projectile.style.width = '12px'; // Much thicker (was 6px)
        projectile.style.height = '12px'; // Much thicker (was 6px)
        projectile.style.background = 'radial-gradient(circle, #FFD700 40%, #FF6B6B 80%, transparent 100%)';
        projectile.style.borderRadius = '50%';
        projectile.style.boxShadow = '0 0 20px #FFD700, 0 0 30px #FF6B6B, 0 0 40px #FFD700'; // Much stronger glow
        projectile.style.zIndex = '1000';
        projectile.style.pointerEvents = 'none';
        projectile.style.transition = 'all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        document.body.appendChild(projectile);
        
        // Animate the projectile flying to target
        setTimeout(() => {
            projectile.style.left = targetX + 'px';
            projectile.style.top = targetY + 'px';
            projectile.style.transform = 'scale(1.8)'; // Scale up more during flight
        }, 50);
        
        // When projectile reaches target, remove it and create explosion
        setTimeout(() => {
            if (document.body.contains(projectile)) {
                document.body.removeChild(projectile);
            }
            // Create the big firework explosion at target location
            this.createFirework(targetX, targetY, 'large');
        }, 1250);
    }
    
    getWeightedRandomPrize() {
        const prizes = Object.keys(this.prizeDistribution);
        const weights = prizes.map(prize => this.prizeDistribution[prize].weight);
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < prizes.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return prizes[i];
            }
        }
        
        return prizes[prizes.length - 1]; // Fallback
    }
    
    // Generate comprehensive preset results for all areas and workers
    generateComprehensivePresetResults() {
        // COMPREHENSIVE REAL WORKER DATABASE WITH PRESET PRIZES
        // Format: 'areaname-workername': { '$50 Cash Prize': count, '$100 Cash Prize': count, '$500 Cash Prize': count }
        const presetResults = {
            // === HONG KONG ISLAND AREAS ===
            'Central-WongKamWing': {
                '$50 Cash Prize': 18, '$100 Cash Prize': 6, '$500 Cash Prize': 1     // Total: $1,900
            },
            'Central-ChanSiuMing': {
                '$50 Cash Prize': 35, '$100 Cash Prize': 12, '$500 Cash Prize': 3    // Total: $4,750
            },
            'Central-LeungWaiMan': {
                '$50 Cash Prize': 22, '$100 Cash Prize': 8, '$500 Cash Prize': 2     // Total: $2,900
            },
            'Central-LiMeiLing': {
                '$50 Cash Prize': 15, '$100 Cash Prize': 5, '$500 Cash Prize': 2     // Total: $2,250
            },
            
            'Admiralty-TangChiKeung': {
                '$50 Cash Prize': 28, '$100 Cash Prize': 9, '$500 Cash Prize': 3     // Total: $3,800
            },
            'Admiralty-YeungSukFan': {
                '$50 Cash Prize': 12, '$100 Cash Prize': 4, '$500 Cash Prize': 1     // Total: $1,500
            },
            'Admiralty-LauHoiYan': {
                '$50 Cash Prize': 25, '$100 Cash Prize': 8, '$500 Cash Prize': 2     // Total: $3,050
            },
            'Admiralty-ChowKinWah': {
                '$50 Cash Prize': 20, '$100 Cash Prize': 7, '$500 Cash Prize': 2     // Total: $2,700
            },
            
            'WanChai-NgWingYiu': {
                '$50 Cash Prize': 32, '$100 Cash Prize': 11, '$500 Cash Prize': 4    // Total: $4,700
            },
            'WanChai-MakYeePing': {
                '$50 Cash Prize': 16, '$100 Cash Prize': 6, '$500 Cash Prize': 1     // Total: $2,100
            },
            'WanChai-TsoiMingFai': {
                '$50 Cash Prize': 24, '$100 Cash Prize': 8, '$500 Cash Prize': 3     // Total: $3,500
            },
            'WanChai-CheungSoWah': {
                '$50 Cash Prize': 19, '$100 Cash Prize': 6, '$500 Cash Prize': 2     // Total: $2,550
            },
            
            'CausewayBay-LamKaYan': {
                '$50 Cash Prize': 40, '$100 Cash Prize': 15, '$500 Cash Prize': 5    // Total: $6,500
            },
            'CausewayBay-WuChiHung': {
                '$50 Cash Prize': 8, '$100 Cash Prize': 3, '$500 Cash Prize': 1      // Total: $1,200
            },
            'CausewayBay-HoSiuLan': {
                '$50 Cash Prize': 27, '$100 Cash Prize': 9, '$500 Cash Prize': 3     // Total: $3,750
            },
            'CausewayBay-KwanYukMing': {
                '$50 Cash Prize': 33, '$100 Cash Prize': 12, '$500 Cash Prize': 4    // Total: $4,850
            },
            
            // === KOWLOON AREAS ===
            'TST-LiuChunWai': {
                '$50 Cash Prize': 45, '$100 Cash Prize': 18, '$500 Cash Prize': 7    // Total: $7,550
            },
            'TST-YipSukYee': {
                '$50 Cash Prize': 14, '$100 Cash Prize': 5, '$500 Cash Prize': 1     // Total: $1,700
            },
            'TST-FungKaiMing': {
                '$50 Cash Prize': 26, '$100 Cash Prize': 9, '$500 Cash Prize': 3     // Total: $3,700
            },
            'TST-ChengMeiYuk': {
                '$50 Cash Prize': 38, '$100 Cash Prize': 13, '$500 Cash Prize': 5    // Total: $5,650
            },
            
            'MongKok-YuenWaiLun': {
                '$50 Cash Prize': 21, '$100 Cash Prize': 7, '$500 Cash Prize': 2     // Total: $2,750
            },
            'MongKok-LeeYinWah': {
                '$50 Cash Prize': 31, '$100 Cash Prize': 11, '$500 Cash Prize': 4    // Total: $4,650
            },
            'MongKok-TamShukLing': {
                '$50 Cash Prize': 17, '$100 Cash Prize': 6, '$500 Cash Prize': 2     // Total: $2,450
            },
            'MongKok-SitKamPo': {
                '$50 Cash Prize': 29, '$100 Cash Prize': 10, '$500 Cash Prize': 3    // Total: $3,950
            },
            
            'YauMaTei-LoiSiuFung': {
                '$50 Cash Prize': 23, '$100 Cash Prize': 8, '$500 Cash Prize': 2     // Total: $2,950
            },
            'YauMaTei-ChanKinYip': {
                '$50 Cash Prize': 36, '$100 Cash Prize': 13, '$500 Cash Prize': 5    // Total: $5,600
            },
            'YauMaTei-WongLaiYing': {
                '$50 Cash Prize': 11, '$100 Cash Prize': 4, '$500 Cash Prize': 1     // Total: $1,450
            },
            'YauMaTei-TseungWaiChung': {
                '$50 Cash Prize': 30, '$100 Cash Prize': 10, '$500 Cash Prize': 4    // Total: $4,500
            },
            
            'HungHom-MaHokKwan': {
                '$50 Cash Prize': 13, '$100 Cash Prize': 5, '$500 Cash Prize': 1     // Total: $1,650
            },
            'HungHom-ChuiMingTak': {
                '$50 Cash Prize': 42, '$100 Cash Prize': 16, '$500 Cash Prize': 6    // Total: $6,700
            },
            'HungHom-KongSumYee': {
                '$50 Cash Prize': 25, '$100 Cash Prize': 9, '$500 Cash Prize': 3     // Total: $3,650
            },
            
            // === NEW TERRITORIES AREAS ===
            'ShaTin-PoonChiWing': {
                '$50 Cash Prize': 34, '$100 Cash Prize': 12, '$500 Cash Prize': 4    // Total: $4,900
            },
            'ShaTin-LokYeePing': {
                '$50 Cash Prize': 19, '$100 Cash Prize': 7, '$500 Cash Prize': 2     // Total: $2,650
            },
            'ShaTin-HuiWaiMing': {
                '$50 Cash Prize': 28, '$100 Cash Prize': 10, '$500 Cash Prize': 3    // Total: $3,900
            },
            'ShaTin-YungSiuLan': {
                '$50 Cash Prize': 16, '$100 Cash Prize': 6, '$500 Cash Prize': 2     // Total: $2,400
            },
            
            'TaiPo-LawKamWah': {
                '$50 Cash Prize': 37, '$100 Cash Prize': 14, '$500 Cash Prize': 5    // Total: $5,750
            },
            'TaiPo-NgaiMeiHong': {
                '$50 Cash Prize': 22, '$100 Cash Prize': 8, '$500 Cash Prize': 2     // Total: $2,900
            },
            'TaiPo-SoYukFan': {
                '$50 Cash Prize': 15, '$100 Cash Prize': 5, '$500 Cash Prize': 1     // Total: $1,750
            },
            
            'TsuenWan-WanHoiLam': {
                '$50 Cash Prize': 41, '$100 Cash Prize': 15, '$500 Cash Prize': 6    // Total: $6,550
            },
            'TsuenWan-YipChunKit': {
                '$50 Cash Prize': 18, '$100 Cash Prize': 6, '$500 Cash Prize': 2     // Total: $2,500
            },
            'TsuenWan-LiuSukMei': {
                '$50 Cash Prize': 26, '$100 Cash Prize': 9, '$500 Cash Prize': 3     // Total: $3,700
            },
            
            'TuenMun-ChanWingHo': {
                '$50 Cash Prize': 32, '$100 Cash Prize': 11, '$500 Cash Prize': 4    // Total: $4,700
            },
            'TuenMun-LeeMingYee': {
                '$50 Cash Prize': 24, '$100 Cash Prize': 8, '$500 Cash Prize': 3     // Total: $3,500
            },
            'TuenMun-KwokSiuWah': {
                '$50 Cash Prize': 9, '$100 Cash Prize': 3, '$500 Cash Prize': 1      // Total: $1,250
            },
            
            'YuenLong-LauChiMing': {
                '$50 Cash Prize': 39, '$100 Cash Prize': 14, '$500 Cash Prize': 5    // Total: $5,850
            },
            'YuenLong-TangSukLan': {
                '$50 Cash Prize': 27, '$100 Cash Prize': 9, '$500 Cash Prize': 3     // Total: $3,750
            },
            'YuenLong-HoKinWai': {
                '$50 Cash Prize': 20, '$100 Cash Prize': 7, '$500 Cash Prize': 2     // Total: $2,700
            },
            
            // === OUTLYING ISLANDS ===
            'Lantau-ChowYeePing': {
                '$50 Cash Prize': 35, '$100 Cash Prize': 12, '$500 Cash Prize': 4    // Total: $4,750
            },
            'Lantau-WongWaiChung': {
                '$50 Cash Prize': 17, '$100 Cash Prize': 6, '$500 Cash Prize': 2     // Total: $2,450
            },
            
            'CheungChau-LiSiuFan': {
                '$50 Cash Prize': 12, '$100 Cash Prize': 4, '$500 Cash Prize': 1     // Total: $1,500
            },
            'CheungChau-NgMingTak': {
                '$50 Cash Prize': 29, '$100 Cash Prize': 10, '$500 Cash Prize': 3    // Total: $3,950
            }
            
            // Total: 50+ real workers across all major Hong Kong areas
        };
        
        return presetResults;
    }
    
    // Calculate realistic prize distribution based on ticket count  
    calculatePrizeDistribution(ticketCount) {
        // Base probabilities: 67% $50, 22% $100, 11% $500
        let fiftyCount = Math.round(ticketCount * 0.67);
        let hundredCount = Math.round(ticketCount * 0.22);
        let fiveHundredCount = Math.round(ticketCount * 0.11);
        
        // Ensure total matches ticket count
        let totalPrizes = fiftyCount + hundredCount + fiveHundredCount;
        if (totalPrizes !== ticketCount) {
            const diff = ticketCount - totalPrizes;
            fiftyCount += diff; // Adjust with $50 prizes
        }
        
        // Ensure minimum values
        fiftyCount = Math.max(1, fiftyCount);
        hundredCount = Math.max(ticketCount > 10 ? 1 : 0, hundredCount);
        fiveHundredCount = Math.max(ticketCount > 20 ? 1 : 0, fiveHundredCount);
        
        return {
            '$50 Cash Prize': fiftyCount,
            '$100 Cash Prize': hundredCount,
            '$500 Cash Prize': fiveHundredCount
        };
    }
    
    // Generate players object from area configurations
    generatePlayersFromAreas() {
        const players = {};
        
        // COMPREHENSIVE REAL WORKER DATABASE - Matches preset results above
        const areaConfigurations = [
            // === HONG KONG ISLAND AREAS ===
            { areaName: 'Central', workers: [
                { name: 'WongKamWing', tickets: 25 },
                { name: 'ChanSiuMing', tickets: 50 },
                { name: 'LeungWaiMan', tickets: 32 },
                { name: 'LiMeiLing', tickets: 22 }
            ]},
            { areaName: 'Admiralty', workers: [
                { name: 'TangChiKeung', tickets: 40 },
                { name: 'YeungSukFan', tickets: 17 },
                { name: 'LauHoiYan', tickets: 35 },
                { name: 'ChowKinWah', tickets: 29 }
            ]},
            { areaName: 'WanChai', workers: [
                { name: 'NgWingYiu', tickets: 47 },
                { name: 'MakYeePing', tickets: 23 },
                { name: 'TsoiMingFai', tickets: 35 },
                { name: 'CheungSoWah', tickets: 27 }
            ]},
            { areaName: 'CausewayBay', workers: [
                { name: 'LamKaYan', tickets: 60 },
                { name: 'WuChiHung', tickets: 12 },
                { name: 'HoSiuLan', tickets: 39 },
                { name: 'KwanYukMing', tickets: 49 }
            ]},
            
            // === KOWLOON AREAS ===
            { areaName: 'TST', workers: [
                { name: 'LiuChunWai', tickets: 70 },
                { name: 'YipSukYee', tickets: 20 },
                { name: 'FungKaiMing', tickets: 38 },
                { name: 'ChengMeiYuk', tickets: 56 }
            ]},
            { areaName: 'MongKok', workers: [
                { name: 'YuenWaiLun', tickets: 30 },
                { name: 'LeeYinWah', tickets: 46 },
                { name: 'TamShukLing', tickets: 25 },
                { name: 'SitKamPo', tickets: 42 }
            ]},
            { areaName: 'YauMaTei', workers: [
                { name: 'LoiSiuFung', tickets: 33 },
                { name: 'ChanKinYip', tickets: 54 },
                { name: 'WongLaiYing', tickets: 16 },
                { name: 'TseungWaiChung', tickets: 44 }
            ]},
            { areaName: 'HungHom', workers: [
                { name: 'MaHokKwan', tickets: 19 },
                { name: 'ChuiMingTak', tickets: 64 },
                { name: 'KongSumYee', tickets: 37 }
            ]},
            
            // === NEW TERRITORIES AREAS ===
            { areaName: 'ShaTin', workers: [
                { name: 'PoonChiWing', tickets: 50 },
                { name: 'LokYeePing', tickets: 28 },
                { name: 'HuiWaiMing', tickets: 41 },
                { name: 'YungSiuLan', tickets: 24 }
            ]},
            { areaName: 'TaiPo', workers: [
                { name: 'LawKamWah', tickets: 56 },
                { name: 'NgaiMeiHong', tickets: 32 },
                { name: 'SoYukFan', tickets: 21 }
            ]},
            { areaName: 'TsuenWan', workers: [
                { name: 'WanHoiLam', tickets: 62 },
                { name: 'YipChunKit', tickets: 26 },
                { name: 'LiuSukMei', tickets: 38 }
            ]},
            { areaName: 'TuenMun', workers: [
                { name: 'ChanWingHo', tickets: 47 },
                { name: 'LeeMingYee', tickets: 35 },
                { name: 'KwokSiuWah', tickets: 13 }
            ]},
            { areaName: 'YuenLong', workers: [
                { name: 'LauChiMing', tickets: 58 },
                { name: 'TangSukLan', tickets: 39 },
                { name: 'HoKinWai', tickets: 29 }
            ]},
            
            // === OUTLYING ISLANDS ===
            { areaName: 'Lantau', workers: [
                { name: 'ChowYeePing', tickets: 51 },
                { name: 'WongWaiChung', tickets: 25 }
            ]},
            { areaName: 'CheungChau', workers: [
                { name: 'LiSiuFan', tickets: 17 },
                { name: 'NgMingTak', tickets: 42 }
            ]}
            
            // Total: 50+ real workers across all major Hong Kong areas
            // Ticket counts calculated based on preset prize totals
        ];
        
        areaConfigurations.forEach(area => {
            area.workers.forEach(worker => {
                const workerId = `${area.areaName}-${worker.name}`;
                players[workerId] = {
                    name: `${worker.name} (${area.areaName})`,
                    tickets: worker.tickets,
                    remaining: worker.tickets,
                    totalWinnings: 0
                };
            });
        });
        
        return players;
    }
    
    showConfetti(sourceElement) {
        const container = document.getElementById('confetti-container');
        const rect = sourceElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const colors = ['#FFD700', '#FFA500', '#FF6347', '#32CD32', '#1E90FF', '#FF1493'];
        const emojis = ['💰', '💵', '💸', '🎉', '⭐', '✨'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                
                if (Math.random() < 0.3) {
                    confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                    confetti.style.fontSize = '28px'; // Much bigger emoji size
                } else {
                    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                    confetti.style.width = '8px';
                    confetti.style.height = '8px';
                }
                
                confetti.style.left = centerX + 'px';
                confetti.style.top = centerY + 'px';
                confetti.style.setProperty('--drift', `${(Math.random() - 0.5) * 300}px`);
                confetti.style.animation = 'confetti-winner-explode 4s linear forwards';
                
                container.appendChild(confetti);
                
                setTimeout(() => {
                    confetti.remove();
                }, 4000);
            }, i * 20);
        }
    }
    
    // Method to toggle between preset and random results
    setPresetMode(usePreset) {
        this.usePresetResults = usePreset;
        console.log(`Results mode: ${usePreset ? 'PRESET' : 'RANDOM'}`);
    }
    
    // Method to display current preset configuration
    showPresetResults() {
        console.log("=== PRESET RESULTS CONFIGURATION ===");
        console.log(`Mode: ${this.usePresetResults ? 'PRESET ENABLED' : 'RANDOM ENABLED'}`);
        
        if (this.usePresetResults) {
            Object.entries(this.presetResults).forEach(([playerId, presets]) => {
                const player = this.players[playerId];
                console.log(`\n🎯 ${player.name} (${player.tickets} tickets):`);
                
                let totalPresetTickets = 0;
                let totalPresetValue = 0;
                
                Object.entries(presets).forEach(([prize, count]) => {
                    const value = this.prizeDistribution[prize].value;
                    const totalValue = value * count;
                    totalPresetTickets += count;
                    totalPresetValue += totalValue;
                    console.log(`   ${prize}: ${count}x = $${totalValue}`);
                });
                
                console.log(`   📊 Total: ${totalPresetTickets} tickets, $${totalPresetValue} value`);
                
                if (totalPresetTickets !== player.tickets) {
                    console.warn(`   ⚠️ WARNING: Preset tickets (${totalPresetTickets}) ≠ Player tickets (${player.tickets})`);
                }
            });
        }
        
        return this.presetResults;
    }
    
    // Method to get detailed worker results - shows exactly what each worker won
    getWorkerResults() {
        console.log("=== DETAILED WORKER RESULTS ===");
        Object.entries(this.workerResults).forEach(([playerId, results]) => {
            console.log(`\n🏆 ${results.playerName} (${results.ticketsUsed} tickets):`);
            console.log(`💰 Total Winnings: $${results.totalWinnings}`);
            console.log("📊 Prize Breakdown:");
            
            Object.entries(results.prizeBreakdown).forEach(([prize, count]) => {
                if (count > 0) {
                    const value = this.prizeDistribution[prize].value;
                    const totalForPrize = value * count;
                    console.log(`   ${prize}: ${count}x = $${totalForPrize}`);
                }
            });
            
            console.log("🎁 Individual Prizes Won:");
            results.individualPrizes.forEach((prize, index) => {
                const value = this.prizeDistribution[prize].value;
                console.log(`   Ticket ${index + 1}: ${prize} ($${value})`);
            });
        });
        
        return this.workerResults;
    }
    
    // Method to get player statistics
    getPlayerStats() {
        return Object.entries(this.players).map(([id, player]) => ({
            id,
            name: player.name,
            totalTickets: player.tickets,
            usedTickets: player.tickets - player.remaining,
            remainingTickets: player.remaining,
            totalWinnings: player.totalWinnings
        }));
    }
    
    // Firework-style celebration with colored circles
    showMiniCelebration(block) {
        const rect = block.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Firework colors - bright and vibrant
        const fireworkColors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF1493'];
        
        // Create 8-10 small colored circles
        const sparkCount = 8 + Math.floor(Math.random() * 3); // 8-10 sparks
        
        for (let i = 0; i < sparkCount; i++) {
            const spark = document.createElement('div');
            spark.style.position = 'fixed';
            spark.style.left = centerX + 'px';
            spark.style.top = centerY + 'px';
            spark.style.width = '12px'; // Larger circles
            spark.style.height = '12px'; // Larger circles
            spark.style.borderRadius = '50%';
            spark.style.backgroundColor = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
            spark.style.boxShadow = `0 0 15px ${fireworkColors[Math.floor(Math.random() * fireworkColors.length)]}`; // Bigger glow
            spark.style.zIndex = '1000';
            spark.style.pointerEvents = 'none';
            spark.style.opacity = '1';
            spark.style.transition = 'all 1.0s ease-out'; // Smooth transition
            
            document.body.appendChild(spark);
            
            // Animate sparks radiating outward like firework
            setTimeout(() => {
                const angle = (i / sparkCount) * 2 * Math.PI + (Math.random() - 0.5) * 0.3;
                const distance = 60 + Math.random() * 40; // Larger spread: 60-100px
                const newX = centerX + Math.cos(angle) * distance;
                const newY = centerY + Math.sin(angle) * distance - Math.random() * 20; // More upward bias
                
                spark.style.left = newX + 'px';
                spark.style.top = newY + 'px';
                spark.style.opacity = '0'; // Gradual fade
                spark.style.transform = 'scale(0.3)'; // Shrink as they fade
            }, 50 + i * 20); // Slight stagger for more realistic effect
            
            // Remove spark after fade
            setTimeout(() => {
                if (document.body.contains(spark)) {
                    document.body.removeChild(spark);
                }
            }, 1200);
        }
    }
    
    // Cash animation for Total Winnings increases
    showCashAnimation(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Focus on CASH and DOLLAR SIGNS mainly
        const cashAndDollarEmojis = ['�', '�', '�', '�', '�', '💲', '�', '💸', '💵', '💲'];
        
        cashAndDollarEmojis.forEach((emoji, index) => {
            const cashElement = document.createElement('div');
            cashElement.textContent = emoji;
            cashElement.style.position = 'fixed';
            cashElement.style.left = centerX + 'px';
            cashElement.style.top = centerY + 'px';
            cashElement.style.fontSize = '22px'; // Bigger emojis
            cashElement.style.zIndex = '1000';
            cashElement.style.pointerEvents = 'none';
            cashElement.style.transition = 'all 0.8s ease-out';
            
            document.body.appendChild(cashElement);
            
            // Animate upward and outward with MUCH BIGGER circle to avoid covering numbers
            setTimeout(() => {
                const angle = (index * 36) * (Math.PI / 180); // 36 degrees apart for 10 emojis
                const distance = 120 + Math.random() * 40; // MUCH BIGGER circle radius (was 70+30)
                const newX = centerX + Math.cos(angle) * distance;
                const newY = centerY - 80 + Math.sin(angle) * distance; // Move higher up
                
                cashElement.style.left = newX + 'px';
                cashElement.style.top = newY + 'px';
                cashElement.style.opacity = '0';
                cashElement.style.transform = 'scale(0.3) rotate(360deg)';
            }, 50);
            
            // Remove element
            setTimeout(() => {
                document.body.removeChild(cashElement);
            }, 900);
        });
    }
    
    // Spectacular button explosion animation
    explodeButton(button) {
        // Start the main button explosion animation
        button.style.animation = 'buttonExplode 1s ease-out forwards';
        
        // Get button position for particle origin
        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Create bubble particles
        const particleCount = 25;
        const colors = [
            '#f87171', '#ef4444', '#dc2626', '#b91c1c',  // Red theme
            '#fbbf24', '#f59e0b', '#d97706', '#b45309',  // Gold theme
            '#ffffff', '#f3f4f6', '#e5e7eb'              // White/light theme
        ];
        
        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'button-particle';
                
                // Random size between 8-16px
                const size = 8 + Math.random() * 8;
                particle.style.width = size + 'px';
                particle.style.height = size + 'px';
                
                // Random color from theme
                particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                
                // Start from button center
                particle.style.left = centerX + 'px';
                particle.style.top = centerY + 'px';
                particle.style.position = 'fixed';
                particle.style.zIndex = '1000';
                
                // Random direction for bubble movement
                const angle = (i / particleCount) * 2 * Math.PI + (Math.random() - 0.5) * 0.5;
                const distance = 80 + Math.random() * 60; // 80-140px distance
                const bubbleX = Math.cos(angle) * distance;
                const bubbleY = Math.sin(angle) * distance;
                
                particle.style.setProperty('--bubble-x', bubbleX + 'px');
                particle.style.setProperty('--bubble-y', bubbleY + 'px');
                
                // Add glow effect for some particles
                if (Math.random() < 0.3) {
                    particle.style.boxShadow = `0 0 ${size}px rgba(248, 113, 113, 0.8)`;
                }
                
                document.body.appendChild(particle);
                
                // Remove particle after animation
                setTimeout(() => {
                    if (document.body.contains(particle)) {
                        document.body.removeChild(particle);
                    }
                }, 1500);
                
            }, i * 20); // Stagger particle creation
        }
        
        // Reset button animation after completion (for future use)
        setTimeout(() => {
            button.style.animation = '';
        }, 1000);
    }

    // MASSIVE money animation when ALL drawing is complete
    showMassiveMoneyAnimation(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // ALL money emojis + rectangular ribbons - bigger celebration!
        const allMoneyEmojis = [
            '💰', '💵', '💸', '💴', '💷', '💶', '🤑', '💲',
            '💰', '💵', '💸', '💴', '💷', '💶', '🤑', '💲',
            '💰', '💵', '💸', '💴', '💷', '💶', '🤑', '💲'
        ]; // Triple the money emojis for MASSIVE effect!
        
        // Add rectangular ribbons for final celebration
        const ribbonEmojis = ['🎀', '🎊', '🎁', '🎗️', '🎀', '🎊', '🎁', '🎗️'];
        
        // Combine money and ribbons
        const finalCelebrationEmojis = [...allMoneyEmojis, ...ribbonEmojis];
        
        // Create multiple waves of money + ribbons
        for (let wave = 0; wave < 3; wave++) {
            setTimeout(() => {
                finalCelebrationEmojis.forEach((emoji, index) => {
                    const moneyElement = document.createElement('div');
                    moneyElement.textContent = emoji;
                    moneyElement.style.position = 'fixed';
                    moneyElement.style.left = centerX + 'px';
                    moneyElement.style.top = centerY + 'px';
                    moneyElement.style.fontSize = '28px'; // MUCH bigger emojis for finale
                    moneyElement.style.zIndex = '1000';
                    moneyElement.style.pointerEvents = 'none';
                    moneyElement.style.transition = 'all 1.2s ease-out'; // Longer animation
                    
                    document.body.appendChild(moneyElement);
                    
                    // Animate in all directions with MASSIVE spread
                    setTimeout(() => {
                        const angle = (index * 15) * (Math.PI / 180); // 15 degrees apart
                        const distance = 120 + Math.random() * 80; // MASSIVE circle radius
                        const newX = centerX + Math.cos(angle) * distance;
                        const newY = centerY - 80 + Math.sin(angle) * distance; // Much higher from top
                        
                        moneyElement.style.left = newX + 'px';
                        moneyElement.style.top = newY + 'px';
                        moneyElement.style.opacity = '0';
                        moneyElement.style.transform = 'scale(0.2) rotate(720deg)'; // Double rotation
                    }, 100);
                    
                    // Remove element
                    setTimeout(() => {
                        if (document.body.contains(moneyElement)) {
                            document.body.removeChild(moneyElement);
                        }
                    }, 1300);
                });
            }, wave * 300); // Stagger the waves
        }
    }
}

// Initialize the lottery system
document.addEventListener('DOMContentLoaded', () => {
    window.salesLottery = new SalesLottery();
});
