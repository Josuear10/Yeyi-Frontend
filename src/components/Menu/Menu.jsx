import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Menu.css';
import logo from '../../assets/Logo.png';
import { getCurrentUser, decodeToken } from '../../api/userService.js';
import {
  CaretLeft,
  CaretRight,
  GridFour,
  ShoppingCart,
  ShoppingBag,
  Clipboard,
  CaretDown,
  Users,
  Tag,
  CurrencyDollar,
  Gear,
  SignOut,
  User,
  FolderOpen,
  ListBullets,
  UserCircle,
  CreditCard,
  Package,
  ChartLine,
} from 'phosphor-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [userData, setUserData] = useState({
    user_first_name: 'Harper',
    user_last_name: 'Nelson',
    user_role: 1,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Helper function to map role number to Spanish text
  const getRoleText = role => {
    switch (role) {
      case 1:
        return 'Administrador';
      case 2:
        return 'Empleado';
      default:
        return 'Usuario';
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (token) {
        // Try to get user data from API first
        try {
          const userData = await getCurrentUser();
          setUserData({
            user_first_name: userData.user_first_name || 'User',
            user_last_name: userData.user_last_name || '',
            user_role: userData.user_role || 0,
          });
        } catch (apiError) {
          // Fallback to decoding JWT token
          console.warn('API call failed, using token decode:', apiError);
          const decodedToken = decodeToken(token);
          if (decodedToken) {
            setUserData({
              user_first_name: decodedToken.user_first_name || 'User',
              user_last_name: decodedToken.user_last_name || '',
              user_role: decodedToken.user_role || 0,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Keep default values if all methods fail
    } finally {
      setLoading(false);
    }
  };

  // Initialize user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const menuItems = [
    {
      section: 'GESTIÓN',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: GridFour,
          path: '/dashboard/overview',
        },
        {
          id: 'productos',
          label: 'Productos',
          icon: Package,
          path: '/dashboard/products',
        },
        {
          id: 'categorias',
          label: 'Categorías',
          icon: FolderOpen,
          path: '/dashboard/categories',
        },
        {
          id: 'ventas',
          label: 'Ventas',
          icon: ChartLine,
          path: '/ventas',
        },
        {
          id: 'detalles',
          label: 'Detalles',
          icon: ListBullets,
          path: '/detalles',
        },
      ],
    },
    {
      section: 'PERSONAL',
      items: [
        {
          id: 'empleados',
          label: 'Empleados',
          icon: UserCircle,
          path: '/empleados',
        },
        {
          id: 'metodos-pago',
          label: 'Métodos de Pago',
          icon: CreditCard,
          path: '/metodos-pago',
        },
      ],
    },
    {
      section: 'SISTEMA',
      items: [
        {
          id: 'configuracion',
          label: 'Configuración',
          icon: Gear,
          path: '/configuracion',
        },
      ],
    },
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      {/* Collapsed state indicator */}
      {!isOpen && (
        <div className="collapsed-indicator">
          <button
            className="expand-btn"
            onClick={() => setIsOpen(true)}
            aria-label="Expand sidebar"
          >
            <CaretRight size={16} weight="bold" />
          </button>
        </div>
      )}

      <div className="sidebar-content">
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-logo">
              <img src={logo} alt="Logo" className="logo-image" />
            </div>
            {isOpen}
          </div>
          {isOpen && (
            <button
              className="toggle-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Collapse sidebar"
            >
              <CaretLeft size={16} weight="bold" />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="menu-section">
              {isOpen && <div className="section-title">{section.section}</div>}
              {section.items.map(item => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? 'active' : ''} ${
                      !isOpen ? 'collapsed' : ''
                    }`
                  }
                  onClick={() => setActiveItem(item.id)}
                >
                  <item.icon
                    size={20}
                    weight={activeItem === item.id ? 'bold' : 'regular'}
                  />
                  {isOpen && (
                    <>
                      <span className="nav-label">{item.label}</span>
                      {item.hasDropdown && (
                        <CaretDown
                          size={16}
                          weight="regular"
                          className="dropdown-arrow"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              <User size={24} weight="regular" />
            </div>
            {isOpen && (
              <div className="user-info">
                <div className="user-name">
                  {loading
                    ? 'Loading...'
                    : `${userData.user_first_name} ${userData.user_last_name}`}
                </div>
                <div className="user-role">
                  {loading ? '...' : getRoleText(userData.user_role)}
                </div>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <SignOut size={20} weight="regular" />
            {isOpen && <span>Salir</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
