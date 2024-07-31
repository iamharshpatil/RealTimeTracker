const socket = io();

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            console.log('Sending location:', { latitude, longitude });
            socket.emit('send-location', { latitude, longitude });
        },
        (error) => {
            console.error('Error getting user location', error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

const map = L.map("map").setView([0, 0], 16);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
    console.log('Received location:', data);
    const { id, latitude, longitude } = data;
    
    if (markers[id]) {
        console.log(`Updating marker for user ${id}`);
        markers[id].setLatLng([latitude, longitude]);
    } else {
        console.log(`Adding marker for new user ${id}`);
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
    console.log(`Current markers:`, markers);
    map.setView([latitude, longitude]); // Optionally adjust map view to new location
});

socket.on("user-disconnect", (id) => {
    console.log('User disconnected:', id);
    if (markers[id]) {
        console.log(`Removing marker for user ${id}`);
        map.removeLayer(markers[id]);
        delete markers[id];
    }
    console.log(`Current markers after disconnection:`, markers);
});
