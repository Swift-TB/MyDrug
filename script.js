class DrugManager {
    constructor() {
        this.drugs = this.loadDrugs();
        this.editingId = null;
        this.drugDosageDatabase = this.initDrugDosageDatabase();
        this.lastImportBackup = null;
        this.init();
    }

    // 初始化药物剂量数据库
    initDrugDosageDatabase() {
        return {
            '阿司匹林': ['25mg', '40mg', '50mg', '100mg', '300mg'],
            '阿司匹林肠溶片': ['25mg', '40mg', '50mg', '100mg', '300mg'],
            '对乙酰氨基酚': ['325mg', '500mg', '650mg'],
            '泰诺': ['325mg', '500mg', '650mg'],
            '扑热息痛': ['325mg', '500mg', '650mg'],
            '布洛芬': ['100mg', '200mg', '400mg', '600mg', '800mg'],
            '芬必得': ['200mg', '400mg'],
            '氨氯地平': ['2.5mg', '5mg', '10mg'],
            '苯磺酸氨氯地平': ['2.5mg', '5mg', '10mg'],
            '络活喜': ['2.5mg', '5mg', '10mg'],
            '硝苯地平': ['10mg', '20mg', '30mg'],
            '硝苯地平缓释片': ['10mg', '20mg', '30mg'],
            '硝苯地平控释片': ['30mg'],
            '辛伐他汀': ['5mg', '10mg', '20mg', '40mg'],
            '阿托伐他汀': ['10mg', '20mg', '40mg', '80mg'],
            '瑞舒伐他汀': ['5mg', '10mg', '20mg', '40mg'],
            '美托洛尔': ['25mg', '50mg', '100mg'],
            '比索洛尔': ['2.5mg', '5mg', '10mg'],
            '卡托普利': ['12.5mg', '25mg', '50mg'],
            '依那普利': ['5mg', '10mg', '20mg'],
            '氯沙坦': ['50mg', '100mg'],
            '缬沙坦': ['80mg', '160mg'],
            '二甲双胍': ['250mg', '500mg', '850mg', '1000mg'],
            '格列美脲': ['1mg', '2mg', '3mg', '4mg', '6mg'],
            '格列齐特': ['80mg'],
            '格列吡嗪': ['5mg', '10mg'],
            '地高辛': ['0.125mg', '0.25mg'],
            '华法林': ['1mg', '2.5mg', '3mg', '5mg'],
            '氯吡格雷': ['25mg', '75mg'],
            '阿司匹林': ['25mg', '40mg', '50mg', '100mg', '300mg'],
            '西替利嗪': ['10mg'],
            '氯雷他定': ['10mg'],
            '奥美拉唑': ['10mg', '20mg', '40mg'],
            '兰索拉唑': ['15mg', '30mg'],
            '泮托拉唑': ['20mg', '40mg'],
            '艾司奥美拉唑': ['20mg', '40mg'],
            '多潘立酮': ['10mg'],
            '莫沙必利': ['5mg'],
            '蒙脱石散': ['3g'],
            '乳果糖': ['5ml', '10ml', '15ml'],
            '开塞露': ['10ml', '20ml']
        };
    }

    init() {
        this.bindEvents();
        this.renderDrugList();
        this.updateUndoButtonState(false);
    }

    loadDrugs() {
        const stored = localStorage.getItem('drugs');
        return stored ? JSON.parse(stored) : [];
    }

    saveDrugs() {
        localStorage.setItem('drugs', JSON.stringify(this.drugs));
    }

    bindEvents() {
        // 添加药物按钮
        document.getElementById('addDrugBtn').addEventListener('click', () => {
            this.openModal();
        });

        document.getElementById('addFirstDrugBtn').addEventListener('click', () => {
            this.openModal();
        });

        // 模态框事件
        document.querySelector('#drugModal .close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('drugForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveDrug();
        });

        // 搜索功能
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchDrugs(e.target.value);
        });

        // 频率下拉菜单变化事件
        document.getElementById('frequency').addEventListener('change', (e) => {
            const otherInput = document.getElementById('frequencyOther');
            if (e.target.value === 'frequency_other') {
                otherInput.style.display = 'block';
                otherInput.required = true;
            } else {
                otherInput.style.display = 'none';
                otherInput.required = false;
                otherInput.value = '';
            }
        });

        // 用法下拉菜单变化事件
        document.getElementById('administration').addEventListener('change', (e) => {
            const otherInput = document.getElementById('administrationOther');
            if (e.target.value === 'administration_other') {
                otherInput.style.display = 'block';
                otherInput.required = true;
            } else {
                otherInput.style.display = 'none';
                otherInput.required = false;
                otherInput.value = '';
            }
        });

        // 药物名称输入事件，自动匹配剂量
        document.getElementById('drugName').addEventListener('input', (e) => {
            this.updateDosageOptions(e.target.value.trim());
        });

        // 剂量下拉菜单选择事件
        document.getElementById('dosageSelect').addEventListener('change', (e) => {
            const dosageInput = document.getElementById('dosage');
            if (e.target.value) {
                dosageInput.value = e.target.value;
            }
        });

        document.getElementById('clearSearchBtn').addEventListener('click', () => {
            document.getElementById('searchInput').value = '';
            this.renderDrugList();
        });

        // 导入导出功能
        document.getElementById('importBtn').addEventListener('click', () => {
            this.openImportModal();
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportDrugs();
        });

        document.getElementById('undoImportBtn').addEventListener('click', () => {
            this.undoImport();
        });

        document.querySelector('#importModal .close').addEventListener('click', () => {
            this.closeImportModal();
        });

        document.getElementById('cancelImportBtn').addEventListener('click', () => {
            this.closeImportModal();
        });

        document.getElementById('confirmImportBtn').addEventListener('click', () => {
            this.importDrugs();
        });

        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                if (e.target.id === 'drugModal') {
                    this.closeModal();
                } else if (e.target.id === 'importModal') {
                    this.closeImportModal();
        this.updateUndoButtonState();
                }
            }
        });
    }

    openModal(drug = null) {
        const modal = document.getElementById('drugModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('drugForm');

        if (drug) {
            modalTitle.textContent = '编辑药物';
            document.getElementById('drugName').value = drug.name;
            document.getElementById('dosage').value = drug.dosage;
            document.getElementById('usageAmount').value = drug.usageAmount || '';
            
            // 更新剂量选项
            this.updateDosageOptions(drug.name);
            
            // 如果当前剂量在下拉选项中，设置选中状态
            const dosageSelect = document.getElementById('dosageSelect');
            if (dosageSelect.style.display !== 'none') {
                for (let i = 0; i < dosageSelect.options.length; i++) {
                    if (dosageSelect.options[i].value === drug.dosage) {
                        dosageSelect.selectedIndex = i;
                        break;
                    }
                }
            }
            
            // 处理频率
            if (drug.frequency) {
                if (drug.frequencyOther) {
                    document.getElementById('frequency').value = 'frequency_other';
                    document.getElementById('frequencyOther').value = drug.frequencyOther;
                    document.getElementById('frequencyOther').style.display = 'block';
                } else {
                    document.getElementById('frequency').value = drug.frequency;
                }
            }
            
            // 处理用法
            if (drug.administration) {
                if (drug.administrationOther) {
                    document.getElementById('administration').value = 'administration_other';
                    document.getElementById('administrationOther').value = drug.administrationOther;
                    document.getElementById('administrationOther').style.display = 'block';
                } else {
                    document.getElementById('administration').value = drug.administration;
                }
            }
            
            document.getElementById('effect').value = drug.effect || '';
            document.getElementById('contraindications').value = drug.contraindications || '';
            document.getElementById('notes').value = drug.notes || '';
            this.editingId = drug.id;
        } else {
            modalTitle.textContent = '添加药物';
            form.reset();
            this.editingId = null;
        }

        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('drugModal').style.display = 'none';
        document.getElementById('drugForm').reset();
        document.getElementById('dosageSelect').style.display = 'none';
        document.getElementById('frequencyOther').style.display = 'none';
        document.getElementById('administrationOther').style.display = 'none';
        this.editingId = null;
    }

    saveDrug() {
        const name = document.getElementById('drugName').value.trim();
        const dosage = document.getElementById('dosage').value.trim();
        const usageAmount = document.getElementById('usageAmount').value.trim();
        
        // 处理频率
        let frequency = '';
        let frequencyOther = '';
        const frequencySelect = document.getElementById('frequency').value;
        if (frequencySelect === 'frequency_other') {
            frequencyOther = document.getElementById('frequencyOther').value.trim();
            if (!frequencyOther) {
                alert('请填写频率');
                return;
            }
            frequency = frequencyOther;
        } else if (frequencySelect) {
            frequency = frequencySelect;
        } else {
            alert('请选择使用频次');
            return;
        }
        
        // 处理用法
        let administration = '';
        let administrationOther = '';
        const administrationSelect = document.getElementById('administration').value;
        if (administrationSelect === 'administration_other') {
            administrationOther = document.getElementById('administrationOther').value.trim();
            if (!administrationOther) {
                alert('请填写用法');
                return;
            }
            administration = administrationOther;
        } else if (administrationSelect) {
            administration = administrationSelect;
        } else {
            alert('请选择药物用法');
            return;
        }
        
        const effect = document.getElementById('effect').value.trim();
        const contraindications = document.getElementById('contraindications').value.trim();
        const notes = document.getElementById('notes').value.trim();

        if (!name || !dosage || !usageAmount) {
            alert('请填写药物名称、剂量和用量');
            return;
        }
        
        if (!effect) {
            alert('请填写药物作用');
            return;
        }

        const drugData = {
            name,
            dosage,
            usageAmount,
            frequency,
            frequencyOther,
            administration,
            administrationOther,
            effect,
            contraindications,
            notes,
            updatedAt: new Date().toISOString()
        };

        if (this.editingId) {
            const index = this.drugs.findIndex(drug => drug.id === this.editingId);
            if (index !== -1) {
                this.drugs[index] = { ...this.drugs[index], ...drugData };
            }
        } else {
            drugData.id = Date.now().toString();
            drugData.createdAt = new Date().toISOString();
            this.drugs.unshift(drugData);
        }

        this.saveDrugs();
        this.renderDrugList();
        this.closeModal();
    }

    deleteDrug(id) {
        if (confirm('确定要删除这个药物记录吗？')) {
            this.drugs = this.drugs.filter(drug => drug.id !== id);
            this.saveDrugs();
            this.renderDrugList();
        }
    }

    searchDrugs(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (!searchTerm) {
            this.renderDrugList();
            return;
        }

        const filtered = this.drugs.filter(drug => {
            return drug.name.toLowerCase().includes(searchTerm) ||
                   (drug.effect && drug.effect.toLowerCase().includes(searchTerm)) ||
                   drug.dosage.toLowerCase().includes(searchTerm) ||
                   (drug.usageAmount && drug.usageAmount.toLowerCase().includes(searchTerm)) ||
                   (drug.frequency && drug.frequency.toLowerCase().includes(searchTerm)) ||
                   (drug.administration && drug.administration.toLowerCase().includes(searchTerm)) ||
                   (drug.contraindications && drug.contraindications.toLowerCase().includes(searchTerm)) ||
                   (drug.notes && drug.notes.toLowerCase().includes(searchTerm));
        });
        
        this.renderDrugList(filtered);
    }

    // 获取频率显示文本
    getFrequencyDisplayText(frequency) {
        const frequencyMap = {
            'qd': 'qd - 每日一次',
            'bid': 'bid - 每日2次',
            'tid': 'tid - 每日3次',
            'qid': 'qid - 每日4次',
            'qh': 'qh - 每小时一次',
            'q2h': 'q2h - 每2小时一次',
            'q3h': 'q3h - 每3小时一次',
            'qxh': 'qxh - 每x小时一次',
            'q12h': 'q12h - 每12小时一次',
            'qod': 'qod - 隔日一次',
            'qw': 'qw - 每周一次',
            'qow': 'qow - 隔周一次',
            'biw': 'biw - 每周2次',
            'tiw': 'tiw - 每周3次',
            'q2w': 'q2w - 每2周一次',
            'q3w': 'q3w - 每3周一次',
            'q4w': 'q4w - 每4周一次',
            'qm': 'qm - 每月一次',
            'bim': 'bim - 每月2次',
            'q2m': 'q2m - 每2月一次',
            'once': 'once - 一次',
            'qm_morning': 'qm - 每晨一次',
            'qn': 'qn - 每晚一次',
            'ac': 'ac - 餐前',
            'pc': 'pc - 餐后',
            'hs': 'hs - 睡前',
            'st': 'st - 立即',
            'prn': 'prn - 必要时（长期）'
        };
        return frequencyMap[frequency] || frequency;
    }

    // 获取用法显示文本
    getAdministrationDisplayText(administration) {
        const administrationMap = {
            'ID': 'ID - 皮内注射',
            'H': 'H - 皮下注射',
            'IM': 'IM - 肌肉注射',
            'IV': 'IV - 静脉注射',
            'PO': 'PO - 口服',
            'ad_us_int': 'ad us.int - 内服',
            'ad_us_ext': 'ad us.ext - 外用',
            'IV_gtt': 'IV gtt - 静脉滴注',
            'Inhal': 'Inhal - 吸入'
        };
        return administrationMap[administration] || administration;
    }

    renderDrugList(drugs = this.drugs) {
        const drugList = document.getElementById('drugList');
        const emptyState = document.getElementById('emptyState');

        if (drugs.length === 0) {
            drugList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        drugList.style.display = 'grid';
        emptyState.style.display = 'none';

        drugList.innerHTML = drugs.map(drug => `
            <div class="drug-card">
                <div class="drug-name">${this.escapeHtml(drug.name)}</div>
                
                <div class="drug-info">
                    <strong>药物剂量</strong>
                    <div>${this.escapeHtml(drug.dosage)}</div>
                </div>

                <div class="drug-info">
                    <strong>药物用量</strong>
                    <div>${this.escapeHtml(drug.usageAmount || '')}</div>
                </div>
                
                ${drug.frequency ? `
                    <div class="drug-info">
                        <strong>使用频次</strong>
                        <div>${this.escapeHtml(this.getFrequencyDisplayText(drug.frequency))}</div>
                    </div>
                ` : ''}
                
                ${drug.administration ? `
                    <div class="drug-info">
                        <strong>药物用法</strong>
                        <div>${this.escapeHtml(this.getAdministrationDisplayText(drug.administration))}</div>
                    </div>
                ` : ''}
                
                ${drug.effect ? `
                    <div class="drug-info">
                        <strong>药物作用</strong>
                        <div>${this.escapeHtml(drug.effect)}</div>
                    </div>
                ` : ''}
                
                ${drug.contraindications ? `
                    <div class="drug-info">
                        <strong>使用禁忌</strong>
                        <div>${this.escapeHtml(drug.contraindications)}</div>
                    </div>
                ` : ''}
                
                ${drug.notes ? `
                    <div class="drug-info">
                        <strong>注意事项</strong>
                        <div>${this.escapeHtml(drug.notes)}</div>
                    </div>
                ` : ''}
                
                <div class="drug-actions">
                    <button class="btn btn-edit" onclick="drugManager.openModal(${JSON.stringify(drug).replace(/"/g, '&quot;')})">
                        编辑
                    </button>
                    <button class="btn btn-delete" onclick="drugManager.deleteDrug('${drug.id}')">
                        删除
                    </button>
                </div>
            </div>
        `).join('');
    }

    openImportModal() {
        document.getElementById('importModal').style.display = 'block';
        document.getElementById('importFile').value = '';
    }

    closeImportModal() {
        document.getElementById('importModal').style.display = 'none';
    }

    importDrugs() {
        const fileInput = document.getElementById('importFile');
        const file = fileInput.files[0];

        if (!file) {
            alert('请选择要导入的文件');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedDrugs = JSON.parse(e.target.result);
                
                if (!Array.isArray(importedDrugs)) {
                    throw new Error('文件格式不正确');
                }

                // 验证数据格式
                const validDrugs = importedDrugs.filter(drug => 
                    drug.name &&
                    drug.dosage &&
                    drug.usageAmount &&
                    drug.frequency &&
                    drug.administration &&
                    drug.effect
                );

                if (validDrugs.length === 0) {
                    throw new Error('文件中没有有效的药物数据');
                }

                // 添加新的ID和时间戳
                validDrugs.forEach(drug => {
                    drug.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                    drug.createdAt = new Date().toISOString();
                    drug.updatedAt = new Date().toISOString();
                });

                this.lastImportBackup = [...this.drugs];
                this.drugs = [...validDrugs, ...this.drugs];
                this.saveDrugs();
                this.renderDrugList();
                this.closeImportModal();
                this.updateUndoButtonState(true);
                alert(`成功导入 ${validDrugs.length} 个药物记录`);
                
            } catch (error) {
                alert('导入失败：' + error.message);
            }
        };

        reader.readAsText(file);
    }

    exportDrugs() {
        if (this.drugs.length === 0) {
            alert('没有可导出的数据');
            return;
        }

        const dataStr = JSON.stringify(this.drugs, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `药物记录_${new Date().toISOString().split('T')[0]}.json`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(link.href);
    }

    undoImport() {
        if (!this.lastImportBackup) {
            return;
        }
        this.drugs = [...this.lastImportBackup];
        this.saveDrugs();
        this.renderDrugList();
        this.lastImportBackup = null;
        this.updateUndoButtonState(false);
        alert('已撤销最近一次导入的数据。');
    }

    updateUndoButtonState(enabled = false) {
        const undoBtn = document.getElementById('undoImportBtn');
        if (!undoBtn) return;
        undoBtn.disabled = !enabled;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 更新剂量选项
    updateDosageOptions(drugName) {
        const dosageSelect = document.getElementById('dosageSelect');
        const dosageInput = document.getElementById('dosage');
        
        if (!drugName) {
            dosageSelect.style.display = 'none';
            dosageInput.value = '';
            return;
        }

        // 查找匹配的药物（支持模糊匹配）
        let matchedDosages = null;
        for (const [drug, dosages] of Object.entries(this.drugDosageDatabase)) {
            if (drug.includes(drugName) || drugName.includes(drug)) {
                matchedDosages = dosages;
                break;
            }
        }

        if (matchedDosages && matchedDosages.length > 0) {
            // 清空现有选项
            dosageSelect.innerHTML = '<option value="">请选择剂量</option>';
            
            // 添加剂量选项
            matchedDosages.forEach(dosage => {
                const option = document.createElement('option');
                option.value = dosage;
                option.textContent = dosage;
                dosageSelect.appendChild(option);
            });
            
            dosageSelect.style.display = 'block';
            
            // 如果当前输入的剂量不在选项中，清空输入
            if (dosageInput.value && !matchedDosages.includes(dosageInput.value)) {
                dosageInput.value = '';
            }
        } else {
            dosageSelect.style.display = 'none';
        }
    }
}

// 初始化应用
const drugManager = new DrugManager();