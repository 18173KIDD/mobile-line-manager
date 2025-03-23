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

    setupPhoneNumberValidation() {
        const phoneInput = document.getElementById('phoneNumber');
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^\d-]/g, '');
            if (value.length > 0) {
                value = value.replace(/^(\d{2,3})(\d{4})(\d{4})$/, '$1-$2-$3');
            }
            e.target.value = value;
        });
    }

    setupAddOptionHandlers() {
        const addButtons = document.querySelectorAll('.add-option-btn');
        addButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target.dataset.target;
                this.addOption(target);
            });
        });
    }

    addOption(target) {
        const newFieldId = `new${target.charAt(0).toUpperCase() + target.slice(1)}`;
        const newValue = document.getElementById(newFieldId).value.trim();

        if (newValue) {
            if (target === 'owner' || target === 'user') {
                if (!this.people.includes(newValue)) {
                    this.people.push(newValue);
                    localStorage.setItem('people', JSON.stringify(this.people));
                    this.updatePeopleSelectOptions();
                }
            } else {
                const arrayName = `${target}s`;
                if (!this[arrayName].includes(newValue)) {
                    this[arrayName].push(newValue);
                    localStorage.setItem(arrayName, JSON.stringify(this[arrayName]));
                    this.updateSelectOptions();
                }
            }
            
            const selectElement = document.getElementById(target);
            selectElement.value = newValue;
            
            document.getElementById(newFieldId).value = '';
        }
    }

    setupDeleteOptionHandlers() {
        const deleteButtons = document.querySelectorAll('.delete-option-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target.dataset.target;
                this.showDeleteOptionsModal(target);
            });
        });
    }

    showDeleteOptionsModal(target) {
        const existingModal = document.querySelector('.option-modal');
        if (existingModal) {
            existingModal.remove();
        }

        let options;
        if (target === 'owner' || target === 'user') {
            options = this.people;
        } else {
            options = this[`${target}s`];
        }
        
        if (!options || options.length === 0) {
            alert('削除可能な選択肢がありません。');
            return;
        }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        document.body.appendChild(overlay);

        const modal = document.createElement('div');
        modal.className = 'option-modal';
        modal.innerHTML = `
            <h3>${this.getTargetLabel(target)}の選択肢削除</h3>
            <ul>
                ${options.map(option => `
                    <li>
                        ${option}
                        <button onclick="mobileLineManager.deleteOption('${target}', '${option}')">削除</button>
                    </li>
                `).join('')}
            </ul>
            <button onclick="this.closest('.option-modal').remove();document.querySelector('.modal-overlay').remove()">閉じる</button>
        `;
        document.body.appendChild(modal);
    }