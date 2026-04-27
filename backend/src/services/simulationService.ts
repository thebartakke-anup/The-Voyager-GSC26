interface Position {
  lat: number;
  lng: number;
}

// Great circle interpolation between two positions
export function interpolatePosition(origin: Position, destination: Position, fraction: number): Position {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const lat1 = toRad(origin.lat);
  const lng1 = toRad(origin.lng);
  const lat2 = toRad(destination.lat);
  const lng2 = toRad(destination.lng);

  const d = 2 * Math.asin(
    Math.sqrt(
      Math.pow(Math.sin((lat2 - lat1) / 2), 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lng2 - lng1) / 2), 2)
    )
  );

  if (d === 0) return origin;

  const f = fraction;
  const a = Math.sin((1 - f) * d) / Math.sin(d);
  const b = Math.sin(f * d) / Math.sin(d);

  const x = a * Math.cos(lat1) * Math.cos(lng1) + b * Math.cos(lat2) * Math.cos(lng2);
  const y = a * Math.cos(lat1) * Math.sin(lng1) + b * Math.cos(lat2) * Math.sin(lng2);
  const z = a * Math.sin(lat1) + b * Math.sin(lat2);

  const lat = toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)));
  const lng = toDeg(Math.atan2(y, x));

  return { lat, lng };
}

export interface TimelinePoint {
  day: number;
  lat: number;
  lng: number;
  speed_knots: number;
  status: string;
  port_id?: string;
}

export function generateTimelinePoints(
  origin: Position,
  destination: Position,
  totalDays: number,
  speedKnots: number = 18
): TimelinePoint[] {
  const points: TimelinePoint[] = [];

  for (let day = 0; day <= totalDays; day++) {
    const fraction = day / totalDays;
    const pos = interpolatePosition(origin, destination, fraction);
    const status = day === 0 ? 'PLANNED' : day === totalDays ? 'DELIVERED' : 'IN_TRANSIT';

    points.push({
      day,
      lat: Math.round(pos.lat * 1e6) / 1e6,
      lng: Math.round(pos.lng * 1e6) / 1e6,
      speed_knots: speedKnots,
      status,
    });
  }

  return points;
}

export function calculateGreatCircleDistance(origin: Position, destination: Position): number {
  const R = 3440.065; // Earth radius in nautical miles
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(destination.lat - origin.lat);
  const dLng = toRad(destination.lng - origin.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(origin.lat)) * Math.cos(toRad(destination.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
