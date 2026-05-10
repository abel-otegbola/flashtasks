import { BrowserRouter, Route, Routes } from "react-router-dom"
import { useEffect, useState } from "react"
import AuthPages from "./pages/auth"
import StaticPages from "./pages/static"
import AuthProvider from "./context/authContext"
import TasksProvider from "./context/tasksContext"
import { OrganizationProvider } from "./context/organizationContext"
import AccountPages from "./pages/account"
import LoadingScreen from "./components/loaders/loadingScreen"

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const savedAccent = localStorage.getItem('accentColor') || '#45b44b';
    const compactMode = localStorage.getItem('compactMode') === 'true';

    root.style.setProperty('--color-primary', savedAccent);
    root.setAttribute('data-density', compactMode ? 'compact' : 'comfortable');

    // Hide loader after initial setup (adjust timing as needed)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="">
      <LoadingScreen isVisible={isLoading} />
      <BrowserRouter>
        <AuthProvider>
          <OrganizationProvider>
            <TasksProvider>
            <Routes>
              <Route path="/auth/*" element={<AuthPages />} />
              <Route path="/*" element={<StaticPages />} />
              <Route path="/account/*" element={<AccountPages />} />
            </Routes>
            </TasksProvider>
          </OrganizationProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  )
}

export default App
