import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Login/Login';
import Products from './components/Products/Products';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard/overview" element={<Dashboard />} />
          <Route path="/dashboard/products" element={<Dashboard />} />
          <Route
            path="/dashboard"
            element={<Navigate to="/dashboard/overview" replace />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
