// =======================================
// Maximum Fire - training.js
// Mit transparenten Rechtecken & Multi-Intervallen
// =======================================

let trainingChart;
let selectionStartTime = null;
let selectionEndTime = null;
let currentChartType = "power";
let savedIntervals = []; 
let boxCounter = 0;

const chartData = {
    power: { 
        label: "Leistung (W)", 
        data: [{x:0, y:120}, {x:10, y:180}, {x:20, y:240}, {x:30, y:260}, {x:40, y:250}, {x:50, y:280}, {x:60, y:310}, {x:70, y:270}, {x:80, y:230}, {x:90, y:200}] 
    },
    hr: { 
        label: "Herzfrequenz (bpm)", 
        data: [{x:0, y:120}, {x:10, y:135}, {x:20, y:150}, {x:30, y:160}, {x:40, y:165}, {x:50, y:170}, {x:60, y:176}, {x:70, y:172}, {x:80, y:160}, {x:90, y:145}] 
    },
    height: { 
        label: "Höhe (m)", 
        data: [{x:0, y:220}, {x:10, y:240}, {x:20, y:260}, {x:30, y:300}, {x:40, y:340}, {x:50, y:370}, {x:60, y:400}, {x:70, y:420}, {x:80, y:410}, {x:90, y:390}] 
    },
    speed: { 
        label: "Geschwindigkeit (km/h)", 
        data: [{x:0, y:22}, {x:10, y:24}, {x:20, y:28}, {x:30, y:31}, {x:40, y:30}, {x:50, y:33}, {x:60, y:34}, {x:70, y:29}, {x:80, y:26}, {x:90, y:22}] 
    },
    cadence: { 
        label: "Kadenz (rpm)", 
        data: [{x:0, y:80}, {x:10, y:85}, {x:20, y:90}, {x:30, y:92}, {x:40, y:91}, {x:50, y:95}, {x:60, y:88}, {x:70, y:84}, {x:80, y:82}, {x:90, y:78}] 
    }
};

const analysis = {
    power:{ title:"⚡ Wattanalyse", values:[ ["Ø Leistung","248 W"], ["Max Leistung","781 W"], ["NP","266 W"], ["IF","0.82"], ["20 Minuten","272 W"], ["4 Minuten","331 W"], ["1 Minute","465 W"], ["30 Sekunden","721 W"], ["10 Sekunden","960 W"], ["5 Sekunden","1110 W"], ["Zone 1","18 min"], ["Zone 2","41 min"], ["Zone 3","32 min"], ["Zone 4","21 min"], ["Zone 5","9 min"], ["Zone 6","3 min"], ["Zone 7","22 s"] ] },
    hr:{ title:"❤️ Pulsanalyse", values:[ ["Ø Puls","163 bpm"], ["Max Puls","188 bpm"], ["20 Minuten","176 bpm"], ["4 Minuten","184 bpm"], ["1 Minute","187 bpm"], ["Zone 1","12 min"], ["Zone 2","29 min"], ["Zone 3","35 min"], ["Zone 4","36 min"], ["Zone 5","13 min"] ] },
    height:{ title:"⛰ Höhenanalyse", values:[ ["Höhenmeter","840 m"], ["Höchster Punkt","628 m"], ["Tiefster Punkt","154 m"], ["Ø Steigung","5.2 %"], ["Max Steigung","19 %"], ["Max Gefälle","16 %"] ] },
    speed:{ title:"🚴 Geschwindigkeitsanalyse", values:[ ["Ø Geschwindigkeit","27.8 km/h"], ["Max Geschwindigkeit","58 km/h"], ["Bewegungszeit","2:01 h"], ["Standzeit","4 min"], ["Schnellster Kilometer","1:48"] ] },
    cadence:{ title:"🔄 Kadenzanalyse", values:[ ["Ø Kadenz","88 rpm"], ["Max Kadenz","119 rpm"], ["Zeit >90 rpm","46 min"], ["Zeit 80–90 rpm","51 min"], ["Zeit <70 rpm","8 min"] ] }
};

function createChart(type){
    const ctx = document.getElementById("trainingChart");
    if (!ctx) return;

    if (trainingChart){
        trainingChart.destroy();
    }

    const currentData = chartData[type].data;

    trainingChart = new Chart(ctx,{
        type:"line",
        data:{
            datasets:[
                {
                    label: chartData[type].label,
                    data: currentData,
                    borderColor: "#ff7a00",
                    backgroundColor: "rgba(255,122,0,0.2)",
                    fill: true,
                    borderWidth: 3,
                    tension: 0.2,
                    pointRadius: 2,
                    pointHoverRadius: 6
                },
                {
                    label: "Markierungen",
                    data: [],
                    pointRadius: 8,
                    pointBackgroundColor: "#ff0000",
                    pointBorderColor: "#ffffff",
                    pointBorderWidth: 2,
                    showLine: false
                }
            ]
        },
        options:{
            responsive: true,
            maintainAspectRatio: false,
            plugins:{
                legend:{ display: false }
            },
            scales:{
                x:{
                    type: "linear",
                    title:{ display: true, text: "Zeit (min)" },
                    ticks:{ stepSize: 10 }
                },
                y:{
                    title:{ display: true, text: chartData[type].label }
                }
            },
            onClick: (event) => {
                const canvasPosition = Chart.helpers.getRelativePosition(event, trainingChart);
                const clickedX = trainingChart.scales.x.getValueForPixel(canvasPosition.x);
                
                if (clickedX !== undefined) {
                    const maxTime = currentData[currentData.length - 1].x;
                    const clampedX = Math.max(0, Math.min(clickedX, maxTime));
                    handleCustomTimeClick(clampedX, type);
                }
            }
        },
        // 🎯 Integriertes Plugin, das die transparenten Rechtecke zeichnet
        plugins: [{
            id: 'intervalHighlightPlugin',
            beforeDraw: (chart) => {
                const ctx = chart.ctx;
                const xAxis = chart.scales.x;
                const yAxis = chart.scales.y;

                ctx.save();
                
                // 1. Gespeicherte Intervalle als transparente orange Rechtecke
                savedIntervals.forEach(item => {
                    const startPixel = xAxis.getPixelForValue(item.start);
                    const endPixel = xAxis.getPixelForValue(item.end);
                    
                    ctx.fillStyle = 'rgba(255, 122, 0, 0.15)'; 
                    ctx.fillRect(startPixel, yAxis.top, endPixel - startPixel, yAxis.bottom - yAxis.top);
                });

                // 2. Aktive Auswahl (während des Setzens des 2. Punktes)
                if (selectionStartTime !== null && selectionEndTime !== null) {
                    const start = Math.min(selectionStartTime, selectionEndTime);
                    const end = Math.max(selectionStartTime, selectionEndTime);
                    const startPixel = xAxis.getPixelForValue(start);
                    const endPixel = xAxis.getPixelForValue(end);

                    ctx.fillStyle = 'rgba(255, 0, 0, 0.15)'; 
                    ctx.fillRect(startPixel, yAxis.top, endPixel - startPixel, yAxis.bottom - yAxis.top);
                }
                
                ctx.restore();
            }
        }]
    });

    updateMarkers(type);
}

function getInterpolatedY(data, targetX) {
    if (targetX <= data[0].x) return data[0].y;
    if (targetX >= data[data.length - 1].x) return data[data.length - 1].y;
    
    let p1 = data[0];
    let p2 = data[1];
    for (let i = 0; i < data.length - 1; i++) {
        if (targetX >= data[i].x && targetX <= data[i+1].x) {
            p1 = data[i];
            p2 = data[i+1];
            break;
        }
    }
    if (p1.x === p2.x) return p1.y;
    return p1.y + (targetX - p1.x) * (p2.y - p1.y) / (p2.x - p1.x);
}

function handleCustomTimeClick(time, type) {
    const roundedTime = Math.round(time * 10) / 10;

    if (selectionStartTime === null || selectionEndTime !== null) {
        selectionStartTime = roundedTime;
        selectionEndTime = null;
    } else {
        selectionEndTime = roundedTime;
        
        const start = Math.min(selectionStartTime, selectionEndTime);
        const end = Math.max(selectionStartTime, selectionEndTime);
        
        if (start !== end) {
            createAndSaveSegment(start, end, type);
        }
        
        selectionStartTime = null;
        selectionEndTime = null;
    }
    updateMarkers(type);
}

function createAndSaveSegment(start, end, type) {
    const rawData = chartData[type].data;
    const segment = rawData.filter(p => p.x >= start && p.x <= end);

    const yStart = getInterpolatedY(rawData, start);
    const yEnd = getInterpolatedY(rawData, end);
    const calcPoints = [{x: start, y: yStart}, ...segment, {x: end, y: yEnd}];

    const sum = calcPoints.reduce((acc, p) => acc + p.y, 0);
    const avg = Math.round(sum / calcPoints.length);
    const max = Math.max(...calcPoints.map(p => p.y));
    const dauer = Math.round((end - start) * 10) / 10;

    const boxId = 'analysisBox_' + (++boxCounter);
    let unit = type === 'power' ? 'W' : (type === 'hr' ? 'bpm' : (type === 'speed' ? 'km/h' : (type === 'cadence' ? 'rpm' : 'm')));
    let labelKurz = chartData[type].label.split(" ")[0];

    const intervalObj = {
        id: boxId,
        start: start,
        end: end,
        dauer: dauer === 0 ? 1 : dauer,
        avg: avg,
        max: max,
        unit: unit,
        labelKurz: labelKurz
    };

    savedIntervals.push(intervalObj);
    renderAllBoxes();
}

function renderAllBoxes() {
    const chartCard = document.querySelector(".chart-wrapper").parentElement; 
    let container = document.getElementById("analysisBoxesContainer");
    
    if (!container) {
        container = document.createElement("div");
        container.id = "analysisBoxesContainer";
        chartCard.after(container);
    }

    container.innerHTML = "";

    savedIntervals.forEach(item => {
        const box = document.createElement("div");
        box.id = item.id;
        box.className = "card";
        box.style.border = "2px solid #ff7a00"; 
        box.style.marginTop = "15px";

        box.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h3 style="margin:0;">🔎 Markierter Bereich (${item.start} min - ${item.end} min)</h3>
                <button onclick="removeIntervalBox('${item.id}')" style="background:none; border:none; cursor:pointer; font-size:20px; color:#ff7a00;">✖</button>
            </div>
            <div class="stats-grid">
                <div class="stat-box">
                    <span>Dauer</span>
                    <strong>${item.dauer} min</strong>
                </div>
                <div class="stat-box">
                    <span>Ø ${item.labelKurz}</span>
                    <strong>${item.avg} ${item.unit}</strong>
                </div>
                <div class="stat-box">
                    <span>Max ${item.labelKurz}</span>
                    <strong>${item.max} ${item.unit}</strong>
                </div>
            </div>
        `;
        container.appendChild(box);
    });
}

function removeIntervalBox(id) {
    savedIntervals = savedIntervals.filter(item => item.id !== id);
    renderAllBoxes();
    if (trainingChart) {
        updateMarkers(currentChartType);
    }
}

function updateMarkers(type) {
    if (!trainingChart) return;
    const rawData = chartData[type].data;
    let markerData = [];

    savedIntervals.forEach(item => {
        markerData.push({ x: item.start, y: getInterpolatedY(rawData, item.start) });
        markerData.push({ x: item.end, y: getInterpolatedY(rawData, item.end) });
    });

    if (selectionStartTime !== null) {
        markerData.push({ x: selectionStartTime, y: getInterpolatedY(rawData, selectionStartTime) });
    }
    if (selectionEndTime !== null) {
        markerData.push({ x: selectionEndTime, y: getInterpolatedY(rawData, selectionEndTime) });
    }

    trainingChart.data.datasets[1].data = markerData;
    trainingChart.update('none');
}

// ----------------------------------------------------
// UI Logik (Buttons & Analyse-Grid)
// ----------------------------------------------------
function updateAnalysis(type){
    const title = document.getElementById("analysisTitle");
    const grid = document.getElementById("analysisGrid");
    if(!title || !grid) return;

    title.textContent = analysis[type].title;
    grid.innerHTML = "";

    analysis[type].values.forEach(value=>{
        const box = document.createElement("div");
        box.className = "stat-box";
        box.innerHTML = `
            <span>${value[0]}</span>
            <strong>${value[1]}</strong>
        `;
        grid.appendChild(box);
    });
}

function updateButtons(type){
    document.querySelectorAll(".chart-btn").forEach(btn=>{
        btn.classList.remove("active");
    });
    const map = { power:0, hr:1, height:2, speed:3, cadence:4 };
    const buttons = document.querySelectorAll(".chart-btn");
    if(buttons[map[type]]){
        buttons[map[type]].classList.add("active");
    }
}

function changeChart(type){
    currentChartType = type;
    selectionStartTime = null;
    selectionEndTime = null;
    savedIntervals = []; 
    renderAllBoxes();
    createChart(type);
    updateAnalysis(type);
    updateButtons(type);
}

function loadTraining(data){
    const name = document.querySelector(".training-header h2");
    const date = document.querySelector(".training-date");
    if(name) name.textContent = data.name;
    if(date) date.textContent = data.date;
}

document.addEventListener("DOMContentLoaded",()=>{
    changeChart("power");
});
