// Inicializar el mapa con Leaflet + OpenStreetMap
var map = L.map("map").setView([4.7110, -74.0721], 12);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
}).addTo(map);

var markerCount = 1;
var markers = [];

// Marcador inicial: Bogotá
agregarMarcador(4.7110, -74.0721, "Bogotá");

// CLIC IZQUIERDO en el mapa → agregar marcador
map.on("click", function (e) {
    markerCount++;
    agregarMarcador(e.latlng.lat, e.latlng.lng, "Marcador " + markerCount);
    toast("📍 Marcador creado — clic derecho sobre él para editarlo o eliminarlo");
});

function agregarMarcador(lat, lon, nombre) {
    var marker = L.marker([lat, lon]).addTo(map);

    // Tooltip con el nombre (visible siempre)
    marker.bindTooltip(nombre, {
        permanent: true,
        direction: "top",
        offset: [0, -10],
        className: "mk-label"
    }).openTooltip();

    // CLIC DERECHO → editar / eliminar
    marker.on("contextmenu", function (e) {
        L.DomEvent.stopPropagation(e);
        mostrarEditor(e.originalEvent.clientX, e.originalEvent.clientY, marker);
    });

    markers.push(marker);
    return marker;
}

// Editor flotante
function mostrarEditor(cx, cy, marker) {
    var old = document.getElementById("mk-editor");
    if (old) old.remove();

    var nombreActual = marker.getTooltip().getContent();

    var box = document.createElement("div");
    box.id = "mk-editor";
    box.style.cssText = [
        "position:fixed",
        "left:" + cx + "px",
        "top:" + cy + "px",
        "background:#fff",
        "border:2px solid #e53935",
        "border-radius:10px",
        "padding:14px 16px",
        "box-shadow:0 6px 24px rgba(0,0,0,.25)",
        "z-index:9999",
        "display:flex",
        "flex-direction:column",
        "gap:10px",
        "min-width:240px",
        "font-family:sans-serif",
        "font-size:14px"
    ].join(";");

    box.innerHTML =
        '<div style="font-weight:bold;color:#333;font-size:15px">✏️ Editar nombre</div>' +
        '<input id="mk-input" type="text" value="' + esc(nombreActual) + '"' +
        ' style="border:1px solid #ccc;border-radius:5px;padding:7px 10px;' +
        'font-size:14px;width:100%;outline:none;">' +
        '<div style="display:flex;gap:8px;justify-content:space-between">' +
        '<button id="mk-delete" style="padding:6px 14px;border:none;border-radius:5px;' +
        'background:#b71c1c;color:#fff;cursor:pointer;font-size:13px">🗑 Eliminar</button>' +
        '<div style="display:flex;gap:8px">' +
        '<button id="mk-cancel" style="padding:6px 14px;border:1px solid #ccc;' +
        'border-radius:5px;background:#f5f5f5;cursor:pointer;font-size:13px">Cancelar</button>' +
        '<button id="mk-save" style="padding:6px 14px;border:none;border-radius:5px;' +
        'background:#e53935;color:#fff;font-weight:bold;cursor:pointer;font-size:13px">Guardar</button>' +
        '</div></div>';

    document.body.appendChild(box);

    // Ajustar si se sale de la pantalla
    var r = box.getBoundingClientRect();
    if (r.right  > window.innerWidth)  box.style.left = (cx - r.width  - 8) + "px";
    if (r.bottom > window.innerHeight) box.style.top  = (cy - r.height - 8) + "px";

    var input = document.getElementById("mk-input");
    input.focus(); input.select();

    function guardar() {
        var v = input.value.trim();
        if (v) {
            marker.setTooltipContent(v);
            toast("✅ Nombre actualizado: " + v);
        }
        box.remove();
    }

    document.getElementById("mk-save").onclick   = guardar;
    document.getElementById("mk-cancel").onclick = function () { box.remove(); };
    document.getElementById("mk-delete").onclick = function () {
        var nombre = marker.getTooltip().getContent();
        map.removeLayer(marker);
        markers.splice(markers.indexOf(marker), 1);
        box.remove();
        toast("🗑️ Marcador eliminado: " + nombre);
    };
    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter")  guardar();
        if (e.key === "Escape") box.remove();
    });

    setTimeout(function () {
        document.addEventListener("mousedown", function cerrar(ev) {
            if (!box.contains(ev.target)) {
                box.remove();
                document.removeEventListener("mousedown", cerrar);
            }
        });
    }, 80);
}

// Toast de notificación
function toast(msg) {
    var old = document.getElementById("mk-toast");
    if (old) old.remove();
    var t = document.createElement("div");
    t.id = "mk-toast";
    t.textContent = msg;
    t.style.cssText = [
        "position:fixed",
        "bottom:28px",
        "left:50%",
        "transform:translateX(-50%)",
        "background:rgba(20,20,20,.88)",
        "color:#fff",
        "padding:10px 22px",
        "border-radius:24px",
        "font-family:sans-serif",
        "font-size:14px",
        "z-index:9998",
        "pointer-events:none",
        "transition:opacity .4s",
        "opacity:1",
        "white-space:nowrap"
    ].join(";");
    document.body.appendChild(t);
    setTimeout(function () { t.style.opacity = "0"; }, 2500);
    setTimeout(function () { t.remove(); }, 3000);
}

function esc(s) {
    return String(s)
        .replace(/&/g,"&amp;")
        .replace(/"/g,"&quot;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;");
}