import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Team from './pages/Team';
import Portfolio from './pages/Portfolio';
import Contact from './pages/Contact';
import ProjectDetail from './pages/ProjectDetail';
import Services from './pages/Services';
import CostEstimator from './pages/CostEstimator';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import BackToTopButton from './components/BackToTopButton';
import './App.css';

/** Wrapper that hides nav/footer on admin routes */
function AppShell() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/auronix-admin');

  return (
    <div className="app">
      {!isAdmin && <Navigation />}
      <main className={isAdmin ? '' : 'main-content'}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/portfolio/:id" element={<ProjectDetail />} />
          <Route path="/services" element={<Services />} />
          <Route path="/estimator" element={<CostEstimator />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />

          {/* Hidden admin routes — not linked from nav */}
          <Route path="/auronix-admin" element={<AdminLogin />} />
          <Route path="/auronix-admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <BackToTopButton />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
