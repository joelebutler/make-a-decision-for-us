import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes, Outlet } from "react-router";
import Home from "@front/home/Home.tsx";
import Authentication from "@front/authentication/Authentication";
import Dashboard from "@front/authenticated/Dashboard";
import AuthenticatedContent from "@front/components/AuthenticatedContent";
import Settings from "./authentication/Settings";
import ThemeInitializer from "@front/components/ThemeInitializer";
import { UserProvider } from "@front/components/UserContext";
import NewRoom from "./authenticated/NewRoom";
import RoomPage from "./authenticated/RoomPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeInitializer />
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Authentication />} />
          <Route path="/register" element={<Authentication />} />
          <Route
            path="/dashboard"
            element={
              <AuthenticatedContent>
                <Dashboard />
              </AuthenticatedContent>
            }
          />
          <Route
            path="/settings"
            element={
              <AuthenticatedContent>
                <Settings />
              </AuthenticatedContent>
            }
          />

          <Route path="room" element={<Outlet />}>
            <Route
              path="new"
              element={
                <AuthenticatedContent>
                  <NewRoom />
                </AuthenticatedContent>
              }
            />
            <Route
              path=":id"
              element={
                <AuthenticatedContent>
                  <RoomPage />
                </AuthenticatedContent>
              }
            />
          </Route>

          <Route path="*" element={<h1>Page not found.</h1>} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  </StrictMode>,
);
