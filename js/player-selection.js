// Player Selection Page Logic
class PlayerSelection {
    constructor() {
        this.selectedGroup = null;
        this.selectedPlayer = null;
        this.currentPage = 1;
        this.playersPerPage = 12;
        this.filteredPlayers = [];
        this.filteredGroups = [];
        
        // Initialize the component
        this.init();
    }
    
    async init() {
        // Generate groups with workers - now async
        this.groupData = await this.generateGroupData();
        
        this.setupEventListeners();
        this.populateGroupGrid();
    }
    
    async generateGroupData() {
        // Load the real data from the extracted JSON file
        try {
            const response = await fetch('./extracted_data.json');
            const realData = await response.json();
            
            // Use the real data structure directly
            const groups = realData;
            
            // Calculate total statistics for each group
            Object.values(groups).forEach(group => {
                group.totalWorkers = group.workers.length;
                group.totalTickets = group.workers.reduce((sum, worker) => sum + worker.tickets, 0);
            });
            
            return groups;
        } catch (error) {
            console.error('Failed to load real data, using fallback dummy data:', error);
            
            // Fallback dummy data in case of error
            const groups = {
                'group-1': {
                    id: 'group-1',
                    name: 'Group 1',
                    icon: '👨‍👩‍👧‍👦',
                    description: 'Team Members',
                    workers: [
                        { name: 'WongKamWing', tickets: 25, employeeId: 'EMP001001' },
                        { name: 'ChanSiuMing', tickets: 50, employeeId: 'EMP001002' },
                        { name: 'LeungWaiMan', tickets: 32, employeeId: 'EMP001003' }
                    ]
                }
            };
            
            Object.values(groups).forEach(group => {
                group.totalWorkers = group.workers.length;
                group.totalTickets = group.workers.reduce((sum, worker) => sum + worker.tickets, 0);
            });
            
            return groups;
        }
    }
    
    setupEventListeners() {
        // Group search
        const groupSearch = document.getElementById('group-search');
        if (groupSearch) {
            groupSearch.addEventListener('input', (e) => {
                this.filterGroups(e.target.value);
            });
        }
        
        // Player search
        const playerSearch = document.getElementById('player-search');
        if (playerSearch) {
            playerSearch.addEventListener('input', (e) => {
                this.filterPlayers(e.target.value);
            });
        }
        
        // Pagination
        const prevPage = document.getElementById('prev-page');
        if (prevPage) {
            prevPage.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.displayPlayers();
                }
            });
        }
        
        const nextPage = document.getElementById('next-page');
        if (nextPage) {
            nextPage.addEventListener('click', () => {
                const totalPages = Math.ceil(this.filteredPlayers.length / this.playersPerPage);
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.displayPlayers();
                }
            });
        }
        
        // Back button
        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.goBackToGroups();
            });
        }
        
        // Proceed button
        const proceedBtn = document.getElementById('proceed-btn');
        if (proceedBtn) {
            proceedBtn.addEventListener('click', () => {
                this.proceedToDrawing();
            });
        }
    }
    
    populateGroupGrid() {
        this.filteredGroups = Object.values(this.groupData);
        this.displayGroups();
    }
    
    displayGroups() {
        const groupGrid = document.getElementById('group-grid');
        if (!groupGrid) {
            console.error('Group grid element not found');
            return;
        }
        
        // Always use list view layout
        groupGrid.innerHTML = this.filteredGroups.map(group => `
            <div class="area-card" data-group="${group.id}">
                <div class="area-icon">${group.icon}</div>
                <div class="area-card-content">
                    <div class="group-info">
                        <h3>Group ${group.groupNo}</h3>
                        <p class="group-description">${group.name}</p>
                    </div>
                    <div class="area-stats">
                        <span class="worker-count">${group.totalWorkers} workers</span>
                        <span class="ticket-count">${group.totalTickets} tickets</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add click listeners to group cards
        document.querySelectorAll('.area-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const groupId = card.dataset.group;
                this.selectGroup(groupId);
            });
        });
    }
    
    filterGroups(searchTerm) {
        const term = searchTerm.toLowerCase();
        this.filteredGroups = Object.values(this.groupData).filter(group => 
            group.name.toLowerCase().includes(term) ||
            group.groupNo.toLowerCase().includes(term)
        );
        this.displayGroups();
    }
    
    selectGroup(groupId) {
        this.selectedGroup = groupId;
        const group = this.groupData[groupId];
        
        // Update UI
        document.querySelectorAll('.area-card').forEach(card => {
            card.classList.remove('selected');
        });
        const selectedCard = document.querySelector(`[data-group="${groupId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        // Show player selection step
        this.showPlayerStep(group);
        this.populatePlayerGrid(group);
    }
    
    showPlayerStep(group) {
        const playerStep = document.getElementById('player-step');
        const backBtn = document.getElementById('back-btn');
        const selectedGroupName = document.getElementById('selected-group-name');
        
        if (playerStep) {
            playerStep.style.display = 'block';
        }
        if (backBtn) {
            backBtn.style.display = 'inline-block';
        }
        if (selectedGroupName) {
            selectedGroupName.textContent = `Group ${group.groupNo} - ${group.name}`;
        }
        
        // Reset search
        const playerSearch = document.getElementById('player-search');
        if (playerSearch) {
            playerSearch.value = '';
        }
        this.currentPage = 1;
        
        // Very smooth scroll to player step with longer duration
        setTimeout(() => {
            if (playerStep) {
                playerStep.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                });
            }
        }, 150);
    }
    
    populatePlayerGrid(group) {
        this.filteredPlayers = [...group.workers];
        this.sortPlayers('name');
        this.displayPlayers();
    }
    
    displayPlayers() {
        const playerGrid = document.getElementById('player-grid');
        if (!playerGrid) {
            console.error('Player grid element not found');
            return;
        }
        
        const startIndex = (this.currentPage - 1) * this.playersPerPage;
        const endIndex = startIndex + this.playersPerPage;
        const playersToShow = this.filteredPlayers.slice(startIndex, endIndex);
        
        playerGrid.innerHTML = playersToShow.map(player => `
            <div class="player-card" data-player="${player.employeeId}">
                <div class="player-avatar">👤</div>
                <h3>${player.name}</h3>
                <div class="ticket-info-separate">
                    <span class="ticket-icon">🎫</span>
                    <span class="ticket-text">${player.tickets} ticket${player.tickets > 1 ? 's' : ''}</span>
                </div>
                <div class="player-details">
                    <div class="agency-info">
                        <span class="agency-icon">🏢</span>
                        <span class="agency-code">${player.agent || 'N/A'}</span>
                    </div>
                    <div class="district-info">
                        <span class="district-icon">📍</span>
                        <span class="district-name">${player.district || 'N/A'}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add click listeners to player cards
        document.querySelectorAll('.player-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectPlayer(card.dataset.player);
            });
        });
        
        // Update pagination
        this.updatePagination();
    }
    
    updatePagination() {
        const totalPages = Math.ceil(this.filteredPlayers.length / this.playersPerPage);
        const paginationDiv = document.getElementById('pagination');
        const pageInfo = document.getElementById('page-info');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        
        if (paginationDiv && totalPages > 1) {
            paginationDiv.style.display = 'flex';
            if (pageInfo) {
                pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
            }
            if (prevBtn) {
                prevBtn.disabled = this.currentPage === 1;
            }
            if (nextBtn) {
                nextBtn.disabled = this.currentPage === totalPages;
            }
        } else if (paginationDiv) {
            paginationDiv.style.display = 'none';
        }
    }
    
    filterPlayers(searchTerm) {
        const term = searchTerm.toLowerCase();
        const group = this.groupData[this.selectedGroup];
        this.filteredPlayers = group.workers.filter(player => 
            player.name.toLowerCase().includes(term) || 
            (player.agent && player.agent.toLowerCase().includes(term))
        );
        this.currentPage = 1;
        this.displayPlayers();
    }
    
    sortPlayers(sortBy) {
        switch (sortBy) {
            case 'name':
                this.filteredPlayers.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'tickets-high':
                this.filteredPlayers.sort((a, b) => b.tickets - a.tickets);
                break;
            case 'tickets-low':
                this.filteredPlayers.sort((a, b) => a.tickets - b.tickets);
                break;
        }
        this.currentPage = 1;
        this.displayPlayers();
    }
    
    
    selectPlayer(employeeId) {
        this.selectedPlayer = employeeId;
        
        // Update UI
        document.querySelectorAll('.player-card').forEach(card => {
            card.classList.remove('selected');
        });
        const selectedCard = document.querySelector(`[data-player="${employeeId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        // Show proceed button
        const proceedBtn = document.getElementById('proceed-btn');
        if (proceedBtn) {
            proceedBtn.style.display = 'inline-block';
        }
        
        // Smooth scroll to the bottom of the page to show the proceed button
        setTimeout(() => {
            // Scroll to the very bottom of the page
            window.scrollTo({ 
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
            
            // Add a gentle pulse animation to draw attention to the button
            setTimeout(() => {
                if (proceedBtn) {
                    proceedBtn.style.transform = 'scale(1.05)';
                    proceedBtn.style.transition = 'transform 0.5s ease-out';
                    setTimeout(() => {
                        proceedBtn.style.transform = 'scale(1)';
                    }, 500);
                }
            }, 800);
        }, 300);
    }
    
    goBackToGroups() {
        this.selectedGroup = null;
        this.selectedPlayer = null;
        
        // Hide player step
        const playerStep = document.getElementById('player-step');
        const backBtn = document.getElementById('back-btn');
        const proceedBtn = document.getElementById('proceed-btn');
        
        if (playerStep) {
            playerStep.style.display = 'none';
        }
        if (backBtn) {
            backBtn.style.display = 'none';
        }
        if (proceedBtn) {
            proceedBtn.style.display = 'none';
        }
        
        // Clear group selections
        document.querySelectorAll('.area-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Scroll back to top
        const selectionContainer = document.querySelector('.selection-container');
        if (selectionContainer) {
            selectionContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }
    
    proceedToDrawing() {
        if (!this.selectedGroup || !this.selectedPlayer) {
            alert('Please select both a group and a player.');
            return;
        }
        
        // Find the selected player data
        const group = this.groupData[this.selectedGroup];
        const playerData = group.workers.find(p => p.employeeId === this.selectedPlayer);
        
        // Store selected player data in localStorage
        localStorage.setItem('selectedPlayer', JSON.stringify({
            id: `Group ${group.groupNo} ${group.name}-${playerData.name}`, // Format: Group X Name-Player for lottery system
            name: playerData.name,
            tickets: playerData.tickets,
            employeeId: playerData.employeeId,
            groupName: `Group ${group.groupNo} - ${group.name}`,
            groupId: this.selectedGroup,
            groupNo: group.groupNo
        }));
        
        // Navigate to drawing page
        window.location.href = 'drawing.html';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PlayerSelection();
});
