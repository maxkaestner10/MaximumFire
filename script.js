
let currentWeekOffset = 0;
console.log("Wochentest gestartet");
function getMonday(date){

    let day = date.getDay();

    let diff = date.getDate() - day + (day === 0 ? -6 : 1);

    return new Date(date.setDate(diff));

}

function getWeekDates(){

    let today = new Date();

    today.setDate(
        today.getDate() + currentWeekOffset * 7
    );


    let monday = getMonday(today);


    let days = [];


    for(let i = 0; i < 7; i++){

        let date = new Date(monday);

        date.setDate(
            monday.getDate() + i
        );


        days.push(date);

    }


    return days;

}

function nextWeek(){

    currentWeekOffset++;

    updateChartWeek();

}


function previousWeek(){

    currentWeekOffset--;

    updateChartWeek();

}

const ctx = document.getElementById("weekChart");

let chart;

if (ctx) {

chart = new Chart(ctx, {
type: "bar",
data: {
labels: getWeekDates().map(day => {

    return day.toLocaleDateString("de-DE",{
        day:"2-digit",
        month:"2-digit"
    });

}),
datasets: [{
data: [42, 65, 30, 80, 55, 95, 48],
backgroundColor: "#ff7a00",
borderRadius: 8
}]
},
options: {
responsive: true,
plugins: {
legend: {
display: false
}
},
scales: {
y: {
beginAtZero: true,
title: {
display: true,
text: "Kilometer"
}
}
}
}
});    
}

function updateChartWeek(){

    chart.data.labels = getWeekDates().map(day => {

        return day.toLocaleDateString("de-DE",{
            day:"2-digit",
            month:"2-digit"
        });

    });

    chart.update();

}

if(document.getElementById("timeline")){

const timeline = document.getElementById("timeline");

const trainings = [
"Ruhetag",
"🚵 MTB Grundlagenausdauer · 3:00 h",
"⚡ VO₂max · 1:30 h",
"🏃 Lockerer Lauf · 45 min",
"🚴 Sweetspot · 2:00 h",
"💪 Krafttraining · 60 min",
"🚵 Grundlage · 2:30 h"
];

const heute = new Date();

const formatter = new Intl.DateTimeFormat("de-DE",{
weekday:"long",
day:"2-digit",
month:"2-digit"
});

let todayCard=null;

for(let i=-7;i<=60;i++){

    const datum=new Date();

    datum.setDate(heute.getDate()+i);

    const card=document.createElement("div");

    card.className="day";

card.onclick = function () {
    window.location.href = "trainingbackup.html";
};

    if(i===0){

        card.classList.add("today");

        todayCard=card;

    }

    card.innerHTML=`

    <div>

    <div class="date">

    ${formatter.format(datum)}

    ${i===0 ? "• HEUTE" : ""}

    </div>

    <strong>${trainings[(i+7)%trainings.length]}</strong>

    </div>


    <button class="plus" onclick="event.stopPropagation(); window.location.href='training-erstellen.html'">
    +
    </button>
    
    `;

    timeline.appendChild(card);

}

setTimeout(()=>{

todayCard.scrollIntoView({

behavior:"instant",

block:"center"

});

},100);

}

