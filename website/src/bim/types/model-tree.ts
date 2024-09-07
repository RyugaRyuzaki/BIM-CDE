export interface IModel {
  id: string;
  name: string;
  versionId: string;
}
export interface IProject {
  id: string;
  name: string;
  models: IModel[];
}
export interface IModelTree {
  id: string;
  name: string;
  children: IModelTree[];
  checked: boolean;
  expandIds: string[];
  type: "project" | "model";
}
