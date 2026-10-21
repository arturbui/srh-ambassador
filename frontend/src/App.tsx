import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import NewsPage from './components/NewsPage';
import EventsPage from './components/EventsPage';
import ClubsPage from './components/ClubsPage';
import ActivitiesPage from './components/ActivitiesPage';
import DocumentsPage from './components/DocumentsPage';
import MembershipPage from './components/MembershipPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/clubs" element={<ClubsPage />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/membership" element={<MembershipPage />} />
      </Route>
    </Routes>
  );
}
