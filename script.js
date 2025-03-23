// データ管理用のクラス
class MobileLineManager {
    constructor() {
        this.lines = JSON.parse(localStorage.getItem('mobileLines')) || [];
        this.carriers = JSON.parse(localStorage.getItem('carriers')) || [];
        this.people = JSON.parse(localStorage.getItem('people')) || [];
        this.currentSort = { field: 'contractDate', direction: 'asc' };
        this.searchText = '';
        this.filters = {
            carrier: '',
            owner: '',
            user: '',
            hasBullet: ''
        };
        
        this.migrateOldData();
        this.initializeApp();
    }
    
    migrateOldData() {
        const oldOwners = JSON.parse(localStorage.getItem('owners')) || [];
        const oldUsers = JSON.parse(localStorage.getItem('users')) || [];
        
        if (oldOwners.length > 0 || oldUsers.length > 0) {
            this.people = [...new Set([...this.people, ...oldOwners, ...oldUsers])];
            localStorage.setItem('people', JSON.stringify(this.people));
            
            localStorage.removeItem('owners');
            localStorage.removeItem('users');
            
            this.lines.forEach(line => {
                if (line.hasBullet === undefined) {
                    line.hasBullet = false;
                }
            });
            
            localStorage.setItem('mobileLines', JSON.stringify(this.lines));
        }
    }

    initializeApp() {
        this.setupFormHandlers();
        this.setupSelectHandlers();
        this.setupAddOptionHandlers();
        this.setupDeleteOptionHandlers();
        this.updateSelectOptions();
        this.setupSortHandlers();
        this.setupPhoneNumberValidation();
        this.setupSearchAndFilter();
        this.displayLines();
        this.setupContractPeriodHandler();
        this.setupFormToggle();
    }

    setupSearchAndFilter() {
        const searchInput = document.getElementById('searchInput');
        const filterCarrier = document.getElementById('filterCarrier');
        const filterOwner = document.getElementById('filterOwner');
        const filterUser = document.getElementById('filterUser');
        const filterBullet = document.getElementById('filterBullet');

        this.updateFilterOptions();

        searchInput.addEventListener('input', () => {
            this.searchText = searchInput.value.toLowerCase();
            this.displayLines();
        });

        filterCarrier.addEventListener('change', () => {
            this.filters.carrier = filterCarrier.value;
            this.displayLines();
        });

        filterOwner.addEventListener('change', () => {
            this.filters.owner = filterOwner.value;
            this.displayLines();
        });
        
        filterUser.addEventListener('change', () => {
            this.filters.user = filterUser.value;
            this.displayLines();
        });
        
        filterBullet.addEventListener('change', () => {
            this.filters.hasBullet = filterBullet.value;
            this.displayLines();
        });
    }

    updateFilterOptions() {
        const filterCarrier = document.getElementById('filterCarrier');
        const filterOwner = document.getElementById('filterOwner');
        const filterUser = document.getElementById('filterUser');

        filterCarrier.innerHTML = '<option value="">キャリア: すべて</option>';
        [...new Set(this.lines.map(line => line.carrier))]
            .filter(carrier => carrier)
            .sort()
            .forEach(carrier => {
                const option = document.createElement('option');
                option.value = carrier;
                option.textContent = carrier;
                filterCarrier.appendChild(option);
            });

        filterOwner.innerHTML = '<option value="">名義: すべて</option>';
        [...new Set(this.lines.map(line => line.owner))]
            .filter(owner => owner)
            .sort()
            .forEach(owner => {
                const option = document.createElement('option');
                option.value = owner;
                option.textContent = owner;
                filterOwner.appendChild(option);
            });
            
        filterUser.innerHTML = '<option value="">利用者: すべて</option>';
        [...new Set(this.lines.map(line => line.user))]
            .filter(user => user)
            .sort()
            .forEach(user => {
                const option = document.createElement('option');
                option.value = user;
                option.textContent = user;
                filterUser.appendChild(option);
            });
    }

    setupFormToggle() {
        const toggleBtn = document.getElementById('toggleForm');
        const formSection = document.getElementById('formSection');

        toggleBtn.addEventListener('click', () => {
            formSection.classList.toggle('hidden');
        });
    }