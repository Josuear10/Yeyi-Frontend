import './Dashboard.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlass,
  Bell,
  Envelope,
  ArrowUp,
  Plus,
  ShoppingCart,
  Package,
  CurrencyDollar,
  Tag,
} from 'phosphor-react';
import { getCurrentUser, decodeToken } from '../../api/userService';

export default function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    user_first_name: 'Usuario',
    user_last_name: '',
    user_role: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
    fetchUserData();
  }, [navigate]);

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

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await getCurrentUser();
          setUserData({
            user_first_name: userData.user_first_name || 'Usuario',
            user_last_name: userData.user_last_name || '',
            user_role: userData.user_role || 0,
          });
        } catch (apiError) {
          console.warn('API call failed, using token decode:', apiError);
          const decodedToken = decodeToken(token);
          if (decodedToken) {
            setUserData({
              user_first_name: decodedToken.user_first_name || 'Usuario',
              user_last_name: decodedToken.user_last_name || '',
              user_role: decodedToken.user_role || 0,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Datos simulados del negocio
  const metrics = [
    {
      label: 'Total Ventas',
      value: 124,
      change: '+12',
      period: 'este mes',
      color: 'primary',
      icon: ShoppingCart,
    },
    {
      label: 'Total Productos',
      value: 48,
      change: '+8',
      period: 'este mes',
      color: 'white',
      icon: Package,
    },
    {
      label: 'Ingresos Totales',
      value: '$8,450',
      change: '+15%',
      period: 'este mes',
      color: 'white',
      icon: CurrencyDollar,
    },
    {
      label: 'Categorías',
      value: 12,
      status: 'Activas',
      color: 'white',
      icon: Tag,
    },
  ];

  const recentSales = [
    {
      id: 1,
      customer: 'María González',
      product: 'Producto Premium',
      amount: '$125.00',
      date: 'Hoy',
      status: 'Completada',
      statusColor: 'success',
    },
    {
      id: 2,
      customer: 'Juan Pérez',
      product: 'Producto Estándar',
      amount: '$89.50',
      date: 'Ayer',
      status: 'Completada',
      statusColor: 'success',
    },
    {
      id: 3,
      customer: 'Ana Martínez',
      product: 'Producto Básico',
      amount: '$45.00',
      date: '2 días',
      status: 'Pendiente',
      statusColor: 'warning',
    },
    {
      id: 4,
      customer: 'Carlos Rodríguez',
      product: 'Producto Premium',
      amount: '$150.00',
      date: '3 días',
      status: 'Completada',
      statusColor: 'success',
    },
  ];

  const topProducts = [
    {
      id: 1,
      name: 'Producto Premium',
      sales: 45,
      revenue: '$5,625',
      color: '#ec4899',
    },
    {
      id: 2,
      name: 'Producto Estándar',
      sales: 32,
      revenue: '$2,864',
      color: '#f472b6',
    },
    {
      id: 3,
      name: 'Producto Básico',
      sales: 28,
      revenue: '$1,260',
      color: '#fbcfe8',
    },
    {
      id: 4,
      name: 'Producto Especial',
      sales: 19,
      revenue: '$1,140',
      color: '#f9a8d4',
    },
  ];

  const categories = [
    { id: 1, name: 'Categoría 1', products: 12, color: '#ec4899' },
    { id: 2, name: 'Categoría 2', products: 8, color: '#f472b6' },
    { id: 3, name: 'Categoría 3', products: 15, color: '#fbcfe8' },
    { id: 4, name: 'Categoría 4', products: 10, color: '#f9a8d4' },
    { id: 5, name: 'Categoría 5', products: 3, color: '#ec4899' },
  ];

  const revenueData = [
    { day: 'Lun', value: 1200, color: '#ec4899' },
    { day: 'Mar', value: 1800, color: '#ec4899' },
    { day: 'Mié', value: 2400, color: '#ec4899' },
    { day: 'Jue', value: 1600, color: '#f472b6', pattern: true },
    { day: 'Vie', value: 2200, color: '#ec4899' },
    { day: 'Sáb', value: 1400, color: '#f472b6', pattern: true },
    { day: 'Dom', value: 1900, color: '#ec4899' },
  ];

  const salesProgressData = [
    { label: 'Completadas', value: 68, color: '#ec4899' },
    { label: 'En Proceso', value: 22, color: '#f472b6' },
    { label: 'Pendientes', value: 10, color: '#fbcfe8' },
  ];

  return (
    <>
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="search-box">
            <MagnifyingGlass size={20} weight="regular" />
            <input type="text" placeholder="Buscar producto..." />
            <span className="search-shortcut">⌘F</span>
          </div>
        </div>

        <div className="header-right">
          <button className="icon-btn">
            <Envelope size={20} weight="regular" />
          </button>
          <button className="icon-btn notification-btn">
            <Bell size={20} weight="regular" />
            <span className="notification-dot"></span>
          </button>

          <div className="user-profile-header">
            <div className="user-avatar-small">
              {userData.user_first_name?.charAt(0)?.toUpperCase() || 'U'}
              {userData.user_last_name?.charAt(0)?.toUpperCase() || ''}
            </div>
            <div className="user-info-small">
              <div className="user-name-small">
                {userData.user_first_name || 'Usuario'}{' '}
                {userData.user_last_name || ''}
              </div>
              <div className="user-email-small">
                {getRoleText(userData.user_role)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Metrics Row */}
        <div className="metrics-grid">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className={`metric-card ${
                metric.color === 'primary' ? 'metric-primary' : ''
              }`}
            >
              <div className="metric-header">
                <h3 className="metric-label">{metric.label}</h3>
                <div className="metric-icon">
                  <metric.icon size={20} weight="bold" />
                </div>
              </div>
              <div className="metric-value">{metric.value}</div>
              {metric.change && (
                <div className="metric-change">
                  {metric.change} {metric.period}
                </div>
              )}
              {metric.status && (
                <div className="metric-status">{metric.status}</div>
              )}
            </div>
          ))}
        </div>

        {/* Middle Row */}
        <div className="middle-grid">
          {/* Sales Analytics */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2 className="card-title">Ingresos de la Semana</h2>
            </div>
            <div className="chart-container">
              <div className="bar-chart">
                {revenueData.map((bar, index) => (
                  <div key={index} className="chart-item">
                    <div className="chart-value">${bar.value}</div>
                    <div
                      className={`chart-bar ${bar.pattern ? 'pattern' : ''}`}
                      style={{
                        height: `${(bar.value / 2400) * 100}%`,
                        backgroundColor: bar.color,
                      }}
                    ></div>
                    <div className="chart-label">{bar.day}</div>
                  </div>
                ))}
              </div>
              <div className="chart-annotation">
                <span className="chart-percentage">$2,400</span> Máximo
              </div>
            </div>
          </div>

          {/* Recent Sales */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2 className="card-title">Ventas Recientes</h2>
              <button className="btn-icon-small">
                <Plus size={16} weight="bold" />
                Nueva
              </button>
            </div>
            <div className="sales-list">
              {recentSales.map(sale => (
                <div key={sale.id} className="sale-item">
                  <div className="sale-info">
                    <h4 className="sale-customer">{sale.customer}</h4>
                    <span className="sale-product">{sale.product}</span>
                  </div>
                  <div className="sale-details">
                    <div className="sale-amount">{sale.amount}</div>
                    <span className={`status-badge status-${sale.statusColor}`}>
                      {sale.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2 className="card-title">Productos Top</h2>
              <button className="btn-icon-small">
                <Plus size={16} weight="bold" />
                Ver Todos
              </button>
            </div>
            <div className="products-list">
              {topProducts.map(product => (
                <div key={product.id} className="product-item">
                  <div
                    className="product-color"
                    style={{ backgroundColor: product.color }}
                  ></div>
                  <div className="product-info">
                    <h4 className="product-name">{product.name}</h4>
                    <span className="product-details">
                      {product.sales} ventas · {product.revenue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="bottom-grid">
          {/* Categories */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2 className="card-title">Categorías</h2>
              <button className="btn-icon-small">
                <Plus size={16} weight="bold" />
                Nueva Categoría
              </button>
            </div>
            <div className="categories-list">
              {categories.map(category => (
                <div key={category.id} className="category-item">
                  <div
                    className="category-color"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <div className="category-info">
                    <h4 className="category-name">{category.name}</h4>
                    <span className="category-products">
                      {category.products} productos
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sales Progress */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2 className="card-title">Estado de Ventas</h2>
            </div>
            <div className="progress-container">
              <div className="donut-chart">
                <svg viewBox="0 0 120 120" className="progress-ring">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="20"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#f472b6"
                    strokeWidth="20"
                    strokeDasharray={`${2 * Math.PI * 50 * 0.68} ${
                      2 * Math.PI * 50
                    }`}
                    strokeDashoffset={2 * Math.PI * 50 * 0.25}
                    className="progress-segment"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#ec4899"
                    strokeWidth="20"
                    strokeDasharray={`${2 * Math.PI * 50 * 0.22} ${
                      2 * Math.PI * 50
                    }`}
                    strokeDashoffset={2 * Math.PI * 50 * 0.93}
                    className="progress-segment"
                  />
                </svg>
                <div className="progress-percentage">
                  <span className="percentage-value">68%</span>
                  <span className="percentage-label">Completadas</span>
                </div>
              </div>
              <div className="progress-legend">
                {salesProgressData.map((item, index) => (
                  <div key={index} className="legend-item">
                    <div
                      className="legend-color"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="legend-label">{item.label}</span>
                    <span className="legend-value">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2 className="card-title">Acciones Rápidas</h2>
            </div>
            <div className="quick-actions">
              <button className="action-btn">
                <ShoppingCart size={24} weight="bold" />
                Nueva Venta
              </button>
              <button className="action-btn">
                <Package size={24} weight="bold" />
                Agregar Producto
              </button>
              <button className="action-btn">
                <Tag size={24} weight="bold" />
                Nueva Categoría
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
