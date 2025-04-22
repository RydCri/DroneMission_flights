import { Loader } from "@googlemaps/js-api-loader";

const loader = new Loader({
    apiKey: import.meta.env.VITE_MAPS_API_KEY,
    version: "weekly",
    libraries: ["places"], // POI/geocoding features
});

let map;
let mapTypeToggle;

loader.importLibrary('maps').then(async () => {
    const { Map } = await google.maps.importLibrary("maps");

    map = new Map(document.getElementById("map"), {
        center: { lat: 37.7749, lng: -122.4194 }, // Default: SF
        zoom: 14,
        mapTypeId: 'satellite',
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false,
    });

    initMapControls();
});

function initMapControls() {
    // Toggle Map/Satellite
    const controlDiv = document.createElement("div");
    controlDiv.className = "p-2 bg-white shadow-md rounded flex items-center gap-2";

    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = "🗺 Map View";
    toggleBtn.className = "px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm";

    toggleBtn.addEventListener("click", () => {
        const current = map.getMapTypeId();
        if (current === "roadmap") {
            map.setMapTypeId("satellite");
            toggleBtn.textContent = "🗺 Map View";
        } else {
            map.setMapTypeId("roadmap");
            toggleBtn.textContent = "🛰 Satellite View";
        }
    });

    controlDiv.appendChild(toggleBtn);
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);
}
