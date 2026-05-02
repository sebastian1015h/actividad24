document.addEventListener("DOMContentLoaded", function () {

    var data = [
        {
            type: "scattermapbox",
            mode: "markers",
            lat: [4.7110],
            lon: [-74.0721],
            text: ["Bogotá"],
            marker: { size: 10, color: "red" }
        }
    ];

    var layout = {
        mapbox: {
            style: "open-street-map",
            center: { lat: 4.7110, lon: -74.0721 },
            zoom: 10
        },
        margin: { r: 0, t: 0, l: 0, b: 0 }
    };

    Plotly.newPlot("tester", data, layout);
});