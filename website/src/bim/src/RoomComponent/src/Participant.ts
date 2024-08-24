import * as THREE from "three";
import {CSS2DObject} from "three/examples/jsm/renderers/CSS2DRenderer";
import * as OBC from "@thatopen/components";
import {IRoomMember} from "@/types/room";
import {createParticipantMaker} from "./ParticipantMaker";
import {ICameraData} from "../types";
import {LineGeometry} from "three/examples/jsm/lines/LineGeometry";
import {Line2} from "three/examples/jsm/lines/Line2";
import {LineMaterial} from "three/examples/jsm/lines/LineMaterial";
export class Participant implements OBC.Disposable {
  readonly onDisposed: OBC.Event<any> = new OBC.Event();
  readonly position = new THREE.Vector3();
  readonly target = new THREE.Vector3();

  private container!: HTMLDivElement;
  segment!: Line2;
  maker!: CSS2DObject;

  get scene() {
    if (!this.world || !this.world.scene) return null;
    return this.world.scene.three;
  }

  set visible(visible: boolean) {
    if (!this.maker || !this.segment) return;
    this.maker.visible = visible;
    this.segment.visible = visible;
  }
  /**
   *
   * @param components
   */
  constructor(
    private components: OBC.Components,
    private world: OBC.World,
    public member: IRoomMember,
    private dimension: LineMaterial
  ) {
    this.container = createParticipantMaker(this);
    this.maker = new CSS2DObject(this.container);
    this.segment = this.createSegment();
    if (this.scene) {
      this.scene.add(this.maker);
      this.scene.add(this.segment);
    }
  }
  async dispose() {
    this.container?.remove();
    (this.container as any) = null;
    this.segment?.geometry?.dispose();
    this.segment?.removeFromParent();
    (this.segment as any) = null;
    if (this.maker) {
      this.maker.removeFromParent();
      this.maker.element.remove();
      (this.maker as any) = null;
    }
    (this.member as any) = null;
    (this.components as any) = null;
    this.onDisposed.trigger(this);
    this.onDisposed.reset();
    console.log("dispose Participant");
  }
  update = (cameraData: ICameraData) => {
    const {position, target} = cameraData;
    this.position.fromArray(position);
    this.target.fromArray(target);
    this.maker.position.copy(this.position);
    this.maker.lookAt(target[0], target[1], target[2]);
    this.updateLineVertices();
  };
  private createSegment(): Line2 {
    const col1 = new THREE.Color();
    col1.setHSL(1, 1, 1, THREE.SRGBColorSpace);
    const colors = [col1.r, col1.g, col1.b, col1.r, col1.g, col1.b];
    // define a LineGeometry
    const geometry = new LineGeometry();
    // set position from p1, p2
    geometry.setPositions([
      this.position.x,
      this.position.y,
      this.position.z,
      this.target.x,
      this.target.y,
      this.target.z,
    ]);
    // set color
    geometry.setColors(colors);
    // create a Line2 object 3D in threeJS
    const segment = new Line2(geometry, this.dimension);
    // compute line distance that means allow every moment this line change , color and line width change
    segment.computeLineDistances();
    // scale this to default
    segment.scale.set(1, 1, 1);
    return segment;
  }
  private updateLineVertices() {
    if (!this.segment) return;
    const array: number[] = [
      this.position.x,
      this.position.y,
      this.position.z,
      this.target.x,
      this.target.y,
      this.target.z,
    ];
    this.segment.geometry.setPositions([...array]);
  }
}
