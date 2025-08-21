// Player Selection Page Logic
class PlayerSelection {
    constructor() {
        this.selectedGroup = null;
        this.selectedPlayer = null;
        this.currentPage = 1;
        this.playersPerPage = 12;
        this.filteredPlayers = [];
        this.filteredGroups = [];
        
        // Generate groups with workers
        this.groupData = this.generateGroupData();
        
        this.init();
    }
    
    generateGroupData() {
        // Group-based organization with real worker names
        const groups = {
            'sales-team': {
                id: 'sales-team',
                name: 'Sales Team',
                icon: '💼',
                description: 'Sales Representatives & Account Managers',
                workers: [
                    { name: 'WongKamWing', tickets: 25, employeeId: 'EMP001001' },
                    { name: 'ChanSiuMing', tickets: 50, employeeId: 'EMP001002' },
                    { name: 'LeungWaiMan', tickets: 32, employeeId: 'EMP001003' },
                    { name: 'LiMeiLing', tickets: 22, employeeId: 'EMP001004' },
                    { name: 'LiuChunWai', tickets: 70, employeeId: 'EMP001005' },
                    { name: 'YipSukYee', tickets: 20, employeeId: 'EMP001006' },
                    { name: 'FungKaiMing', tickets: 38, employeeId: 'EMP001007' },
                    { name: 'ChengMeiYuk', tickets: 56, employeeId: 'EMP001008' },
                    { name: 'YuenWaiLun', tickets: 30, employeeId: 'EMP001009' },
                    { name: 'LeeYinWah', tickets: 46, employeeId: 'EMP001010' },
                    { name: 'TamShukLing', tickets: 25, employeeId: 'EMP001011' },
                    { name: 'SitKamPo', tickets: 42, employeeId: 'EMP001012' }
                ]
            },
            'marketing-team': {
                id: 'marketing-team',
                name: 'Marketing Team',
                icon: '📢',
                description: 'Marketing Specialists & Campaign Managers',
                workers: [
                    { name: 'TangChiKeung', tickets: 40, employeeId: 'EMP002001' },
                    { name: 'YeungSukFan', tickets: 17, employeeId: 'EMP002002' },
                    { name: 'LauHoiYan', tickets: 35, employeeId: 'EMP002003' },
                    { name: 'ChowKinWah', tickets: 29, employeeId: 'EMP002004' },
                    { name: 'NgWingYiu', tickets: 47, employeeId: 'EMP002005' },
                    { name: 'MakYeePing', tickets: 23, employeeId: 'EMP002006' },
                    { name: 'TsoiMingFai', tickets: 35, employeeId: 'EMP002007' },
                    { name: 'CheungSoWah', tickets: 27, employeeId: 'EMP002008' }
                ]
            },
            'operations-team': {
                id: 'operations-team',
                name: 'Operations Team',
                icon: '⚙️',
                description: 'Operations & Support Staff',
                workers: [
                    { name: 'LamKaYan', tickets: 60, employeeId: 'EMP003001' },
                    { name: 'WuChiHung', tickets: 12, employeeId: 'EMP003002' },
                    { name: 'HoSiuLan', tickets: 39, employeeId: 'EMP003003' },
                    { name: 'KwanYukMing', tickets: 49, employeeId: 'EMP003004' },
                    { name: 'LoiSiuFung', tickets: 33, employeeId: 'EMP003005' },
                    { name: 'ChanKinYip', tickets: 54, employeeId: 'EMP003006' },
                    { name: 'WongLaiYing', tickets: 16, employeeId: 'EMP003007' },
                    { name: 'TseungWaiChung', tickets: 44, employeeId: 'EMP003008' }
                ]
            },
            'customer-service': {
                id: 'customer-service',
                name: 'Customer Service',
                icon: '🎧',
                description: 'Customer Support & Relations',
                workers: [
                    { name: 'MaHokKwan', tickets: 19, employeeId: 'EMP004001' },
                    { name: 'ChuiMingTak', tickets: 64, employeeId: 'EMP004002' },
                    { name: 'KongSumYee', tickets: 37, employeeId: 'EMP004003' },
                    { name: 'PoonChiWing', tickets: 50, employeeId: 'EMP004004' },
                    { name: 'LokYeePing', tickets: 28, employeeId: 'EMP004005' },
                    { name: 'HuiWaiMing', tickets: 41, employeeId: 'EMP004006' },
                    { name: 'YungSiuLan', tickets: 24, employeeId: 'EMP004007' }
                ]
            },
            'claims-department': {
                id: 'claims-department',
                name: 'Claims Department',
                icon: '📋',
                description: 'Claims Processing & Assessment',
                workers: [
                    { name: 'LawKamWah', tickets: 56, employeeId: 'EMP005001' },
                    { name: 'NgaiMeiHong', tickets: 32, employeeId: 'EMP005002' },
                    { name: 'SoYukFan', tickets: 21, employeeId: 'EMP005003' },
                    { name: 'WanHoiLam', tickets: 62, employeeId: 'EMP005004' },
                    { name: 'YipChunKit', tickets: 26, employeeId: 'EMP005005' },
                    { name: 'LiuSukMei', tickets: 38, employeeId: 'EMP005006' }
                ]
            },
            'administration': {
                id: 'administration',
                name: 'Administration',
                icon: '📊',
                description: 'HR, Finance & Admin Support',
                workers: [
                    { name: 'ChanWingHo', tickets: 47, employeeId: 'EMP006001' },
                    { name: 'LeeMingYee', tickets: 35, employeeId: 'EMP006002' },
                    { name: 'KwokSiuWah', tickets: 13, employeeId: 'EMP006003' },
                    { name: 'LauChiMing', tickets: 58, employeeId: 'EMP006004' },
                    { name: 'TangSukLan', tickets: 39, employeeId: 'EMP006005' },
                    { name: 'HoKinWai', tickets: 29, employeeId: 'EMP006006' },
                    { name: 'ChowYeePing', tickets: 51, employeeId: 'EMP006007' },
                    { name: 'WongWaiChung', tickets: 25, employeeId: 'EMP006008' },
                    { name: 'LiSiuFan', tickets: 17, employeeId: 'EMP006009' },
                    { name: 'NgMingTak', tickets: 42, employeeId: 'EMP006010' }
                ]
            }
        };
        
        // Calculate total statistics for each group
        Object.values(groups).forEach(group => {
            group.totalWorkers = group.workers.length;
            group.totalTickets = group.workers.reduce((sum, worker) => sum + worker.tickets, 0);
        });
        
        return groups;
    }
    
    init() {
        this.setupEventListeners();
        this.populateGroupGrid();
    }
    
    setupEventListeners() {
        // Group search
        document.getElementById('group-search').addEventListener('input', (e) => {
            this.filterGroups(e.target.value);
        });
        
        // Player search
        document.getElementById('player-search').addEventListener('input', (e) => {
            this.filterPlayers(e.target.value);
        });
        
        // Pagination
        document.getElementById('prev-page').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.displayPlayers();
            }
        });
        
        document.getElementById('next-page').addEventListener('click', () => {
            const totalPages = Math.ceil(this.filteredPlayers.length / this.playersPerPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.displayPlayers();
            }
        });
        
        // Back button
        document.getElementById('back-btn').addEventListener('click', () => {
            this.goBackToGroups();
        });
        
        // Proceed button
        document.getElementById('proceed-btn').addEventListener('click', () => {
            this.proceedToDrawing();
        });
    }
    
    populateGroupGrid() {
        this.filteredGroups = Object.values(this.groupData);
        this.displayGroups();
    }
    
    displayGroups() {
        const groupGrid = document.getElementById('group-grid');
        
        groupGrid.innerHTML = this.filteredGroups.map(group => `
            <div class="area-card" data-group="${group.id}">
                <div class="area-icon">${group.icon}</div>
                <h3>${group.name}</h3>
                <p class="group-description">${group.description}</p>
                <div class="area-stats">
                    <span class="worker-count">${group.totalWorkers} workers</span>
                    <span class="ticket-count">${group.totalTickets} tickets</span>
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
            group.description.toLowerCase().includes(term)
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
        document.querySelector(`[data-group="${groupId}"]`).classList.add('selected');
        
        // Show player selection step
        this.showPlayerStep(group);
        this.populatePlayerGrid(group);
    }
    
    showPlayerStep(group) {
        document.getElementById('player-step').style.display = 'block';
        document.getElementById('back-btn').style.display = 'inline-block';
        document.getElementById('selected-group-name').textContent = group.name;
        
        // Reset search
        document.getElementById('player-search').value = '';
        this.currentPage = 1;
        
        // Very smooth scroll to player step with longer duration
        setTimeout(() => {
            const playerStep = document.getElementById('player-step');
            playerStep.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
            });
        }, 150);
    }
    
    populatePlayerGrid(group) {
        this.filteredPlayers = [...group.workers];
        this.sortPlayers('name');
        this.displayPlayers();
    }
    
    displayPlayers() {
        const playerGrid = document.getElementById('player-grid');
        const startIndex = (this.currentPage - 1) * this.playersPerPage;
        const endIndex = startIndex + this.playersPerPage;
        const playersToShow = this.filteredPlayers.slice(startIndex, endIndex);
        
        playerGrid.innerHTML = playersToShow.map(player => `
            <div class="player-card" data-player="${player.employeeId}">
                <div class="player-avatar">👤</div>
                <h3>${player.name}</h3>
                <div class="employee-id">${player.employeeId}</div>
                <div class="ticket-info">
                    <div class="ticket-count">
                        <span class="ticket-icon">🎫</span>
                        <span class="ticket-number">${player.tickets}</span>
                        <span class="ticket-label">tickets</span>
                    </div>
                    <div class="ticket-level ${this.getTicketLevel(player.tickets)}">
                        ${this.getTicketLevelText(player.tickets)}
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
        
        if (totalPages > 1) {
            paginationDiv.style.display = 'flex';
            pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
            prevBtn.disabled = this.currentPage === 1;
            nextBtn.disabled = this.currentPage === totalPages;
        } else {
            paginationDiv.style.display = 'none';
        }
    }
    
    filterPlayers(searchTerm) {
        const term = searchTerm.toLowerCase();
        const group = this.groupData[this.selectedGroup];
        this.filteredPlayers = group.workers.filter(player => 
            player.name.toLowerCase().includes(term) || 
            player.employeeId.toLowerCase().includes(term)
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
    
    getTicketLevel(tickets) {
        if (tickets >= 50) return 'high';
        if (tickets >= 25) return 'medium';
        return 'low';
    }
    
    getTicketLevelText(tickets) {
        if (tickets >= 50) return '⭐⭐⭐ High Volume';
        if (tickets >= 25) return '⭐⭐ Medium Volume';
        return '⭐ Standard Volume';
    }
    
    selectPlayer(employeeId) {
        this.selectedPlayer = employeeId;
        
        // Update UI
        document.querySelectorAll('.player-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-player="${employeeId}"]`).classList.add('selected');
        
        // Show proceed button
        document.getElementById('proceed-btn').style.display = 'inline-block';
        
        // Simple smooth scroll down to make the button visible
        setTimeout(() => {
            const proceedBtn = document.getElementById('proceed-btn');
            if (proceedBtn) {
                // Just scroll down to show the button, not center it
                proceedBtn.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest'
                });
                
                // Add a gentle pulse animation to draw attention
                setTimeout(() => {
                    proceedBtn.style.transform = 'scale(1.05)';
                    proceedBtn.style.transition = 'transform 0.5s ease-out';
                    setTimeout(() => {
                        proceedBtn.style.transform = 'scale(1)';
                    }, 500);
                }, 600);
            }
        }, 600);
    }
    
    goBackToGroups() {
        this.selectedGroup = null;
        this.selectedPlayer = null;
        
        // Hide player step
        document.getElementById('player-step').style.display = 'none';
        document.getElementById('back-btn').style.display = 'none';
        document.getElementById('proceed-btn').style.display = 'none';
        
        // Clear group selections
        document.querySelectorAll('.area-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Scroll back to top
        document.querySelector('.selection-container').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
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
            id: `${group.name}-${playerData.name}`, // Format: Group-Name for lottery system
            name: playerData.name,
            tickets: playerData.tickets,
            employeeId: playerData.employeeId,
            groupName: group.name,
            groupId: this.selectedGroup
        }));
        
        // Navigate to drawing page
        window.location.href = 'drawing.html';
    }
    
    getTicketLevel(tickets) {
        if (tickets >= 60) return 'high';
        if (tickets >= 30) return 'medium';
        return 'low';
    }
    
    getTicketLevelText(tickets) {
        if (tickets >= 60) return '⭐⭐⭐ High Volume';
        if (tickets >= 30) return '⭐⭐ Medium Volume';
        return '⭐ Standard Volume';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PlayerSelection();
});
