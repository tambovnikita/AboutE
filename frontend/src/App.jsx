import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Login/LoginPage';
import RegistrationPage from './pages/Registration/RegistrationPage';
import ProfilePage from './pages/Profile/ProfilePage';
import SupportPage from './pages/Support/SupportPage';
import PeopleList from './pages/PeopleList/PeopleList';
import PeopleMap from './pages/PeopleMap/PeopleMap';
import { AuthProvider } from './context/AuthContext';

import './App.css';


export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="registration" element={<RegistrationPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="people_list">
            <Route index element={<PeopleList />} />
            <Route path=":personId" element={<PeopleList />} />
          </Route>
          <Route path="people_map" element={<PeopleMap />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}