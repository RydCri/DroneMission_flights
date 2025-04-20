import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

let map;
let poiMarker = null;
let droneMarker = null;
let droneLatLng = L.latLng(37.7739, -122.4312); // Initial position near SF
let droneMoveInterval = null;

export function initMap() {
    map = L.map('map').setView([37.7749, -122.4194], 13); // SF placeholder
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    console.log('Map loaded')
    const missionControls = document.getElementById('mission-controls');
    const poiCoordsDisplay = document.getElementById('poi-coords');
    const startMissionBtn = document.getElementById('start-mission');
    const missionTypeSelect = document.getElementById('mission-type');

    // Map click handler: select POI
    map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        if (poiMarker) {
            poiMarker.setLatLng([lat, lng]);
        } else {
            poiMarker = L.marker([lat, lng]).addTo(map);
        }

        poiCoordsDisplay.textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        missionControls.classList.remove('hidden');
        startMissionBtn.disabled = missionTypeSelect.value === "";
    });

    // Enable button only if POI and mission are both selected
    missionTypeSelect.addEventListener('change', () => {
        startMissionBtn.disabled = !poiMarker || missionTypeSelect.value === "";
    });

    startMissionBtn.addEventListener('click', () => {
        if (!poiMarker) return;

        const missionType = missionTypeSelect.value;
        const coords = poiMarker.getLatLng();

        console.log("🚀 Starting mission:", missionType, "at", coords);


        // Sim logic.
        simulateDroneFlight(coords);
    });
}

function simulateDroneFlight(destination) {
    const stepSize = 0.0005; // Adjust this for speed

    if (droneMarker) droneMarker.remove();

    droneMarker = L.marker(droneLatLng, {
        icon: L.icon({
            iconUrl: '../drone-icon.png', // Replace
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        })
    }).addTo(map);

    if (droneMoveInterval) clearInterval(droneMoveInterval);

    droneMoveInterval = setInterval(() => {
        const dx = destination.lat - droneLatLng.lat;
        const dy = destination.lng - droneLatLng.lng;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < stepSize) {
            clearInterval(droneMoveInterval);
            droneLatLng = destination;
            droneMarker.setLatLng(destination);
            alert("📍 Drone has arrived at the POI!");
            return;
        }

        // Step toward POI
        const stepLat = droneLatLng.lat + (dx / distance) * stepSize;
        const stepLng = droneLatLng.lng + (dy / distance) * stepSize;
        droneLatLng = L.latLng(stepLat, stepLng);
        droneMarker.setLatLng(droneLatLng);
    }, 50);
}


function orbitMission(poi, radius = 50, points = 12, interval = 1000) {
    const waypoints = [];
    const angleStep = 360 / points;
    const droneMarker = L.marker(poi, { icon: droneIcon }).addTo(map);

    // Generate waypoints around the POI in a circle
    for (let i = 0; i < 360; i += angleStep) {
        const angleRad = (i * Math.PI) / 180;
        const lat = poi.lat + (radius / 111111) * Math.cos(angleRad); // 111,111m per degree
        const lng = poi.lng + (radius / (111111 * Math.cos(poi.lat * Math.PI / 180))) * Math.sin(angleRad);
        waypoints.push([lat, lng]);
    }

    // Draw the path for visualization
    L.polyline(waypoints, { color: 'blue', dashArray: '4' }).addTo(map);

    // Log container
    const log = document.getElementById('mission-log');
    log.innerHTML = '<h3>🛰 Orbit Mission Log</h3>';

    let i = 0;
    function moveDrone() {
        if (i >= waypoints.length) {
            log.innerHTML += `<div>✅ Mission Complete</div>`;
            return;
        }

        const [lat, lng] = waypoints[i];
        droneMarker.setLatLng([lat, lng]);
        log.innerHTML += `<div>📸 Photo captured at ${lat.toFixed(5)}, ${lng.toFixed(5)}</div>`;
        log.scrollTop = log.scrollHeight;

        i++;
        setTimeout(moveDrone, interval);
    }

    moveDrone();
}
