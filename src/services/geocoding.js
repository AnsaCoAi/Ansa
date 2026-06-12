const haversine = (a, b) => {
  const R = 3958.8;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

async function geocode(address) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return null;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'OK' && data.results?.length) {
      return data.results[0].geometry.location;
    }
  } catch (err) {
    console.error('[Geocode] Error:', err.message);
  }
  return null;
}

async function getDistanceMiles(address1, address2) {
  const [loc1, loc2] = await Promise.all([geocode(address1), geocode(address2)]);
  if (!loc1 || !loc2) return null;
  return haversine(loc1, loc2);
}

module.exports = { getDistanceMiles };
