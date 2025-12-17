import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import MainLayout from '../components/layout/MainLayout';

export default function AppRouter() {
  return (
    <BrowserRouter>
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </MainLayout>
    </BrowserRouter>
  );
}
