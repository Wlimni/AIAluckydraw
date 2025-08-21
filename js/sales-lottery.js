// Sales Lottery System for AIA Insurance
class SalesLottery {
    constructor() {
        this.players = {
            'john-25': { name: 'John Smith', tickets: 25, remaining: 25, totalWinnings: 0 },
            'mary-63': { name: 'Mary Johnson', tickets: 63, remaining: 63, totalWinnings: 0 },
            'david-12': { name: 'David Lee', tickets: 12, remaining: 12, totalWinnings: 0 },
            'sarah-45': { name: 'Sarah Wilson', tickets: 45, remaining: 45, totalWinnings: 0 },
            'mike-8': { name: 'Mike Brown', tickets: 8, remaining: 8, totalWinnings: 0 },
            'lisa-32': { name: 'Lisa Davis', tickets: 32, remaining: 32, totalWinnings: 0 }
        };
        
        this.currentPlayer = null;
        this.isDrawing = false;
        
        // Track individual worker results for detailed reporting
        this.workerResults = {};
        
        // PRESET RESULTS - You can customize exactly what each worker wins!
        this.presetResults = {
            'john-25': {
                '$50 Cash Prize': 20,   // John gets 20x $50 prizes
                '$100 Cash Prize': 4,   // John gets 4x $100 prizes  
                '$500 Cash Prize': 1    // John gets 1x $500 prize
            },
            'mary-63': {
                '$50 Cash Prize': 50,   // Mary gets 50x $50 prizes
                '$100 Cash Prize': 10,  // Mary gets 10x $100 prizes
                '$500 Cash Prize': 3    // Mary gets 3x $500 prizes
            },
            'david-12': {
                '$50 Cash Prize': 10,   // David gets 10x $50 prizes
                '$100 Cash Prize': 2,   // David gets 2x $100 prizes
                '$500 Cash Prize': 0    // David gets 0x $500 prizes
            },
            'sarah-45': {
                '$50 Cash Prize': 35,   // Sarah gets 35x $50 prizes
                '$100 Cash Prize': 8,   // Sarah gets 8x $100 prizes
                '$500 Cash Prize': 2    // Sarah gets 2x $500 prizes
            },
            'mike-8': {
                '$50 Cash Prize': 6,    // Mike gets 6x $50 prizes
                '$100 Cash Prize': 2,   // Mike gets 2x $100 prizes
                '$500 Cash Prize': 0    // Mike gets 0x $500 prizes
            },
            'lisa-32': {
                '$50 Cash Prize': 25,   // Lisa gets 25x $50 prizes
                '$100 Cash Prize': 6,   // Lisa gets 6x $100 prizes
                '$500 Cash Prize': 1    // Lisa gets 1x $500 prize
            }
        };
        
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
        
        playerSelect.addEventListener('change', (e) => {
            // Prevent player selection changes during drawing
            if (this.isDrawing) {
                e.preventDefault();
                return;
            }
            this.selectPlayer(e.target.value);
        });
        
        drawBtn.addEventListener('click', () => {
            this.startBulkDraw();
        });
        
        newDrawBtn.addEventListener('click', () => {
            // Prevent resetting during drawing
            if (this.isDrawing) return;
            this.resetForNewDraw();
        });
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
        }
    }
    
    startBulkDraw() {
        if (!this.currentPlayer || this.isDrawing) return;
        
        const player = this.players[this.currentPlayer];
        if (player.remaining <= 0) return;
        
        this.isDrawing = true;
        
        // Disable all controls during drawing
        this.disableControlsDuringDrawing();
        
        // Get the draw button for explosion animation
        const drawButton = document.getElementById('draw-btn');
        
        // Start button explosion animation
        this.explodeButton(drawButton);
        
        // Add light ray emission effect
        document.querySelector('.container').classList.add('light-rays');
        
        // Set initial drawing state for container only
        document.querySelector('.container').classList.add('drawing');
        
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
        document.getElementById('total-amount').textContent = '0';
        document.getElementById('tickets-drawn').textContent = '0';
        this.realtimeTotalWinnings = 0;
    }
    
    // Update counter when a golden flash appears (with realistic delay and effect)
    updateRealtimeCounter(prizeName) {
        // RULE: After each golden flash, increment both tickets drawn AND the specific prize
        
        // 1. Increment tickets drawn counter
        this.ticketsDrawnCount++;
        
        // 2. Increment the specific prize counter
        this.realtimeCounters[prizeName]++;
        const prizeValue = this.prizeDistribution[prizeName].value;
        this.realtimeTotalWinnings += prizeValue;
        
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
        
        // Update total winnings with same delay
        setTimeout(() => {
            const totalElement = document.getElementById('total-amount');
            totalElement.style.transition = 'all 0.3s ease-out';
            totalElement.style.transform = 'scale(1.05)';
            totalElement.style.background = 'rgba(255, 215, 0, 0.6)';
            totalElement.style.borderRadius = '8px';
            totalElement.style.padding = '4px 8px';
            totalElement.textContent = this.realtimeTotalWinnings;
            
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
        
        // Update player data
        player.remaining = 0;
        const totalWinnings = results.reduce((sum, result) => sum + result.value, 0);
        player.totalWinnings += totalWinnings;
        
        // Store individual worker results for detailed tracking
        this.workerResults[this.currentPlayer] = {
            playerName: player.name,
            ticketsUsed: ticketsToProcess,
            totalWinnings: totalWinnings,
            prizeBreakdown: results[0].counts, // Prize counts for this worker
            individualPrizes: results.map(r => r.prize) // List of each prize won
        };
        
        // Final processing complete - rely on Tickets Drawn counter for status
        document.getElementById('winner').textContent = '';
        
        // Update UI
        document.getElementById('remaining-tickets').textContent = '0';
        
        // Show massive confetti celebration
        this.showMassiveConfetti();
        
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
        
        // Display prize counts (without total amounts in parentheses)
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
        
        // Update total summary (only total winnings, no tickets used)
        document.getElementById('total-amount').textContent = totalWinnings;
        
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
        
        // Update total winnings
        document.getElementById('total-amount').textContent = workerResult.totalWinnings;
        
        // Show results box
        resultsBox.classList.remove('hidden');
    }
    
    // Disable controls during drawing to prevent interference
    disableControlsDuringDrawing() {
        const playerSelect = document.getElementById('player-select');
        const newDrawBtn = document.getElementById('new-draw-btn');
        
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
    }
    
    resetForNewDraw() {
        document.getElementById('results-summary').classList.add('hidden');
        document.getElementById('winner').textContent = ''; // Clear winner message together
        
        // Show draw button again and enable it
        document.getElementById('draw-btn').style.display = 'block';
        document.getElementById('draw-btn').disabled = false;
        
        // Reset player selection
        document.getElementById('player-select').value = '';
        this.selectPlayer('');
        
        // Clear confetti
        document.getElementById('confetti-container').innerHTML = '';
    }
    
    showMassiveConfetti() {
        const container = document.getElementById('confetti-container');
        const colors = ['#FFD700', '#FFA500', '#FF6347', '#32CD32', '#1E90FF', '#FF1493'];
        const emojis = ['💰', '💵', '💸', '🎉', '⭐', '✨', '🏆', '💎'];
        
        // Create confetti from multiple points
        for (let burst = 0; burst < 5; burst++) {
            setTimeout(() => {
                for (let i = 0; i < 30; i++) {
                    setTimeout(() => {
                        const confetti = document.createElement('div');
                        confetti.className = 'confetti';
                        
                        if (Math.random() < 0.4) {
                            confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                            confetti.style.fontSize = '32px'; // Much bigger emoji size
                        } else {
                            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                            confetti.style.width = '10px';
                            confetti.style.height = '10px';
                        }
                        
                        // Random starting positions across the top
                        confetti.style.left = Math.random() * window.innerWidth + 'px';
                        confetti.style.top = '-40px';
                        confetti.style.setProperty('--drift', `${(Math.random() - 0.5) * 400}px`);
                        confetti.style.animation = 'confetti-fall 6s linear forwards';
                        
                        container.appendChild(confetti);
                        
                        setTimeout(() => {
                            confetti.remove();
                        }, 6000);
                    }, i * 50);
                }
            }, burst * 300);
        }
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
    
    // Mini celebration animation with ribbons and money emojis
    showMiniCelebration(block) {
        const rect = block.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Create celebration elements
        const celebrationElements = ['🎀', '💰', '💸', '🎊', '✨', '💎'];
        
        celebrationElements.forEach((emoji, index) => {
            const element = document.createElement('div');
            element.textContent = emoji;
            element.style.position = 'fixed';
            element.style.left = centerX + 'px';
            element.style.top = centerY + 'px';
            element.style.fontSize = '20px';
            element.style.zIndex = '1000';
            element.style.pointerEvents = 'none';
            element.style.transition = 'all 0.6s ease-out';
            
            document.body.appendChild(element);
            
            // Animate outward
            setTimeout(() => {
                const angle = (index * 60) * (Math.PI / 180); // 60 degrees apart
                const distance = 50 + Math.random() * 30;
                const newX = centerX + Math.cos(angle) * distance;
                const newY = centerY + Math.sin(angle) * distance;
                
                element.style.left = newX + 'px';
                element.style.top = newY + 'px';
                element.style.opacity = '0';
                element.style.transform = 'scale(0.5)';
            }, 50);
            
            // Remove element
            setTimeout(() => {
                document.body.removeChild(element);
            }, 700);
        });
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
