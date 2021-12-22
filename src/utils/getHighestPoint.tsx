import { LatLngTuple } from 'leaflet';
import axios from 'axios';

import { HighestPoint } from '../state/slices/routeSlice';

export default async (route: LatLngTuple[]) => {
  const locations = route
    .map((location, index) => (index % 2 === 0 ? { latitude: location[0], longitude: location[1] } : null))
    .filter(location => location);
  const response = await axios.post(
    'https://api.open-elevation.com/api/v1/lookup',
    {
      locations,
    },
    { headers: { Accept: 'application/json', 'Content-Type': 'application/json' } },
  );

  let newHighestPoint: HighestPoint = null;
  let highestElevation = 0;

  response.data.results.forEach((coord: { latitude: number; longitude: number; elevation: number }) => {
    if (highestElevation < coord.elevation) {
      highestElevation = coord.elevation;
      newHighestPoint = [...Object.values(coord)] as HighestPoint;
    }
  });

  return newHighestPoint;
};
