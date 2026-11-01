import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { RestaurantProvider, useRestaurant } from '../context/RestaurantContext.jsx';

function Shell() {
  const { user, logout } = useAuth();
  const { restaurant } = useRestaurant();

  return (
    <div className="shell">
      <aside className="sidebar">
        <h2>{restaurant?.name || 'My Restaurant'}</h2>
        <nav>
          <NavLink to="/orders">Orders</NavLink>
          <NavLink to="/menu">Menu</NavLink>
          <NavLink to="/restaurant">Restaurant</NavLink>
        </nav>
        <div className="sidebar-bottom">
          <small>{user.email}</small>
          <button className="btn outline" onClick={logout}>Log out</button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default function DashboardLayout() {
  return (
    <RestaurantProvider>
      <Shell />
    </RestaurantProvider>
  );
}
