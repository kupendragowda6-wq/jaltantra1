let chart;

let map = L.map('map').setView([12.9716, 77.5946], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let marker = L.marker([12.9716, 77.5946]).addTo(map);
let drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// Drawing Controls
let drawControl = new L.Control.Draw({
    draw: {
        polygon: true,
        rectangle: true,
        circle: false,
        marker: false,
        polyline: false,
        circlemarker: false
    },
    edit: {
        featureGroup: drawnItems
    }
});

map.addControl(drawControl);
map.on(L.Draw.Event.CREATED, function (event) {

    let layer = event.layer;
    drawnItems.clearLayers();
    drawnItems.addLayer(layer);

    let area = 100; // Temporary value

    document.getElementById("roof").value = area;
});



const locations = {
    "bangalore": [12.9716, 77.5946],
    "bengaluru": [12.9716, 77.5946],
    "kolar": [13.1367, 78.1299],
    "mysore": [12.2958, 76.6394],
    "tumkur": [13.3409, 77.1010],
    "mangalore": [12.9141, 74.8560],
    "hubli": [15.3647, 75.1240],
    "belgaum": [15.8497, 74.4977],
    "shivamogga": [13.9299, 75.5681],
    "davanagere": [14.4661, 75.9238]
};

async function getWeather(city) {

    const apiKey = "7c70275f9bf66e5116e27a62cbaedab7";

    try {

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );

        const data = await response.json();

        if (data.cod != 200) {
            return;
        }

        document.getElementById("temp").innerText =
            data.main.temp + " °C";

        document.getElementById("humidity").innerText =
            data.main.humidity + " %";

        document.getElementById("weather").innerText =
            data.weather[0].main;

        document.getElementById("wind").innerText =
            data.wind.speed + " m/s";

    } catch (error) {
        console.log(error);
    }

}


function calculateHarvest() {

    let location = document.getElementById("location").value.trim().toLowerCase();

    getWeather(location);

    let roof = parseFloat(document.getElementById("roof").value);

    if (isNaN(roof) || roof <= 0) {
        alert("Please enter a valid roof area.");
        return;
    }

    // Move map to selected location
    if (locations[location]) {
        map.setView(locations[location], 12);
        marker.setLatLng(locations[location]);
    } else {
        alert("Location not found. Showing default map.");
    }

    // Rainwater calculation
    const rainfallData = {
    bangalore: 970,
    bengaluru: 970,
    kolar: 745,
    mysore: 800,
    mangalore: 3800,
    hubli: 730,
    tumkur: 690,
    shivamogga: 1800
};
let rainfall = rainfallData[location] || 900;
const soilData = {
    bangalore: "Red Loamy",
    bengaluru: "Red Loamy",
    mysore: "Black Soil",
    kolar: "Red Soil",
    tumkur: "Sandy Loam",
    mangalore: "Laterite",
    hubli: "Black Cotton Soil",
    shivamogga: "Forest Soil"
};

const groundwaterData = {
    bangalore: "30 m",
    bengaluru: "30 m",
    mysore: "20 m",
    kolar: "18 m",
    tumkur: "25 m",
    mangalore: "10 m",
    hubli: "22 m",
    shivamogga: "12 m"
};

let soil = soilData[location] || "Not Available";
let groundwater = groundwaterData[location] || "Not Available";

let structure = "";

if (soil === "Red Soil" || soil === "Red Loamy") {
    structure = "Recharge Pit";
}
else if (soil === "Black Soil" || soil === "Black Cotton Soil") {
    structure = "Recharge Trench";
}
else if (soil === "Laterite") {
    structure = "Recharge Well";
}
else if (soil === "Sandy Loam") {
    structure = "Percolation Pit";
}
else {
    structure = "Recharge Pit";
}


    let coefficient = 0.8;

    let water = roof * rainfall * coefficient;
    let tank = Math.ceil((water / 7) / 1000) * 1000;
    let cost = tank * 4.5;

    let subsidy = 0;

// Demo subsidy logic
if (tank >= 10000) {
    subsidy = cost * 0.30;   // 30%
} else if (tank >= 5000) {
    subsidy = cost * 0.20;   // 20%
} else {
    subsidy = cost * 0.10;   // 10%
}

let finalCost = cost - subsidy;    


    let saving = Math.round(water * 0.4);
    let advice = "";

if (water < 10000) {
    advice = "Low harvesting potential. Increase your roof collection area if possible.";
} else if (water < 50000) {
    advice = "Good harvesting potential. A medium-sized storage tank is recommended.";
} else {
    advice = "Excellent harvesting potential. You can significantly reduce water usage by installing a large storage tank.";
}

document.getElementById("advice").innerText = advice;


    // Government Scheme
    let scheme = "Jal Shakti Abhiyan";

    // Display Result
    document.getElementById("water").innerText =
        water.toLocaleString() + " Litres / Year";

    document.getElementById("tank").innerText =
        tank.toLocaleString() + " Litres";

    document.getElementById("cost").innerText =
        "₹" + cost.toLocaleString();

    document.getElementById("subsidy").innerText =
    "₹" + Math.round(subsidy).toLocaleString();

    document.getElementById("finalCost").innerText =
    "₹" + Math.round(finalCost).toLocaleString();   


    document.getElementById("scheme").innerText =
        scheme;
    document.getElementById("structure").innerText = structure;       
    document.getElementById("soil").innerText = soil;
    document.getElementById("groundwater").innerText = groundwater;    
    document.getElementById("saving").innerText =
        "₹" + saving.toLocaleString(); 
    document.getElementById("date").innerText =
    "Report Generated on: " + new Date().toLocaleDateString(); 
fetch("/save-report", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        location: location,
        roof: roof,
        rainfall: rainfall,
        harvested: water,
        tank: tank,
        soil: soil,
        groundwater: groundwater,
        structure: structure,
        cost: cost,
        subsidy: subsidy,
        finalcost: finalCost
    })
})
.then(response => response.json())
.then(data => console.log(data.message));


if (chart) {
    chart.destroy();
}

const ctx = document.getElementById("waterChart");

chart = new Chart(ctx, {
    type: "bar",
    data: {
        labels: ["Harvested Water", "Tank Capacity"],
        datasets: [{
            label: "Litres",
            data: [water, tank]
        }]
    },
    options: {
        responsive: true
    }
});


}  
function getCurrentLocation() {

    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(function(position) {

        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;

        map.setView([latitude, longitude], 15);

        marker.setLatLng([latitude, longitude]);

        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
.then(response => response.json())
.then(data => {

    let city =
        data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.state_district ||
        "Unknown";

   document.getElementById("location").value = city;

});

    }, function() {

        alert("Unable to access your location.");

    });

}
async function loadHistory() {

    let response = await fetch("/history");

    let data = await response.json();

    let table = "";

    data.forEach(report => {

        table += `
        <tr>
            <td>${report.location}</td>
            <td>${report.harvested}</td>
            <td>${report.tank}</td>
        </tr>
        `;

    });

    document.getElementById("historyTable").innerHTML = table;
}
window.onload = function () {
    loadHistory();
};