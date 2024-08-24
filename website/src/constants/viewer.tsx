import {MathUtils} from "three";
import {IViewerLink} from "@/types/viewer";
import {lazy} from "react";
const RoomViewer = lazy(() => import("@pages/viewer/RoomViewer"));
const BimViewer = lazy(() => import("@pages/viewer/BimViewer"));
const ProjectViewer = lazy(() => import("@pages/viewer/ProjectViewer"));
export const viewerPages: IViewerLink[] = [
  {
    title: "Project",
    path: "/viewer",
    Component: ProjectViewer,
    uuid: MathUtils.generateUUID(),
  },
  {
    title: "BCF Room Meeting",
    path: "/viewer/room",
    Component: RoomViewer,
    uuid: MathUtils.generateUUID(),
  },
  {
    title: "Bim Viewer",
    path: "/viewer/bim",
    Component: BimViewer,
    uuid: MathUtils.generateUUID(),
  },
];
