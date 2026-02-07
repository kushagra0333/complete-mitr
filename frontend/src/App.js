import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/header/Header';
import Home from './pages/home';
import Login from './pages/login';
import Signup from './pages/signup';
import Dashboard from './pages/Dashboard';
import DeviceDetails from './pages/DeviceDetails';
import MapPage from './pages/MapPage';
import TriggerHistory from './pages/TriggerHistory';
import Settings from './pages/Settings';
import ForgotPassword from './pages/ForgotPassword';
import Footer from './components/footer/footer';
import MapLive from './pages/MapLive';
import CustomCursor from './components/CustomCursor';
import PrivateRoute from './PrivateRoutes';

const App = () => {
  return (
    <Router>
      <CustomCursor />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/device/:deviceId" element={<PrivateRoute><DeviceDetails /></PrivateRoute>} />
        <Route path="/map/:sessionId" element={<MapPage />} />
        <Route path="/history" element={<PrivateRoute><TriggerHistory /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/map-live/:deviceId" element={<MapLive />} />
        <Route path="*" element={<Home />} />
      </Routes>
     
    </Router>
  );
};

export default App;
