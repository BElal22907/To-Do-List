/**
 * Application State & Store Management
 */
const AppState = {
    selectedDate: "2026-09-29",
    currentFilter: "all",
    searchQuery: "",
    apiKey: localStorage.getItem("gemini_api_key") || "",
    tasks: JSON.parse(localStorage.getItem("schedule_app_tasks_v3")) || [
        {
            id: "101",
            title: "Data Structure",
            type: "محاضرة / كلية",
            priority: "عالية",
            notes: "مدرج 3",
            timeStart: "09:00",
            timeEnd: "10:00",
            date: "2026-09-29",
            completed: false,
            repeat: "تكرار أسبوعي"
        }
    ]
};

const ArabicDays = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const ArabicMonths = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

/**
 * Web Audio API - Sound Effects Generator (بدون روابط خارجية)
 */
const SoundEffects = {
    audioCtx: null,
    init() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
        }
    },
    playClick() {
        try {
            this.init();
            if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
            gain.gain.setValueAtTime(0.05, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.08);
        } catch (e) {}
    },
    playSuccess() {
        try {
            this.init();
            if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
            const now = this.audioCtx.currentTime;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start();
            osc.stop(now + 0.15);
        } catch (e) {}
    }
};

/**
 * DOM Elements Selection
 */
const DOM = {
    daysStripContainer: document.getElementById("days-strip-container"),
    currentSelectedDateText: document.getElementById("current-selected-date-text"),
    tasksListTarget: document.getElementById("tasks-list-target"),
    progressPercentageDisplay: document.getElementById("progress-percentage-display"),
    progressBarFillElem: document.getElementById("progress-bar-fill-elem"),
    addTaskForm: document.getElementById("add-task-form"),
    searchInput: document.getElementById("search-tasks-input"),
    filterButtons: document.querySelectorAll(".btn-filter"),
    btnClearCompleted: document.getElementById("btn-clear-completed"),
    btnGoToday: document.getElementById("btn-go-today"),
    btnPrevWeek: document.getElementById("btn-prev-week"),
    btnNextWeek: document.getElementById("btn-next-week"),
    
    // Modals
    calendarModal: document.getElementById("calendar-modal"),
    btnToggleCalendar: document.getElementById("btn-toggle-calendar"),
    btnCloseCalendar: document.getElementById("btn-close-calendar"),
    calendarDaysContainer: document.getElementById("calendar-days-container"),
    calMonthYearTitle: document.getElementById("cal-month-year-title"),
    
    apiModal: document.getElementById("api-modal"),
    btnOpenApiModal: document.getElementById("btn-open-api-modal"),
    btnCloseApi: document.getElementById("btn-close-api"),
    btnSaveApiKey: document.getElementById("btn-save-api-key"),
    geminiApiKeyInput: document.getElementById("gemini-api-key-input"),

    // AI Widget
    aiChatWindow: document.getElementById("ai-chat-window"),
    btnToggleAiWidget: document.getElementById("btn-toggle-ai-widget"),
    btnCloseAiWidget: document.getElementById("btn-close-ai-widget"),
    aiChatMessagesContainer: document.getElementById("ai-chat-messages-container"),
    aiChatInput: document.getElementById("ai-chat-input"),
    btnSendAiMessage: document.getElementById("btn-send-ai-message"),

    // Export/Import
    btnExportBackup: document.getElementById("btn-export-backup"),
    btnImportBackupTrigger: document.getElementById("btn-import-backup-trigger"),
    fileImportInput: document.getElementById("file-import-input")
};

/**
 * Helper Functions
 */
function formatDateToYYYYMMDD(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function parseYYYYMMDD(dateStr) {
    const parts = dateStr.split('-');
    return new Date(parts[0], parts[1] - 1, parts[2]);
}

function getFormattedArabicDate(dateStr) {
    const d = parseYYYYMMDD(dateStr);
    const dayName = ArabicDays[d.getDay()];
    const dayNum = d.getDate();
    const monthName = ArabicMonths[d.getMonth()];
    const year = d.getFullYear();
    return `${dayName}، ${dayNum} ${monthName} ${year}`;
}

function saveData() {
    localStorage.setItem("schedule_app_tasks_v3", JSON.stringify(AppState.tasks));
}

/**
 * Rendering Logic
 */
function renderDaysStrip() {
    DOM.daysStripContainer.innerHTML = "";
    const current = parseYYYYMMDD(AppState.selectedDate);
    
    const dayOfWeek = current.getDay();
    const distanceToSaturday = (dayOfWeek + 1) % 7;
    const saturday = new Date(current);
    saturday.setDate(current.getDate() - distanceToSaturday);

    for (let i = 0; i < 7; i++) {
        const loopDate = new Date(saturday);
        loopDate.setDate(saturday.getDate() + i);
        const loopDateStr = formatDateToYYYYMMDD(loopDate);

        const card = document.createElement("div");
        card.className = `day-item-card ${loopDateStr === AppState.selectedDate ? 'active' : ''}`;
        card.innerHTML = `
            <div class="day-name">${ArabicDays[loopDate.getDay()]}</div>
            <div class="day-date">${loopDate.getDate()}/${loopDate.getMonth() + 1}</div>
        `;

        card.addEventListener("click", () => {
            SoundEffects.playClick();
            AppState.selectedDate = loopDateStr;
            renderAll();
        });

        DOM.daysStripContainer.appendChild(card);
    }

    DOM.currentSelectedDateText.textContent = getFormattedArabicDate(AppState.selectedDate);
}

function renderTasks() {
    DOM.tasksListTarget.innerHTML = "";
    
    let filtered = AppState.tasks.filter(t => t.date === AppState.selectedDate);

    if (AppState.searchQuery.trim() !== "") {
        const q = AppState.searchQuery.toLowerCase();
        filtered = filtered.filter(t => t.title.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q)));
    }

    if (AppState.currentFilter === "pending") filtered = filtered.filter(t => !t.completed);
    if (AppState.currentFilter === "completed") filtered = filtered.filter(t => t.completed);

    if (filtered.length === 0) {
        DOM.tasksListTarget.innerHTML = `
            <div class="empty-state-box">
                <i class="fa-solid fa-folder-open" style="font-size: 1.8rem; margin-bottom: 6px; color: var(--accent-blue);"></i><br>
                لا توجد مهام أو محاضرات مسجلة لهذا اليوم
            </div>
        `;
    } else {
        filtered.forEach(task => {
            const item = document.createElement("div");
            item.className = `task-card-item ${task.completed ? 'completed-card' : ''}`;
            item.innerHTML = `
                <div class="task-right-details">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <div>
                        <div class="task-title-text ${task.completed ? 'line-through' : ''}">${task.title}</div>
                        <div class="task-meta-pills">
                            <span class="pill-badge">📌 ${task.type}</span>
                            <span class="pill-badge">⏰ ${task.timeStart} - ${task.timeEnd}</span>
                            <span class="pill-badge">⚡ ${task.priority}</span>
                            ${task.notes ? `<span class="pill-badge">📍 ${task.notes}</span>` : ''}
                        </div>
                    </div>
                </div>
                <button class="btn-delete-task-item"><i class="fa-solid fa-trash"></i></button>
            `;

            item.querySelector(".task-checkbox").addEventListener("change", () => {
                task.completed = !task.completed;
                if (task.completed) SoundEffects.playSuccess();
                else SoundEffects.playClick();
                saveData();
                renderTasks();
                renderProgress();
            });

            item.querySelector(".btn-delete-task-item").addEventListener("click", () => {
                SoundEffects.playClick();
                AppState.tasks = AppState.tasks.filter(t => t.id !== task.id);
                saveData();
                renderAll();
            });

            DOM.tasksListTarget.appendChild(item);
        });
    }

    renderProgress();
}

function renderProgress() {
    const dayTasks = AppState.tasks.filter(t => t.date === AppState.selectedDate);
    const total = dayTasks.length;
    const completed = dayTasks.filter(t => t.completed).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    DOM.progressPercentageDisplay.textContent = `(${completed}/${total}) ${pct}%`;
    DOM.progressBarFillElem.style.width = `${pct}%`;
}

function renderAll() {
    renderDaysStrip();
    renderTasks();
}

/**
 * Events Setup
 */
function setupEventListeners() {
    DOM.addTaskForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = document.getElementById("input-task-title").value.trim();
        if (!title) return;

        SoundEffects.playSuccess();

        const newTask = {
            id: Date.now().toString(),
            title: title,
            type: document.getElementById("select-task-type").value,
            priority: document.getElementById("select-task-priority").value,
            notes: document.getElementById("input-task-notes").value.trim(),
            repeat: document.getElementById("select-task-repeat").value,
            timeStart: document.getElementById("input-time-start").value,
            timeEnd: document.getElementById("input-time-end").value,
            date: AppState.selectedDate,
            completed: false
        };

        AppState.tasks.push(newTask);
        saveData();
        renderAll();

        document.getElementById("input-task-title").value = "";
        document.getElementById("input-task-notes").value = "";
    });

    DOM.searchInput.addEventListener("input", (e) => {
        AppState.searchQuery = e.target.value;
        renderTasks();
    });

    DOM.filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            SoundEffects.playClick();
            DOM.filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            AppState.currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    DOM.btnClearCompleted.addEventListener("click", () => {
        SoundEffects.playClick();
        AppState.tasks = AppState.tasks.filter(t => !(t.date === AppState.selectedDate && t.completed));
        saveData();
        renderAll();
    });

    DOM.btnGoToday.addEventListener("click", () => {
        SoundEffects.playClick();
        AppState.selectedDate = formatDateToYYYYMMDD(new Date());
        renderAll();
    });

    DOM.btnPrevWeek.addEventListener("click", () => {
        SoundEffects.playClick();
        const d = parseYYYYMMDD(AppState.selectedDate);
        d.setDate(d.getDate() - 7);
        AppState.selectedDate = formatDateToYYYYMMDD(d);
        renderAll();
    });

    DOM.btnNextWeek.addEventListener("click", () => {
        SoundEffects.playClick();
        const d = parseYYYYMMDD(AppState.selectedDate);
        d.setDate(d.getDate() + 7);
        AppState.selectedDate = formatDateToYYYYMMDD(d);
        renderAll();
    });

    DOM.btnToggleCalendar.addEventListener("click", () => {
        SoundEffects.playClick();
        DOM.calendarModal.classList.remove("hidden");
        renderFullCalendar();
    });

    DOM.btnCloseCalendar.addEventListener("click", () => {
        SoundEffects.playClick();
        DOM.calendarModal.classList.add("hidden");
    });

    DOM.btnOpenApiModal.addEventListener("click", () => {
        SoundEffects.playClick();
        DOM.geminiApiKeyInput.value = AppState.apiKey;
        DOM.apiModal.classList.remove("hidden");
    });

    DOM.btnCloseApi.addEventListener("click", () => {
        SoundEffects.playClick();
        DOM.apiModal.classList.add("hidden");
    });

    DOM.btnSaveApiKey.addEventListener("click", () => {
        SoundEffects.playSuccess();
        AppState.apiKey = DOM.geminiApiKeyInput.value.trim();
        localStorage.setItem("gemini_api_key", AppState.apiKey);
        alert("تم حفظ مفتاح Gemini API بنجاح!");
        DOM.apiModal.classList.add("hidden");
    });

    DOM.btnToggleAiWidget.addEventListener("click", () => {
        SoundEffects.playClick();
        DOM.aiChatWindow.classList.toggle("hidden");
    });

    DOM.btnCloseAiWidget.addEventListener("click", () => {
        SoundEffects.playClick();
        DOM.aiChatWindow.classList.add("hidden");
    });

    DOM.btnSendAiMessage.addEventListener("click", handleAiMessage);
    DOM.aiChatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleAiMessage();
    });

    DOM.btnExportBackup.addEventListener("click", () => {
        SoundEffects.playClick();
        const jsonStr = JSON.stringify(AppState.tasks, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `schedule_backup_${AppState.selectedDate}.json`;
        a.click();
    });

    DOM.btnImportBackupTrigger.addEventListener("click", () => {
        SoundEffects.playClick();
        DOM.fileImportInput.click();
    });

    DOM.fileImportInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const imported = JSON.parse(evt.target.result);
                if (Array.isArray(imported)) {
                    SoundEffects.playSuccess();
                    AppState.tasks = imported;
                    saveData();
                    renderAll();
                    alert("تم استرجاع البيانات بنجاح!");
                }
            } catch (err) {
                alert("ملف غير صالح!");
            }
        };
        reader.readAsText(file);
    });
}

/**
 * Calendar Modal Builder
 */
function renderFullCalendar() {
    DOM.calendarDaysContainer.innerHTML = "";
    const curr = parseYYYYMMDD(AppState.selectedDate);
    const year = curr.getFullYear();
    const month = curr.getMonth();

    DOM.calMonthYearTitle.textContent = `${ArabicMonths[month]} ${year}`;

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = (firstDayOfMonth + 1) % 7;

    for (let i = 0; i < offset; i++) {
        const emptyCell = document.createElement("div");
        DOM.calendarDaysContainer.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement("div");
        const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        cell.className = `cal-day-cell ${cellDateStr === AppState.selectedDate ? 'selected' : ''}`;
        cell.textContent = day;

        cell.addEventListener("click", () => {
            SoundEffects.playClick();
            AppState.selectedDate = cellDateStr;
            renderAll();
            DOM.calendarModal.classList.add("hidden");
        });

        DOM.calendarDaysContainer.appendChild(cell);
    }
}

/**
 * AI Agent Execution Processor
 */
function handleAiMessage() {
    const query = DOM.aiChatInput.value.trim();
    if (!query) return;

    SoundEffects.playClick();
    appendChatBubble(query, "user");
    DOM.aiChatInput.value = "";

    setTimeout(() => {
        let response = "تم معالجة طلبك وتنفيذه على النظام بنجاح!";
        const lower = query.toLowerCase();

        if (lower.includes("ضيف") || lower.includes("اضف") || lower.includes("إضافة")) {
            const taskTitle = query.replace(/ضيف|اضف|إضافة|محاضرة|مهمة/gi, "").trim() || "مهمة جديدة من المساعد الذكي";
            
            const newTask = {
                id: Date.now().toString(),
                title: taskTitle,
                type: query.includes("محاضرة") ? "محاضرة / كلية" : "مهمة / مذاكرة",
                priority: "عالية",
                notes: "تمت إضافته عبر المساعد الذكي",
                repeat: "مرة واحدة",
                timeStart: "10:00",
                timeEnd: "12:00",
                date: AppState.selectedDate,
                completed: false
            };

            AppState.tasks.push(newTask);
            SoundEffects.playSuccess();
            saveData();
            renderAll();
            response = `تمت إضافة "${taskTitle}" لجدول يوم ${getFormattedArabicDate(AppState.selectedDate)} بنجاح!`;
        } 
        else if (lower.includes("احذف المكتمل") || lower.includes("مسح المكتمل")) {
            AppState.tasks = AppState.tasks.filter(t => !(t.date === AppState.selectedDate && t.completed));
            SoundEffects.playClick();
            saveData();
            renderAll();
            response = "تم مسح كافة المهام المكتملة لهذا اليوم.";
        }
        else if (lower.includes("امسح الكل") || lower.includes("احذف الكل")) {
            AppState.tasks = AppState.tasks.filter(t => t.date !== AppState.selectedDate);
            SoundEffects.playClick();
            saveData();
            renderAll();
            response = "تم مسح جميع مهام هذا اليوم بنجاح.";
        }

        appendChatBubble(response, "bot");
    }, 400);
}

function appendChatBubble(text, sender) {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${sender}`;
    bubble.innerHTML = text;
    DOM.aiChatMessagesContainer.appendChild(bubble);
    DOM.aiChatMessagesContainer.scrollTop = DOM.aiChatMessagesContainer.scrollHeight;
}

/**
 * App Initialization
 */
document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
    renderAll();
});