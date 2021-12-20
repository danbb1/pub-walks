import { LatLngTuple } from 'leaflet';

type ICartesianCoords = {
  x: number;
  y: number;
  z: number;
};

type IRouteBounds = { n: number | null; s: number | null; e: number | null; w: number | null };

const degreesToRadians = (deg: number) => deg * (Math.PI / 180);

const radiansToDegrees = (rad: number) => rad * (180 / Math.PI);

const getCentrePoint = (cartesianCoords: ICartesianCoords): LatLngTuple => {
  // Converts average X, Y, Z Cartesian coordinates back to Latitude and Longitude
  const { x, y, z } = cartesianCoords;
  const centreLong = Math.atan2(y, x);
  const centreSqrt = Math.sqrt(x * x + y * y);
  const centreLat = Math.atan2(z, centreSqrt);

  return [radiansToDegrees(centreLat), radiansToDegrees(centreLong)];
};

export const calcDistance = (a: LatLngTuple, b: LatLngTuple): number => {
  // Calculates the distance between two points a and b using Haversine formula

  const radius = 6371; // Earth's radius in km as defined by IUGG arithmetic mean radius

  const dLat = degreesToRadians(b[0] - a[0]);
  const dLong = degreesToRadians(b[1] - a[1]);
  const aLatRad = degreesToRadians(a[0]);
  const bLatRad = degreesToRadians(b[0]);

  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLong / 2) ** 2 * Math.cos(aLatRad) * Math.cos(bLatRad);
  const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));

  return radius * y;
};

const calcNewCartesian = (original: ICartesianCoords, coord: LatLngTuple): ICartesianCoords => {
  const latRad = degreesToRadians(coord[0]);
  const longRad = degreesToRadians(coord[1]);

  return {
    x: original.x + Math.cos(latRad) * Math.cos(longRad),
    y: original.y + Math.cos(latRad) * Math.sin(longRad),
    z: original.z + Math.sin(latRad),
  };
};

export const calcNewRouteBounds = (original: IRouteBounds, coord: LatLngTuple): IRouteBounds => {
  const distanceTolerance = 0.005;
  const [lat, long] = coord;

  return {
    n: Math.max(lat + distanceTolerance, original.n ? original.n : lat + distanceTolerance),
    w: Math.max(long + distanceTolerance, original.w ? original.w : long + distanceTolerance),
    s: Math.min(lat - distanceTolerance, original.s ? original.s : lat - distanceTolerance),
    e: Math.min(long - distanceTolerance, original.e ? original.e : long - distanceTolerance),
  };
};

const handleRoute = (
  coordinates: [...LatLngTuple, number?][] | { lat: number; long: number }[],
): {
  points: LatLngTuple[];
  centrePoint: LatLngTuple;
  searchArea: LatLngTuple[];
  routeDistance: number;
} => {
  // Cumulative cartesian coordinates of all points in route. Origin from earth's centre. X-axis through long,lat(0,0), y-axis through (0,90), z-axis through poles.
  let cartesianCoords: ICartesianCoords = {
    x: 0,
    y: 0,
    z: 0,
  };

  let prevCoord: null | LatLngTuple = null;

  // Most northerly, easterly, westerly and southerly coordinates + distance tolerance. Used to search for pubs on the route.
  let newRouteBounds: IRouteBounds = {
    n: null,
    e: null,
    s: null,
    w: null,
  };

  let routeDistance = 0;

  const points = coordinates.map(coord => {
    const isArray = Array.isArray(coord);

    const lat = isArray ? coord[1] : coord.lat;

    const long = isArray ? coord[0] : coord.long;

    cartesianCoords = calcNewCartesian(cartesianCoords, [lat, long]);
    newRouteBounds = calcNewRouteBounds(newRouteBounds, [lat, long]);

    if (prevCoord) {
      routeDistance += calcDistance(prevCoord, [lat, long]);
    }

    prevCoord = [lat, long];

    return [lat, long] as LatLngTuple;
  });
  // Average X, Y, Z values
  cartesianCoords.x /= points.length;
  cartesianCoords.y /= points.length;
  cartesianCoords.z /= points.length;

  const newCentrePoint = getCentrePoint(cartesianCoords);

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
    routeDistance,
  };
};

export default handleRoute;
