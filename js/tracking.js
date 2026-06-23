const PROVINCIAS = {
  'Pinar del Río':    { lat: 22.4167, lng: -83.7000 },
  'Artemisa':         { lat: 22.8167, lng: -82.7667 },
  'La Habana':        { lat: 23.1167, lng: -82.3833 },
  'Mayabeque':        { lat: 22.9667, lng: -82.1500 },
  'Matanzas':         { lat: 23.0500, lng: -81.5667 },
  'Cienfuegos':       { lat: 22.1500, lng: -80.4500 },
  'Villa Clara':      { lat: 22.4167, lng: -79.9667 },
  'Sancti Spíritus':  { lat: 21.9333, lng: -79.4333 },
  'Ciego de Ávila':   { lat: 21.8500, lng: -78.7667 },
  'Camagüey':         { lat: 21.3833, lng: -77.9167 },
  'Las Tunas':        { lat: 20.9667, lng: -76.9500 },
  'Holguín':          { lat: 20.8833, lng: -76.2667 },
  'Granma':           { lat: 20.3833, lng: -76.6500 },
  'Santiago de Cuba': { lat: 20.0167, lng: -75.8167 },
  'Guantánamo':       { lat: 20.1500, lng: -75.2000 },
};

function distanciaHaversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function generarTracking() {
  const pedidos = JSON.parse(localStorage.getItem('scorp_pedidos') || '[]');
  const usados = new Set(pedidos.map(p => p.tracking));
  let codigo;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  do {
    codigo = '';
    for (var i = 0; i < 6; i++) {
      codigo += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (usados.has('JW-' + codigo));
  return 'JW-' + codigo;
}

function getCoords(provincia) {
  return PROVINCIAS[provincia] || null;
}

function tiempoEstimado(origen, destino) {
  const o = getCoords(origen);
  const d = getCoords(destino);
  if (!o || !d) return null;
  const km = distanciaHaversine(o.lat, o.lng, d.lat, d.lng);
  const horas = km / 50;
  return { km: Math.round(km), horas: horas };
}

function buscarPedido(tracking) {
  const pedidos = JSON.parse(localStorage.getItem('scorp_pedidos') || '[]');
  return pedidos.find(p => p.tracking === tracking) || null;
}
