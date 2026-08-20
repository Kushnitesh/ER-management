// ER Patient Management System - Main Script

/**
 * Priority Queue / Max Heap Implementation
 * Higher severity means higher priority.
 * If severity is equal, earlier arrival time (smaller timestamp) means higher priority.
 */
class MaxHeap {
    constructor() {
        this.heap = [];
    }

    // Helper: Compare two patients to determine priority
    // Returns negative if 'a' should come before 'b' (higher priority)
    compare(a, b) {
        if (a.severity !== b.severity) {
            return b.severity - a.severity; // Higher severity comes first
        }
        // If severity is the same, compare arrival time (earlier is better)
        return a.arrivalTime.getTime() - b.arrivalTime.getTime();
    }

    parent(i) { return Math.floor((i - 1) / 2); }
    leftChild(i) { return 2 * i + 1; }
    rightChild(i) { return 2 * i + 2; }

    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    insert(patient) {
        this.heap.push(patient);
        this.bubbleUp(this.heap.length - 1);
    }

    bubbleUp(index) {
        while (index > 0) {
            let pIndex = this.parent(index);
            // If child has higher priority than parent, swap them
            if (this.compare(this.heap[index], this.heap[pIndex]) < 0) {
                this.swap(index, pIndex);
                index = pIndex;
            } else {
                break;
            }
        }
    }

    extractMax() {
        if (this.isEmpty()) return null;
        if (this.size() === 1) return this.heap.pop();

        const max = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.sinkDown(0);
        return max;
    }

    sinkDown(index) {
        const size = this.heap.length;
        while (true) {
            let left = this.leftChild(index);
            let right = this.rightChild(index);
            let highestPriority = index;

            if (left < size && this.compare(this.heap[left], this.heap[highestPriority]) < 0) {
                highestPriority = left;
            }
            if (right < size && this.compare(this.heap[right], this.heap[highestPriority]) < 0) {
                highestPriority = right;
            }

            if (highestPriority !== index) {
                this.swap(index, highestPriority);
                index = highestPriority;
            } else {
                break;
            }
        }
    }

    peek() {
        return this.isEmpty() ? null : this.heap[0];
    }

    size() {
        return this.heap.length;
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    getArray() {
        return [...this.heap];
    }
    
    // Get all sorted by extracting into a temporary array
    // Used for rendering the queue in order
    getSortedArray() {
        const tempHeap = new MaxHeap();
        tempHeap.heap = [...this.heap];
        const sorted = [];
        while(!tempHeap.isEmpty()) {
            sorted.push(tempHeap.extractMax());
        }
        return sorted;
    }
}

// Application State
const state = {
    patients: new MaxHeap(),
    treatedPatients: [],
    totalAdded: 0,
    patientIdCounter: 1
};

// DOM Element References (will be initialized on DOMContentLoaded)
const dom = {};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Collect DOM references - matching actual HTML element IDs
    dom.form = document.getElementById('patient-form');
    dom.nameInput = document.getElementById('patient-name');
    dom.ageInput = document.getElementById('patient-age');
    dom.genderInput = document.getElementById('patient-gender');
    dom.severityInput = document.getElementById('severity-level');
    dom.typeInput = document.getElementById('emergency-type');
    
    dom.queueContainer = document.getElementById('queue-container');
    dom.queueCount = document.getElementById('queue-count');
    dom.nextPatientContent = document.getElementById('next-patient-content');
    dom.heapVisualizer = document.getElementById('heap-container');
    dom.historyTableBody = document.getElementById('history-body');
    dom.historyEmpty = document.getElementById('history-empty');
    dom.historyTable = document.getElementById('history-table');
    
    dom.totalPatients = document.getElementById('total-patients');
    dom.waitingPatients = document.getElementById('waiting-patients');
    dom.criticalPatients = document.getElementById('critical-patients');
    dom.treatedPatients = document.getElementById('treated-patients');
    
    dom.treatBtn = document.getElementById('treat-btn');
    dom.demoBtn = document.getElementById('demo-btn');
    dom.notificationContainer = document.getElementById('notification-container');
    dom.headerTime = document.getElementById('header-time');
    
    // Event Listeners
    if(dom.form) dom.form.addEventListener('submit', handleAddPatient);
    if(dom.treatBtn) dom.treatBtn.addEventListener('click', handleTreatNext);
    if(dom.demoBtn) dom.demoBtn.addEventListener('click', addDemoPatients);

    // Start clock
    updateClock();
    setInterval(updateClock, 1000);

    // Initial render
    updateUI();
});

// Live Clock
function updateClock() {
    if (dom.headerTime) {
        dom.headerTime.textContent = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    }
}

// --- Helper Functions ---

function getSeverityLabel(level) {
    const labels = {
        5: 'Critical',
        4: 'Very Urgent',
        3: 'Urgent',
        2: 'Moderate',
        1: 'Low'
    };
    return labels[level] || 'Unknown';
}

function getSeverityColor(level) {
    const colors = {
        5: '#e74c3c', // Red
        4: '#e67e22', // Orange
        3: '#f1c40f', // Yellow
        2: '#3498db', // Blue
        1: '#2ecc71'  // Green
    };
    return colors[level] || '#95a5a6';
}

function getSeverityIcon(level) {
    const icons = {
        5: '🔴',
        4: '🟠',
        3: '🟡',
        2: '🔵',
        1: '🟢'
    };
    return icons[level] || '⚪';
}

function getEmergencyIcon(type) {
    const icons = {
        'Injury': '🩹',
        'Heart Problem': '❤️',
        'Breathing Problem': '🫁',
        'Accident': '🚑',
        'Fever': '🤒',
        'Other': '🏥'
    };
    return icons[type] || '🏥';
}

function formatTime(date) {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function showNotification(message, type = 'info') {
    if (!dom.notificationContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `notification toast-${type}`;
    // Basic inline styles in case CSS is missing, though CSS classes are preferred
    toast.style.padding = '15px 20px';
    toast.style.margin = '10px';
    toast.style.borderRadius = '5px';
    toast.style.color = 'white';
    toast.style.fontWeight = 'bold';
    toast.style.animation = 'slideIn 0.3s ease-out forwards';
    toast.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    
    if (type === 'success') toast.style.backgroundColor = '#2ecc71';
    else if (type === 'warning') toast.style.backgroundColor = '#f39c12';
    else toast.style.backgroundColor = '#3498db'; // info
    
    toast.textContent = message;
    
    dom.notificationContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function animateWorkflow(step) {
    // Assuming steps have class 'workflow-step' and id 'step-1', 'step-2', etc.
    const steps = document.querySelectorAll('.workflow-step');
    steps.forEach(s => s.classList.remove('active'));
    
    const activeStep = document.getElementById(`step-${step}`);
    if (activeStep) {
        activeStep.classList.add('active');
        // Pulse animation
        activeStep.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.1)' },
            { transform: 'scale(1)' }
        ], { duration: 500 });
    }
}

// --- Main Actions ---

function handleAddPatient(e) {
    if (e) e.preventDefault();
    
    // Read form values
    const name = dom.nameInput ? dom.nameInput.value.trim() : 'Unknown';
    const age = dom.ageInput ? parseInt(dom.ageInput.value, 10) : 0;
    const gender = dom.genderInput ? dom.genderInput.value : 'Unknown';
    const severity = dom.severityInput ? parseInt(dom.severityInput.value, 10) : 1;
    const emergencyType = dom.typeInput ? dom.typeInput.value : 'Other';
    
    if (!name || isNaN(age)) {
        showNotification('Please fill in all required fields.', 'warning');
        return;
    }
    
    addPatient(name, age, gender, severity, emergencyType);
    
    if(dom.form) dom.form.reset();
}

function addPatient(name, age, gender, severity, emergencyType) {
    const arrivalTime = new Date();
    
    const patient = {
        id: `PT-${state.patientIdCounter++}`,
        name,
        age,
        gender,
        severity,
        emergencyType,
        arrivalTime,
        arrivalTimeFormatted: formatTime(arrivalTime)
    };
    
    state.patients.insert(patient);
    state.totalAdded++;
    
    updateUI();
    showNotification(`${name} added to the priority queue.`, 'success');
    animateWorkflow('add'); // Step 1: Patient Added
    
    setTimeout(() => animateWorkflow('queue'), 800); // Step 2: Priority Queue
}

function handleTreatNext() {
    if (state.patients.isEmpty()) {
        showNotification('No patients waiting in the queue.', 'warning');
        return;
    }
    
    animateWorkflow('treat'); // Step 4: Treatment
    
    const patient = state.patients.extractMax();
    patient.treatedTime = new Date();
    patient.treatedTimeFormatted = formatTime(patient.treatedTime);
    patient.status = 'Treated';
    
    state.treatedPatients.push(patient);
    
    updateUI();
    showNotification(`${patient.name} has been treated.`, 'info');
    
    setTimeout(() => animateWorkflow('history'), 800); // Step 5: History
}

// --- UI Rendering ---

function updateUI() {
    updateDashboardStats();
    renderNextPatient();
    renderQueue();
    renderHeapVisualizer();
    renderTreatmentHistory();
}

function animateNumber(element, newValue) {
    if(!element) return;
    const current = parseInt(element.textContent || '0', 10);
    if (current !== newValue) {
        element.textContent = newValue;
        element.animate([
            { transform: 'scale(1)', color: 'inherit' },
            { transform: 'scale(1.2)', color: '#3498db' },
            { transform: 'scale(1)', color: 'inherit' }
        ], { duration: 300 });
    }
}

function updateDashboardStats() {
    animateNumber(dom.totalPatients, state.totalAdded);
    animateNumber(dom.waitingPatients, state.patients.size());
    
    const criticalCount = state.patients.getArray().filter(p => p.severity === 5).length;
    animateNumber(dom.criticalPatients, criticalCount);
    
    animateNumber(dom.treatedPatients, state.treatedPatients.length);
    
    // Update queue count badge
    if (dom.queueCount) {
        dom.queueCount.textContent = `${state.patients.size()} patient${state.patients.size() !== 1 ? 's' : ''}`;
    }
    
    // Enable/disable treat button
    if (dom.treatBtn) {
        dom.treatBtn.disabled = state.patients.isEmpty();
    }
}

function renderNextPatient() {
    if (!dom.nextPatientContent) return;
    
    const next = state.patients.peek();
    
    if (!next) {
        dom.nextPatientContent.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No patients in queue</p>
            </div>`;
        return;
    }
    
    const color = getSeverityColor(next.severity);
    const icon = getSeverityIcon(next.severity);
    const emergencyIcon = getEmergencyIcon(next.emergencyType);
    
    dom.nextPatientContent.innerHTML = `
        <div class="next-patient-card severity-${next.severity}">
            <div class="next-patient-badge">
                <span class="pulse-label">🚨 NEXT TO BE TREATED</span>
                <span class="severity-badge" style="background: ${color};">
                    ${icon} ${getSeverityLabel(next.severity)}
                </span>
            </div>
            <div class="next-patient-info">
                <div class="next-patient-details">
                    <h3 class="next-patient-name">${next.name}</h3>
                    <p class="next-patient-meta">ID: ${next.id} &bull; ${next.age} yrs &bull; ${next.gender}</p>
                </div>
                <div class="next-patient-emergency">
                    <span class="emergency-icon">${emergencyIcon}</span>
                    <span class="emergency-type">${next.emergencyType}</span>
                </div>
            </div>
            <div class="next-patient-time">
                <i class="fas fa-clock"></i> Waiting since: ${next.arrivalTimeFormatted}
            </div>
        </div>
    `;
}

function renderQueue() {
    if (!dom.queueContainer) return;
    
    dom.queueContainer.innerHTML = '';
    
    if (state.patients.isEmpty()) {
        dom.queueContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No patients in the emergency queue</p>
                <p class="empty-subtitle">Add a patient or click 'Add Demo Patients' to get started</p>
            </div>`;
        return;
    }
    
    const sortedPatients = state.patients.getSortedArray();
    
    sortedPatients.forEach((patient, index) => {
        const color = getSeverityColor(patient.severity);
        const icon = getSeverityIcon(patient.severity);
        
        const card = document.createElement('div');
        card.className = `patient-card severity-${patient.severity}`;
        card.style.animationDelay = `${index * 0.05}s`;
        
        const isFirst = index === 0;
        
        card.innerHTML = `
            ${isFirst ? '<div class="first-patient-label"><i class="fas fa-star"></i> NEXT TO BE TREATED</div>' : ''}
            <div class="patient-card-header">
                <h4 class="patient-name">${patient.name}</h4>
                <span class="severity-badge" style="background: ${color};">
                    ${icon} ${getSeverityLabel(patient.severity)}
                </span>
            </div>
            <div class="patient-card-body">
                <div class="patient-info-row">
                    <i class="fas fa-user"></i>
                    <span>${patient.age} yrs, ${patient.gender}</span>
                </div>
                <div class="patient-info-row">
                    <i class="fas fa-ambulance"></i>
                    <span>${getEmergencyIcon(patient.emergencyType)} ${patient.emergencyType}</span>
                </div>
                <div class="patient-info-row">
                    <i class="fas fa-clock"></i>
                    <span>${patient.arrivalTimeFormatted}</span>
                </div>
            </div>
        `;
        
        dom.queueContainer.appendChild(card);
    });
}

function renderHeapVisualizer() {
    if (!dom.heapVisualizer) return;
    
    const heap = state.patients.getArray();
    dom.heapVisualizer.innerHTML = '';
    
    if (heap.length === 0) {
        dom.heapVisualizer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-sitemap"></i>
                <p>Heap visualization will appear here</p>
                <p class="empty-subtitle">Add patients to see the Max Heap tree structure dynamically build</p>
            </div>`;
        return;
    }

    // Legend Header
    const legend = document.createElement('div');
    legend.className = 'heap-legend';
    legend.innerHTML = `
        <span class="legend-item"><span class="legend-dot" style="background: var(--severity-5);"></span> S5: Critical</span>
        <span class="legend-item"><span class="legend-dot" style="background: var(--severity-4);"></span> S4: Very Urgent</span>
        <span class="legend-item"><span class="legend-dot" style="background: var(--severity-3);"></span> S3: Urgent</span>
        <span class="legend-item"><span class="legend-dot" style="background: var(--severity-2);"></span> S2: Moderate</span>
        <span class="legend-item"><span class="legend-dot" style="background: var(--severity-1);"></span> S1: Low</span>
    `;
    dom.heapVisualizer.appendChild(legend);

    // Build SVG-based tree visualization
    const svgNS = "http://www.w3.org/2000/svg";
    const nodeRadius = 34;
    const levelHeight = 85;
    const totalLevels = Math.floor(Math.log2(heap.length)) + 1;
    const svgWidth = Math.max(650, Math.pow(2, totalLevels - 1) * (nodeRadius * 2 + 28));
    const svgHeight = totalLevels * levelHeight + 70;
    
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
    svg.style.maxWidth = svgWidth + "px";
    svg.style.margin = "0 auto";
    svg.style.display = "block";
    
    // Calculate positions for each node
    const positions = [];
    for (let i = 0; i < heap.length; i++) {
        const level = Math.floor(Math.log2(i + 1));
        const posInLevel = i - (Math.pow(2, level) - 1);
        const nodesInLevel = Math.pow(2, level);
        const spacing = svgWidth / (nodesInLevel + 1);
        const x = spacing * (posInLevel + 1);
        const y = level * levelHeight + 55;
        positions.push({ x, y });
    }
    
    // Draw edges (lines connecting parent to children)
    for (let i = 0; i < heap.length; i++) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        
        if (left < heap.length) {
            const line = document.createElementNS(svgNS, "line");
            line.setAttribute("x1", positions[i].x);
            line.setAttribute("y1", positions[i].y);
            line.setAttribute("x2", positions[left].x);
            line.setAttribute("y2", positions[left].y);
            line.setAttribute("stroke", "#cbd5e1");
            line.setAttribute("stroke-width", "3");
            line.setAttribute("stroke-linecap", "round");
            svg.appendChild(line);
        }
        if (right < heap.length) {
            const line = document.createElementNS(svgNS, "line");
            line.setAttribute("x1", positions[i].x);
            line.setAttribute("y1", positions[i].y);
            line.setAttribute("x2", positions[right].x);
            line.setAttribute("y2", positions[right].y);
            line.setAttribute("stroke", "#cbd5e1");
            line.setAttribute("stroke-width", "3");
            line.setAttribute("stroke-linecap", "round");
            svg.appendChild(line);
        }
    }
    
    // Draw nodes
    for (let i = 0; i < heap.length; i++) {
        const patient = heap[i];
        const color = getSeverityColor(patient.severity);
        const { x, y } = positions[i];
        const isRoot = (i === 0);
        
        // Group for interactive node
        const g = document.createElementNS(svgNS, "g");
        g.style.cursor = "pointer";
        g.style.transition = "transform 0.2s ease";
        
        // Tooltip
        const title = document.createElementNS(svgNS, "title");
        title.textContent = `${isRoot ? 'ROOT (Max Priority)\n' : ''}${patient.name} (${patient.age}y, ${patient.gender})\nEmergency: ${patient.emergencyType}\nSeverity: ${patient.severity} - ${getSeverityLabel(patient.severity)}\nArrived: ${patient.arrivalTimeFormatted}`;
        g.appendChild(title);

        // Root Node Pulse Outer Ring
        if (isRoot) {
            const rootRing = document.createElementNS(svgNS, "circle");
            rootRing.setAttribute("cx", x);
            rootRing.setAttribute("cy", y);
            rootRing.setAttribute("r", nodeRadius + 6);
            rootRing.setAttribute("fill", "none");
            rootRing.setAttribute("stroke", "#f59e0b");
            rootRing.setAttribute("stroke-width", "3");
            rootRing.setAttribute("stroke-dasharray", "4 2");
            svg.appendChild(rootRing);
        }
        
        // Node Circle
        const circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", nodeRadius);
        circle.setAttribute("fill", color);
        circle.setAttribute("stroke", isRoot ? "#f59e0b" : "white");
        circle.setAttribute("stroke-width", isRoot ? "4" : "3");
        circle.style.filter = isRoot ? "drop-shadow(0 0 10px rgba(245, 158, 11, 0.5))" : "drop-shadow(0 4px 6px rgba(0,0,0,0.15))";
        g.appendChild(circle);

        // Index Badge (Heap Index)
        const idxCircle = document.createElementNS(svgNS, "circle");
        idxCircle.setAttribute("cx", x + nodeRadius - 8);
        idxCircle.setAttribute("cy", y - nodeRadius + 8);
        idxCircle.setAttribute("r", "9");
        idxCircle.setAttribute("fill", "#0f4c75");
        idxCircle.setAttribute("stroke", "white");
        idxCircle.setAttribute("stroke-width", "1.5");
        g.appendChild(idxCircle);

        const idxText = document.createElementNS(svgNS, "text");
        idxText.setAttribute("x", x + nodeRadius - 8);
        idxText.setAttribute("y", y - nodeRadius + 11);
        idxText.setAttribute("text-anchor", "middle");
        idxText.setAttribute("fill", "white");
        idxText.setAttribute("font-size", "9");
        idxText.setAttribute("font-weight", "700");
        idxText.setAttribute("font-family", "Inter, sans-serif");
        idxText.textContent = i;
        g.appendChild(idxText);
        
        // Name text
        const nameText = document.createElementNS(svgNS, "text");
        nameText.setAttribute("x", x);
        nameText.setAttribute("y", y - 4);
        nameText.setAttribute("text-anchor", "middle");
        nameText.setAttribute("fill", "white");
        nameText.setAttribute("font-size", "11");
        nameText.setAttribute("font-weight", "700");
        nameText.setAttribute("font-family", "Inter, sans-serif");
        nameText.textContent = patient.name.split(' ')[0].substring(0, 7);
        g.appendChild(nameText);
        
        // Severity text
        const sevText = document.createElementNS(svgNS, "text");
        sevText.setAttribute("x", x);
        sevText.setAttribute("y", y + 13);
        sevText.setAttribute("text-anchor", "middle");
        sevText.setAttribute("fill", "white");
        sevText.setAttribute("font-size", "10");
        sevText.setAttribute("font-weight", "600");
        sevText.setAttribute("font-family", "Inter, sans-serif");
        sevText.textContent = `P:${patient.severity}`;
        g.appendChild(sevText);

        svg.appendChild(g);
    }
    
    dom.heapVisualizer.appendChild(svg);
}

function renderTreatmentHistory() {
    if (!dom.historyTableBody) return;
    
    dom.historyTableBody.innerHTML = '';
    
    if (state.treatedPatients.length === 0) {
        if (dom.historyEmpty) dom.historyEmpty.style.display = 'flex';
        if (dom.historyTable) dom.historyTable.style.display = 'none';
        return;
    }
    
    if (dom.historyEmpty) dom.historyEmpty.style.display = 'none';
    if (dom.historyTable) dom.historyTable.style.display = 'table';
    
    // Most recent first
    const reversed = [...state.treatedPatients].reverse();
    
    reversed.forEach((patient, index) => {
        const tr = document.createElement('tr');
        if (index === 0) {
            tr.style.animation = 'highlightRow 2s forwards';
        }
        
        tr.innerHTML = `
            <td>${reversed.length - index}</td>
            <td>${patient.name}</td>
            <td>${getEmergencyIcon(patient.emergencyType)} ${patient.emergencyType}</td>
            <td>
                <span class="severity-badge" style="background: ${getSeverityColor(patient.severity)};">
                    ${patient.severity} - ${getSeverityLabel(patient.severity)}
                </span>
            </td>
            <td>${patient.arrivalTimeFormatted}</td>
            <td>${patient.treatedTimeFormatted}</td>
            <td>
                <span class="status-badge treated">
                    <i class="fas fa-check-circle"></i> Treated
                </span>
            </td>
        `;
        dom.historyTableBody.appendChild(tr);
    });
}

// --- Demo Mode ---

function addDemoPatients() {
    const demos = [
        { name: 'Rahul', age: 28, gender: 'Male', severity: 2, emergencyType: 'Injury' },
        { name: 'Priya', age: 45, gender: 'Female', severity: 5, emergencyType: 'Heart Problem' },
        { name: 'Aman', age: 32, gender: 'Male', severity: 3, emergencyType: 'Breathing Problem' },
        { name: 'Neha', age: 55, gender: 'Female', severity: 4, emergencyType: 'Accident' },
        { name: 'Rohan', age: 22, gender: 'Male', severity: 1, emergencyType: 'Fever' }
    ];
    
    // Add them with staggered delays
    demos.forEach((demo, index) => {
        setTimeout(() => {
            addPatient(demo.name, demo.age, demo.gender, demo.severity, demo.emergencyType);
        }, index * 200);
    });
    
    if(dom.demoBtn) {
        dom.demoBtn.disabled = true;
        setTimeout(() => { dom.demoBtn.disabled = false; }, demos.length * 200 + 500);
    }
}

// --- CSS Animations injection ---
(function injectStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes slideInRight {
            from { transform: translateX(20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideIn {
            from { transform: translateY(-20px) translateX(20px); opacity: 0; }
            to { transform: translateY(0) translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(50px); opacity: 0; }
        }
        @keyframes popIn {
            0% { transform: scale(0.5); opacity: 0; }
            70% { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
        }
        @keyframes highlightRow {
            0% { background-color: #e8f5e9; }
            100% { background-color: transparent; }
        }
        .active { border-color: #3498db !important; box-shadow: 0 0 10px rgba(52,152,219,0.5); }
    `;
    document.head.appendChild(style);
})();
