import {missions, openWaypointEditor} from "./missionBuilder.js";
import { waypoints} from "./missionBuilder.js";


    export function closeWaypointEditor() {
    document.getElementById("waypointEditor").classList.add("hidden");
}

    // Batch editor
    export function openBatchEditor(missionIndex) {
    const editor = document.getElementById("batchEditor");
    editor.classList.remove("hidden");

    const form = document.getElementById("batchEditForm");
    form.onsubmit = (e) => {
    e.preventDefault();

    const alt = document.getElementById("batch-altitude").value;
    const poiAlt = document.getElementById('batch-poi-altitude').value;
    const speed = document.getElementById("batch-speed").value;
    const action = document.getElementById("batch-action").value;

    missions[missionIndex].waypoints.forEach(wp => {
    if (alt) wp.altitude = parseFloat(alt);
    if (poiAlt) wp.poiAlt = parseFloat(alt);
    if (speed) wp.speed = parseFloat(speed);
    if (action) wp.action = action;
});

    editor.classList.add("hidden");
    renderMissionTree();
};
}

    export function closeBatchEditor() {
    document.getElementById("batchEditor").classList.add("hidden");
}

    export function deleteMission(mission) {

    }
    // Download KML
function downloadKML(mission) {
    const kmlContent = generateKML(mission);
    const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mission.name || 'mission'}.kml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


    // Export to JSON
export function exportMissionJSON() {
    const cleanedMissions = missions.map((mission) => ({
        ...mission,
        waypoints: mission.waypoints.map(({ position, meta }) => ({
            position,
            meta,
        })),
    }));

    const blob = new Blob([JSON.stringify(cleanedMissions, null, 2)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "missions.json";
    link.click();
    URL.revokeObjectURL(url);
}

// TODO: camera and bearing logic for pan flight
export function generateKML(mission) {
    const { name, poi, waypoints = [], altitudeMode = 'absolute' } = mission;

    console.log("POI", poi)
    console.log("Mission", mission)
    console.log(waypoints)
    function calculateBearing(from, to) {
        const lat1 = from.lat * Math.PI / 180;
        const lat2 = to.lat * Math.PI / 180;
        const deltaLng = (to.lng - from.lng) * Math.PI / 180;
        const y = Math.sin(deltaLng) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
        const bearing = Math.atan2(y, x) * 180 / Math.PI;
        return (bearing + 360) % 360;
    }

    const kml = [];
    kml.push(`<?xml version="1.0" encoding="UTF-8"?>`);
    kml.push(`<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2">`);
    kml.push(`<Document>`);
    kml.push(`<name>${name}</name>`);

    // Line path
    kml.push(`<Placemark><name>Flight Path</name><LineString>`);
    kml.push(`<altitudeMode>${altitudeMode}</altitudeMode>`);
    kml.push(`<coordinates>`);
    waypoints.forEach(wp => {
        kml.push(`${wp.position.lng},${wp.position.lat},${wp.meta.altitude}`);
    });
    kml.push(`</coordinates></LineString></Placemark>`);

    // Per waypoint
    waypoints.forEach((wp, idx) => {
        const heading = calculateBearing(wp.position, poi);
        const tilt = wp.meta.gimbal ?? 45;
        const speed = wp.meta.speed ?? mission.speed ?? 5;
        const poiAlt = wp.meta.poiAlt ?? 0;
        const alt = wp.meta.altitude ?? 30;
        const action = wp.meta.action ?? 'None';

        kml.push(`<Placemark><name>Waypoint ${idx + 1}</name>`);
        kml.push(`
        <Camera>
          <longitude>${wp.position.lng}</longitude>
          <latitude>${wp.position.lat}</latitude>
          <altitude>${alt}</altitude>
          <altitudeMode>${altitudeMode}</altitudeMode>
          <tilt>${tilt}</tilt>
          <heading>${heading.toFixed(2)}</heading>
        </Camera>`);

        kml.push(`<ExtendedData>
            <Data name="speed"><value>${speed}</value></Data>
            <Data name="gimbalPitch"><value>${tilt}</value></Data>
            <Data name="action"><value>${action}</value></Data>
        </ExtendedData>`);

        kml.push(`<Point><coordinates>${wp.position.lng},${wp.position.lat},${alt}</coordinates></Point>`);
        kml.push(`</Placemark>`);
    });

    // Optional gx:Tour
    kml.push(`<gx:Tour><name>${name} Tour</name><gx:Playlist>`);
    waypoints.forEach((wp, idx) => {
        const heading = calculateBearing(wp.position, poi);
        const tilt = wp.meta.gimbal ?? 45;
        const alt = wp.meta.altitude ?? 30;
        const poiAlt = wp.meta.poiAlt ?? 0;
        const wait = 1.5; // seconds pause at each WP
        const action = wp.meta.action ?? 'None';

        kml.push(`<gx:FlyTo><gx:duration>1.2</gx:duration><gx:flyToMode>smooth</gx:flyToMode>
        <Camera>
          <longitude>${wp.position.lng}</longitude>
          <latitude>${wp.position.lat}</latitude>
          <altitude>${alt}</altitude>
          <altitudeMode>${altitudeMode}</altitudeMode>
          <tilt>${tilt}</tilt>
          <heading>${heading.toFixed(2)}</heading>
        </Camera></gx:FlyTo>`);

        // Optional simulated action: log action as a wait marker
        if (action !== 'None') {
            kml.push(`<gx:Wait><gx:duration>${wait}</gx:duration></gx:Wait>`);
        }
    });
    kml.push(`</gx:Playlist></gx:Tour>`);

    kml.push(`</Document></kml>`);
    return kml.join('\n');
}



// Add dummy mission
    function addDummyMission() {
    const id = crypto.randomUUID().slice(0, 8);
    missions.push({
    name: "POI Orbit Mission",
    id,
    type: "orbit",
    waypoints: [
{ id: "A", lat: 37.77, lng: -122.42, altitude: 100, speed: 6, action: "Photo" },
{ id: "B", lat: 37.78, lng: -122.41, altitude: 110, speed: 6, action: "Start Video" },
    ]
});
    renderMissionTree();
}

    // Auto-run on load
//     window.onload = () => {
//     addDummyMission(); // Replace real mission builder hook later
// };

    export function addMissionToTree(mission) {
        const tree = document.getElementById("missionList");

        const rightSide = document.createElement("div");
        rightSide.classList.add("space-x-2");

        const batchBtn = document.createElement("button");
        batchBtn.textContent = "Batch Edit";
        batchBtn.classList.add("text-xs", "bg-gray-300", "rounded", "px-2", "py-0.5");
        batchBtn.onclick = () => openBatchEditor(mission);

        const downloadBtn = document.createElement("button");
        downloadBtn.textContent = "Download KML";
        downloadBtn.classList.add("text-xs", "bg-blue-500", "text-white", "rounded", "px-2", "py-0.5");
        downloadBtn.onclick = () => downloadKML(mission);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete Mission";
        deleteBtn.classList.add("text-xs", "bg-red-500", "text-white", "rounded", "px-2", "py-0.5","hover:bg-red-600");
        deleteBtn.onclick = () => tree.removeChild(missionNode);

        rightSide.appendChild(batchBtn);
        rightSide.appendChild(downloadBtn);
        rightSide.appendChild(deleteBtn);

        const missionNode = document.createElement("li");
        missionNode.className = "mission-node";

        const summary = document.createElement("summary");
        summary.textContent = `${mission.name} (${mission.type})`;
        summary.className = "cursor-pointer font-bold";

        const details = document.createElement("details");
        details.open = true;
        details.appendChild(summary);

        const childrenList = document.createElement("ul");
        childrenList.className = "pl-4";

        mission.waypoints.forEach((wp, index) => {
            const child = document.createElement("li");
            child.className = "text-sm hover:underline cursor-pointer";
            child.textContent = `Waypoint ${index + 1} - Drone Alt: ${wp.meta.altitude}m - POI Alt: ${wp.meta.poiAlt}m`;

            child.addEventListener("click", () => {
                wp.marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(() => wp.marker.setAnimation(null), 1400);
                wp.marker.getMap().panTo(wp.marker.getPosition());
            });

            childrenList.appendChild(child);
        });

        details.appendChild(childrenList);
        missionNode.appendChild(details);
        missionNode.appendChild(rightSide);
        tree.appendChild(missionNode);
    }


