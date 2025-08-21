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
            
            // Show and enable the draw button prominently
            const drawBtn = document.getElementById('draw-btn');
            if (drawBtn) {
                drawBtn.style.display = 'block';
                drawBtn.style.visibility = 'visible';
                drawBtn.style.opacity = '1';
                drawBtn.disabled = false;
                
                // Add a bit of animation to draw attention
                setTimeout(() => {
                    drawBtn.style.transform = 'scale(1.02)';
                    setTimeout(() => {
                        drawBtn.style.transform = 'scale(1)';
                    }, 200);
                }, 100);
            }
        }
    }
    
    updatePlayerDisplay() {
        if (!this.currentPlayer) return;
        
        const player = this.players[this.currentPlayer];
        document.getElementById('player-name').textContent = player.name;
        document.getElementById('remaining-tickets').textContent = `${player.remaining}/${player.tickets}`;
    }
    
    selectPlayer(playerId) {
        if (!playerId) {
            this.currentPlayer = null;
            document.getElementById('player-name').textContent = 'Select Player';
            document.getElementById('remaining-tickets').textContent = '/';
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
        console.log('Current player:', this.currentPlayer);
        console.log('Is drawing:', this.isDrawing);
        
        if (!this.currentPlayer || this.isDrawing) {
            console.log('Cannot start draw - no player or already drawing');
            return;
        }
        
        const player = this.players[this.currentPlayer];
        console.log('Player data:', player);
        
        if (player.remaining <= 0) {
            console.log('No tickets remaining');
            return;
        }
        
        console.log('startBulkDraw called - ensuring pre-drawing animation is stopped');
        
        // Stop pre-drawing animation immediately
        if (window.blocksLottery && window.blocksLottery.stopPreDrawingAnimation) {
            console.log('Calling stopPreDrawingAnimation from startBulkDraw...');
            window.blocksLottery.stopPreDrawingAnimation();
        } else {
            console.warn('blocksLottery not available in startBulkDraw');
        }
        
        this.isDrawing = true;
        console.log('Set isDrawing to true');
        
        // Hide the pre-draw indicator
        const indicator = document.getElementById('pre-draw-indicator');
        if (indicator) {
            indicator.style.display = 'none';
            console.log('Hid pre-draw indicator');
        }
        
        // Disable all controls during drawing
        this.disableControlsDuringDrawing();
        console.log('Disabled controls during drawing');
        
        // Get the draw button for explosion animation
        const drawButton = document.getElementById('draw-btn');
        console.log('Draw button element:', drawButton);
        
        // Start button explosion animation
        console.log('Starting button explosion...');
        this.explodeButton(drawButton);
        
        // Add light ray emission effect
        document.querySelector('.container').classList.add('light-rays');
        console.log('Added light-rays class');
        
        // Set initial drawing state for container only
        document.querySelector('.container').classList.add('drawing');
        console.log('Added drawing class to container');
        
        // Hide draw button after explosion starts (with delay)
        setTimeout(() => {
            document.getElementById('draw-btn').style.display = 'none';
        }, 800); // Hide after explosion animation
        
        // Show summary box after button explosion
        setTimeout(() => {
            document.getElementById('results-summary').classList.remove('hidden');
        }, 600);
        
        // Clear winner text - rely on Tickets Drawn counter for progress
        document.getElementById('winner').textContent = '';
        
        // Remove light rays after 2-second red explosion
        setTimeout(() => {
            document.querySelector('.container').classList.remove('light-rays');
        }, 2000);
        
        // Start the actual drawing process after 2-second excitement period
        setTimeout(() => {
            this.isDrawing = true;
            // Add drawing animation to summary box during actual drawing
            document.getElementById('results-summary').classList.add('drawing');
            // Start the bulk drawing animation
            this.animateBulkDraw();
        }, 2000);
    }
    
    animateBulkDraw() {
        const blocks = document.querySelectorAll('.block');
        const player = this.players[this.currentPlayer];
        const ticketCount = player.tickets;
        
        // Start multiple simultaneous animations
        this.startMultipleAnimations(blocks, ticketCount);
    }
    
    startMultipleAnimations(blocks, ticketCount) {
        // Faster timing: target about 6 seconds for 25 tickets
        const targetTimeFor25 = 6000; // 6 seconds for 25 tickets
        const timePerTicket = targetTimeFor25 / 25; // 240ms per ticket
        const totalAnimationTime = timePerTicket * ticketCount;
        
        console.log(`Drawing ${ticketCount} tickets - Total time: ${(totalAnimationTime/1000).toFixed(1)} seconds`);
        
        // Get the actual results we will show
        const actualResults = this.getActualWinningResults(ticketCount);
        
        // Initialize real-time counting display
        this.initializeRealtimeCounters();
        
        // Show golden animations for EVERY prize
        const totalPrizes = actualResults.length;
        const animationPromises = [];
        
        // Calculate timing - much faster now
        const timePerAnimation = Math.max(150, totalAnimationTime / totalPrizes); // At least 150ms per animation
        
        console.log(`Showing ${totalPrizes} golden animations over ${(totalAnimationTime/1000).toFixed(1)} seconds`);
        
        // Create realistic rolling animations that stop on actual winning prizes
        for (let i = 0; i < totalPrizes; i++) {
            const promise = new Promise((resolve) => {
                const startDelay = i * timePerAnimation; // Evenly spaced animations
                const winningPrize = actualResults[i]; // Each animation shows one actual prize
                
                setTimeout(() => {
                    this.animateRealisticDraw(blocks, winningPrize, i + 1, totalPrizes).then(resolve);
                }, startDelay);
            });
            animationPromises.push(promise);
        }
        
        // When all animations complete, process results
        Promise.all(animationPromises).then(() => {
            setTimeout(() => {
                this.processBulkResults();
            }, 300);
        });
    }
    
    // Initialize real-time counters that update as golden flashes appear
    initializeRealtimeCounters() {
        const prizeCountsDiv = document.getElementById('prize-counts');
        const resultsBox = document.getElementById('results-summary');
        
        // Show the results box immediately but with zero counts
        resultsBox.classList.remove('hidden');
        
        // Only initialize if we don't already have counters running
        if (!this.realtimeCounters || Object.keys(this.realtimeCounters).length === 0) {
            // Initialize display with all possible prizes at 0
            prizeCountsDiv.innerHTML = '';
            this.realtimeCounters = {};
            this.ticketsDrawnCount = 0;
            
            Object.keys(this.prizeDistribution).forEach(prize => {
                this.realtimeCounters[prize] = 0;
                
                const prizeItem = document.createElement('div');
                prizeItem.className = 'prize-item';
                prizeItem.id = `counter-${prize.replace(/\s+/g, '-').replace(/\$/g, '')}`;
                
                prizeItem.innerHTML = `
                    <span>${prize}</span>
                    <span class="count">0</span>
                `;
                prizeCountsDiv.appendChild(prizeItem);
            });
            
            // Initialize total winnings and tickets drawn at 0
            document.getElementById('total-amount').textContent = '$0';
            document.getElementById('tickets-drawn').textContent = '0';
            this.realtimeTotalWinnings = 0;
        }
        
        console.log('Real-time counters initialized. Total winnings:', this.realtimeTotalWinnings);
    }
    
    // Update counter when a golden flash appears (with realistic delay and effect)
    updateRealtimeCounter(prizeName) {
        // RULE: After each golden flash, increment both tickets drawn AND the specific prize
        
        // 1. Increment tickets drawn counter
        this.ticketsDrawnCount++;
        
        // 2. Increment the specific prize counter
        this.realtimeCounters[prizeName]++;
        const prizeValue = this.prizeDistribution[prizeName].value;
        
        // Log before adding to catch any issues
        const oldTotal = this.realtimeTotalWinnings;
        this.realtimeTotalWinnings += prizeValue;
        
        console.log(`Prize won: ${prizeName} (+$${prizeValue}). Total: $${oldTotal} → $${this.realtimeTotalWinnings}`);
        
        // Update tickets drawn display
        setTimeout(() => {
            const ticketsElement = document.getElementById('tickets-drawn');
            ticketsElement.style.transition = 'all 0.3s ease-out';
            ticketsElement.style.transform = 'scale(1.05)';
            ticketsElement.style.background = 'rgba(248, 113, 113, 0.6)';
            ticketsElement.style.borderRadius = '8px';
            ticketsElement.style.padding = '4px 8px';
            ticketsElement.textContent = this.ticketsDrawnCount;
            
            setTimeout(() => {
                ticketsElement.style.transform = 'scale(1)';
                ticketsElement.style.background = 'transparent';
                ticketsElement.style.padding = '0';
            }, 300);
        }, 50);
        
        // Update specific prize counter display
        const counterId = `counter-${prizeName.replace(/\s+/g, '-').replace(/\$/g, '')}`;
        const counterElement = document.getElementById(counterId);
        
        if (counterElement) {
            const countSpan = counterElement.querySelector('.count');
            const newCount = this.realtimeCounters[prizeName];
            
            // Add consistent red/golden background flash effect
            setTimeout(() => {
                countSpan.style.transition = 'all 0.3s ease-out';
                countSpan.style.background = 'linear-gradient(135deg, rgba(248, 113, 113, 0.8), rgba(255, 215, 0, 0.6))';
                countSpan.style.transform = 'scale(1.15)';
                countSpan.style.borderRadius = '8px';
                countSpan.style.padding = '4px 8px';
                countSpan.style.color = '#fff';
                countSpan.style.fontWeight = 'bold';
                countSpan.style.border = '2px solid rgba(255, 215, 0, 0.8)';
                countSpan.textContent = newCount;
                
                setTimeout(() => {
                    countSpan.style.transform = 'scale(1)';
                    // Keep the red circle background - don't clear it!
                    // countSpan.style.background = 'transparent';
                    // countSpan.style.color = 'inherit';
                    // countSpan.style.fontWeight = 'inherit';
                    // countSpan.style.border = 'none';
                    // countSpan.style.padding = '0';
                }, 400);
            }, 50);
        }
        
        // Update total winnings with same delay and proper formatting
        setTimeout(() => {
            const totalElement = document.getElementById('total-amount');
            totalElement.style.transition = 'all 0.3s ease-out';
            totalElement.style.transform = 'scale(1.05)';
            totalElement.style.background = 'rgba(255, 215, 0, 0.6)';
            totalElement.style.borderRadius = '8px';
            totalElement.style.padding = '4px 8px';
            
            // Format the total as currency for clarity
            totalElement.textContent = `$${this.realtimeTotalWinnings.toLocaleString()}`;
            
            // Add cash and money emoji animation for Total Winnings
            this.showCashAnimation(totalElement);
            
            setTimeout(() => {
                totalElement.style.transform = 'scale(1)';
                totalElement.style.background = 'transparent';
                totalElement.style.padding = '0';
            }, 300);
        }, 50);
    }
    
    // Get actual winning results for realistic animation
    getActualWinningResults(ticketCount) {
        const winningPrizes = [];
        
        if (this.usePresetResults && this.presetResults[this.currentPlayer]) {
            const preset = this.presetResults[this.currentPlayer];
            
            // Create array of actual winning prizes
            Object.entries(preset).forEach(([prize, count]) => {
                for (let i = 0; i < count; i++) {
                    winningPrizes.push(prize);
                }
            });
            
            // Shuffle the prizes for random order during animation
            return winningPrizes.sort(() => Math.random() - 0.5);
        } else {
            // For random mode, generate prizes normally
            for (let i = 0; i < ticketCount; i++) {
                winningPrizes.push(this.getWeightedRandomPrize());
            }
            return winningPrizes;
        }
    }
    
    // Animate a realistic draw that rolls through blocks and stops on winning prize
    animateRealisticDraw(blocks, targetPrize, drawNumber = 1, totalDraws = 1) {
        return new Promise((resolve) => {
            // Clear progress message - use Tickets Drawn counter instead
            document.getElementById('winner').textContent = '';
            
            // Find all blocks that match the target prize
            const matchingBlocks = Array.from(blocks).filter(block => 
                block.getAttribute('data-name') === targetPrize
            );
            
            if (matchingBlocks.length === 0) {
                console.warn(`No blocks found for prize: ${targetPrize}`);
                resolve();
                return;
            }
            
            // For realistic probability, choose block based on position weight
            const targetBlock = this.getRealisticTargetBlock(matchingBlocks, targetPrize);
            const blockArray = Array.from(blocks);
            const targetIndex = blockArray.indexOf(targetBlock);
            
            let currentIndex = 0;
            let rounds = 0;
            const maxRounds = 1; // Just 1 round for speed
            let speed = 50; // Much faster starting speed
            
            const animate = () => {
                // Remove previous highlight
                blocks.forEach(block => block.classList.remove('highlight', 'rolling'));
                
                // Add rolling highlight to current block
                blockArray[currentIndex].classList.add('highlight', 'rolling');
                
                currentIndex = (currentIndex + 1) % blockArray.length;
                
                // Count rounds
                if (currentIndex === 0) rounds++;
                
                // Check if we should stop (reached target after enough rounds)
                if (rounds >= maxRounds && currentIndex === targetIndex) {
                    // Final highlight on winning block
                    setTimeout(() => {
                        blocks.forEach(block => block.classList.remove('highlight', 'rolling'));
                        targetBlock.classList.add('golden-win');
                        
                        // IMPORTANT: Update counter AFTER golden flash appears (150ms delay)
                        setTimeout(() => {
                            this.updateRealtimeCounter(targetPrize);
                            // Add mini celebration with ribbons and money
                            this.showMiniCelebration(targetBlock);
                        }, 150); // Wait 150ms after golden flash starts
                        
                        setTimeout(() => {
                            targetBlock.classList.remove('golden-win');
                            resolve();
                        }, 300); // 0.3 second golden win
                        
                    }, speed);
                    return;
                }
                
                // Gradually slow down in the last round
                if (rounds >= maxRounds - 1) {
                    speed = Math.min(speed * 1.1, 120); // Slow down quickly
                }
                
                setTimeout(animate, speed);
            };
            
            animate();
        });
    }
    
    // Choose realistic target block based on position and frequency
    getRealisticTargetBlock(matchingBlocks, targetPrize) {
        // Get how many times this prize should appear based on preset
        let expectedCount = 0;
        if (this.usePresetResults && this.presetResults[this.currentPlayer]) {
            expectedCount = this.presetResults[this.currentPlayer][targetPrize] || 0;
        }
        
        // Track how many times each block has been selected (you could enhance this)
        if (!this.blockSelectionCount) {
            this.blockSelectionCount = {};
        }
        
        // For $50 prizes, distribute more realistically across the 6 blocks
        if (targetPrize === '$50 Cash Prize') {
            // Create weighted selection based on position
            const weights = matchingBlocks.map((block, index) => {
                const blockId = Array.from(document.querySelectorAll('.block')).indexOf(block);
                const timesSelected = this.blockSelectionCount[blockId] || 0;
                
                // Give slight preference to earlier positions, but balance usage
                const positionWeight = Math.max(1, 7 - (timesSelected * 2));
                return positionWeight;
            });
            
            const totalWeight = weights.reduce((sum, w) => sum + w, 0);
            let random = Math.random() * totalWeight;
            
            for (let i = 0; i < matchingBlocks.length; i++) {
                random -= weights[i];
                if (random <= 0) {
                    const selectedBlock = matchingBlocks[i];
                    const blockId = Array.from(document.querySelectorAll('.block')).indexOf(selectedBlock);
                    this.blockSelectionCount[blockId] = (this.blockSelectionCount[blockId] || 0) + 1;
                    return selectedBlock;
                }
            }
        }
        
        // For $100 prizes, alternate between the 2 blocks
        if (targetPrize === '$100 Cash Prize') {
            if (!this.lastSelectedBlock100) {
                this.lastSelectedBlock100 = 0;
            }
            const selectedBlock = matchingBlocks[this.lastSelectedBlock100 % matchingBlocks.length];
            this.lastSelectedBlock100++;
            return selectedBlock;
        }
        
        // For $500 prize, always use the single block
        if (targetPrize === '$500 Cash Prize') {
            return matchingBlocks[0];
        }
        
        // Default: random selection
        return matchingBlocks[Math.floor(Math.random() * matchingBlocks.length)];
    }
    
    animateSingleDraw(blocks, animationType, duration) {
        return new Promise((resolve) => {
            const randomBlocks = [...blocks].sort(() => Math.random() - 0.5);
            const animateBlocks = randomBlocks.slice(0, Math.floor(Math.random() * 3) + 2); // 2-4 blocks
            
            // Add animation class
            animateBlocks.forEach(block => {
                block.classList.add(animationType === 'fast' ? 'fast-draw' : 'slow-draw');
            });
            
            setTimeout(() => {
                // Remove animation class
                animateBlocks.forEach(block => {
                    block.classList.remove('fast-draw', 'slow-draw');
                });
                
                // Show golden win animation for multiple blocks (simulate multiple wins)
                const numberOfWins = Math.floor(Math.random() * 3) + 1; // 1-3 wins per animation
                const winnerBlocks = animateBlocks.slice(0, numberOfWins);
                
                // Stagger golden animations by 0.3 seconds each
                winnerBlocks.forEach((winnerBlock, index) => {
                    setTimeout(() => {
                        winnerBlock.classList.add('golden-win');
                        
                        setTimeout(() => {
                            winnerBlock.classList.remove('golden-win');
                            
                            // Resolve when last golden animation finishes
                            if (index === winnerBlocks.length - 1) {
                                resolve();
                            }
                        }, 300); // 0.3 second golden animation
                        
                    }, index * 300); // Stagger by 0.3 seconds
                });
                
                // Fallback resolve in case no golden animations
                if (numberOfWins === 0) {
                    resolve();
                }
                
            }, duration);
        });
    }
    
    processBulkResults() {
        const blocks = document.querySelectorAll('.block');
        const player = this.players[this.currentPlayer];
        const ticketsToProcess = player.remaining;
        
        // Clear all highlights
        blocks.forEach(block => block.classList.remove('highlight'));
        
        // Draw all tickets at once (for final calculation)
        const results = this.drawAllTickets(ticketsToProcess);
        
        // Ensure we have results and calculate properly
        let prizeBreakdown = {};
        if (results && results.length > 0) {
            prizeBreakdown = results[0].counts;
        } else {
            // Fallback: create empty prize breakdown
            Object.keys(this.prizeDistribution).forEach(prize => {
                prizeBreakdown[prize] = 0;
            });
        }
        
        // Update player data
        player.remaining = 0;
        const totalWinnings = results.reduce((sum, result) => sum + result.value, 0);
        player.totalWinnings += totalWinnings;
        
        // Store individual worker results for detailed tracking
        this.workerResults[this.currentPlayer] = {
            playerName: player.name,
            ticketsUsed: ticketsToProcess,
            totalWinnings: totalWinnings,
            prizeBreakdown: prizeBreakdown, // Safe prize counts for this worker
            individualPrizes: results.map(r => r.prize) // List of each prize won
        };
        
        // Final processing complete - rely on Tickets Drawn counter for status
        document.getElementById('winner').textContent = '';
        
        // Update UI
        document.getElementById('remaining-tickets').textContent = '0';
        
        // Show massive confetti celebration
        console.log('Starting massive confetti celebration!');
        this.showMassiveConfetti();
        
        // Add fireworks from both sides
        setTimeout(() => {
            this.showSideFireworks();
        }, 500); // Start fireworks 0.5 seconds after confetti
        
        // Show BIG money animation on Total Winnings when all drawing complete
        setTimeout(() => {
            const totalElement = document.getElementById('total-amount');
            this.showMassiveMoneyAnimation(totalElement);
        }, 500); // Small delay after confetti starts
        
        // Reset drawing state
        setTimeout(() => {
            document.querySelector('.container').classList.remove('drawing');
            // Keep light beam for a bit longer after drawing completes
            setTimeout(() => {
                document.getElementById('results-summary').classList.remove('drawing');
                // Re-enable all controls after drawing is complete
                this.enableControlsAfterDrawing();
            }, 2000); // Light beam continues for 2 more seconds
            this.isDrawing = false;
        }, 2000);
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
        const resultsBox = document.getElementById('results-summary');
        const prizeCountsDiv = document.getElementById('prize-counts');
        const totalSummaryDiv = document.getElementById('total-summary');
        
        // Get unique counts
        const prizeCounts = results[0].counts;
        
        // DON'T clear the prize counts div - preserve real-time counters!
        // The real-time counters are already displaying the correct values
        // prizeCountsDiv.innerHTML = ''; // REMOVED THIS LINE
        
        // Only update if we don't have real-time counters (fallback)
        if (!this.realtimeCounters || Object.keys(this.realtimeCounters).length === 0) {
            prizeCountsDiv.innerHTML = '';
            Object.entries(prizeCounts).forEach(([prize, count]) => {
                if (count > 0) {
                    const prizeItem = document.createElement('div');
                    prizeItem.className = 'prize-item';
                    
                    prizeItem.innerHTML = `
                        <span>${prize}</span>
                        <span class="count">${count}</span>
                    `;
                    prizeCountsDiv.appendChild(prizeItem);
                }
            });
        }
        
        // Use real-time total instead of calculated total to prevent discrepancies
        const finalTotal = this.realtimeTotalWinnings || totalWinnings;
        document.getElementById('total-amount').textContent = `$${finalTotal.toLocaleString()}`;
        
        console.log(`Final display: Using real-time total $${finalTotal} instead of calculated $${totalWinnings}`);
        
        // Show results box with animation
        resultsBox.classList.remove('hidden');
        setTimeout(() => {
            resultsBox.style.transform = 'scale(1.05)';
            setTimeout(() => {
                resultsBox.style.transform = 'scale(1)';
            }, 200);
        }, 100);
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
                    <span>${prize}</span>
                    <span class="count">${count}</span>
                `;
                prizeCountsDiv.appendChild(prizeItem);
            }
        });
        
        // Only update total if we're not currently drawing (prevent overwriting real-time total)
        if (!this.isDrawing) {
            document.getElementById('total-amount').textContent = `$${workerResult.totalWinnings.toLocaleString()}`;
            console.log(`Displaying previous results: $${workerResult.totalWinnings}`);
        } else {
            console.log(`Skipping previous results update - currently drawing. Real-time total: $${this.realtimeTotalWinnings}`);
        }
        
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
            // === SALES TEAM ===
            'Sales Team-WongKamWing': {
                '$50 Cash Prize': 18, '$100 Cash Prize': 6, '$500 Cash Prize': 1     // Total: $1,900
            },
            'Sales Team-ChanSiuMing': {
                '$50 Cash Prize': 35, '$100 Cash Prize': 12, '$500 Cash Prize': 3    // Total: $4,750
            },
            'Sales Team-LeungWaiMan': {
                '$50 Cash Prize': 22, '$100 Cash Prize': 8, '$500 Cash Prize': 2     // Total: $2,900
            },
            'Sales Team-LiMeiLing': {
                '$50 Cash Prize': 15, '$100 Cash Prize': 5, '$500 Cash Prize': 2     // Total: $2,250
            },
            'Sales Team-LiuChunWai': {
                '$50 Cash Prize': 45, '$100 Cash Prize': 18, '$500 Cash Prize': 7    // Total: $7,550
            },
            'Sales Team-YipSukYee': {
                '$50 Cash Prize': 14, '$100 Cash Prize': 5, '$500 Cash Prize': 1     // Total: $1,700
            },
            'Sales Team-FungKaiMing': {
                '$50 Cash Prize': 26, '$100 Cash Prize': 9, '$500 Cash Prize': 3     // Total: $3,700
            },
            'Sales Team-ChengMeiYuk': {
                '$50 Cash Prize': 38, '$100 Cash Prize': 13, '$500 Cash Prize': 5    // Total: $5,650
            },
            'Sales Team-YuenWaiLun': {
                '$50 Cash Prize': 21, '$100 Cash Prize': 7, '$500 Cash Prize': 2     // Total: $2,750
            },
            'Sales Team-LeeYinWah': {
                '$50 Cash Prize': 31, '$100 Cash Prize': 11, '$500 Cash Prize': 4    // Total: $4,650
            },
            'Sales Team-TamShukLing': {
                '$50 Cash Prize': 17, '$100 Cash Prize': 6, '$500 Cash Prize': 2     // Total: $2,450
            },
            'Sales Team-SitKamPo': {
                '$50 Cash Prize': 29, '$100 Cash Prize': 10, '$500 Cash Prize': 3    // Total: $3,950
            },
            
            // === MARKETING TEAM ===
            'Marketing Team-TangChiKeung': {
                '$50 Cash Prize': 28, '$100 Cash Prize': 9, '$500 Cash Prize': 3     // Total: $3,800
            },
            'Marketing Team-YeungSukFan': {
                '$50 Cash Prize': 12, '$100 Cash Prize': 4, '$500 Cash Prize': 1     // Total: $1,500
            },
            'Marketing Team-LauHoiYan': {
                '$50 Cash Prize': 25, '$100 Cash Prize': 8, '$500 Cash Prize': 2     // Total: $3,050
            },
            'Marketing Team-ChowKinWah': {
                '$50 Cash Prize': 20, '$100 Cash Prize': 7, '$500 Cash Prize': 2     // Total: $2,700
            },
            'Marketing Team-NgWingYiu': {
                '$50 Cash Prize': 32, '$100 Cash Prize': 11, '$500 Cash Prize': 4    // Total: $4,700
            },
            'Marketing Team-MakYeePing': {
                '$50 Cash Prize': 16, '$100 Cash Prize': 6, '$500 Cash Prize': 1     // Total: $2,100
            },
            'Marketing Team-TsoiMingFai': {
                '$50 Cash Prize': 24, '$100 Cash Prize': 8, '$500 Cash Prize': 3     // Total: $3,500
            },
            'Marketing Team-CheungSoWah': {
                '$50 Cash Prize': 19, '$100 Cash Prize': 6, '$500 Cash Prize': 2     // Total: $2,550
            },
            
            // === OPERATIONS TEAM ===
            'Operations Team-LamKaYan': {
                '$50 Cash Prize': 40, '$100 Cash Prize': 15, '$500 Cash Prize': 5    // Total: $6,500
            },
            'Operations Team-WuChiHung': {
                '$50 Cash Prize': 8, '$100 Cash Prize': 3, '$500 Cash Prize': 1      // Total: $1,200
            },
            'Operations Team-HoSiuLan': {
                '$50 Cash Prize': 27, '$100 Cash Prize': 9, '$500 Cash Prize': 3     // Total: $3,750
            },
            'Operations Team-KwanYukMing': {
                '$50 Cash Prize': 33, '$100 Cash Prize': 12, '$500 Cash Prize': 4    // Total: $4,850
            },
            'Operations Team-LoiSiuFung': {
                '$50 Cash Prize': 23, '$100 Cash Prize': 8, '$500 Cash Prize': 2     // Total: $2,950
            },
            'Operations Team-ChanKinYip': {
                '$50 Cash Prize': 36, '$100 Cash Prize': 13, '$500 Cash Prize': 5    // Total: $5,600
            },
            'Operations Team-WongLaiYing': {
                '$50 Cash Prize': 11, '$100 Cash Prize': 4, '$500 Cash Prize': 1     // Total: $1,450
            },
            'Operations Team-TseungWaiChung': {
                '$50 Cash Prize': 30, '$100 Cash Prize': 10, '$500 Cash Prize': 4    // Total: $4,500
            },
            
            // === CUSTOMER SERVICE ===
            'Customer Service-MaHokKwan': {
                '$50 Cash Prize': 13, '$100 Cash Prize': 5, '$500 Cash Prize': 1     // Total: $1,650
            },
            'Customer Service-ChuiMingTak': {
                '$50 Cash Prize': 42, '$100 Cash Prize': 16, '$500 Cash Prize': 6    // Total: $6,700
            },
            'Customer Service-KongSumYee': {
                '$50 Cash Prize': 25, '$100 Cash Prize': 9, '$500 Cash Prize': 3     // Total: $3,650
            },
            'Customer Service-PoonChiWing': {
                '$50 Cash Prize': 34, '$100 Cash Prize': 12, '$500 Cash Prize': 4    // Total: $4,900
            },
            'Customer Service-LokYeePing': {
                '$50 Cash Prize': 19, '$100 Cash Prize': 7, '$500 Cash Prize': 2     // Total: $2,650
            },
            'Customer Service-HuiWaiMing': {
                '$50 Cash Prize': 28, '$100 Cash Prize': 10, '$500 Cash Prize': 3    // Total: $3,900
            },
            'Customer Service-YungSiuLan': {
                '$50 Cash Prize': 16, '$100 Cash Prize': 6, '$500 Cash Prize': 2     // Total: $2,400
            },
            
            // === CLAIMS DEPARTMENT ===
            'Claims Department-LawKamWah': {
                '$50 Cash Prize': 37, '$100 Cash Prize': 14, '$500 Cash Prize': 5    // Total: $5,750
            },
            'Claims Department-NgaiMeiHong': {
                '$50 Cash Prize': 22, '$100 Cash Prize': 8, '$500 Cash Prize': 2     // Total: $2,900
            },
            'Claims Department-SoYukFan': {
                '$50 Cash Prize': 15, '$100 Cash Prize': 5, '$500 Cash Prize': 1     // Total: $1,750
            },
            'Claims Department-WanHoiLam': {
                '$50 Cash Prize': 41, '$100 Cash Prize': 15, '$500 Cash Prize': 6    // Total: $6,550
            },
            'Claims Department-YipChunKit': {
                '$50 Cash Prize': 18, '$100 Cash Prize': 6, '$500 Cash Prize': 2     // Total: $2,500
            },
            'Claims Department-LiuSukMei': {
                '$50 Cash Prize': 26, '$100 Cash Prize': 9, '$500 Cash Prize': 3     // Total: $3,700
            },
            
            // === ADMINISTRATION ===
            'Administration-ChanWingHo': {
                '$50 Cash Prize': 32, '$100 Cash Prize': 11, '$500 Cash Prize': 4    // Total: $4,700
            },
            'Administration-LeeMingYee': {
                '$50 Cash Prize': 24, '$100 Cash Prize': 8, '$500 Cash Prize': 3     // Total: $3,500
            },
            'Administration-KwokSiuWah': {
                '$50 Cash Prize': 9, '$100 Cash Prize': 3, '$500 Cash Prize': 1      // Total: $1,250
            },
            'Administration-LauChiMing': {
                '$50 Cash Prize': 39, '$100 Cash Prize': 14, '$500 Cash Prize': 5    // Total: $5,850
            },
            'Administration-TangSukLan': {
                '$50 Cash Prize': 27, '$100 Cash Prize': 9, '$500 Cash Prize': 3     // Total: $3,750
            },
            'Administration-HoKinWai': {
                '$50 Cash Prize': 20, '$100 Cash Prize': 7, '$500 Cash Prize': 2     // Total: $2,700
            },
            'Administration-ChowYeePing': {
                '$50 Cash Prize': 35, '$100 Cash Prize': 12, '$500 Cash Prize': 4    // Total: $4,750
            },
            'Administration-WongWaiChung': {
                '$50 Cash Prize': 17, '$100 Cash Prize': 6, '$500 Cash Prize': 2     // Total: $2,450
            },
            'Administration-LiSiuFan': {
                '$50 Cash Prize': 12, '$100 Cash Prize': 4, '$500 Cash Prize': 1     // Total: $1,500
            },
            'Administration-NgMingTak': {
                '$50 Cash Prize': 29, '$100 Cash Prize': 10, '$500 Cash Prize': 3    // Total: $3,950
            }
            
            // EASY TO EXPAND: Just add more workers using the format above!
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
