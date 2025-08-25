class SalesLottery {
    constructor() {
        // Initialize players from preset configuration
        this.players = {};
        this.currentPlayer = null;
        this.isDrawing = false;
        // Track individual worker results for detailed reporting
        this.workerResults = {};
        // Use preset results
        this.usePresetResults = true;
        // Load preset results from extracted_data.json
        this.presetResults = {};
        this.loadPresetResultsFromJSON().then(() => {
            this.initializeEvents();
        });
    }

    async loadPresetResultsFromJSON() {
        try {
            const response = await fetch('./extracted_data.json');
            const data = await response.json();
            // Map prize keys from JSON to internal format
            const prizeKeyMap = {
                '$20': '$20 Cash Prize',
                '$50': '$50 Cash Prize',
                '$100': '$100 Cash Prize',
                '$200': '$200 Cash Prize',
                '$500': '$500 Cash Prize',
                '$1000': '$1000 Cash Prize'
            };
            // Build presetResults: key = groupName-workerName (no spaces), value = {prize: count}
            Object.values(data).forEach(group => {
                group.workers.forEach(worker => {
                    const groupKey = (group.name || group.district || group.id || '').replace(/\s+/g, '');
                    const workerKey = (worker.name || worker.employeeId || '').replace(/\s+/g, '');
                    const key = `${groupKey}-${workerKey}`;
                    const mappedPrizeCounts = {};
                    if (worker.prizeCounts) {
                        Object.entries(worker.prizeCounts).forEach(([prize, count]) => {
                            const mappedPrize = prizeKeyMap[prize] || prize;
                            mappedPrizeCounts[mappedPrize] = count;
                        });
                    }
                    this.presetResults[key] = mappedPrizeCounts;
                    // Initialize player data
                    this.players[key] = {
                        name: worker.name || worker.employeeId || 'Unknown',
                        tickets: Object.values(mappedPrizeCounts).reduce((sum, count) => sum + count, 0),
                        remaining: Object.values(mappedPrizeCounts).reduce((sum, count) => sum + count, 0),
                        totalWinnings: 0
                    };
                });
            });
            console.log('Preset results loaded from extracted_data.json:', this.presetResults);
            console.log('Initialized players:', this.players);
        } catch (e) {
            console.error('Failed to load preset results from extracted_data.json:', e);
        }
    }
    
    initializeEvents() {
        const playerSelect = document.getElementById('player-select');
        const drawBtn = document.getElementById('draw-btn');
        const newDrawBtn = document.getElementById('new-draw-btn');
        
        if (playerSelect) {
            playerSelect.addEventListener('change', (e) => {
                if (this.isDrawing) {
                    e.preventDefault();
                    return;
                }
                this.selectPlayer(e.target.value);
            });
        }
        
        if (drawBtn) {
            drawBtn.addEventListener('click', () => {
                console.log('=== DRAW BUTTON CLICKED ===');
                console.log('Current player:', this.currentPlayer);
                console.log('Players object:', this.players);
                console.log('Is drawing:', this.isDrawing);
                console.log('Window.blocksLottery available:', !!window.blocksLottery);

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

                // Hide the press instruction immediately (try both id and class)
                const pressEl = document.getElementById('press') || document.querySelector('.press') || document.getElementById('press-instruction') || document.querySelector('.press-instruction');
                if (pressEl) {
                    pressEl.style.display = 'none';
                }

                // Trigger red light effect and button explosion at the same time
                const container = document.querySelector('.container');
                if (container) container.classList.add('light-rays', 'drawing');
                this.explodeButton(drawBtn);

                // Stop pre-drawing animation
                if (window.blocksLottery && window.blocksLottery.stopPreDrawingAnimation) {
                    console.log('Calling stopPreDrawingAnimation...');
                    window.blocksLottery.stopPreDrawingAnimation();
                    console.log('stopPreDrawingAnimation called');
                } else {
                    console.warn('blocksLottery or stopPreDrawingAnimation method not found on window object');
                }

                console.log('Starting bulk draw...');
                // Delay startBulkDraw to allow button animation to play (lengthened for more dramatic effect)
                setTimeout(() => {
                    this.startBulkDraw();
                }, 1800); // Increased delay for longer animation
            });
        }
        
        if (newDrawBtn) {
            newDrawBtn.addEventListener('click', () => {
                if (this.isDrawing) return;
                this.resetForNewDraw();
            });
        }
    }
    
    updatePlayerTickets(ticketCount) {
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
            
            this.currentPlayer = playerData.id;
            console.log('Set currentPlayer emphasizes: ', this.currentPlayer);
            console.log('Players object:', this.players);
            
            this.updatePlayerDisplay();
            
            const drawBtn = document.getElementById('draw-btn');
            if (drawBtn) {
                drawBtn.style.display = 'block';
                drawBtn.style.visibility = 'visible';
                drawBtn.disabled = false;
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
            document.getElementById('draw-btn').style.display = 'none';
            document.getElementById('results-summary').classList.add('hidden');
            document.getElementById('winner').textContent = '';
            return;
        }
        
        this.currentPlayer = playerId;
        const player = this.players[playerId];
        document.getElementById('player-name').textContent = player.name;
        document.getElementById('remaining-tickets').textContent = player.remaining;
        
        if (this.workerResults[playerId]) {
            const results = this.workerResults[playerId];
            this.displayPreviousResults(results);
            document.getElementById('draw-btn').style.display = 'none';
            document.getElementById('winner').textContent = '';
        } else {
            document.getElementById('results-summary').classList.add('hidden');
            document.getElementById('draw-btn').style.display = 'block';
            document.getElementById('draw-btn').disabled = player.remaining <= 0;
            document.getElementById('winner').textContent = '';
            
            if (window.blocksLottery && window.blocksLottery.startPreDrawingAnimation) {
                if (!window.blocksLottery.isPreDrawing) {
                    setTimeout(() => {
                        window.blocksLottery.startPreDrawingAnimation();
                    }, 100);
                } else {
                    console.log('Pre-drawing animation already running, not restarting');
                }
            }
        }
    }
    
    startBulkDraw() {
        console.log('=== START NEW BULK DRAW ===');
        if (!this.currentPlayer || this.isDrawing) {
            console.log('Cannot start draw - no player or already drawing');
            return;
        }
        const player = this.players[this.currentPlayer];
        if (player.remaining <= 0) {
            console.log('No tickets remaining');
            return;
        }
        // Stop and hide pre-drawing animation and UI
        if (window.blocksLottery && window.blocksLottery.stopPreDrawingAnimation) {
            window.blocksLottery.stopPreDrawingAnimation();
        }
        // Remove pre-drawing classes from container if present
        const container = document.getElementById('blocks-container');
        if (container) {
            container.classList.remove('pre-drawing');
        }
        // Hide any pre-drawing overlays or elements if present
        const preDrawingOverlay = document.getElementById('pre-drawing-overlay');
        if (preDrawingOverlay) {
            preDrawingOverlay.style.display = 'none';
        }
        this.isDrawing = true;
        this.initializeDrawingState(player);
        const blocks = Array.from(document.querySelectorAll('.block'));
        if (!blocks.length) {
            alert('No prize blocks found!');
            this.isDrawing = false;
            return;
        }
        // Assign each prize in the preset order to a random cell
        const prizeToBlocks = {};
        blocks.forEach(block => {
            const name = block.getAttribute('data-name');
            if (!prizeToBlocks[name]) prizeToBlocks[name] = [];
            prizeToBlocks[name].push(block);
        });
        const assignedBlocks = [];
        const usedBlocks = new Set();
        this.actualResults.forEach((prize) => {
            const availableBlocks = prizeToBlocks[prize]?.filter(b => !usedBlocks.has(b)) || [];
            if (availableBlocks.length === 0) {
                usedBlocks.clear();
                availableBlocks.push(...(prizeToBlocks[prize] || []));
            }
            if (availableBlocks.length === 0) {
                console.warn(`No blocks available for prize: ${prize}`);
                return;
            }
            const randomIndex = Math.floor(Math.random() * availableBlocks.length);
            const chosen = availableBlocks[randomIndex];
            assignedBlocks.push(chosen);
            usedBlocks.add(chosen);
        });
        this.prizeBlockOrder = assignedBlocks;
        this.blockPrizeMap = {};
        this.actualResults.forEach((prize, idx) => {
            if (assignedBlocks[idx]) {
                this.blockPrizeMap[assignedBlocks[idx]] = prize;
            }
        });
        this.animatePresetDraw(blocks, assignedBlocks, this.actualResults);
    }
    
    async animatePresetDraw(blocks, assignedBlocks, prizeOrder) {
        // Clean up all blocks
        blocks.forEach(block => {
            block.classList.remove('highlight', 'golden-win');
            block.removeAttribute('data-golden-protected');
            block.removeAttribute('data-ticket-number');
        });
        // Animation state
        let currentIdx = 0;
        let cycles = 0;
        let prizeIdx = 0;
        const totalPrizes = prizeOrder.length;
        const totalBlocks = blocks.length;
        let isAnimating = false; // Prevent overlapping animations
        let timeoutId = null; // Track setTimeout for cleanup
        // UI setup
        if (typeof this.disableControlsDuringDrawing === 'function') {
            this.disableControlsDuringDrawing();
        } else {
            console.warn('disableControlsDuringDrawing is not defined, skipping UI control disable');
        }
        document.getElementById('draw-btn').style.display = 'none';
        document.getElementById('results-summary').classList.remove('hidden');
        document.getElementById('winner').textContent = '';
        // Ensure counters are initialized
        this.ticketsDrawnCount = 0;
        this.totalWinnings = 0;
        this.prizeCounts = {};
        this.isDrawingComplete = false; // Prevent multiple completeDrawing calls
        // Animation loop
        const highlightNext = () => {
            // Stop if animation is complete or already processing
            if (prizeIdx >= totalPrizes || isAnimating || this.isDrawingComplete) {
                if (prizeIdx >= totalPrizes && !this.isDrawingComplete) {
                    this.isDrawingComplete = true;
                    if (timeoutId) {
                        clearTimeout(timeoutId); // Clear any pending timeouts
                    }
                    setTimeout(() => this.completeDrawing(), 1000);
                }
                return;
            }
            isAnimating = true; // Lock animation
            // Remove highlight from all blocks
            blocks.forEach(block => block.classList.remove('highlight'));
            // Highlight current block
            const block = blocks[currentIdx];
            block.classList.add('highlight');
            // Check if this block is assigned a prize, only after first cycle
            if (cycles > 0 && prizeIdx < totalPrizes && block === assignedBlocks[prizeIdx]) {
                const prize = prizeOrder[prizeIdx];
                // Validate prize to prevent undefined
                if (!prize || !this.getPrizeValue(prize)) {
                    console.error(`Invalid prize at index ${prizeIdx}:`, prize);
                    prizeIdx++;
                    currentIdx = (currentIdx + 1) % totalBlocks;
                    if (currentIdx === 0) cycles++;
                    console.log(`PrizeIdx: ${prizeIdx}, Tickets: ${this.ticketsDrawnCount}, Winnings: $${this.totalWinnings}`);
                    isAnimating = false; // Unlock for next iteration
                    timeoutId = setTimeout(highlightNext, 120);
                    return;
                }
                // Update counters before animation to ensure consistency
                this.prizeCounts[prize] = (this.prizeCounts[prize] || 0) + 1;
                this.ticketsDrawnCount = prizeIdx + 1; // Strictly increment
                this.totalWinnings += this.getPrizeValue(prize);
                // Update summary box immediately
                this.displayLiveCounters(true, prize);
                // Reveal prize: gold shine
                setTimeout(() => {
                    block.classList.add('golden-win');
                    block.setAttribute('data-golden-protected', 'true');
                    block.setAttribute('data-ticket-number', this.ticketsDrawnCount);
                    // Mini celebration
                    this.showMiniCelebration(block);
                    // Remove gold after 0.5s
                    setTimeout(() => {
                        block.classList.remove('golden-win');
                        block.removeAttribute('data-golden-protected');
                        block.removeAttribute('data-ticket-number');
                        block.classList.remove('highlight');
                        block.setAttribute('data-final-winner', 'true');
                    }, 500);
                }, 80);
                prizeIdx++;
            }
            // Move to next block
            currentIdx = (currentIdx + 1) % totalBlocks;
            if (currentIdx === 0) cycles++;
            // Continue animation if not done
            if (prizeIdx < totalPrizes) {
                console.log(`PrizeIdx: ${prizeIdx}, Tickets: ${this.ticketsDrawnCount}, Winnings: $${this.totalWinnings}`);
                isAnimating = false; // Unlock for next iteration
                timeoutId = setTimeout(highlightNext, 120);
            } else if (!this.isDrawingComplete) {
                this.isDrawingComplete = true;
                if (timeoutId) {
                    clearTimeout(timeoutId); // Clear any pending timeouts
                }
                setTimeout(() => this.completeDrawing(), 1000);
            }
        };
        highlightNext();
    }

    getPrizeValue(prize) {
        const prizeValues = {
            '$20 Cash Prize': 20,
            '$50 Cash Prize': 50,
            '$100 Cash Prize': 100,
            '$200 Cash Prize': 200,
            '$500 Cash Prize': 500,
            '$1000 Cash Prize': 1000
        };
        const value = prizeValues[prize];
        if (!value) {
            console.warn(`No value found for prize: ${prize}`);
            return 0;
        }
        return value;
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
        Object.keys(this.prizeDistribution || {
            '$20 Cash Prize': 0,
            '$50 Cash Prize': 0,
            '$100 Cash Prize': 0,
            '$200 Cash Prize': 0,
            '$500 Cash Prize': 0,
            '$1000 Cash Prize': 0
        }).forEach(prize => {
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
        
        // Start visual effects
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

    explodeButton(button) {
        if (!button) {
            console.warn('No button provided for explosion animation');
            return;
        }
        console.log('Starting button explosion animation...');
        
        // Create explosion particles
        const particleCount = 20;
        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            particle.style.width = '8px';
            particle.style.height = '8px';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.borderRadius = '50%';
            particle.style.zIndex = '1000';
            particle.style.pointerEvents = 'none';
            particle.style.opacity = '1';
            particle.style.transition = 'all 0.6s ease-out';
            document.body.appendChild(particle);
            
            setTimeout(() => {
                const angle = (i / particleCount) * 2 * Math.PI + (Math.random() - 0.5) * 0.4;
                const distance = 50 + Math.random() * 50;
                const newX = centerX + Math.cos(angle) * distance;
                const newY = centerY + Math.sin(angle) * distance;
                particle.style.left = newX + 'px';
                particle.style.top = newY + 'px';
                particle.style.opacity = '0';
                particle.style.transform = 'scale(0.2)';
            }, 50);
            
            setTimeout(() => {
                if (document.body.contains(particle)) {
                    document.body.removeChild(particle);
                }
            }, 600);
        }
        
        // Animate button
        button.style.transition = 'all 0.3s ease-out';
        button.style.transform = 'scale(1.2)';
        button.style.opacity = '0.3';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
            button.style.opacity = '1';
            button.style.display = 'none'; // Hide after explosion
        }, 300);
        
        console.log('Button explosion animation completed');
    }

    disableControlsDuringDrawing() {
        const playerSelect = document.getElementById('player-select');
        const newDrawBtn = document.getElementById('new-draw-btn');
        const leftArrow = document.querySelector('.left-arrow');
        const rightArrow = document.querySelector('.right-arrow');
        if (leftArrow) leftArrow.style.display = 'none';
        if (rightArrow) rightArrow.style.display = 'none';
        const player = this.players[this.currentPlayer];
        if (player) {
            player.remaining = 0;
            document.getElementById('remaining-tickets').textContent = '0';
        }
        if (playerSelect) {
            playerSelect.disabled = true;
            playerSelect.style.opacity = '0.5';
            playerSelect.style.cursor = 'not-allowed';
        }
        if (newDrawBtn) {
            newDrawBtn.disabled = true;
            newDrawBtn.style.opacity = '0.5';
            newDrawBtn.style.cursor = 'not-allowed';
            newDrawBtn.style.background = '#9ca3af';
            newDrawBtn.style.borderColor = '#9ca3af';
        }
    }

    enableControlsAfterDrawing() {
        const playerSelect = document.getElementById('player-select');
        const newDrawBtn = document.getElementById('new-draw-btn');
        const blocks = document.querySelectorAll('.block');
        blocks.forEach(block => {
            block.classList.remove('highlight', 'golden-win', 'rolling', 'fast-draw', 'slow-draw', 'pre-highlight');
            block.removeAttribute('data-golden-protected');
            block.removeAttribute('data-ticket-number');
        });
        const container = document.getElementById('blocks-container');
        if (container) {
            container.classList.remove('drawing', 'pre-drawing');
        }
        if (playerSelect) {
            playerSelect.disabled = false;
            playerSelect.style.opacity = '1';
            playerSelect.style.cursor = 'pointer';
        }
        if (newDrawBtn) {
            newDrawBtn.disabled = false;
            newDrawBtn.style.opacity = '1';
            newDrawBtn.style.cursor = 'pointer';
            newDrawBtn.style.background = '';
            newDrawBtn.style.borderColor = '';
        }
        console.log('All drawing animations and classes cleaned up');
    }

    completeDrawing() {
        console.log('🏁 Drawing complete!');
        console.log('Final counts:', JSON.stringify(this.prizeCounts));
        console.log('Total tickets drawn:', this.ticketsDrawnCount, '/', this.actualResults.length);
        console.log(`💰 Total winnings: $${this.totalWinnings.toLocaleString()}`);
        
        let hasErrors = false;
        Object.keys(this.expectedResults || {}).forEach(prize => {
            const expected = this.expectedResults[prize];
            const actual = this.prizeCounts[prize] || 0;
            if (expected !== actual) {
                console.error(`❌ MISMATCH: ${prize} - Expected: ${expected}, Actual: ${actual}`);
                hasErrors = true;
            } else {
                console.log(`✅ CORRECT: ${prize} - ${actual}/${expected}`);
            }
        });
        
        if (!hasErrors) {
            console.log('🎉 ALL ANIMATIONS AND COUNTS VERIFIED SUCCESSFULLY!');
        }
        
        const player = this.players[this.currentPlayer];
        player.remaining = 0;
        player.totalWinnings += this.totalWinnings;
        
        this.workerResults[this.currentPlayer] = {
            playerName: player.name,
            ticketsUsed: player.tickets,
            totalWinnings: this.totalWinnings,
            prizeBreakdown: { ...this.prizeCounts },
            individualPrizes: [...this.actualResults],
            animationErrors: []
        };
        
        const blocks = document.querySelectorAll('.block');
        blocks.forEach(block => block.classList.remove('highlight'));
        
        this.showMassiveConfetti();
        setTimeout(() => this.showSideFireworks(), 500);
        
        setTimeout(() => {
            document.querySelector('.container').classList.remove('drawing', 'light-rays');
            document.getElementById('results-summary').classList.remove('drawing');
            this.enableControlsAfterDrawing();
            this.isDrawing = false;
        }, 2000);
    }

    displayLiveCounters(animate = false, lastPrize = null) {
        const prizeCountsDiv = document.getElementById('prize-counts');
        prizeCountsDiv.innerHTML = '';

        Object.keys(this.prizeCounts).forEach(prize => {
            if (this.prizeCounts[prize] > 0) {
                const item = document.createElement('div');
                item.className = 'prize-item';
                const name = document.createElement('span');
                name.className = 'prize-name';
                name.textContent = prize + ':';
                const count = document.createElement('span');
                count.className = 'count';
                count.textContent = this.prizeCounts[prize];
                if (animate && lastPrize === prize) {
                    this.animateSummaryCounter(count);
                }
                item.appendChild(name);
                item.appendChild(count);
                prizeCountsDiv.appendChild(item);
            }
        });

        const totalAmountEl = document.getElementById('total-amount');
        const ticketsDrawnEl = document.getElementById('tickets-drawn');
        totalAmountEl.textContent = this.totalWinnings ? this.totalWinnings.toLocaleString() : '0';
        ticketsDrawnEl.textContent = this.ticketsDrawnCount || '0';
        totalAmountEl.className = 'count';
        ticketsDrawnEl.className = 'count';

        if (animate) {
            this.animateSummaryCounter(totalAmountEl);
            this.animateSummaryCounter(ticketsDrawnEl);
        }

        console.log('displayLiveCounters: Tickets:', this.ticketsDrawnCount, ', Winnings: $', this.totalWinnings);
    }

    animateSummaryCounter(element) {
        if (!element) return;
        element.style.transition = 'all 0.4s cubic-bezier(0.4,1.4,0.4,1)';
        element.style.transform = 'scale(1.25)';
        element.style.background = 'linear-gradient(90deg, #ffd700 60%, #fffbe6 100%)';
        element.style.color = '#b8860b';
        element.style.fontWeight = 'bold';
        element.style.boxShadow = '0 0 12px 2px #ffd70088';
        setTimeout(() => {
            element.style.transform = '';
            element.style.background = '';
            element.style.color = '';
            element.style.fontWeight = '';
            element.style.boxShadow = '';
        }, 400);
    }

    getActualWinningResults(ticketCount) {
        const winningPrizes = [];
        let player = this.players[this.currentPlayer];
        let groupKey = '';
        let workerKey = '';
        if (player) {
            let groupName = player.groupName || player.district || player.groupNo || '';
            groupKey = (groupName || '').replace(/\s+/g, '');
            workerKey = (player.name || player.employeeId || '').replace(/\s+/g, '');
        } else {
            [groupKey, workerKey] = (this.currentPlayer || '').split('-');
        }
        let lookupKey = `${groupKey}-${workerKey}`;
        console.log(`🔑 Looking up preset for key: ${lookupKey}`);
        console.log('🗝️ Available preset keys:', Object.keys(this.presetResults));
        let presetKey = null;
        if (groupKey && this.presetResults[lookupKey]) {
            presetKey = lookupKey;
        } else {
            const possibleKeys = Object.keys(this.presetResults).filter(k => k.endsWith(`-${workerKey}`));
            if (possibleKeys.length === 1) {
                presetKey = possibleKeys[0];
                console.log(`🔍 Found matching preset key by worker name: ${presetKey}`);
            } else if (possibleKeys.length > 1) {
                console.warn(`⚠️ Multiple preset keys found for worker: ${workerKey}. Using the first: ${possibleKeys[0]}`);
                presetKey = possibleKeys[0];
            }
        }
        if (presetKey) {
            const preset = this.presetResults[presetKey];
            console.log(`🎯 Using preset results for player: ${presetKey}`);
            console.log(`📋 Preset data:`, preset);
            Object.entries(preset).forEach(([prize, count]) => {
                // Validate prize
                if (this.getPrizeValue(prize)) {
                    console.log(`Adding ${count}x ${prize} to results`);
                    for (let i = 0; i < count; i++) {
                        winningPrizes.push(prize);
                    }
                } else {
                    console.warn(`Skipping invalid prize: ${prize}`);
                }
            });
            console.log(`🎪 Total prizes to animate: ${winningPrizes.length}`);
            return winningPrizes;
        } else {
            const msg = `❌ No preset found for player key: ${lookupKey}. Drawing aborted. Check extracted_data.json and key generation logic.`;
            console.error(msg);
            alert(msg);
            throw new Error(msg);
        }
    }

    displayPreviousResults(workerResult) {
        const resultsBox = document.getElementById('results-summary');
        const prizeCountsDiv = document.getElementById('prize-counts');
        
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
        
        document.getElementById('total-amount').textContent = `${workerResult.totalWinnings.toLocaleString()}`;
        document.getElementById('tickets-drawn').textContent = workerResult.ticketsUsed;
        
        resultsBox.classList.remove('hidden');
    }

    resetForNewDraw() {
        this.enableControlsAfterDrawing();
        document.getElementById('results-summary').classList.add('hidden');
        document.getElementById('winner').textContent = '';
        document.getElementById('draw-btn').style.display = 'block';
        document.getElementById('draw-btn').disabled = false;
        document.getElementById('player-select').value = '';
        this.selectPlayer('');
        if (window.blocksLottery && window.blocksLottery.startPreDrawingAnimation) {
            if (!window.blocksLottery.isPreDrawing) {
                setTimeout(() => {
                    window.blocksLottery.startPreDrawingAnimation();
                }, 200);
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
        const emojis = ['💰', '💵', '💸', '🎉', '⭐', '✨', '🏆', '💎', '🎊'];
        for (let burst = 0; burst < 4; burst++) {
            setTimeout(() => {
                for (let i = 0; i < 20; i++) {
                    setTimeout(() => {
                        const confetti = document.createElement('div');
                        confetti.className = 'confetti';
                        if (Math.random() < 0.25) {
                            confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                            confetti.style.fontSize = '32px';
                        } else {
                            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                            confetti.style.width = '18px';
                            confetti.style.height = '18px';
                            confetti.style.borderRadius = '50%';
                        }
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

    showSideFireworks() {
        console.log('Starting spread out fireworks!');
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const startX = 50 + Math.random() * 150;
                const startY = window.innerHeight - 100;
                const targetX = window.innerWidth * 0.2 + Math.random() * 250;
                const targetY = 100 + Math.random() * 300;
                this.launchFirework(startX, startY, targetX, targetY);
            }, i * 1200);
        }
        for (let i = 0; i < 2; i++) {
            setTimeout(() => {
                const startX = window.innerWidth * 0.4 + Math.random() * (window.innerWidth * 0.2);
                const startY = window.innerHeight - 100;
                const targetX = window.innerWidth * 0.4 + Math.random() * (window.innerWidth * 0.2);
                const targetY = 120 + Math.random() * 250;
                this.launchFirework(startX, startY, targetX, targetY);
            }, i * 1500 + 600);
        }
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const startX = window.innerWidth - 200 + Math.random() * 150;
                const startY = window.innerHeight - 100;
                const targetX = window.innerWidth * 0.7 + Math.random() * 250;
                const targetY = 100 + Math.random() * 300;
                this.launchFirework(startX, startY, targetX, targetY);
            }, i * 1200 + 800);
        }
    }

    launchFirework(startX, startY, targetX, targetY) {
        const projectile = document.createElement('div');
        projectile.style.position = 'fixed';
        projectile.style.left = startX + 'px';
        projectile.style.top = startY + 'px';
        projectile.style.width = '12px';
        projectile.style.height = '12px';
        projectile.style.background = 'radial-gradient(circle, #FFD700 40%, #FF6B6B 80%, transparent 100%)';
        projectile.style.borderRadius = '50%';
        projectile.style.boxShadow = '0 0 20px #FFD700, 0 0 30px #FF6B6B, 0 0 40px #FFD700';
        projectile.style.zIndex = '1000';
        projectile.style.pointerEvents = 'none';
        projectile.style.transition = 'all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        document.body.appendChild(projectile);
        setTimeout(() => {
            projectile.style.left = targetX + 'px';
            projectile.style.top = targetY + 'px';
            projectile.style.transform = 'scale(1.8)';
        }, 50);
        setTimeout(() => {
            if (document.body.contains(projectile)) {
                document.body.removeChild(projectile);
            }
            this.createFirework(targetX, targetY, 'large');
        }, 1250);
    }

    createFirework(x, y, size = 'medium') {
        const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#FF1493', '#00FA9A'];
        const sparkleCount = size === 'small' ? 40 : size === 'medium' ? 60 : 80;
        const maxDistance = size === 'small' ? 120 : size === 'medium' ? 160 : 200;
        const centerBurst = document.createElement('div');
        centerBurst.style.position = 'fixed';
        centerBurst.style.left = x + 'px';
        centerBurst.style.top = y + 'px';
        centerBurst.style.width = size === 'large' ? '30px' : '20px';
        centerBurst.style.height = size === 'large' ? '30px' : '20px';
        centerBurst.style.background = 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,215,0,0.08) 30%, rgba(255,107,107,0.05) 60%, transparent 100%)';
        centerBurst.style.borderRadius = '50%';
        centerBurst.style.zIndex = '1000';
        centerBurst.style.pointerEvents = 'none';
        centerBurst.style.boxShadow = '0 0 30px rgba(255,215,0,0.2), 0 0 50px rgba(255,107,107,0.15)';
        centerBurst.style.animation = 'firework-center 0.6s ease-out forwards';
        document.body.appendChild(centerBurst);
        for (let i = 0; i < sparkleCount; i++) {
            setTimeout(() => {
                const angle = (i / sparkleCount) * 2 * Math.PI + (Math.random() - 0.5) * 0.4;
                const distance = (Math.random() * 0.8 + 0.4) * maxDistance;
                const duration = 1500 + Math.random() * 700;
                this.createSparkleWithTrail(x, y, angle, distance, duration, colors, size);
            }, i * 6);
        }
        setTimeout(() => {
            if (document.body.contains(centerBurst)) {
                document.body.removeChild(centerBurst);
            }
        }, 700);
    }

    createSparkleWithTrail(x, y, angle, distance, duration, colors, size) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const sparkle = document.createElement('div');
        sparkle.style.position = 'fixed';
        sparkle.style.left = x + 'px';
        sparkle.style.top = y + 'px';
        sparkle.style.width = '10px';
        sparkle.style.height = '10px';
        sparkle.style.background = color;
        sparkle.style.borderRadius = '50%';
        sparkle.style.zIndex = '999';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.transition = `all ${duration}ms ease-out`;
        document.body.appendChild(sparkle);
        setTimeout(() => {
            const spreadMultiplier = 1.5;
            const endX = x + Math.cos(angle) * distance * spreadMultiplier;
            const endY = y + Math.sin(angle) * distance * spreadMultiplier - Math.random() * 40;
            sparkle.style.left = endX + 'px';
            sparkle.style.top = endY + 'px';
            sparkle.style.opacity = '0';
            sparkle.style.transform = 'scale(0.3)';
        }, 30);
        setTimeout(() => {
            if (document.body.contains(sparkle)) {
                document.body.removeChild(sparkle);
            }
        }, duration);
    }

    showMiniCelebration(block) {
        const rect = block.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const fireworkColors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF1493'];
        const sparkCount = 8 + Math.floor(Math.random() * 3);
        for (let i = 0; i < sparkCount; i++) {
            const spark = document.createElement('div');
            spark.style.position = 'fixed';
            spark.style.left = centerX + 'px';
            spark.style.top = centerY + 'px';
            spark.style.width = '12px';
            spark.style.height = '12px';
            spark.style.borderRadius = '50%';
            spark.style.backgroundColor = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
            spark.style.boxShadow = `0 0 15px ${fireworkColors[Math.floor(Math.random() * fireworkColors.length)]}`;
            spark.style.zIndex = '1000';
            spark.style.pointerEvents = 'none';
            spark.style.opacity = '1';
            spark.style.transition = 'all 1.0s ease-out';
            document.body.appendChild(spark);
            setTimeout(() => {
                const angle = (i / sparkCount) * 2 * Math.PI + (Math.random() - 0.5) * 0.3;
                const distance = 60 + Math.random() * 40;
                const newX = centerX + Math.cos(angle) * distance;
                const newY = centerY + Math.sin(angle) * distance - Math.random() * 20;
                spark.style.left = newX + 'px';
                spark.style.top = newY + 'px';
                spark.style.opacity = '0';
                spark.style.transform = 'scale(0.3)';
            }, 50 + i * 20);
            setTimeout(() => {
                if (document.body.contains(spark)) {
                    document.body.removeChild(spark);
                }
            }, 1200);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.salesLottery = new SalesLottery();
});