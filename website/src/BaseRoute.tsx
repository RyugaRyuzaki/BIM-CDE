import {Routes, Route, useNavigate} from "react-router-dom";
import {Helmet} from "react-helmet";
import {Error} from "./Error";
import SuspensePage from "@components/suspense/SuspensePage";
import {Suspense} from "react";
import PrivateLayout from "@layout/private";
import {viewerPages} from "@constants/viewer";
import {IViewerLink} from "@/types/viewer";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  UserProfile,
} from "@clerk/clerk-react";
import {SignIn, SignUp} from "@clerk/clerk-react";
//@ts-ignore
import AuthLayout from "@layout/auth/AuthLayout";
import PublicLayout from "@layout/public";
import Home from "@pages/home/Home";
import UserLayout from "@layout/auth/UserLayout";
// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const BaseRoute = () => {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route
            index
            element={
              <>
                <Helmet>
                  <title>BIM CDE</title>
                </Helmet>
                <Home />
              </>
            }
          />
        </Route>
        <Route
          element={
            <SignedOut>
              <AuthLayout />
            </SignedOut>
          }
        >
          <Route
            path="/signIn"
            element={
              <>
                <Helmet>
                  <title>SignIn</title>
                </Helmet>
                <SignIn fallbackRedirectUrl={"/viewer/project"} />
              </>
            }
          />
          <Route
            path="/signUp"
            element={
              <>
                <Helmet>
                  <title>SignIn</title>
                </Helmet>
                <SignUp />
              </>
            }
          />
        </Route>
        <Route
          element={
            <SignedIn>
              <PrivateLayout />
            </SignedIn>
          }
        >
          <>
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
            <Route element={<UserLayout />}>
              <Route path="/user-profile" element={<UserProfile />} />
            </Route>
          </>
        </Route>
        <Route path="*" element={<Error message="Opp!" />} />
      </Routes>
    </ClerkProvider>
  );
};

export default BaseRoute;
