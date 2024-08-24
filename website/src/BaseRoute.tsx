import {Routes, Route} from "react-router-dom";
import {Helmet} from "react-helmet";
import {Error} from "./Error";
import SuspensePage from "@components/suspense/SuspensePage";
import {Suspense} from "react";
import PrivateLayout from "@layout/private";
import {viewerPages} from "@constants/viewer";
import {IViewerLink} from "@/types/viewer";

const BaseRoute = () => {
  return (
    <>
      <Routes>
        <Route element={<PrivateLayout />}>
          {viewerPages.map((page: IViewerLink, index: number) => {
            const {title, path, Component, uuid} = page;
            return (
              <Route
                key={`${uuid}-${index}`}
                path={path}
                element={
                  <>
                    <Helmet>
                      <title>{title}</title>
                    </Helmet>
                    <Suspense fallback={<SuspensePage />}>
                      <Component />
                    </Suspense>
                  </>
                }
              />
            );
          })}
        </Route>
        <Route path="*" element={<Error message="Opp!" />} />
      </Routes>
    </>
  );
};

export default BaseRoute;
