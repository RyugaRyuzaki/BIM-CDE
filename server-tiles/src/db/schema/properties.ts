import {Schema, model} from "mongoose";
interface IProperties {
  modelId: string;
  name: string;
  data: any;
}

const propertySchema = new Schema<IProperties>({
  name: {type: String, required: true},
  modelId: {type: String, required: true},
  data: {type: Object, required: true},
});

export const Properties = model<IProperties>("Properties", propertySchema);
