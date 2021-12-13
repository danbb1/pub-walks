import { LatLngTuple } from 'leaflet';

const getCentrePoint = (x: number, y: number, z: number): LatLngTuple => {
  const centreLong = Math.atan2(y, x);
  const centreSqrt = Math.sqrt(x * x + y * y);
  const centreLat = Math.atan2(z, centreSqrt);

  return [(centreLat * 180) / Math.PI, (centreLong * 180) / Math.PI];
};

const handleRoute = (
  coordinates: [...LatLngTuple, number?][] | { lat: number; long: number }[],
): {
  points: LatLngTuple[];
  centrePoint: LatLngTuple;
  searchArea: LatLngTuple[];
} => {
  let x = 0;
  let y = 0;
  let z = 0;

  const newRouteBounds: { n: number | null; s: number | null; e: number | null; w: number | null } = {
    n: null,
    e: null,
    s: null,
    w: null,
  };

  const points = coordinates.map(coord => {
    const isArray = Array.isArray(coord);

    const lat = isArray ? coord[1] : coord.lat;
    const latToDeg = (lat * Math.PI) / 180;
    const long = isArray ? coord[0] : coord.long;
    const longToDeg = (long * Math.PI) / 180;
    x += Math.cos(latToDeg) * Math.cos(longToDeg);
    y += Math.cos(latToDeg) * Math.sin(longToDeg);
    z += Math.sin(latToDeg);

    const distanceTolerance = 0.005;
    if (!newRouteBounds.w || long + distanceTolerance > newRouteBounds.w) newRouteBounds.w = long + distanceTolerance;
    if (!newRouteBounds.e || long - distanceTolerance < newRouteBounds.e) newRouteBounds.e = long - distanceTolerance;
    if (!newRouteBounds.n || lat + distanceTolerance > newRouteBounds.n) newRouteBounds.n = lat + distanceTolerance;
    if (!newRouteBounds.s || lat - distanceTolerance < newRouteBounds.s) newRouteBounds.s = lat - distanceTolerance;

    return [lat, long] as LatLngTuple;
  });
  x /= points.length;
  y /= points.length;
  z /= points.length;

  const newCentrePoint = getCentrePoint(x, y, z);

  const { n, s, w, e } = newRouteBounds;

  return {
    points,
    centrePoint: newCentrePoint,
    searchArea: [
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      [n!, w!],
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      [s!, e!],
    ],
  };
};

export default handleRoute;
