document.addEventListener('DOMContentLoaded', () => {
    dayjs.locale('he');

    const App = {
        // Mock Data
        mockData: {
            customers: [
                { id: 1, name: "אורניל-כללי", phone: "972508860896", projects: [{ id: 'P1', name: "אלנבי", address: "ויצמן 4, רעננה" }] },
                { id: 2, name: "רמי לוי", phone: "972545998111", projects: [{ id: 'P2', name: "גינדי", address: "רמבם 29, יבנה" }] }
            ],
            containers: [
                { id: 'C-4588', customerId: 1, projectId: 'P1', rentalStartDate: '2025-08-20' }
            ],
            adminMessages: [
                { id: 1, text: "מבצע סוף שנה! כל שקי המלט ב-15% הנחה.", type: "promo" },
                { id: 2, text: "שימו לב, יתכנו עיכובים באספקה באזור המרכז.", type: "alert" },
                { id: 3, text: "חג שמח ושנה טובה מצוות סבן!", type: "info" }
            ]
        },

        state: {
            currentUser: null,
            currentStep: 1,
            orderData: {}
        },

        init() {
            this.cacheDOMElements();
            this.bindEvents();
            this.simulateLogin();
        },

        cacheDOMElements() {
            this.dom = {
                loadingSkeleton: document.getElementById('loading-skeleton'),
                appContent: document.getElementById('app-content'),
                userNamePlaceholder: document.getElementById('user-name-placeholder'),
                noticeCarousel: document.getElementById('notice-carousel'),
                activeContainers: document.getElementById('active-containers'),
                newOrderFab: document.getElementById('new-order-fab'),
                adminMessageBtn: document.getElementById('admin-message-btn'),
            };
        },

        bindEvents() {
            this.dom.newOrderFab.addEventListener('click', () => this.renderNewOrderModal());
            this.dom.adminMessageBtn.addEventListener('click', () => this.showAdminMessagePopup());
        },

        simulateLogin() {
            setTimeout(() => {
                this.state.currentUser = this.mockData.customers[0]; // Login as "אורניל"
                this.dom.userNamePlaceholder.textContent = this.state.currentUser.name;
                this.renderDashboard();

                this.dom.loadingSkeleton.classList.add('hidden');
                this.dom.appContent.classList.remove('hidden');
            }, 1500);
        },

        renderDashboard() {
            this.renderAdminMessages();
            this.renderActiveContainers();
        },

        renderAdminMessages() {
            this.dom.noticeCarousel.innerHTML = '';
            this.mockData.adminMessages.forEach((msg, index) => {
                const noticeEl = document.createElement('div');
                noticeEl.className = 'notice-item';
                if (msg.type === 'alert') {
                    noticeEl.classList.add('neon-text');
                }
                noticeEl.textContent = msg.text;
                noticeEl.style.animationDelay = `${index * 5}s`;
                this.dom.noticeCarousel.appendChild(noticeEl);
            });
        },

        renderActiveContainers() {
            const userContainers = this.mockData.containers.filter(c => c.customerId === this.state.currentUser.id);
            if (userContainers.length === 0) {
                this.dom.activeContainers.innerHTML = `
                    <div class="card" style="text-align: center;">
                        <p style="margin:0; color: var(--text-light);">אין מכולות פעילות כרגע.</p>
                    </div>`;
                return;
            }

            this.dom.activeContainers.innerHTML = userContainers.map(container => {
                const startDate = dayjs(container.rentalStartDate);
                const rentalDays = dayjs().diff(startDate, 'day');
                const isOverdue = rentalDays > 10;
                
                return `
                <div class="card ${isOverdue ? 'overdue-warning' : ''}">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <p style="font-weight: 700; color: var(--text-dark); margin: 0;">מכולה #${container.id}</p>
                        <p class="rental-days" style="margin: 0;">שכירות: ${rentalDays} ימים</p>
                    </div>
                    ${isOverdue ? `<p style="color: #ef4444; font-size: 0.8rem; margin: 0.5rem 0 0;">שימו לב, המכולה חורגת מתקופת השכירות!</p>` : ''}
                </div>`;
            }).join('');
        },

        renderNewOrderModal() {
            this.state.currentStep = 1;
            this.state.orderData = {};

            const modalHTML = `
                <div id="order-wizard">
                    <div class="progress-bar">
                        <div class="step active" data-step="1">1</div>
                        <div class="step" data-step="2">2</div>
                        <div class="step" data-step="3">3</div>
                    </div>
                    
                    <div class="wizard-step active" data-step="1">
                        <h3 class="font-heavy">שלב 1: פרטי הלקוח</h3>
                        <div class="form-group">
                            <label for="customer-search">חיפוש לקוח</label>
                            <input type="text" id="customer-search" class="swal2-input" placeholder="התחל להקליד שם או טלפון...">
                        </div>
                        <div class="form-group">
                            <label for="project-select">בחירת פרויקט</label>
                            <select id="project-select" class="swal2-select" disabled><option>בחר לקוח תחילה</option></select>
                        </div>
                         <div class="form-group">
                            <label for="delivery-address">כתובת אספקה</label>
                            <input type="text" id="delivery-address" class="swal2-input" placeholder="יתמלא אוטומטית מבחירת פרויקט">
                        </div>
                        <div class="form-group">
                            <label for="contact-person">איש קשר בשטח</label>
                            <input type="text" id="contact-person" class="swal2-input">
                        </div>
                    </div>

                    <div class="wizard-step" data-step="2">
                        <h3 class="font-heavy">שלב 2: פרטי הפעולה</h3>
                        <div class="form-group">
                            <label>סוג מכולה</label>
                            <input type="text" class="swal2-input" value="מכולה לפינוי פסולת בניין 8 קוב" readonly>
                        </div>
                         <div class="form-group">
                            <label>סוג הפעולה</label>
                            <div class="action-buttons">
                                <button type="button" class="action-btn" data-action="הורדה">📥 הורדה</button>
                                <button type="button" class="action-btn" data-action="החלפה">🔄 החלפה</button>
                                <button type="button" class="action-btn" data-action="העלאה">📤 העלאה</button>
                                <button type="button" class="action-btn" data-action="פינוי במקום">🗑️ פינוי במקום</button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="order-notes">הערות והוראות גישה</label>
                            <textarea id="order-notes" class="swal2-textarea" placeholder="לדוגמה: להניח ליד שער אחורי..."></textarea>
                        </div>
                    </div>

                     <div class="wizard-step" data-step="3">
                        <h3 class="font-heavy">שלב 3: סקירה ואישור</h3>
                        <div id="order-summary" class="bg-slate-100 p-4 rounded-lg text-right space-y-2">
                            <!-- Summary will be generated here -->
                        </div>
                        <p class="text-xs text-center text-slate-500 mt-4">בלחיצה על 'שלח הזמנה' אני מאשר את כל הפרטים.</p>
                    </div>
                </div>`;

            Swal.fire({
                title: 'הזמנת מכולה',
                html: modalHTML,
                confirmButtonText: 'הבא',
                showCancelButton: true,
                cancelButtonText: 'ביטול',
                allowOutsideClick: false,
                didOpen: () => this.initializeWizard(),
                preConfirm: () => this.handleWizardStep()
            }).then(result => {
                if(result.isConfirmed) {
                    this.sendOrder();
                }
            });
        },

        initializeWizard() {
            const customerSearch = document.getElementById('customer-search');
            const projectSelect = document.getElementById('project-select');
            const deliveryAddress = document.getElementById('delivery-address');
            const contactPerson = document.getElementById('contact-person');

            // Simulate selecting the current user
            customerSearch.value = this.state.currentUser.name;
            contactPerson.value = this.state.currentUser.name;
            
            projectSelect.innerHTML = this.state.currentUser.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
            projectSelect.disabled = false;

            const selectedProject = this.state.currentUser.projects.find(p => p.id === projectSelect.value);
            if (selectedProject) {
                deliveryAddress.value = selectedProject.address;
            }

            projectSelect.addEventListener('change', () => {
                 const selectedProject = this.state.currentUser.projects.find(p => p.id === projectSelect.value);
                 if (selectedProject) {
                    deliveryAddress.value = selectedProject.address;
                 }
            });

            document.querySelectorAll('.action-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.action-btn').forEach(b => b.classList.remove('selected'));
                    e.currentTarget.classList.add('selected');
                });
            });
        },

        handleWizardStep() {
            const stepData = this.captureStepData(this.state.currentStep);
            if (!stepData) return false; // Validation failed

            Object.assign(this.state.orderData, stepData);

            if (this.state.currentStep < 3) {
                this.state.currentStep++;
                this.updateWizardView();
                return false; // Prevent modal from closing
            } else {
                return true; // Final step, allow closing on confirm
            }
        },
        
        captureStepData(step) {
            if (step === 1) {
                const project = document.getElementById('project-select').selectedOptions[0].text;
                const address = document.getElementById('delivery-address').value;
                const contact = document.getElementById('contact-person').value;
                if (!address || !contact) {
                    Swal.showValidationMessage('יש למלא את כל השדות');
                    return null;
                }
                return { customer: this.state.currentUser.name, project, address, contact };
            }
            if (step === 2) {
                const action = document.querySelector('.action-btn.selected')?.dataset.action;
                if (!action) {
                    Swal.showValidationMessage('יש לבחור סוג פעולה');
                    return null;
                }
                const notes = document.getElementById('order-notes').value;
                return { containerType: '8 קוב', action, notes };
            }
            return {};
        },

        updateWizardView() {
            document.querySelectorAll('.wizard-step').forEach(stepEl => {
                stepEl.classList.toggle('active', parseInt(stepEl.dataset.step) === this.state.currentStep);
            });
            document.querySelectorAll('.progress-bar .step').forEach(stepEl => {
                const stepNum = parseInt(stepEl.dataset.step);
                stepEl.classList.toggle('active', stepNum === this.state.currentStep);
                stepEl.classList.toggle('completed', stepNum < this.state.currentStep);
            });
             if (this.state.currentStep === 3) {
                this.renderOrderSummary();
                Swal.getConfirmButton().textContent = 'שלח הזמנה';
            }
        },

        renderOrderSummary() {
            const { customer, project, address, contact, action, notes } = this.state.orderData;
            document.getElementById('order-summary').innerHTML = `
                <p><strong>לקוח:</strong> ${customer}</p>
                <p><strong>פרויקט:</strong> ${project}</p>
                <p><strong>כתובת:</strong> ${address}</p>
                <p><strong>איש קשר:</strong> ${contact}</p>
                <p><strong>פעולה:</strong> ${action}</p>
                ${notes ? `<p><strong>הערות:</strong> ${notes}</p>` : ''}
            `;
        },

        async sendOrder() {
            console.log("Sending order:", this.state.orderData);
            // In a real app, this would be a POST request to the API
            // const response = await apiCall('createOrder', this.state.orderData);
            Swal.fire({
                title: 'הזמנה נשלחה!',
                text: 'הבקשה שלך התקבלה ותטופל בהקדם.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            
            // Simulate WhatsApp message for overdue rental
            if (this.state.orderData.action === 'החלפה' || this.state.orderData.action === 'העלאה') {
                const container = this.mockData.containers.find(c => c.customerId === this.state.currentUser.id);
                if(container) {
                    const rentalDays = dayjs().diff(dayjs(container.rentalStartDate), 'day');
                    if (rentalDays > 10) {
                         const whatsappMessage = `התראת חריגת שכירות: מכולה ${container.id} של לקוח ${this.state.currentUser.name} נמצאת בשטח ${rentalDays} ימים. בוצעה פעולת ${this.state.orderData.action}.`;
                         console.log("WHATSAPP PAYLOAD:", whatsappMessage);
                    }
                }
            }
        },

        showAdminMessagePopup() {
            // A simple popup to show all messages
            const messagesHTML = this.mockData.adminMessages.map(msg => `<p class="p-2 border-b">${msg.text}</p>`).join('');
            Swal.fire({
                title: 'הודעות מערכת',
                html: `<div class="text-right">${messagesHTML}</div>`
            });
        }
    };

    App.init();
});
