import { Loader } from "@googlemaps/js-api-loader";

const loader = new Loader({
    apiKey: import.meta.env.VITE_MAPS_API_KEY,
    version: "weekly",
    libraries: ["places"],
});

let mapResolve;
const mapPromise = new Promise((resolve) => {
    mapResolve = resolve;
});
loader.importLibrary("maps").then(async () => {
    const { Map } = await google.maps.importLibrary("maps");

    const mapInstance = new Map(document.getElementById("map"), {
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 14,
        mapTypeId: 'satellite',
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false,
    });

    initMapControls(mapInstance); // pass initMapControls
    mapResolve(mapInstance); // Resolve after init
});


function initMapControls(map) {
    const controlDiv = document.createElement("div");
    controlDiv.className = "p-2 space-y-2";
    const wpUI = document.createElement("div");
    wpUI.className = "p-2 space-y-2";

    // Map/Satellite Toggle
    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = "🗺 Map View";
    toggleBtn.className = "px-3 py-1 bg-blue-500 text-white tx-shadow-sm rounded hover:bg-blue-600 text-sm hover:cursor-pointer w-40";

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

    // 📍 My Location Button
    const mylocationBtn = document.createElement("button");
    mylocationBtn.textContent = "📍 My Location";
    mylocationBtn.className = "px-3 py-1 bg-blue-500 text-white tx-shadow-sm rounded hover:bg-blue-600 text-sm hover:cursor-pointer w-40";

    mylocationBtn.addEventListener("click", () => {
        if (navigator.geolocation) {
            console.log('Getting Location...')
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };

                    map.setCenter(pos);
                    map.setZoom(17);

                    new google.maps.Marker({
                        position: pos,
                        map,
                        title: "You are here",
                    });
                },
                () => {
                    alert("Geolocation failed or was denied.");
                }
            );
        } else {
            alert("Your browser doesn't support geolocation.");
        }
    });


    let userPath = null;
    let pathCoords = [];
    let watchId = null;
    let userMarker = null;

    const liveTrackBtn = document.createElement("button");
    liveTrackBtn.textContent = "📡 Start Tracking";
    liveTrackBtn.className = "px-3 py-1 text-white rounded bg-[rgb(0,0,0)]/50 hover:bg-[rgb(0,0,0)]/60 text-sm hover:cursor-pointer";

    function startTracking(map) {
        if (watchId) return;

        watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                const userLatLng = { lat: latitude, lng: longitude };

                // Place or move the marker
                if (!userMarker) {
                    userMarker = new google.maps.Marker({
                        position: userLatLng,
                        map,
                        title: "Your Location",
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 6,
                            fillColor: "#00f",
                            fillOpacity: 0.8,
                            strokeWeight: 2,
                            strokeColor: "#fff",
                        },
                    });
                } else {
                    userMarker.setPosition(userLatLng);
                }

                // Append to path
                pathCoords.push(userLatLng);

                // Draw or update polyline
                if (!userPath) {
                    userPath = new google.maps.Polyline({
                        path: pathCoords,
                        geodesic: true,
                        strokeColor: "#00f",
                        strokeOpacity: 0.7,
                        strokeWeight: 3,
                        map,
                    });
                } else {
                    userPath.setPath(pathCoords);
                }

                map.panTo(userLatLng);
            },
            (err) => console.error("Tracking error:", err),
            {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 20000,
            }
        );

        liveTrackBtn.textContent = "🛑 Stop Tracking";
        liveTrackBtn.classList.replace("bg-green-500", "bg-red-500");
    }

    function stopTracking() {
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }

        if (userMarker) {
            userMarker.setMap(null);
            userMarker = null;
        }

        if (userPath) {
            userPath.setMap(null);
            userPath = null;
        }

        pathCoords = [];

        liveTrackBtn.textContent = "📡 Start Tracking";
        liveTrackBtn.classList.replace("bg-red-500", "bg-green-500");
    }

    liveTrackBtn.addEventListener("click", () => {
        if (!watchId) {
            getMap().then((map) => startTracking(map));
        } else {
            stopTracking();
        }
    });

    const missionBtn = document.createElement('button')
    const missionUI = document.getElementById('mission-controls')
    missionBtn.textContent = 'Build Mission'
    missionBtn.className = "px-3 py-1 bg-[rgb(0,0,0)]/50 hover:bg-[rgb(0,0,0)]/60 text-white rounded text-sm hover:cursor-pointer";
    missionBtn.id = 'mission-toggle'
    const wpTree = document.getElementById('waypointTree')
    const wpTreeToggle = document.createElement('button')
    wpTreeToggle.textContent = 'Waypoints'
    wpTreeToggle.className = "px-3 py-1 bg-[rgb(0,0,0)]/50 hover:bg-[rgb(0,0,0)]/60 text-white rounded text-sm hover:cursor-pointer";
    wpTreeToggle.id = 'mission-toggle'
    // Append buttons
    controlDiv.appendChild(toggleBtn);
    controlDiv.appendChild(mylocationBtn);
    controlDiv.appendChild(liveTrackBtn);
    wpUI.appendChild(missionBtn);
    wpUI.appendChild(wpTreeToggle);
    missionBtn.addEventListener('click', () => {
        missionUI.classList.toggle('mission-open')
    });
    wpTreeToggle.addEventListener('click', () => {
        wpTree.classList.toggle('waypointTree')
    });
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(wpUI);

}

let mapInstance = null;

export async function getMap() {
    return mapPromise;
}

