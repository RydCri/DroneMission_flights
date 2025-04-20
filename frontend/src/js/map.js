export function initMap() {
    const map = L.map('map').setView([37.7749, -122.4194], 13); // SF placeholder
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
}
