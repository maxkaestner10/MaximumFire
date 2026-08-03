// =======================================
// Maximum Fire - training.js
// Mit 2x4 Info-Boxen und darunterliegenden 5 Zonen
// =======================================

let trainingChart = null;
let currentChartType = "power";

// Messdaten für das Diagramm
const chartData = {
    power: { 
        label: "Leistung (Watt)", 
        borderColor: "#ff7a00",
        backgroundColor: "rgba(255, 122, 0, 0.15)",
        unit: "W",
        data: [120, 150, 210, 240, 260, 250, 280, 310, 270, 230, 200, 180] 
    },
    hr: { 
        label: "Herzfrequenz (bpm)", 
        borderColor: "#e74c3c",
        backgroundColor: "rgba(231, 76, 60, 0.15)",
        unit: "bpm",
        data: [110, 125, 140, 155, 165, 168, 172, 175, 162, 150, 138, 120] 
    },
    height: { 
        label: "Höhe (m)", 
        borderColor: "#2ecc71",
        backgroundColor: "rgba(46, 204, 113, 0.15)",
        unit: "m",
        data: [250, 260, 290, 340, 420, 480, 520, 490, 410, 330, 280, 250] 
    },
    speed: { 
        label: "Geschwindigkeit (km/h)", 
        borderColor: "#3498db",
        backgroundColor: "rgba(52, 152, 219, 0.15)",
        unit: "km/h",
        data: [18, 22, 25, 28, 21, 15, 32, 45, 38, 29, 24, 20] 
    },
    cadence: { 
        label: "Kadenz (rpm)", 
        borderColor: "#9b59b6",
        backgroundColor: "rgba(155, 89, 182, 0.15)",
        unit: "rpm",
        data: [80, 85, 90, 88, 92, 75, 82, 95, 90, 86, 82, 78] 
    }
};

// Analysedaten (Jetzt mit jeweils 8 Werten für exakt 2 Reihen à 4 Boxen)
const analysisData = {
    power: {
        title: "⚡ Wattanalyse",
        stats: [
            ["Ø Leistung", "218 W"],
            ["Max. Leistung", "850 W"],
            ["NP (Normalized)", "232 W"],
            ["TSS", "142"],
            ["Max 20 min", "245 W"],
            ["Max 4 min", "290 W"],
            ["Max 30 s", "450 W"],
            ["Max 5 s", "810 W"]
        ],
        zones: [
            { name: "Zone 1: Aktive Erholung", range: "< 160 W", time: "0:25 h", percent: 14, color: "#3498db" },
            { name: "Zone 2: Grundlagenausdauer", range: "160 - 215 W", time: "1:45 h", percent: 58, color: "#2ecc71" },
            { name: "Zone 3: Tempo", range: "215 - 260 W", time: "0:30 h", percent: 17, color: "#f1c40f" },
            { name: "Zone 4: Laktatschwelle", range: "260 - 305 W", time: "0:12 h", percent: 7, color: "#e67e22" },
            { name: "Zone 5: VO₂max / Anaerob", range: "> 305 W", time: "0:08 h", percent: 4, color: "#e74c3c" }
        ]
    },
    hr: {
        title: "❤️ Pulsanalyse",
        stats: [
            ["Ø Puls", "148 bpm"],
            ["Max. Puls", "176 bpm"],
            ["Kalorien", "1.850 kcal"],
            ["Trainings Load", "120"],
            ["Max 20 min", "165 bpm"],
            ["Max 4 min", "172 bpm"],
            ["Max 30 s", "175 bpm"],
            ["Max 5 s", "176 bpm"]
        ],
        zones: [
            { name: "Zone 1: Regeneration", range: "< 115 bpm", time: "0:20 h", percent: 11, color: "#3498db" },
            { name: "Zone 2: Aerobe Basis", range: "115 - 135 bpm", time: "1:50 h", percent: 61, color: "#2ecc71" },
            { name: "Zone 3: Aerobes Tempo", range: "135 - 155 bpm", time: "0:35 h", percent: 19, color: "#f1c40f" },
            { name: "Zone 4: Schwellenbereich", range: "155 - 175 bpm", time: "0:10 h", percent: 6, color: "#e67e22" },
            { name: "Zone 5: Maximalbereich", range: "> 175 bpm", time: "0:05 h", percent: 3, color: "#e74c3c" }
        ]
    },
    height: {
        title: "⛰ Höhenanalyse",
        stats: [
            ["Höhenmeter ↑", "680 m"],
            ["Höhenmeter ↓", "670 m"],
            ["Max. Höhe", "520 m"],
            ["Steigung max.", "14%"]
        ]
    },
    speed: {
        title: "🚴 Geschwindigkeitsanalyse",
        stats: [
            ["Ø Geschwindigkeit", "24,5 km/h"],
            ["Max. Geschwindigkeit", "52,1 km/h"],
            ["Distanz", "58 km"],
            ["Fahrzeit", "2:36 h"]
        ]
    },
    cadence: {
        title: "🔄 Kadenzanalyse",
        stats: [
            ["Ø Trittfrequenz", "84 rpm"],
            ["Max. Trittfrequenz", "112 rpm"],
            ["Umdrehungen ges.", "15.120"],
            ["Freilauf-Zeit", "0:15 h"]
        ]
    }
};

document.addEventListener("DOMContentLoaded", () => {
    initChart();
    changeChart("power");
});

function initChart() {
    const ctx = document.getElementById("trainingChart");
    if (!ctx) return;

    const timeLabels = ["00:00", "00:15", "00:30", "00:45", "01:00", "01:15", "01:30", "01:45", "02:00", "02:15", "02:30", "03:00"];

    trainingChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: timeLabels,
            datasets: [{
                label: chartData.power.label,
                data: chartData.power.data,
                borderColor: chartData.power.borderColor,
                backgroundColor: chartData.power.backgroundColor,
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: false },
                x: { grid: { display: false } }
            }
        }
    });
}

function changeChart(type) {
    currentChartType = type;

    // Chart-Buttons aktualisieren
    const buttons = document.querySelectorAll(".chart-btn");
    const map = { power: 0, hr: 1, height: 2, speed: 3, cadence: 4 };

    buttons.forEach(btn => btn.classList.remove("active"));
    if (buttons[map[type]]) {
        buttons[map[type]].classList.add("active");
    }

    // Diagramm aktualisieren
    if (trainingChart && chartData[type]) {
        trainingChart.data.datasets[0].label = chartData[type].label;
        trainingChart.data.datasets[0].data = chartData[type].data;
        trainingChart.data.datasets[0].borderColor = chartData[type].borderColor;
        trainingChart.data.datasets[0].backgroundColor = chartData[type].backgroundColor;
        trainingChart.update();
    }

    // Analyse-Bereich rendern
    renderAnalysis(type);
}

function renderAnalysis(type) {
    const title = document.getElementById("analysisTitle");
    const grid = document.getElementById("analysisGrid");

    if (!title || !grid) return;

    const data = analysisData[type];
    title.textContent = data.title;
    
    // WICHTIG: Erzwingt das Untereinander-Anordnen von Info-Boxen und Zonen
    grid.style.display = "flex";
    grid.style.flexDirection = "column";
    grid.style.gap = "20px";
    grid.innerHTML = "";

    // 1. Kennzahlen-Boxen rendern (2 Reihen à 4 Boxen)
    if (data.stats) {
        const statsContainer = document.createElement("div");
        statsContainer.className = "stats-grid";
        // 4 Spalten erzwingen. Bei extrem schmalen Bildschirmen bricht es automatisch gut um
        statsContainer.style.cssText = "display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; width: 100%; text-align: center;";

        data.stats.forEach(stat => {
            const box = document.createElement("div");
            box.className = "stat-box";
            // Die Styles in der div überschreiben minimal die Standardwerte für eine saubere Darstellung der 4 Boxen
            box.style.cssText = "background: #fdfdfd; padding: 10px 5px; border-radius: 10px; border: 1px solid #eee; display: flex; flex-direction: column; justify-content: center; align-items: center;";
            box.innerHTML = `
                <span style="font-size: 11px; color: #777; margin-bottom: 4px;">${stat[0]}</span>
                <strong style="font-size: 14px; color: #111;">${stat[1]}</strong>
            `;
            statsContainer.appendChild(box);
        });

        grid.appendChild(statsContainer);
    }

    // 2. Die 5 Zonen genau darunter (untereinander gestapelt)
    if (data.zones) {
        const zonesHeader = document.createElement("h3");
        zonesHeader.innerText = "Zonenverteilung";
        zonesHeader.style.cssText = "margin-top: 10px; margin-bottom: 5px; font-size: 16px; color: #111;";
        grid.appendChild(zonesHeader);

        const zonesContainer = document.createElement("div");
        // Erzwingt, dass die 5 Zonen exakt untereinander gestapelt werden
        zonesContainer.style.cssText = "display: flex; flex-direction: column; gap: 10px; width: 100%;";

        data.zones.forEach(zone => {
            const card = document.createElement("div");
            card.style.cssText = "background: #fdfdfd; padding: 14px; border-radius: 12px; border: 1px solid #eee; display: flex; flex-direction: column; gap: 6px; position: relative; overflow: hidden;";

            card.innerHTML = `
                <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 6px; background: ${zone.color};"></div>

                <div style="display: flex; justify-content: space-between; align-items: center; padding-left: 6px;">
                    <strong style="font-size: 14px; color: #111;">${zone.name}</strong>
                    <span style="font-size: 12px; color: #666; background: #eee; padding: 2px 8px; border-radius: 6px; font-weight: bold;">${zone.range}</span>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; padding-left: 6px; font-size: 13px;">
                    <span style="color: #555;">Zeit: <strong>${zone.time}</strong></span>
                    <span style="color: #ff7a00; font-weight: bold;">${zone.percent}%</span>
                </div>

                <div style="width: calc(100% - 6px); background: #eee; height: 7px; border-radius: 4px; margin-top: 2px; margin-left: 6px; overflow: hidden;">
                    <div style="width: ${zone.percent}%; height: 100%; background: ${zone.color}; border-radius: 4px;"></div>
                </div>
            `;

            zonesContainer.appendChild(card);
        });

        grid.appendChild(zonesContainer);
    }
}