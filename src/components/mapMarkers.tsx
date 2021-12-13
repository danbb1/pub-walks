import React, { useMemo, useRef } from 'react';
import { LatLngTuple, Icon, Marker as IMarker } from 'leaflet';
import { Marker } from 'react-leaflet';
import { useDispatch } from 'react-redux';

import { setNewPubMarker } from '../state/slices/pubSlice';

type Props = { position: LatLngTuple };

type BaseProps = Props & { src: string; draggable?: boolean };

const Base: React.FC<BaseProps> = ({ position, src, children, draggable = false }) => {
  const icon = new Icon({
    iconUrl: src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [12, -31],
  });

  const dispatch = useDispatch();

  const ref = useRef<IMarker>(null);

  const handleDrag = useMemo(
    () => ({
      dragend() {
        const marker = ref.current;
        if (draggable && marker) {
          const { lat, lng } = marker.getLatLng();
          dispatch(setNewPubMarker([lat, lng]));
        }
      },
    }),
    [],
  );

  return (
    <Marker draggable={draggable} position={position} ref={ref} icon={icon} eventHandlers={handleDrag}>
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
  <Base position={position} src="/new-pub-marker.png" draggable>
    {children}
  </Base>
);
