import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { ThemeProvider } from "./lib/theme/ThemeProvider";
import { useTheme } from "./lib/theme/theme-context";
import { AccessibilityProvider } from "./lib/theme/AccessibilityProvider";
import { TickProvider } from "./hooks/useTick";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useAppStore } from "./store/useAppStore";
import { AppShell } from "./components/chrome/AppShell";
import { NAV_ENTRIES } from "./lib/nav";
import { Dashboard } from "./pages/Dashboard";
import { LiveArrivals } from "./pages/LiveArrivals";
import { ServiceAlerts } from "./pages/ServiceAlerts";
import { Routes as RoutesPage } from "./pages/Routes";
import { Favorites } from "./pages/Favorites";
import { Nearby } from "./pages/Nearby";
import { SavedViews } from "./pages/SavedViews";
import { Settings } from "./pages/Settings";
import { LiveCrowding } from "./pages/LiveCrowding";
import { TripPlanner } from "./pages/TripPlanner";
import { DepartureBoard } from "./pages/DepartureBoard";
import { ServiceCalendar } from "./pages/ServiceCalendar";
import { Reliability } from "./pages/Reliability";
import { LiveVehicles } from "./pages/LiveVehicles";
import { ServiceChanges } from "./pages/ServiceChanges";
import { RouteMapPage } from "./pages/RouteMapPage";
import { Accessibility } from "./pages/Accessibility";
import { Notifications } from "./pages/Notifications";
import { TripHistory } from "./pages/TripHistory";
import { Profile } from "./pages/Profile";

function AppShortcuts() {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const setView = useAppStore((s) => s.setView);
  const setPalette = useAppStore((s) => s.setPalette);
  const setHelpOpen = useAppStore((s) => s.setHelpOpen);

  useKeyboardShortcuts({
    onDigit: (n) => {
      const entry = NAV_ENTRIES[n - 1];
      if (entry) navigate(entry.path);
    },
    onPalette: () => setPalette(true),
    onHelp: () => setHelpOpen(true),
    onSettings: () => navigate("/settings"),
    onTheme: toggleTheme,
    onMapView: () => setView("map"),
    onListView: () => setView("list"),
    onEscape: () => {
      setPalette(false);
      setHelpOpen(false);
    },
  });

  return null;
}

function AppContent() {
  useOnlineStatus();

  return (
    <AppShell>
      <AppShortcuts />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/arrivals" element={<LiveArrivals />} />
        <Route path="/alerts" element={<ServiceAlerts />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/nearby" element={<Nearby />} />
        <Route path="/saved-views" element={<SavedViews />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/crowding" element={<LiveCrowding />} />
        <Route path="/trip-planner" element={<TripPlanner />} />
        <Route path="/departures" element={<DepartureBoard />} />
        <Route path="/calendar" element={<ServiceCalendar />} />
        <Route path="/reliability" element={<Reliability />} />
        <Route path="/vehicles" element={<LiveVehicles />} />
        <Route path="/changes" element={<ServiceChanges />} />
        <Route path="/route-map" element={<RouteMapPage />} />
        <Route path="/accessibility" element={<Accessibility />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/history" element={<TripHistory />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </AppShell>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AccessibilityProvider>
          <TickProvider>
            <AppContent />
          </TickProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
