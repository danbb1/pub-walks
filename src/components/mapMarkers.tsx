import * as React from 'react';
import { LatLngTuple, Icon } from 'leaflet';
import { Marker } from 'react-leaflet';

type Props = { position: LatLngTuple };

type BaseProps = Props & { src: string };

const Base: React.FC<BaseProps> = ({ position, src, children }) => {
  const icon = new Icon({
    iconUrl: src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [12, -31],
  });

  return (
    <Marker position={position} icon={icon}>
      {children}
    </Marker>
  );
};

export const PubMarker: React.FC<Props> = ({ position, children }) => (
  <Base position={position} src="/pub-marker.png">
    {children}
  </Base>
);

export const HighestPointMarker: React.FC<Props> = ({ position, children }) => (
  <Base position={position} src="/highest-point.png">
    {children}
  </Base>
);

export const NewPubMarker: React.FC<Props> = ({ position, children }) => (
  <Base position={position} src="/new-pub-marker.png">
    {children}
  </Base>
);
