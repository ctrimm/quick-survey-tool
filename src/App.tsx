// src/App.tsx
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/Home';
import { AdminPage } from '@/pages/Admin';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { SurveyPage } from '@/pages/Survey';
import { ResultsPage } from '@/pages/Results';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/survey" element={<SurveyPage />} />
            <Route path="/survey/:id" element={<SurveyPage />} />
            <Route path="/results/:id" element={<ResultsPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
