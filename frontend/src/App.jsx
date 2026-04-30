import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AITutorPage from './pages/AITutorPage';
import AnalyticsPage from './pages/AnalyticsPage';
import QuizPage from './pages/QuizPage';
import AssignmentsPage from './pages/AssignmentsPage';
import SettingsPage from './pages/SettingsPage';
import RoadmapPage from './pages/RoadmapPage';
import MockInterviewPage from './pages/MockInterviewPage';
import ResumeAnalyzerPage from './pages/ResumeAnalyzerPage';
import SocialDashboardPage from './pages/SocialDashboardPage';
import ScholarshipDashboard from './pages/ScholarshipDashboard';
import ApplyScholarshipPage from './pages/ApplyScholarshipPage';
import ScholarshipTrackerPage from './pages/ScholarshipTrackerPage';
import AppLayout from './components/AppLayout';
import MessagesPage from './pages/MessagesPage';
import StudentsPage from './pages/StudentsPage';
import TeacherDashboard from './pages/TeacherDashboard';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-primary animate-pulse flex items-center justify-center">
           <div className="w-6 h-6 bg-white/20 rounded-lg" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium tracking-widest uppercase text-[10px]">Initializing LEARN OS...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const DashboardRouter = () => {
  const { user } = useAuth();
  return user?.role === 'teacher' ? <TeacherDashboard /> : <DashboardPage />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/app" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardRouter />} />
          <Route path="ai-tutor" element={<AITutorPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="quiz" element={<QuizPage />} />
          <Route path="assignments" element={<AssignmentsPage />} />
          <Route path="roadmaps" element={<RoadmapPage />} />
          <Route path="interviews" element={<MockInterviewPage />} />
          <Route path="resume" element={<ResumeAnalyzerPage />} />
          <Route path="social" element={<SocialDashboardPage />} />
          <Route path="scholarships" element={<ScholarshipDashboard />} />
          <Route path="scholarships/apply/:id" element={<ApplyScholarshipPage />} />
          <Route path="scholarships/tracker" element={<ScholarshipTrackerPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

