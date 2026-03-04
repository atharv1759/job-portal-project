import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getSession } from './services/authService';
import Navbar from './components/navbar';
import Footer from './components/footer';
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import JobList from './pages/jobSeeker/jobList';
import JobDetail from './pages/jobSeeker/jobDetail';
import MyApplications from './pages/jobSeeker/myApplications';
import CompanyDashboard from './pages/company/companyDashboard';
import PostJob from './pages/company/postJob';
import OAuth2Callback from './pages/OAuth2Callback';
import './App.css';

// Protected route wrapper
function ProtectedRoute({ children, requiredRole }) {
  const session = getSession();
  if (!session) return <Navigate to="/login" replace />;
  if (requiredRole && session.role.toUpperCase() !== requiredRole.toUpperCase()) {
    const role = session.role.toLowerCase();
    return <Navigate to={role === 'company' ? '/company/dashboard' : '/jobs'} replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <main className="app-main">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/oauth2/callback" element={<OAuth2Callback />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/jobs/:id" element={<JobDetail />} />




            {/* Job Seeker Protected Routes */}
            <Route
              path="/applications"
              element={
                <ProtectedRoute requiredRole="jobseeker">
                  <MyApplications />
                </ProtectedRoute>
              }
            />

            {/* Company Protected Routes */}
            <Route
              path="/company/dashboard"
              element={
                <ProtectedRoute requiredRole="company">
                  <CompanyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/post-job"
              element={
                <ProtectedRoute requiredRole="company">
                  <PostJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/edit-job/:id"
              element={
                <ProtectedRoute requiredRole="company">
                  <PostJob />
                </ProtectedRoute>
              }
            />

            {/* Catch All - Redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}