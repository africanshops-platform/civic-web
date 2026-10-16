import { memo, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { useIssueMap } from '../hooks/useSocialRepo';

const F = { meta: 'clamp(1.2rem, 1.8vw, 1.5rem)', subH: 'clamp(1.4rem, 2.2vw, 1.8rem)' };
const NIGERIA_CENTER = [9.082, 8.6753];

function FitToPoints({ points }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => {
      map.invalidateSize();
      if (points.length === 1) map.setView([points[0].latitude, points[0].longitude], 8);
      else if (points.length > 1) map.fitBounds(points.map((p) => [p.latitude, p.longitude]), { padding: [24, 24], maxZoom: 9 });
    }, 100);
    return () => clearTimeout(t);
  }, [map, points]);
  return null;
}

/**
 * Where the community's issues are, one marker per LGA at the LGA's own centre point (never a guessed spot). Marker size
 * follows the number of issues; green means the area has funded projects, orange means issues are still being voted on.
 * Every area is also listed under the map, so the map is never the only way to reach an issue.
 */
function CommunityIssuesMap() {
  const { data, isLoading } = useIssueMap();
  const points = useMemo(() => data?.points ?? [], [data]);

  return (
    <div>
      <div style={{ fontWeight: 800, color: '#111827', marginBottom: 12, fontSize: F.subH }}>Issues Around You</div>
      <div style={{ height: 220, borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <MapContainer center={NIGERIA_CENTER} zoom={6} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri"
          />
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}" />
          <FitToPoints points={points} />
          {points.map((p) => (
            <CircleMarker
              key={`${p.state}-${p.lga}`}
              center={[p.latitude, p.longitude]}
              radius={Math.min(26, 10 + p.total * 3)}
              pathOptions={{ color: p.funded ? '#15803d' : '#ea580c', fillColor: p.funded ? '#22c55e' : '#f97316', fillOpacity: 0.45, weight: 2 }}
            >
              <Popup>
                <div style={{ minWidth: 160 }}>
                  <strong>{p.lga}</strong>, {p.state}
                  <div style={{ fontSize: 12, color: '#6b7280', margin: '4px 0' }}>
                    {p.total} issue{p.total === 1 ? '' : 's'} · {p.voting} voting · {p.funded} funded
                  </div>
                  {p.issues.map((i) => (
                    <div key={i.id}><Link to={`/community/issues/${i.id}`}>{i.title}</Link></div>
                  ))}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      {!isLoading && points.length === 0 && (
        <div style={{ fontSize: F.meta, color: '#9ca3af', marginTop: 8 }}>No issues with a known location yet.</div>
      )}
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {points.map((p) => (
          <div key={`l-${p.state}-${p.lga}`} style={{ fontSize: F.meta, color: '#374151' }}>
            <strong>{p.lga}</strong> · {p.total} issue{p.total === 1 ? '' : 's'}
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(CommunityIssuesMap);
