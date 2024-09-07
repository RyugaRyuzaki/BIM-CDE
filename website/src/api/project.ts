import axios, {AxiosResponse} from "axios";
import {apiUrl} from "./core";
import {IProject} from "@bim/types";

export const getListProject = async (
  token: string
): Promise<AxiosResponse<{projects: IProject[]}>> => {
  return await axios({
    url: `${apiUrl}/v1/projects`,
    method: "GET",
    responseType: "json",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
export const newProject = async (
  token: string,
  data: {projectName: string; address: string}
): Promise<AxiosResponse<{projects: IProject[]}>> => {
  return await axios({
    url: `${apiUrl}/v1/projects`,
    method: "POST",
    responseType: "json",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    data,
  });
};
export const newModel = async (
  token: string,
  data: {name: string; projectId: string}
): Promise<AxiosResponse<{projects: IProject[]}>> => {
  return await axios({
    url: `${apiUrl}/v1/models`,
    method: "POST",
    responseType: "json",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    data,
  });
};