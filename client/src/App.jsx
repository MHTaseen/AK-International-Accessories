import { AdminProvider } from './context/AdminContext.jsx';
import Navbar from './components/Navbar.jsx';
import CategoryNavbar from './components/CategoryNavbar.jsx';
import GlassShowcase from './components/GlassShowcase.jsx';
import FeatureStrip from './components/FeatureStrip.jsx';

export default function App() {
  return (
    <AdminProvider>
      <div className="app-shell">
        <Navbar />
        <CategoryNavbar />
        <main>
          <GlassShowcase />
          <FeatureStrip />
        </main>
      </div>
    </AdminProvider>
  );
}
