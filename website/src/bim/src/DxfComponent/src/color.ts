import {IEntity, IDxf} from "dxf-parser";

export const getColor = (entity: IEntity, data: IDxf) => {
  let color = 0x000000; //default
  if (entity.color) color = entity.color;
  else if (
    data.tables &&
    data.tables.layer &&
    data.tables.layer.layers[entity.layer]
  )
    color = data.tables.layer.layers[entity.layer].color;

  if (color == null || color === 0xffffff) {
    color = 0x000000;
  }
  return color;
};
