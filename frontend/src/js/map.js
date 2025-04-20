import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import droneIconUrl from '../assets/drone_icon.png';

let map;
let poiMarker = null;
let droneMarker = null;
let droneLatLng = L.latLng(37.7739, -122.4312); // Initial position near SF
let droneMoveInterval = null;
const log = document.getElementById('mission-log');



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

        log.innerHTML += `<div class="log-event">🚀 Starting mission:, ${missionType}, at ${coords}</div>`
        let newLog = log.lastElementChild
        if (newLog) {
            newLog.scrollIntoView()
        }

        // Sim logic.
        simulateDroneFlight(coords);

    });
}

function simulateDroneFlight(destination) {
    const stepSize = 0.0005; // Adjust this for speed

    if (droneMarker) droneMarker.remove();

    droneMarker = L.marker(droneLatLng, {
        icon: L.icon({
            iconUrl: droneIconUrl, // drone-icon.png
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -20]
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
            log.innerHTML += '<div class="log-event">"📍 Drone has arrived at the POI!"</div>'
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
    const droneIcon = L.marker(droneLatLng, {
            icon: L.icon({
            iconUrl: droneIconUrl, // drone-icon.png
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -20]
        })
    })
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
    log.innerHTML = '<div class="log-event">🛰 Orbit Mission Log</div>';

    let i = 0;
    function moveDrone() {
        if (i >= waypoints.length) {
            log.innerHTML += `<div class="log-event">✅ Mission Complete</div>`;
            return;
        }

        const [lat, lng] = waypoints[i];
        droneMarker.setLatLng([lat, lng]);
        log.innerHTML += `<div class="log-event">📸 Photo captured at ${lat.toFixed(5)}, ${lng.toFixed(5)}</div>`;
        log.scrollTop = log.scrollHeight;

        i++;
        setTimeout(moveDrone, interval);
    }

    moveDrone();
}


function generateGrid(center, width, height, rows, cols, angleDegrees = 0) {
    const lat = center.lat;
    const lng = center.lng;
    const dLat = height / rows / 111111; // approx degrees per meter
    const dLng = width / cols / (111111 * Math.cos(lat * (Math.PI / 180)));

    const angle = angleDegrees * (Math.PI / 180);
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const points = [];

    for (let i = 0; i <= rows; i++) {
        for (let j = 0; j <= cols; j++) {
            // Grid relative coordinates
            const dx = (j - cols / 2) * dLng;
            const dy = (i - rows / 2) * dLat;

            // Apply rotation
            const rx = dx * cosA - dy * sinA;
            const ry = dx * sinA + dy * cosA;

            points.push([lat + ry, lng + rx]);
        }
    }

    return points;
}
