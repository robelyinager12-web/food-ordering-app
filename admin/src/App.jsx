import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import Login from './pages/Login.jsx';
import Orders from './pages/Orders.jsx';
import Menu from './pages/Menu.jsx';
import RestaurantPage from './pages/Restaurant.jsx';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <p className="center">Loading...</p>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/orders" replace /> : <Login />} />
      <Route element={user ? <DashboardLayout /> : <Navigate to="/login" replace />}>
        <Route path="/orders" element={<Orders />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/restaurant" element={<RestaurantPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/orders" replace />} />
    </Routes>
  );
}
