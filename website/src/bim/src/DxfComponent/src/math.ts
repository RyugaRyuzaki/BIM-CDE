import * as THREE from "three";

export const angle2 = (
  p1: {x: number; y: number},
  p2: {x: number; y: number}
) => {
  const v1 = new THREE.Vector2(p1.x, p1.y);
  const v2 = new THREE.Vector2(p2.x, p2.y);
  v2.sub(v1); // sets v2 to be our chord
  v2.normalize();
  if (v2.y < 0) return -Math.acos(v2.x);
  return Math.acos(v2.x);
};

export const polar = (
  point: {x: number; y: number},
  distance: number,
  angle: number
): {x: number; y: number} => {
  const x = point.x + distance * Math.cos(angle);
  const y = point.y + distance * Math.sin(angle);
  return {x, y};
};
/**
 * Calculates points for a curve between two points using a bulge value. Typically used in polylines.
 * @param startPoint - the starting point of the curve
 * @param endPoint - the ending point of the curve
 * @param bulge - a value indicating how much to curve
 * @param segments - number of segments between the two given points
 */
export const getBulgeCurvePoints = (
  startPoint: {x: number; y: number},
  endPoint: {x: number; y: number},
  bulge: number,
  segments?: number
) => {
  const p0 = startPoint
    ? new THREE.Vector2(startPoint.x, startPoint.y)
    : new THREE.Vector2(0, 0);
  const p1 = endPoint
    ? new THREE.Vector2(endPoint.x, endPoint.y)
    : new THREE.Vector2(1, 0);

  const angle = 4 * Math.atan(bulge);
  const radius = p0.distanceTo(p1) / 2 / Math.sin(angle / 2);
  const center = polar(
    startPoint,
    radius,
    angle2(p0, p1) + (Math.PI / 2 - angle / 2)
  );

  const newSegments =
    segments || Math.max(Math.abs(Math.ceil(angle / (Math.PI / 18))), 6); // By default want a segment roughly every 10 degrees
  const startAngle = angle2(center, p0);
  const thetaAngle = angle / newSegments;

  const vertices: THREE.Vector3[] = [];

  vertices.push(new THREE.Vector3(p0.x, p0.y, 0));

  for (let i = 1; i <= newSegments - 1; i++) {
    const vertex = polar(center, Math.abs(radius), startAngle + thetaAngle * i);
    vertices.push(new THREE.Vector3(vertex.x, 0, -vertex.y));
  }

  return vertices;
};
export const addTriangleFacingCamera = (
  verts: THREE.Vector3[],
  p0: THREE.Vector3,
  p1: THREE.Vector3,
  p2: THREE.Vector3
) => {
  // Calculate which direction the points are facing (clockwise or counter-clockwise)
  const vector1 = new THREE.Vector3();
  const vector2 = new THREE.Vector3();
  vector1.subVectors(p1, p0);
  vector2.subVectors(p2, p0);
  vector1.cross(vector2);

  const v0 = new THREE.Vector3(p0.x, p0.y, p0.z);
  const v1 = new THREE.Vector3(p1.x, p1.y, p1.z);
  const v2 = new THREE.Vector3(p2.x, p2.y, p2.z);

  // If z < 0 then we must draw these in reverse order
  if (vector1.z < 0) {
    verts.push(v2, v1, v0);
  } else {
    verts.push(v0, v1, v2);
  }
};
