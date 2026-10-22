import { memo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { typeInfo } from '../constants';

const NIGERIA_CENTER = [9.082, 8.6753];
const hasPoint = (f) => f.gpsLat != null && f.gpsLng != null;

function Fit({ points }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => {
      map.invalidateSize();
      if (points.length === 1) map.setView(points[0], 14);
      else if (points.length > 1) map.fitBounds(points, { padding: [28, 28], maxZoom: 15 });
    }, 100);
    return () => clearTimeout(t);
  }, [map, points]);
  return null;
}

const STYLE = {
  mine: { color: '#b45309', fill: '#f59e0b', radius: 13, label: 'Your primary facility' },
  primary: { color: '#15803d', fill: '#22c55e', radius: 11, label: 'Primary facility for your area' },
  other: { color: '#475569', fill: '#94a3b8', radius: 8, label: null },
};

/**
 * Facilities on a map, at the coordinates they registered. Your primary facility is amber, the primary facilities for the
 * area where you live are green, the rest are grey. A facility with no coordinates is not drawn (it is still in the list).
 */
function FacilityMap({ facilities = [], primaryIds = [], mineId = null, height = 280 }) {
  const drawn = facilities.filter(hasPoint);
  const points = drawn.map((f) => [f.gpsLat, f.gpsLng]);
  const kindOf = (f) => {
    if (f.id === mineId) return 'mine';
    return primaryIds.includes(f.id) ? 'primary' : 'other';
  };
  const missing = facilities.length - drawn.length;

  if (!drawn.length) {
    return <div style={{ color: '#6b7280', fontSize: '1.5rem', lineHeight: 1.6 }}>No facility here has a map location yet.</div>;
  }

  return (
    <div>
      <div style={{ height, borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <MapContainer center={NIGERIA_CENTER} zoom={6} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}" attribution="Tiles &copy; Esri" />
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}" />
          <Fit points={points} />
          {drawn.map((f) => {
            const s = STYLE[kindOf(f)];
            return (
              <CircleMarker key={f.id} center={[f.gpsLat, f.gpsLng]} radius={s.radius} pathOptions={{ color: s.color, fillColor: s.fill, fillOpacity: 0.65, weight: 2 }}>
                <Popup>
                  <strong>{f.name}</strong>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{typeInfo(f.type).label}</div>
                  {s.label && <div style={{ fontSize: 12, fontWeight: 700 }}>{s.label}</div>}
                  <Link to={`/healthcare/facility/${f.id}`}>View</Link>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 10, fontSize: '1.4rem', color: '#374151' }}>
        {mineId && <span><span style={{ color: STYLE.mine.fill }}>●</span> Your primary</span>}
        {primaryIds.length > 0 && <span><span style={{ color: STYLE.primary.fill }}>●</span> Primary for your area</span>}
        <span><span style={{ color: STYLE.other.fill }}>●</span> Other facilities</span>
      </div>
      {missing > 0 && <div style={{ marginTop: 6, fontSize: '1.3rem', color: '#9ca3af' }}>{missing} {missing === 1 ? 'facility has' : 'facilities have'} no map location and {missing === 1 ? 'is' : 'are'} only in the list.</div>}
    </div>
  );
}

export default memo(FacilityMap);
