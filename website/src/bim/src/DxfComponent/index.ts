import * as THREE from "three";
import * as OBC from "@thatopen/components";
import {IDxf, IEntity} from "dxf-parser";
import {
  addTriangleFacingCamera,
  createLineTypeShaders,
  getBulgeCurvePoints,
  getColor,
} from "./src";
import {Font, FontLoader} from "three/examples/jsm/loaders/FontLoader";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry";
import fontJSON from "@/assets/font/gentilis_bold.typeface.json";
import {spinnerSignal} from "@bim/signals/loader";

export class DxfComponent extends OBC.Component implements OBC.Disposable {
  /**
   * A unique identifier for the component.
   * This UUID is used to register the component within the Components system.
   */
  static readonly uuid = "3976d618-ed46-49d2-8da2-0e5b9b413865" as const;

  /** {@link OBC.Component.enabled} */
  enabled = true;
  readonly onDisposed: OBC.Event<any> = new OBC.Event();

  private _world: OBC.World | null = null;
  /**
   * The world in which the fragments will be displayed.
   * It must be set before using the streaming service.
   * If not set, an error will be thrown when trying to access the world.
   */
  get world() {
    if (!this._world) {
      throw new Error("You must set a world before using the streamer!");
    }
    return this._world;
  }

  /**
   * Sets the world in which the fragments will be displayed.
   * @param world - The new world to be set.
   */
  set world(world: OBC.World) {
    this._world = world;
  }
  private loader: FontLoader = new FontLoader();
  private font!: Font;
  /**
   *
   * @param components
   */
  constructor(components: OBC.Components) {
    super(components);
    this.components.add(DxfComponent.uuid, this);
    this.font = this.loader.parse(fontJSON);
  }

  async dispose() {
    (this._world as any) = null;
    this.onDisposed.trigger(this);
    this.onDisposed.reset();
    console.log("disposed RoomComponent");
  }

  private readonly dims = {
    min: {x: 0, y: 0, z: 0},
    max: {x: 0, y: 0, z: 0},
  };

  async parser(data: IDxf) {
    const lineMats = createLineTypeShaders(data);
    console.log(data);
    for (const entity of data.entities) {
      const mesh = this.drawEntity(entity, data);
      if (!mesh) continue;
      this.world.scene.three.add(mesh);
    }
    spinnerSignal.value = false;
  }

  private drawEntity(entity: IEntity, data: IDxf): THREE.Object3D | null {
    if (entity.type === "CIRCLE" || entity.type === "ARC") {
      return this.drawArc(entity, data);
    } else if (
      entity.type === "LWPOLYLINE" ||
      entity.type === "LINE" ||
      entity.type === "POLYLINE"
    ) {
      return this.drawLine(entity, data);
    } else if (entity.type === "TEXT") {
      return this.drawText(entity, data);
    }
    //else if ( entity.type === "SOLID" ) {
    //   return this.drawSolid(entity, data);
    // } else if (entity.type === "POINT") {
    //   return this.drawPoint(entity, data);
    // } else if (entity.type === "INSERT") {
    //   return this.drawBlock(entity, data);
    // } else if (entity.type === "SPLINE") {
    //   return this.drawSpline(entity, data);
    // } else if (entity.type === "MTEXT") {
    //   return this.drawMText(entity, data);
    // } else if (entity.type === "ELLIPSE") {
    //   return this.drawEllipse(entity, data);
    // } else if (entity.type === "DIMENSION") {
    //   //@ts-ignore
    //   const dimTypeEnum = entity.dimensionType & 7;
    //   if (dimTypeEnum === 0) {
    //     return this.drawDimension(entity, data);
    //   }
    // }
    return null;
  }
  private drawArc(entity: IEntity, data: IDxf): THREE.Object3D {
    let startAngle, endAngle;
    if (entity.type === "CIRCLE") {
      //@ts-ignore
      startAngle = entity.startAngle || 0;
      endAngle = startAngle + 2 * Math.PI;
    } else {
      //@ts-ignore
      startAngle = entity.startAngle;
      //@ts-ignore
      endAngle = entity.endAngle;
    }

    const curve = new THREE.ArcCurve(
      0,
      0,
      //@ts-ignore
      entity.radius || 0,
      startAngle,
      endAngle
    );

    const points = curve.getPoints(32);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({
      color: getColor(entity, data),
    });

    const arc = new THREE.Line(geometry, material);
    //@ts-ignore
    arc.position.x = entity.center!.x || 0;
    //@ts-ignore
    arc.position.y = entity.center!.y || 0;
    //@ts-ignore
    arc.position.z = entity.center!.z || 0;

    return arc;
  }
  private drawLine(entity: IEntity, data: IDxf): THREE.Object3D | null {
    const points: THREE.Vector3[] = [];
    const color = getColor(entity, data);
    let material, lineType, vertex, startPoint, endPoint, bulge;
    //@ts-ignore
    if (!entity.vertices) return null;
    //@ts-ignore
    const {vertices} = entity;
    // create geometry
    //@ts-ignore
    for (let i = 0; i < vertices.length; i++) {
      if (vertices[i].bulge) {
        bulge = vertices[i].bulge;
        //@ts-ignore
        startPoint = entity.vertices[i];
        endPoint = i + 1 < vertices.length ? vertices[i + 1] : points[0];

        const bulgePoints = getBulgeCurvePoints(startPoint, endPoint, bulge);

        // eslint-disable-next-line prefer-spread
        points.push.apply(points, bulgePoints);
      } else {
        //@ts-ignore
        vertex = entity.vertices[i];
        points.push(new THREE.Vector3(vertex.x, 0, -vertex.y));
      }
    }
    //@ts-ignore
    if (entity.shape) points.push(points[0]);

    // set material
    if (entity.lineType) {
      lineType = data.tables.lineType.lineTypes[entity.lineType];
    }

    if (lineType && lineType.pattern && lineType.pattern.length !== 0) {
      material = new THREE.LineDashedMaterial({
        color: color,
        gapSize: 4,
        dashSize: 4,
      });
    } else {
      material = new THREE.LineBasicMaterial({linewidth: 1, color: color});
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const line = new THREE.Line(geometry, material);
    line.scale.set(0.001, 0.001, 0.001);
    return line;
  }
  private drawText(entity: IEntity, data: IDxf): THREE.Object3D | null {
    if (!this.font) return null;
    //@ts-ignore
    const geometry = new TextGeometry(entity.text || "", {
      font: this.font,
      height: 0,
      //@ts-ignore
      size: entity.textHeight || 12,
    });

    // //@ts-ignore
    // if (entity.rotation) {
    //   //@ts-ignore
    //   const zRotation = (entity.rotation * Math.PI) / 180;
    //   geometry.rotateY(zRotation);
    // }

    const material = new THREE.MeshBasicMaterial({
      color: getColor(entity, data),
    });

    const text = new THREE.Mesh(geometry, material);
    //@ts-ignore
    text.position.x = (entity.startPoint.x || 0) * 0.001;
    //@ts-ignore
    text.position.y = (entity.startPoint.z || 0) * 0.001;
    //@ts-ignore
    text.position.z = (-entity.startPoint.y || 0) * 0.001;
    text.scale.set(0.001, 0.001, 0.001);
    return text;
  }
  private drawSolid(entity: IEntity, data: IDxf): THREE.Object3D {
    const geometry = new THREE.BufferGeometry();

    //@ts-ignore
    const points = (entity.points as THREE.Vector3[]) || [];
    // verts = geometry.vertices;
    const verts: THREE.Vector3[] = [];
    addTriangleFacingCamera(verts, points[0], points[1], points[2]);
    addTriangleFacingCamera(verts, points[1], points[2], points[3]);

    const material = new THREE.MeshBasicMaterial({
      color: getColor(entity, data),
    });
    geometry.setFromPoints(verts);

    return new THREE.Mesh(geometry, material);
  }
  private drawPoint(entity: IEntity, data: IDxf): THREE.Object3D {
    const geometry = new THREE.BufferGeometry();
    //@ts-ignore
    const position = (entity.position as THREE.Vector3) || new THREE.Vector3();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([position.x, position.y, position.z], 3)
    );

    const color = getColor(entity, data);

    const material = new THREE.PointsMaterial({
      size: 0.1,
      color: new THREE.Color(color),
    });
    const point = new THREE.Points(geometry, material);
    return point;
  }
  private drawBlock(entity: IEntity, data: IDxf): THREE.Object3D {
    const block = data.blocks[entity.name];

    if (!block.entities) return null;

    var group = new THREE.Object3D();

    if (entity.xScale) group.scale.x = entity.xScale;
    if (entity.yScale) group.scale.y = entity.yScale;

    if (entity.rotation) {
      group.rotation.z = (entity.rotation * Math.PI) / 180;
    }

    if (entity.position) {
      group.position.x = entity.position.x;
      group.position.y = entity.position.y;
      group.position.z = entity.position.z;
    }

    for (var i = 0; i < block.entities.length; i++) {
      var childEntity = drawEntity(block.entities[i], data, group);
      if (childEntity) group.add(childEntity);
    }

    return group;
  }
  private drawSpline(entity: IEntity, data: IDxf): THREE.Object3D {}
  private drawMText(entity: IEntity, data: IDxf): THREE.Object3D {}
  private drawEllipse(entity: IEntity, data: IDxf): THREE.Object3D {}
  private drawDimension(entity: IEntity, data: IDxf): THREE.Object3D {}
}
//
