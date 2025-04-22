import { getMap } from "./map.js";
let poi = null;
let markers = [];
let missionType = "orbit";

let listenerAttached = false;

getMap().then((map) => {
    if (!listenerAttached) {
        console.log('Setting map listener')
        map.addListener("click", (e) => {
            poi = { lat: e.latLng.lat(), lng: e.latLng.lng() };
            generateMissionWaypoints(poi, missionType);
        });
        listenerAttached = true;
        console.log(listenerAttached)
    }
});

// Mission dropdown listener
const missionSelect = document.getElementById("mission-type");
missionSelect.addEventListener("change", (e) => {
    missionType = e.target.value;
});

const missionOptions = [
    { label: "Orbit", value: "orbit" },
    { label: "Grid Photo", value: "grid-photo" },
    { label: "Grid Video", value: "grid-video" },
];


let waypoints = [];
export function generateMissionWaypoints(poi, missionType = "orbit", config = {}) {
    waypoints = []; // Reset

    switch (missionType) {
        case "orbit":
            waypoints = generateOrbit(poi, 50, 8); // center, radius (m), number of points
            break;
        case "grid":
            waypoints = generateGrid(poi, 100, 80, 4, 3); // center, width, height, rows, cols
            break;
        case "linear":
            waypoints = generateLinear(poi, 200, 5); // center, length, number of points
            break;
        default:
            console.warn("Unsupported mission type");
            return;
    }

    drawWaypoints(waypoints);
}


document.getElementById("generateBtn").addEventListener("click", () => {
    const missionType = document.getElementById("missionType").value;
    const altitude = parseFloat(document.getElementById("altitude").value);
    const speed = parseFloat(document.getElementById("speed").value);
    const gimbal = parseFloat(document.getElementById("gimbal").value);

    if (!poi) {
        alert("Please click a location on the map to set a POI first.");
        return;
    }

    const config = { altitude, speed, gimbal };
    generateMissionWaypoints(poi, missionType, config);
});

function generateOrbit(center, radiusMeters, pointCount) {
    const R = 6371000; // Earth radius in meters
    const lat = center.lat * (Math.PI / 180);
    const lng = center.lng * (Math.PI / 180);

    const waypoints = [];

    for (let i = 0; i < pointCount; i++) {
        const angle = (2 * Math.PI * i) / pointCount;
        const dx = (radiusMeters / R) * Math.cos(angle);
        const dy = (radiusMeters / R) * Math.sin(angle);

        const latOffset = lat + dy;
        const lngOffset = lng + dx / Math.cos(lat);

        waypoints.push({
            lat: (latOffset * 180) / Math.PI,
            lng: (lngOffset * 180) / Math.PI,
        });
    }

    return waypoints;
}

function generateGrid(center, width, height, rows, cols) {
    const waypoints = [];

    const latDelta = metersToLat(height) / (rows - 1);
    const lngDelta = metersToLng(width, center.lat) / (cols - 1);

    const startLat = center.lat - (latDelta * (rows - 1)) / 2;
    const startLng = center.lng - (lngDelta * (cols - 1)) / 2;

    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
            row.push({
                lat: startLat + i * latDelta,
                lng: startLng + j * lngDelta,
            });
        }
        // Serpentine
        if (i % 2 === 1) row.reverse();
        waypoints.push(...row);
    }

    return waypoints;
}

function generateLinear(center, length, points) {
    const waypoints = [];
    const step = metersToLng(length / (points - 1), center.lat);

    const startLng = center.lng - (step * (points - 1)) / 2;
    for (let i = 0; i < points; i++) {
        waypoints.push({
            lat: center.lat,
            lng: startLng + i * step,
        });
    }

    return waypoints;
}



let polyline;
function drawWaypoints(coords) {
    getMap().then((map) => {
        if (polyline) polyline.setMap(null);

        polyline = new google.maps.Polyline({
            path: coords,
            map,
            geodesic: true,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });

        coords.forEach((pt, i) => {
            new google.maps.Marker({
                position: pt,
                map,
                label: `${i + 1}`,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 4,
                    fillColor: "#f00",
                    fillOpacity: 0.8,
                    strokeWeight: 1,
                    strokeColor: "#fff",
                },
            });
        });
    });
}


// Meters to Coords

function metersToLat(meters) {
    return (meters / 111320);
}

function metersToLng(meters, latitude) {
    return meters / (111320 * Math.cos((latitude * Math.PI) / 180));
}


function createWaypointMarker(position, index) {
    const marker = new google.maps.Marker({
        position,
        map: window.map,
        draggable: true,
        label: `${index + 1}`,
    });

    marker.addListener("dragend", () => {
        updateWaypointData();
    });

    return marker;
}

function clearMarkers() {
    markers.forEach(m => m.setMap(null));
    markers = [];
}

function updateWaypointData() {
    // side panel
    const data = markers.map((m, i) => ({
        index: i + 1,
        lat: m.getPosition().lat(),
        lng: m.getPosition().lng(),
        altitude: 50, // placeholder
        speed: 5,
        gimbal: -60,
        bearing: 0,
        action: "photo",
    }));
    console.log("Updated Waypoints:", data);
}
