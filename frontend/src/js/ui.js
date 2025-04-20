let poi = null

export function setupSimUI() {
    const mapDiv = document.getElementById('map')
    mapDiv.addEventListener('click', (e) => {
        const x = e.offsetX
        const y = e.offsetY
        // Mock coordinates
        poi = { lat: (y / mapDiv.clientHeight * 180 - 90).toFixed(5), lon: (x / mapDiv.clientWidth * 360 - 180).toFixed(5) }

        document.getElementById('poi-display').textContent = `Lat: ${poi.lat}, Lon: ${poi.lon}`
    })

    document.getElementById('simulate-btn').addEventListener('click', () => {
        const missionType = document.getElementById('mission-type').value

        if (!poi) {
            alert('Please select a point of interest on the map first.')
            return
        }

        console.log(`Simulating '${missionType}' mission at`, poi)
        // Placeholder simulation logic
        alert(`Starting "${missionType}" mission at Lat: ${poi.lat}, Lon: ${poi.lon}`)
    })
}
