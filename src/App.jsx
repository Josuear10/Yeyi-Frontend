import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Login/Login';
import Products from './components/Products/Products';
import Categories from './components/Categories/Categories';
import Sales from './components/Sales/Sales';
import Details from './components/Details/Details';
import Employees from './components/Employees/Employees';
import Menu from './components/Menu/Menu';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Dashboard Layout Component
function DashboardLayout() {
  return (
    <>
      <Menu />
      <div className="main-content">
        <Outlet />
      </div>
    </>
  );
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route path="overview" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="sales" element={<Sales />} />
            <Route path="details" element={<Details />} />
            <Route path="empleados" element={<Employees />} />
            <Route
              index
              element={<Navigate to="/dashboard/overview" replace />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
