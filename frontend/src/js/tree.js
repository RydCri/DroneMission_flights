import {missions, openWaypointEditor} from "./missionBuilder.js";
import { waypoints} from "./missionBuilder.js";

// Populate the collapsible tree with mission and waypoint info
// TODO: needs missions import, Don't change this yet, decouple any direct handling eventually
    function renderMissionTree() {
    const missionList = document.getElementById("missionList");
    missionList.innerHTML = "";

    missions.forEach((mission, mIndex) => {
    const missionItem = document.createElement("li");
    missionItem.classList.add("border", "rounded", "p-2", "bg-white", "shadow");

    const missionHeader = document.createElement("div");
    missionHeader.classList.add("font-semibold", "cursor-pointer", "flex", "justify-between", "items-center");
    missionHeader.innerHTML = `
      <span>${mission.name}</span>
      <button onclick="openBatchEditor(${mIndex})" class="text-xs bg-gray-300 rounded px-2 py-0.5">Batch Edit</button>
    `;

    const waypointList = document.createElement("ul");
    waypointList.classList.add("pl-4", "mt-2", "space-y-1");

    mission.waypoints.forEach((wp, wpIndex) => {
    const wpItem = document.createElement("li");
    wpItem.classList.add("cursor-pointer", "text-sm", "hover:underline");
    wpItem.textContent = `Waypoint ${wp.id} - ${wp.action}`;
    wpItem.onclick = () => openWaypointEditor(wpIndex);
    waypointList.appendChild(wpItem);
});

    missionItem.appendChild(missionHeader);
    missionItem.appendChild(waypointList);
    missionList.appendChild(missionItem);
});
}

    // Open single waypoint editor

//     function openWaypointEditor(missionIndex, wpIndex) {
//     const wp = missions[missionIndex].waypoints[wpIndex];
//
//     const form = document.getElementById("waypointEditForm");
//     const editor = document.getElementById("waypointEditModal");
//
//     document.getElementById("wp-altitude").value = wp.meta.altitude;
//     document.getElementById("wp-speed").value = wp.meta.speed;
//     document.getElementById("wp-action").value = wp.meta.action;
//
//     form.onsubmit = (e) => {
//         e.preventDefault();
//         wp.meta.altitude = parseFloat(document.getElementById("wp-altitude").value);
//         wp.meta.speed = parseFloat(document.getElementById("wp-speed").value);
//         wp.meta.action = document.getElementById("wp-action").value;
//
//         editor.classList.add("hidden");
//
//         renderMissionTree(); // Refresh
//     };
//
//     editor.classList.remove("hidden");
// }

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
    const speed = document.getElementById("batch-speed").value;
    const action = document.getElementById("batch-action").value;

    missions[missionIndex].waypoints.forEach(wp => {
    if (alt) wp.altitude = parseFloat(alt);
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
        const tree = document.getElementById("waypointTree");

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
            child.textContent = `Waypoint ${index + 1} - Alt: ${wp.meta.altitude}m`;

            child.addEventListener("click", () => {
                wp.marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(() => wp.marker.setAnimation(null), 1400);
                wp.marker.getMap().panTo(wp.marker.getPosition());
                openWaypointEditor(index); // from missionBuilder.js
            });

            childrenList.appendChild(child);
        });

        details.appendChild(childrenList);
        missionNode.appendChild(details);
        tree.appendChild(missionNode);
    }


