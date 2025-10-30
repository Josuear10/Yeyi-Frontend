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
import {
  getDashboardStats,
  getRecentSales,
  getWeeklyRevenue,
  getTopProducts,
  getCategoriesWithProducts,
  getSalesStatus,
} from '../../api/dashboardService';

export default function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    user_first_name: 'Usuario',
    user_last_name: '',
    user_role: 0,
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [salesStatus, setSalesStatus] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    fetchUserData();
    fetchDashboardData();

    // Listen for profile updates
    const handleProfileUpdate = event => {
      if (event.detail) {
        setUserData(prev => ({
          ...prev,
          user_first_name: event.detail.user_first_name || prev.user_first_name,
          user_last_name: event.detail.user_last_name || prev.user_last_name,
        }));
      } else {
        // If no detail, refetch from API
        fetchUserData();
      }
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
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

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        statsData,
        recentSalesData,
        weeklyRevenueData,
        topProductsData,
        categoriesData,
        salesStatusData,
      ] = await Promise.all([
        getDashboardStats(),
        getRecentSales(10),
        getWeeklyRevenue(),
        getTopProducts(5),
        getCategoriesWithProducts(),
        getSalesStatus(),
      ]);

      setStats(statsData);
      setRecentSales(recentSalesData || []);
      setWeeklyRevenue(weeklyRevenueData || []);
      setTopProducts(topProductsData || []);
      setCategories(categoriesData || []);
      setSalesStatus(salesStatusData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format currency
  const formatCurrency = value => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Helper function to format date relative to now
  const formatRelativeDate = dateString => {
    if (!dateString) return 'Fecha desconocida';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-GT');
  };

  // Prepare metrics data
  const metrics = stats
    ? [
        {
          label: 'Total Ventas',
          value: stats.totalSales || 0,
          change: stats.salesChange
            ? (stats.salesChange >= 0 ? '+' : '') + stats.salesChange
            : null,
          period: 'este mes',
          color: 'primary',
          icon: ShoppingCart,
        },
        {
          label: 'Total Productos',
          value: stats.totalProducts || 0,
          change: null,
          period: 'este mes',
          color: 'white',
          icon: Package,
        },
        {
          label: 'Ingresos Totales',
          value: formatCurrency(stats.totalRevenue || 0),
          change: stats.revenueChange
            ? (stats.revenueChange >= 0 ? '+' : '') +
              stats.revenueChange.toFixed(1) +
              '%'
            : null,
          period: 'este mes',
          color: 'white',
          icon: CurrencyDollar,
        },
        {
          label: 'Categorías',
          value: stats.activeCategories || 0,
          status: 'Activas',
          color: 'white',
          icon: Tag,
        },
      ]
    : [];

  // Prepare revenue data for chart
  const revenueData =
    weeklyRevenue.length > 0
      ? weeklyRevenue.map((item, index) => ({
          day: item.day,
          value: item.value,
          color: index % 2 === 0 ? '#ec4899' : '#f472b6',
          pattern: index % 3 === 0,
        }))
      : [
          { day: 'Lun', value: 0, color: '#ec4899' },
          { day: 'Mar', value: 0, color: '#ec4899' },
          { day: 'Mié', value: 0, color: '#ec4899' },
          { day: 'Jue', value: 0, color: '#f472b6', pattern: true },
          { day: 'Vie', value: 0, color: '#ec4899' },
          { day: 'Sáb', value: 0, color: '#f472b6', pattern: true },
          { day: 'Dom', value: 0, color: '#ec4899' },
        ];

  // Prepare top products with colors
  const topProductsColors = [
    '#ec4899',
    '#f472b6',
    '#fbcfe8',
    '#f9a8d4',
    '#ec4899',
  ];
  const preparedTopProducts = topProducts.map((product, index) => ({
    id: product.prod_id,
    name: product.prod_name,
    sales: Number(product.total_sold || 0),
    revenue: formatCurrency(Number(product.total_revenue || 0)),
    color: topProductsColors[index % topProductsColors.length],
  }));

  // Prepare categories with colors
  const categoryColors = [
    '#ec4899',
    '#f472b6',
    '#fbcfe8',
    '#f9a8d4',
    '#ec4899',
  ];
  const preparedCategories = categories.map((category, index) => ({
    id: category.cat_id,
    name: category.cat_name,
    products: Number(category.product_count || 0),
    color: categoryColors[index % categoryColors.length],
  }));

  // Prepare recent sales data
  const preparedRecentSales = recentSales.map(sale => ({
    id: sale.sale_id,
    customer: sale.employee_name || 'Cliente',
    product: sale.firstProduct?.prod_name || 'Producto',
    amount: formatCurrency(Number(sale.sale_total || 0)),
    date: formatRelativeDate(sale.sale_date),
    status: 'Completada',
    statusColor: 'success',
  }));

  // Prepare sales progress data
  const totalProgress = salesStatus.reduce(
    (sum, item) => sum + (item.value || 0),
    0
  );
  const preparedSalesProgress =
    salesStatus.length > 0
      ? salesStatus.map(item => ({
          label: item.label,
          value: item.value || 0,
          color:
            item.label === 'Completadas'
              ? '#ec4899'
              : item.label === 'En Proceso'
              ? '#f472b6'
              : '#fbcfe8',
        }))
      : [
          { label: 'Completadas', value: 0, color: '#ec4899' },
          { label: 'En Proceso', value: 0, color: '#f472b6' },
          { label: 'Pendientes', value: 0, color: '#fbcfe8' },
        ];

  // Calculate max value for chart
  const maxRevenue = Math.max(...revenueData.map(item => item.value), 1);

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
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            Cargando datos...
          </div>
        ) : (
          <>
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
                        <div className="chart-value">
                          {formatCurrency(bar.value)}
                        </div>
                        <div
                          className={`chart-bar ${
                            bar.pattern ? 'pattern' : ''
                          }`}
                          style={{
                            height: `${(bar.value / maxRevenue) * 100}%`,
                            backgroundColor: bar.color,
                          }}
                        ></div>
                        <div className="chart-label">{bar.day}</div>
                      </div>
                    ))}
                  </div>
                  <div className="chart-annotation">
                    <span className="chart-percentage">
                      {formatCurrency(maxRevenue)}
                    </span>{' '}
                    Máximo
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
                  {preparedRecentSales.length > 0 ? (
                    preparedRecentSales.map(sale => (
                      <div key={sale.id} className="sale-item">
                        <div className="sale-info">
                          <h4 className="sale-customer">{sale.customer}</h4>
                          <span className="sale-product">{sale.product}</span>
                        </div>
                        <div className="sale-details">
                          <div className="sale-amount">{sale.amount}</div>
                          <span
                            className={`status-badge status-${sale.statusColor}`}
                          >
                            {sale.status}
                          </span>
                        </div>
                        <div
                          className="sale-date"
                          style={{
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            marginTop: '0.25rem',
                          }}
                        >
                          {sale.date}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        padding: '1rem',
                        textAlign: 'center',
                        color: '#6b7280',
                      }}
                    >
                      No hay ventas recientes
                    </div>
                  )}
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
                  {preparedTopProducts.length > 0 ? (
                    preparedTopProducts.map(product => (
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
                    ))
                  ) : (
                    <div
                      style={{
                        padding: '1rem',
                        textAlign: 'center',
                        color: '#6b7280',
                      }}
                    >
                      No hay productos vendidos
                    </div>
                  )}
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
                  {preparedCategories.length > 0 ? (
                    preparedCategories.map(category => (
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
                    ))
                  ) : (
                    <div
                      style={{
                        padding: '1rem',
                        textAlign: 'center',
                        color: '#6b7280',
                      }}
                    >
                      No hay categorías activas
                    </div>
                  )}
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
                      {preparedSalesProgress.length > 0 &&
                        (() => {
                          const total = preparedSalesProgress.reduce(
                            (sum, item) => sum + item.value,
                            0
                          );
                          if (total === 0) return null;

                          let currentOffset = 0;
                          const circumference = 2 * Math.PI * 50;

                          return preparedSalesProgress.map((item, index) => {
                            const percentage = item.value / total;
                            const dashLength = circumference * percentage;
                            const offset = currentOffset;
                            currentOffset += dashLength;

                            return (
                              <circle
                                key={index}
                                cx="60"
                                cy="60"
                                r="50"
                                fill="none"
                                stroke={item.color}
                                strokeWidth="20"
                                strokeDasharray={`${dashLength} ${circumference}`}
                                strokeDashoffset={-offset}
                                className="progress-segment"
                                transform="rotate(-90 60 60)"
                              />
                            );
                          });
                        })()}
                    </svg>
                    <div className="progress-percentage">
                      <span className="percentage-value">
                        {preparedSalesProgress.length > 0 &&
                        preparedSalesProgress[0]
                          ? `${preparedSalesProgress[0].value}%`
                          : '0%'}
                      </span>
                      <span className="percentage-label">Completadas</span>
                    </div>
                  </div>
                  <div className="progress-legend">
                    {preparedSalesProgress.map((item, index) => (
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
          </>
        )}
      </main>
    </>
  );
}
