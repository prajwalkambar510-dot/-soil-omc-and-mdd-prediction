// Global State
let moistureContent = null;
let compactionData = []; // Array of objects { x: waterContent, y: dryDensity }
let chartInstance = null;
let aiResults = { omc: null, mdd: null };
let numColumns = 0;

// -- Navigation Logic --
function navigateTo(targetId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.querySelectorAll('.nav-links li').forEach(li => {
        li.classList.remove('active');
    });

    document.getElementById(targetId).classList.add('active');
    
    const navLink = document.querySelector(`.nav-links li[data-target="${targetId}"]`);
    if(navLink) navLink.classList.add('active');
    
    if (targetId === 'report') {
        renderReport();
    }
}

// Add event listeners to nav links
document.querySelectorAll('.nav-links li').forEach(link => {
    link.addEventListener('click', (e) => {
        navigateTo(e.target.dataset.target);
    });
});

// -- Moisture Content Logic (First Page/Tab) --
function calculateMoisture() {
    const w1 = parseFloat(document.getElementById('w1').value);
    const w2 = parseFloat(document.getElementById('w2').value);
    const w3 = parseFloat(document.getElementById('w3').value);

    if (isNaN(w1) || isNaN(w2) || isNaN(w3)) {
        alert("Please enter all weights correctly.");
        return;
    }

    if (w3 <= w1 || w2 <= w3) {
        alert("Invalid weights. Ensure W2 > W3 > W1.");
        return;
    }

    const w = ((w2 - w3) / (w3 - w1)) * 100;
    moistureContent = w.toFixed(2);
    
    document.getElementById('moisture-result-value').textContent = moistureContent;
}

// -- Dynamic Matrix Columns Logic --

function addTrialColumn(headerText = '', initialData = {}) {
    const colIndex = numColumns;
    headerText = headerText || `Trial ${colIndex + 1}`;

    // 1. Append Header Columns
    const compHeaderRow = document.getElementById('compaction-header-row');
    const thComp = document.createElement('th');
    thComp.innerHTML = `<input type="text" class="trial-header-input" value="${headerText}" oninput="syncHeaders(${colIndex}, this.value)">`;
    compHeaderRow.appendChild(thComp);

    const waterHeaderRow = document.getElementById('water-header-row');
    const thWater = document.createElement('th');
    thWater.id = `water-header-cell-${colIndex}`;
    thWater.innerHTML = `<span class="trial-header-text">${headerText}</span>`;
    waterHeaderRow.appendChild(thWater);

    // 2. Add inputs/cells to Compaction Table Rows
    appendInputCell('row-comp-mw', `mw-${colIndex}`, initialData.mw || '');
    appendInputCell('row-comp-mms', `mms-${colIndex}`, initialData.mms || '', 'updateCompactionCalculations()');
    appendCalcCell('row-comp-ms', `ms-${colIndex}`);
    appendCalcCell('row-comp-bd', `bd-${colIndex}`);
    appendCalcCell('row-comp-dd', `dd-${colIndex}`);

    // 3. Add inputs/cells to Water Content Table Rows
    appendInputCell('row-wat-cn', `cn-${colIndex}`, initialData.cn || '', '', 'text');
    appendInputCell('row-wat-w1', `wc-w1-${colIndex}`, initialData.w1 || '', 'updateCompactionCalculations()');
    appendInputCell('row-wat-w2', `wc-w2-${colIndex}`, initialData.w2 || '', 'updateCompactionCalculations()');
    appendInputCell('row-wat-w3', `wc-w3-${colIndex}`, initialData.w3 || '', 'updateCompactionCalculations()');
    appendCalcCell('row-wat-w', `wc-w-${colIndex}`);

    numColumns++;
    updateCompactionCalculations();
}

function syncHeaders(index, val) {
    const waterHeader = document.getElementById(`water-header-cell-${index}`);
    if (waterHeader) {
        waterHeader.innerHTML = `<span class="trial-header-text">${val}</span>`;
    }
}

function appendInputCell(rowId, inputId, val = '', onInputAttrib = '', type = 'number') {
    const row = document.getElementById(rowId);
    const td = document.createElement('td');
    const step = type === 'number' ? 'step="0.01"' : '';
    const oninput = onInputAttrib ? `oninput="${onInputAttrib}"` : '';
    td.innerHTML = `<input type="${type}" id="${inputId}" class="matrix-input" value="${val}" ${step} ${oninput}>`;
    row.appendChild(td);
}

function appendCalcCell(rowId, cellId) {
    const row = document.getElementById(rowId);
    const td = document.createElement('td');
    td.id = cellId;
    td.textContent = '--';
    row.appendChild(td);
}

function removeTrialColumn() {
    if (numColumns <= 3) {
        alert("At least 3 trial columns are required to fit a compaction curve.");
        return;
    }

    const colIndex = numColumns - 1;

    // Remove headers
    const compHeaderRow = document.getElementById('compaction-header-row');
    compHeaderRow.removeChild(compHeaderRow.lastElementChild);

    const waterHeaderRow = document.getElementById('water-header-row');
    waterHeaderRow.removeChild(waterHeaderRow.lastElementChild);

    // Remove cells from rows
    removeLastCell('row-comp-mw');
    removeLastCell('row-comp-mms');
    removeLastCell('row-comp-ms');
    removeLastCell('row-comp-bd');
    removeLastCell('row-comp-dd');

    removeLastCell('row-wat-cn');
    removeLastCell('row-wat-w1');
    removeLastCell('row-wat-w2');
    removeLastCell('row-wat-w3');
    removeLastCell('row-wat-w');

    numColumns--;
    updateCompactionCalculations();
}

function removeLastCell(rowId) {
    const row = document.getElementById(rowId);
    row.removeChild(row.lastElementChild);
}

// Calculate Mould Volume: V = pi * r^2 * h
function calculateMouldVolume() {
    const height = parseFloat(document.getElementById('mould-height').value);
    const diameter = parseFloat(document.getElementById('mould-diameter').value);
    
    if (!isNaN(height) && !isNaN(diameter) && height > 0 && diameter > 0) {
        const radius = diameter / 2;
        const volume = Math.PI * Math.pow(radius, 2) * height;
        document.getElementById('mould-volume').value = volume.toFixed(2);
        updateCompactionCalculations();
    } else {
        document.getElementById('mould-volume').value = '';
    }
}

// Triggered on any input change in the matrix tables
function updateCompactionCalculations() {
    const volume = parseFloat(document.getElementById('mould-volume').value);
    const mouldMass = parseFloat(document.getElementById('mould-mass').value);
    
    for (let i = 0; i < numColumns; i++) {
        // --- 1. Water Content Calculations ---
        const w1 = parseFloat(document.getElementById(`wc-w1-${i}`).value);
        const w2 = parseFloat(document.getElementById(`wc-w2-${i}`).value);
        const w3 = parseFloat(document.getElementById(`wc-w3-${i}`).value);
        let waterContent = null;
        
        if (!isNaN(w1) && !isNaN(w2) && !isNaN(w3) && (w3 > w1) && (w2 > w3)) {
            waterContent = ((w2 - w3) / (w3 - w1)) * 100;
            document.getElementById(`wc-w-${i}`).textContent = waterContent.toFixed(2);
        } else {
            document.getElementById(`wc-w-${i}`).textContent = '--';
        }
        
        // --- 2. Density & Mass Calculations ---
        const mms = parseFloat(document.getElementById(`mms-${i}`).value);
        let massSoil = null;
        let bulkDensity = null;
        let dryDensity = null;
        
        if (!isNaN(mms) && !isNaN(mouldMass) && mms > mouldMass) {
            massSoil = mms - mouldMass;
            document.getElementById(`ms-${i}`).textContent = massSoil.toFixed(2);
            
            if (!isNaN(volume) && volume > 0) {
                bulkDensity = massSoil / volume;
                document.getElementById(`bd-${i}`).textContent = bulkDensity.toFixed(3);
                
                if (waterContent !== null) {
                    dryDensity = bulkDensity / (1 + (waterContent / 100));
                    document.getElementById(`dd-${i}`).textContent = dryDensity.toFixed(3);
                } else {
                    document.getElementById(`dd-${i}`).textContent = '--';
                }
            } else {
                document.getElementById(`bd-${i}`).textContent = '--';
                document.getElementById(`dd-${i}`).textContent = '--';
            }
        } else {
            document.getElementById(`ms-${i}`).textContent = '--';
            document.getElementById(`bd-${i}`).textContent = '--';
            document.getElementById(`dd-${i}`).textContent = '--';
        }
    }
}

// Populate sample default values for easy testing
function populateDefaultCompactionValues() {
    // Mould Dimensions (Standard Indian Standard mould)
    document.getElementById('mould-height').value = 11.6;
    document.getElementById('mould-diameter').value = 10.0;
    calculateMouldVolume(); // V = ~911.06 cc
    
    document.getElementById('mould-mass').value = 2050; // Empty mould mass in g
    
    const sampleHeaders = ['15%', '18%', '21%', '24%', '27%'];
    const sampleData = [
        { mw: 300, mms: 3620, cn: 'C1', w1: 15.2, w2: 85.5, w3: 76.8 },
        { mw: 360, mms: 3780, cn: 'C2', w1: 14.8, w2: 92.4, w3: 81.2 },
        { mw: 420, mms: 3880, cn: 'C3', w1: 15.5, w2: 102.1, w3: 87.5 },
        { mw: 480, mms: 3910, cn: 'C4', w1: 15.0, w2: 98.6, w3: 83.1 },
        { mw: 540, mms: 3860, cn: 'C5', w1: 14.9, w2: 90.2, w3: 75.3 }
    ];

    // Clear existing columns
    numColumns = 0;
    document.getElementById('compaction-header-row').innerHTML = '<th>Sl. No.</th><th>Determinations</th>';
    document.getElementById('water-header-row').innerHTML = '<th>Sl. No.</th><th>Observations</th>';
    
    const rowsComp = ['row-comp-mw', 'row-comp-mms', 'row-comp-ms', 'row-comp-bd', 'row-comp-dd'];
    const labelsComp = [
        '<td>1</td><td>Mass of water added (mw) [g]</td>',
        '<td>2</td><td>Mass of mould + compacted soil (g)</td>',
        '<td>3</td><td>Mass of compacted soil (M) [g]</td>',
        '<td>4</td><td>Bulk Density (ρ) [g/cc]</td>',
        '<td>5</td><td>Dry Density (ρd) [g/cc]</td>'
    ];
    rowsComp.forEach((id, idx) => {
        document.getElementById(id).innerHTML = labelsComp[idx];
    });

    const rowsWat = ['row-wat-cn', 'row-wat-w1', 'row-wat-w2', 'row-wat-w3', 'row-wat-w'];
    const labelsWat = [
        '<td>1</td><td>Container No.</td>',
        '<td>2</td><td>Mass of container (W1) [g]</td>',
        '<td>3</td><td>Mass of container + wet soil (W2) [g]</td>',
        '<td>4</td><td>Mass of container + dry soil (W3) [g]</td>',
        '<td>5</td><td>Water Content (w) [%]</td>'
    ];
    rowsWat.forEach((id, idx) => {
        document.getElementById(id).innerHTML = labelsWat[idx];
    });

    // Populate columns
    for (let i = 0; i < 5; i++) {
        addTrialColumn(sampleHeaders[i], sampleData[i]);
    }
}

// Call on window load
window.onload = () => {
    populateDefaultCompactionValues();
};

function addTrialColumnButton() {
    addTrialColumn();
}

// -- AI Compaction Curve Analysis --
function analyzeCompactionData() {
    compactionData = [];
    
    for (let i = 0; i < numColumns; i++) {
        const mcText = document.getElementById(`wc-w-${i}`).textContent;
        const ddText = document.getElementById(`dd-${i}`).textContent;
        
        const mc = parseFloat(mcText);
        const dd = parseFloat(ddText);
        
        if (!isNaN(mc) && !isNaN(dd)) {
            compactionData.push({ x: mc, y: dd });
        }
    }
    
    if (compactionData.length < 3) {
        alert("Please complete the table calculations for at least 3 trials before plotting.");
        return;
    }
    
    // Sort data points by water content (x)
    compactionData.sort((a, b) => a.x - b.x);
    
    // Fit a second degree polynomial: y = ax^2 + bx + c
    const coeffs = polynomialRegression(compactionData);
    const a = coeffs[0];
    const b = coeffs[1];
    const c = coeffs[2];
    
    // Optimum Moisture Content (peak x): derivative = 2ax + b = 0 => x = -b / 2a
    const omc = -b / (2 * a);
    const mdd = a * Math.pow(omc, 2) + b * omc + c;
    
    if (a >= 0) {
        alert("AI Warning: The plotted curve has an upward trend instead of a standard compaction hump. Check your compaction trial inputs.");
        aiResults.omc = null;
        aiResults.mdd = null;
    } else {
        aiResults.omc = omc.toFixed(2);
        aiResults.mdd = mdd.toFixed(3);
        
        document.getElementById('ai-omc').textContent = aiResults.omc + " %";
        document.getElementById('ai-mdd').textContent = aiResults.mdd + " g/cc";
        document.getElementById('ai-insights').style.display = 'flex';
        document.getElementById('proceed-report-btn').style.display = 'block';
    }
    
    // Display chart section
    document.getElementById('chart-section').style.display = 'block';
    
    // Plot the compaction curve
    plotChart(compactionData, a, b, c, omc, mdd);
}

// Robust polynomial regression (Degree 2) using Gauss-Jordan elimination
function polynomialRegression(data) {
    let sumX = 0, sumX2 = 0, sumX3 = 0, sumX4 = 0;
    let sumY = 0, sumXY = 0, sumX2Y = 0;
    let n = data.length;

    for (let i = 0; i < n; i++) {
        let x = data[i].x;
        let y = data[i].y;
        
        sumX += x;
        sumX2 += x * x;
        sumX3 += x * x * x;
        sumX4 += x * x * x * x;
        
        sumY += y;
        sumXY += x * y;
        sumX2Y += x * x * y;
    }

    let m = [
        [sumX4, sumX3, sumX2, sumX2Y],
        [sumX3, sumX2, sumX,  sumXY],
        [sumX2, sumX,  n,     sumY]
    ];

    for (let i = 0; i < 3; i++) {
        let maxRow = i;
        for (let k = i + 1; k < 3; k++) {
            if (Math.abs(m[k][i]) > Math.abs(m[maxRow][i])) {
                maxRow = k;
            }
        }
        
        let temp = m[i];
        m[i] = m[maxRow];
        m[maxRow] = temp;

        let pivot = m[i][i];
        if (pivot === 0) return [0, 0, 0];

        for (let j = i; j <= 3; j++) {
            m[i][j] /= pivot;
        }

        for (let k = 0; k < 3; k++) {
            if (k !== i) {
                let factor = m[k][i];
                for (let j = i; j <= 3; j++) {
                    m[k][j] -= factor * m[i][j];
                }
            }
        }
    }

    return [m[0][3], m[1][3], m[2][3]]; // [a, b, c]
}

function plotChart(data, a, b, c, omc, mdd) {
    const ctx = document.getElementById('compactionChart').getContext('2d');
    
    if (chartInstance) {
        chartInstance.destroy();
    }

    let minX = Math.min(...data.map(d => d.x)) - 2;
    let maxX = Math.max(...data.map(d => d.x)) + 2;
    let curvePoints = [];
    
    for (let x = minX; x <= maxX; x += 0.2) {
        curvePoints.push({
            x: x,
            y: a * x * x + b * x + c
        });
    }

    let datasets = [
        {
            label: 'Lab Trials Data',
            data: data,
            backgroundColor: '#ec4899',
            borderColor: '#ec4899',
            showLine: false,
            pointRadius: 6,
            pointHoverRadius: 8,
            type: 'scatter'
        },
        {
            label: 'AI Fitted Compaction Curve',
            data: curvePoints,
            borderColor: '#3b82f6',
            borderWidth: 3,
            fill: false,
            pointRadius: 0,
            type: 'line',
            tension: 0.4
        }
    ];

    if (a < 0 && omc && mdd) {
        datasets.push({
            label: 'OMC & MDD (Peak Point)',
            data: [{ x: omc, y: mdd }],
            backgroundColor: '#10b981',
            borderColor: '#10b981',
            pointRadius: 8,
            pointStyle: 'triangle',
            type: 'scatter'
        });
    }

    chartInstance = new Chart(ctx, {
        type: 'scatter',
        data: { datasets: datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#f8fafc', font: { family: 'Outfit' } } },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `MC: ${context.parsed.x.toFixed(2)}%, DD: ${context.parsed.y.toFixed(3)} g/cc`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Water Content (%)', color: '#94a3b8', font: { family: 'Outfit', size: 14 } },
                    grid: { color: 'rgba(255,255,255,0.08)' },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    title: { display: true, text: 'Dry Density (g/cc)', color: '#94a3b8', font: { family: 'Outfit', size: 14 } },
                    grid: { color: 'rgba(255,255,255,0.08)' },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}

// -- Report Logic --
function generateReport() {
    if (!aiResults.omc && compactionData.length === 0) {
        analyzeCompactionData();
    }
    
    if (chartInstance) {
        const originalColor = chartInstance.options.plugins.legend.labels.color;
        const originalTickColorX = chartInstance.options.scales.x.ticks.color;
        const originalTickColorY = chartInstance.options.scales.y.ticks.color;
        const originalTitleColorX = chartInstance.options.scales.x.title.color;
        const originalTitleColorY = chartInstance.options.scales.y.title.color;

        chartInstance.options.plugins.legend.labels.color = '#1e293b';
        chartInstance.options.scales.x.ticks.color = '#1e293b';
        chartInstance.options.scales.y.ticks.color = '#1e293b';
        chartInstance.options.scales.x.title.color = '#1e293b';
        chartInstance.options.scales.y.title.color = '#1e293b';
        chartInstance.update();

        setTimeout(() => {
            const chartImg = chartInstance.toBase64Image();
            document.getElementById('report-chart-img').src = chartImg;

            chartInstance.options.plugins.legend.labels.color = originalColor;
            chartInstance.options.scales.x.ticks.color = originalTickColorX;
            chartInstance.options.scales.y.ticks.color = originalTickColorY;
            chartInstance.options.scales.x.title.color = originalTitleColorX;
            chartInstance.options.scales.y.title.color = originalTitleColorY;
            chartInstance.update();
            
            navigateTo('report');
        }, 300);
    } else {
        navigateTo('report');
    }
}

function renderReport() {
    document.getElementById('report-date').textContent = new Date().toLocaleDateString();

    document.getElementById('rep-w1').textContent = document.getElementById('w1').value ? document.getElementById('w1').value + ' g' : '--';
    document.getElementById('rep-w2').textContent = document.getElementById('w2').value ? document.getElementById('w2').value + ' g' : '--';
    document.getElementById('rep-w3').textContent = document.getElementById('w3').value ? document.getElementById('w3').value + ' g' : '--';
    document.getElementById('rep-moisture').textContent = moistureContent ? moistureContent + ' %' : '--';

    document.getElementById('rep-omc').textContent = aiResults.omc ? aiResults.omc + ' %' : '--';
    document.getElementById('rep-mdd').textContent = aiResults.mdd ? aiResults.mdd + ' g/cc' : '--';
}
