import { createBrowserRouter, Outlet } from "react-router";
import { SplashScreen } from "./screens/SplashScreen";
import { MicPermissionScreen } from "./screens/MicPermissionScreen";
import { MainTunerScreen } from "./screens/MainTunerScreen";
import { PrivacyScreen } from "./screens/PrivacyScreen";
import { TelemetryTracker } from "./components/TelemetryTracker";

// Simple error fallback component
function ErrorBoundary() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <a href="/" className="text-blue-400 underline">
          Go back to home
        </a>
      </div>
    </div>
  );
}

// Root layout component
function RootLayout() {
  return (
    <>
      <Outlet />
      <TelemetryTracker />
    </>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "/",
        element: <SplashScreen />,
      },
      {
        path: "/mic-permission",
        element: <MicPermissionScreen />,
      },
      {
        path: "/tuner",
        element: <MainTunerScreen />,
      },
      {
        path: "/privacy",
        element: <PrivacyScreen />,
      },
      {
        path: "*",
        element: <SplashScreen />,
      },
    ],
  },
]);
