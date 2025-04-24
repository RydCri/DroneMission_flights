import { getMap } from "./map.js";
import { addMissionToTree } from "./tree.js";
export const missions = [];

// TODO: Editing waypoints needs close modal anim,
// TODO: Missions are being pushed with all waypoints
// TODO: Gimbal pitch logic add to generateKML()
// TODO: Pan controls and heading to calculateBearing() /tree.js
function registerMission(name, type, poi, waypoints) {
    const missionId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const mission = {
        id: missionId,
        name,
        type,
        timestamp,
        poi,
        waypoints,
    };

    missions.push(mission);
    addMissionToTree(mission);
    return { mission, index: missions.length - 1 };
}

let poi = null;
let markers = [];
let missionType = "orbit";
const waypointData = [];
const waypointMarkers = [];


let listenerAttached = false;

getMap().then((map) => {
    const poiDisplay = document.getElementById("poi-coords");
    const generateBtn = document.getElementById("generateMissionBtn");

    // Update POI when clicking map
    map.addListener("click", (e) => {
        poi = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        poiDisplay.textContent = `${poi.lat.toFixed(5)}, ${poi.lng.toFixed(5)}`;
        map.panTo(poi)
        map.setZoom(17)
        generateBtn.disabled = false;
    });

    // Generate mission on submit
    generateBtn.addEventListener("click", () => {
        if (!poi) return;

        const missionType = document.getElementById("missionType").value;

        // Grab orbit settings
        const orbitCount = parseInt(document.getElementById("orbitCount").value, 10);
        const orbitRadius = parseFloat(document.getElementById("orbitRadius").value);
        const altitude = parseFloat(document.getElementById("altitude").value);
        const poiAlt = parseFloat(document.getElementById("poi-Alt").value) ?? 1;
        const speed = parseFloat(document.getElementById("speed").value);
        const cameraAction = document.getElementById("cameraAction").value;

        const config = {
            poi,
            poiAlt,
            orbitCount,
            orbitRadius,
            altitude,
            speed,
            cameraAction,
        };

        if (missionType === "orbit") {
            generateOrbitMission(config, map);
        }

        // TODO: disable form / highlight mission / enable editing, etc.
    });
});

getMap().then((map) => {
    if (!listenerAttached) {
        map.addListener("click", (e) => {
            poi = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        });
        listenerAttached = true;
    }
});




export const waypoints = [];

document.body.addEventListener("DOMContentLoaded", () => {
    document.getElementById("generateBtn").addEventListener("click", () => {
        const missionType = document.getElementById("missionType").value;
        const altitude = parseFloat(document.getElementById("altitude").value);
        const speed = parseFloat(document.getElementById("speed").value);
        const gimbal = parseFloat(document.getElementById("gimbal").value);

        if (!poi) {
            alert("Please click a location on the map to set a POI first.");
            return;
        }
        // Refactor for map edit or use tree.js edit
        // const config = {altitude, speed, gimbal};
        // generateMissionWaypoints(poi, missionType, config);
    });
// Mission dropdown listener
const missionSelect = document.getElementById("mission-type");
missionSelect.addEventListener("change", (e) => {
    missionType = e.target.value;
});
});


function generateOrbitMission(config, map) {
    let newWaypoints = [];
    const {
        poi,
        poiAlt,
        orbitCount,
        orbitRadius,
        altitude,
        speed,
        cameraAction
    } = config;

    const pointsPerOrbit = 12;
    const totalPoints = orbitCount * pointsPerOrbit;

    for (let i = 0; i < totalPoints; i++) {
        const angle = (i / pointsPerOrbit) * 2 * Math.PI;
        const latOffset = (orbitRadius / 111111) * Math.cos(angle);
        const lngOffset = (orbitRadius / (111111 * Math.cos(poi.lat * Math.PI / 180))) * Math.sin(angle);

        const position = {
            lat: poi.lat + latOffset,
            lng: poi.lng + lngOffset,
            alt: poiAlt ?? 0  // default to 0 if not set
        };

        const meta = {
            poiAlt,
            altitude,
            speed,
            action: cameraAction,
            gimbal: -90,
        };

        const marker = new google.maps.Marker({
            position,
            map,
            label: `${newWaypoints.length + 1}`,
            title: `Waypoint ${newWaypoints.length + 1}`,
        });
        const index = newWaypoints.length; // capture current index before push

        newWaypoints.push({
            position,
            meta,
            marker
        });
    }const { mission, index: missionIndex } = registerMission(
        `Orbit Mission @ ${new Date().toLocaleTimeString()}`,
        "orbit",
        poi,
        newWaypoints
    );
    console.log(mission)
    mission.waypoints.forEach((wp, wpIndex) => {
        wp.marker.addListener("click", () => openWaypointEditor(missionIndex, wpIndex));

    });

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
// replace
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

export function openWaypointEditor(missionIndex, waypointIndex) {
    const mission = missions[missionIndex];
    // const wp = waypoints[waypointIndex];
    const meta = mission.waypoints
    console.log(mission, meta)

    // Update modal header
    document.getElementById("editModalTitle").textContent = `Edit Waypoint ${waypointIndex + 1}`;

    // Set input values
    document.getElementById("edit-poi-altitude").value = meta.poiAlt ?? 0;
    document.getElementById("edit-altitude").value = meta.altitude;
    document.getElementById("edit-speed").value = meta.speed;
    document.getElementById("edit-action").value = meta.action;
    document.getElementById("edit-gimbal").value = meta.gimbal;

    // Store index for save handler
    document.getElementById("editModal").dataset.index = waypointIndex;

    // Show modal
    document.getElementById("editModal").classList.remove("hidden");

    // Save btn
    document.getElementById("editSaveBtn").addEventListener("click", () => {
        const index = parseInt(document.getElementById("editModal").dataset.index);
        const mission = missions[missionIndex];
        const wp = mission.waypoints[waypointIndex];
        console.log("Waypoint updated ", wp)

        wp.meta.altitude = parseFloat(document.getElementById("edit-altitude").value);
        wp.meta.poiAlt = parseFloat(document.getElementById("edit-poi-altitude").value);
        wp.meta.speed = parseFloat(document.getElementById("edit-speed").value);
        wp.meta.action = document.getElementById("edit-action").value;
        wp.meta.gimbal = parseFloat(document.getElementById("edit-gimbal").value);
        // Set marker
        wp.marker.setTitle(`Waypoint ${index + 1} - ${wp.meta.action}`);
    });
        // Close modal
    document.getElementById("editCancelBtn").addEventListener("click", () => {
        document.getElementById("editModal").classList.add("hidden");
    });
//     TODO: fix function to empty tree of duplicates
// addMissionToTree(mission)
}


