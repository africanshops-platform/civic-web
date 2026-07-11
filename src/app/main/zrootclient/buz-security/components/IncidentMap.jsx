// SOC dashboard incident map — using Leaflet (free, OpenStreetMap tiles).
// Google Maps is available as a fallback — swap the export below to re-enable it.
// import IncidentMapGoogle from './IncidentMapGoogle';
// const USE_GOOGLE = Boolean(import.meta.env.VITE_MAP_KEY);
// export default function IncidentMap(props) {
//   return USE_GOOGLE ? <IncidentMapGoogle {...props} /> : <IncidentMapLeaflet {...props} />;
// }
import IncidentMapLeaflet from './IncidentMapLeaflet';

export default IncidentMapLeaflet;

