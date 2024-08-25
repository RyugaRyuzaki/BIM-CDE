import * as MAPBOX from "mapbox-gl";
import * as THREE from "three";

/**
 *
 */
export class MapBoxCoord {
  private _modelRotate: number[] = [Math.PI / 2, 0, 0];
  private _modelAsMercatorCoordinate!: MAPBOX.MercatorCoordinate;
  private _modelTransform!: {
    translateX: number;
    translateY: number;
    translateZ: number;
    rotateX: number;
    rotateY: number;
    rotateZ: number;
    scale: number;
  };
  get mapCamera(): THREE.Matrix4 {
    const rotationX = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(1, 0, 0),
      this._modelTransform.rotateX
    );
    const rotationY = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(0, 1, 0),
      this._modelTransform.rotateY
    );
    const rotationZ = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(0, 0, 1),
      this._modelTransform.rotateZ
    );
    return new THREE.Matrix4()
      .makeTranslation(
        this._modelTransform.translateX,
        this._modelTransform.translateY,
        this._modelTransform.translateZ as number
      )
      .scale(
        new THREE.Vector3(
          this._modelTransform.scale,
          -this._modelTransform.scale,
          this._modelTransform.scale
        )
      )
      .multiply(rotationX)
      .multiply(rotationY)
      .multiply(rotationZ);
  }

  private _center: [number, number] = [8.5523926, 47.4133122];

  set center(center: [number, number]) {
    this._center = [...center];
    // parameters to ensure the model is georeferenced correctly on the map
    this._modelAsMercatorCoordinate = MAPBOX.MercatorCoordinate.fromLngLat(
      {lng: center[0], lat: center[1]},
      0
    ) as MAPBOX.MercatorCoordinate;

    // transformation parameters to position, rotate and scale the 3D model onto the map
    this._modelTransform = {
      translateX: this._modelAsMercatorCoordinate.x,
      translateY: this._modelAsMercatorCoordinate.y,
      translateZ: this._modelAsMercatorCoordinate.z,
      rotateX: this._modelRotate[0],
      rotateY: this._modelRotate[1],
      rotateZ: this._modelRotate[2],
      /* Since the 3D model is in real world meters, a scale transform needs to be
       * applied since the CustomLayerInterface expects units in MercatorCoordinates.
       */
      scale: this._modelAsMercatorCoordinate.meterInMercatorCoordinateUnits(),
    };
  }
  get center() {
    return this._center;
  }
}
