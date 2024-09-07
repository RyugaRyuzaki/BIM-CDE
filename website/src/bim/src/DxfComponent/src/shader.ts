import * as THREE from "three";
import {IEntity, IDxf, ILineType} from "dxf-parser";

export interface ILineMaterial {
  ltype: ILineType;
  material: THREE.ShaderMaterial;
}

export const createLineTypeShaders = (data: IDxf) => {
  if (!data.tables || !data.tables.lineType) return;
  const lineTypes = data.tables.lineType.lineTypes;
  const lineMats: ILineMaterial[] = [];
  for (const type in lineTypes) {
    const ltype = lineTypes[type];
    if (!ltype.pattern) continue;
    const material = createDashedLineShader(ltype.pattern);
    lineMats.push({material, ltype});
  }
  return lineMats;
};
function createDashedLineShader(pattern: string[]) {
  let totalLength = 0.0;

  for (let i = 0; i < pattern.length; i++) {
    totalLength += Math.abs(+pattern[i]);
  }

  const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib["common"],
    THREE.UniformsLib["fog"],
    {
      //@ts-ignore
      pattern: {type: "fv1", value: pattern},
      //@ts-ignore
      patternLength: {type: "f", value: totalLength},
    },
  ]);

  const vertexShader = [
    "attribute float lineDistance;",

    "varying float vLineDistance;",

    THREE.ShaderChunk["color_pars_vertex"],

    "void main() {",

    THREE.ShaderChunk["color_vertex"],

    "vLineDistance = lineDistance;",

    "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}",
  ].join("\n");

  const fragmentShader = [
    "uniform vec3 diffuse;",
    "uniform float opacity;",

    "uniform float pattern[" + pattern.length + "];",
    "uniform float patternLength;",

    "varying float vLineDistance;",

    THREE.ShaderChunk["color_pars_fragment"],
    THREE.ShaderChunk["fog_pars_fragment"],

    "void main() {",

    "float pos = mod(vLineDistance, patternLength);",

    "for ( int i = 0; i < " + pattern.length + "; i++ ) {",
    "pos = pos - abs(pattern[i]);",
    "if( pos < 0.0 ) {",
    "if( pattern[i] > 0.0 ) {",
    "gl_FragColor = vec4(1.0, 0.0, 0.0, opacity );",
    "break;",
    "}",
    "discard;",
    "}",

    "}",

    THREE.ShaderChunk["color_fragment"],
    THREE.ShaderChunk["fog_fragment"],

    "}",
  ].join("\n");

  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
  });
}
