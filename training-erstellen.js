console.log("training-erstellen.js läuft");

let trainingChart;

// 1. Array für die Intervalle muss VOR der ersten Nutzung definiert sein!
let intervals = []; 

// Bereiche anzeigen
function renderIntervals(){
    const box = document.getElementById("intervals");
    box.innerHTML = "";

    intervals.forEach((item,index)=>{
        let div = document.createElement("div");
        div.className = "stat-box";

        div.innerHTML = `
        <h3>Bereich ${index + 1}</h3>
        <label>Zeit (Minuten)</label>
        <input type="number" value="${item.time}" onchange="updateInterval(${index},'time',this.value)">

        <label>Messwert</label>
        <select onchange="updateInterval(${index},'type',this.value)">
            <option ${item.type=="Watt"?"selected":""}>Watt</option>
            <option ${item.type=="Puls"?"selected":""}>Puls</option>
        </select>

        <label>Wert</label>
        <input type="number" value="${item.value}" onchange="updateInterval(${index},'value',this.value)">

        <button onclick="removeInterval(${index})">Löschen</button>
        `;
        box.appendChild(div);
    });

    updateChart();
}

// neuen Bereich hinzufügen
function addInterval(){
    intervals.push({
        time: 10,
        value: 250,
        type: "Watt"
    });

    renderIntervals();
    document.getElementById("intervals").scrollTop = document.getElementById("intervals").scrollHeight;
}

// Werte ändern
function updateInterval(index, key, value){
    // Wandle Eingaben in Zahlen um, falls es Zeit oder Wert ist
    intervals[index][key] = (key === 'time' || key === 'value') ? Number(value) : value;
    updateChart();
}

// Bereich löschen
function removeInterval(index){
    intervals.splice(index, 1);
    renderIntervals();
}

// Diagramm updaten
function updateChart(){
    const data = [];
    let time = 0;

    intervals.forEach((item)=>{
        // Start des Bereichs
        data.push({ x: time, y: item.value });
        // Ende des Bereichs
        time += item.time;
        data.push({ x: time, y: item.value });
    });

    if(trainingChart){
        trainingChart.destroy();
    }

    const ctx = document.getElementById("trainingChart");
    if(!ctx) return; // Falls Canvas nicht gefunden wird, Abbruch

    trainingChart = new Chart(ctx, {
        type: "line",
        data: {
            datasets: [{
                label: "Intensität",
                data: data,
                borderColor: "#ff7a00",
                backgroundColor: "rgba(255,122,0,0.2)",
                fill: false,
                stepped: true, // Macht das typische "Block"-Diagramm für Intervalle
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: "linear",
                    title: { display: true, text: "Zeit (min)" }
                },
                y: {
                    title: { display: true, text: "Wert (Watt / Puls)" }
                }
            }
        }
    });
}

// 2. Hier ist die fehlende Funktion für den Button "Training speichern"
function saveTraining() {
    const name = document.getElementById("trainingName").value;
    const beschreibung = document.getElementById("beschreibung").value;
    
    // Einfache Überprüfung, ob überhaupt etwas eingegeben wurde
    if(name === "" || intervals.length === 0) {
        alert("Bitte gib dem Training einen Namen und füge mindestens ein Intervall hinzu.");
        return;
    }

    // Hier würden wir später Firebase einbauen!
    // Vorerst zeigen wir nur eine Bestätigung an:
    let speichern = confirm("Training '" + name + "' wurde gespeichert!\nZurück zum Kalender?");
    
    if(speichern){
        window.location.href = "kalenderbackup.html";
    }
}

// Speichern Notiz
function saveNote(){
    let speichern = confirm("Notiz gespeichert!");
    if(speichern){
        window.location.href="kalenderbackup.html";
    }
}

// Start
document.addEventListener("DOMContentLoaded",()=>{
    // Startet mit einem leeren Diagramm oder man könnte addInterval() aufrufen
    renderIntervals();
});