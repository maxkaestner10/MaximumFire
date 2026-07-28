const ctx = document.getElementById("weekChart");

new Chart(ctx, {
type: "bar",
data: {
labels: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
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

