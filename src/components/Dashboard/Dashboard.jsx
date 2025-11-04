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
  Clock,
  X,
  Trophy,
  ChartLineUp,
  ChartBar,
  Target,
  TrendUp,
} from 'phosphor-react';
import { getCurrentUser, decodeToken } from '../../api/userService';
import {
  getDashboardStats,
  getRecentSales,
  getWeeklyRevenue,
  getTopProducts,
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
  const [dailyGoal, setDailyGoal] = useState(() => {
    const saved = localStorage.getItem('dailyGoal');
    return saved ? parseFloat(saved) : 4000;
  });
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalInputValue, setGoalInputValue] = useState('');

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
      const [statsData, recentSalesData, weeklyRevenueData, topProductsData] =
        await Promise.all([
          getDashboardStats(),
          getRecentSales(3),
          getWeeklyRevenue(),
          getTopProducts(5),
        ]);

      setStats(statsData);
      setRecentSales(recentSalesData || []);
      setWeeklyRevenue(weeklyRevenueData || []);
      setTopProducts(topProductsData || []);
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

    try {
      // Extract date part if it's an ISO string
      let dateOnly = dateString;
      if (typeof dateString === 'string' && dateString.includes('T')) {
        dateOnly = dateString.split('T')[0];
      }

      // Parse the date string (YYYY-MM-DD) directly to avoid timezone issues
      if (
        typeof dateOnly === 'string' &&
        dateOnly.match(/^\d{4}-\d{2}-\d{2}$/)
      ) {
        const [year, month, day] = dateOnly.split('-').map(Number);

        // Get today's date in local timezone
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        // Create date object for the sale date (in local timezone, not UTC)
        const saleDate = new Date(year, month - 1, day);

        // Calculate difference in days
        const diffTime = today - saleDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;

        // Format as DD/MM/YYYY for older dates
        return `${day.toString().padStart(2, '0')}/${month
          .toString()
          .padStart(2, '0')}/${year}`;
      }

      // Fallback: parse as Date object
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const saleDateLocal = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const diffTime = today - saleDateLocal;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Hoy';
      if (diffDays === 1) return 'Ayer';
      if (diffDays < 7) return `Hace ${diffDays} días`;
      return date.toLocaleDateString('es-GT');
    } catch (error) {
      return 'Fecha desconocida';
    }
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

  // Daily goal threshold (from state) - Define early
  const DAILY_GOAL = dailyGoal;

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

  // Calculate weekly totals
  const weeklyTotal = revenueData.reduce(
    (sum, item) => sum + (Number(item.value) || 0),
    0
  );
  const averageDaily = weeklyTotal / 7;
  const daysExceedingGoal = revenueData.filter(
    bar => bar.value > DAILY_GOAL
  ).length;

  // Prepare top products with neutral colors
  const topProductsColors = [
    '#3b82f6', // Blue
    '#6366f1', // Indigo
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#10b981', // Green
  ];
  const preparedTopProducts = topProducts.map((product, index) => ({
    id: product.prod_id,
    name: product.prod_name,
    sales: Number(product.total_sold || 0),
    revenue: formatCurrency(Number(product.total_revenue || 0)),
    color: topProductsColors[index % topProductsColors.length],
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

  // Helper function to calculate bar height based on daily goal
  // Bars grow proportionally from 0% to 100% of goal, and can exceed up to 150%
  const getBarHeight = value => {
    if (value === 0) return '4px'; // Minimum visible height for zero values

    const percentage = (value / DAILY_GOAL) * 100;
    const baseHeight = 180; // Base height in pixels (100% of goal)

    if (percentage > 100) {
      // If exceeds goal, allow growth up to 150% of base height
      const extraPercentage = percentage - 100;
      const maxExtraHeight = baseHeight * 0.5; // 50% extra = 150% total
      const extraHeight = (extraPercentage / 100) * maxExtraHeight;
      return `${baseHeight + extraHeight}px`;
    }

    // Calculate height proportionally to goal (0% to 100%)
    const height = (percentage / 100) * baseHeight;
    return `${Math.max(height, 4)}px`; // Minimum 4px for visibility
  };

  // Check if value exceeds goal
  const exceedsGoal = value => value > DAILY_GOAL;

  // Handle goal modal functions
  const handleOpenGoalModal = () => {
    setGoalInputValue(dailyGoal.toString());
    setIsGoalModalOpen(true);
  };

  const handleCloseGoalModal = () => {
    setIsGoalModalOpen(false);
    setGoalInputValue('');
  };

  const handleSaveGoal = () => {
    const newGoal = parseFloat(goalInputValue);
    if (!isNaN(newGoal) && newGoal > 0) {
      setDailyGoal(newGoal);
      localStorage.setItem('dailyGoal', newGoal.toString());
      handleCloseGoalModal();
    }
  };

  const handleGoalInputKeyDown = e => {
    if (e.key === 'Enter') {
      handleSaveGoal();
    } else if (e.key === 'Escape') {
      handleCloseGoalModal();
    }
  };

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
              <div className="dashboard-card weekly-income-card">
                <div className="card-header weekly-income-header">
                  <div className="card-title-wrapper">
                    <div className="card-icon-wrapper">
                      <ChartBar size={20} weight="bold" />
                    </div>
                    <h2 className="card-title">Ingresos de la Semana</h2>
                  </div>
                  <button
                    className="goal-edit-btn"
                    onClick={handleOpenGoalModal}
                    title={`Meta diaria: ${formatCurrency(
                      DAILY_GOAL
                    )} - Click para editar`}
                    aria-label="Editar meta diaria"
                  >
                    <Target size={14} weight="regular" />
                  </button>
                </div>

                {/* Stats Summary */}
                <div className="weekly-stats-summary">
                  <div className="stat-summary-item">
                    <div className="stat-summary-label">Total Semanal</div>
                    <div className="stat-summary-value">
                      {formatCurrency(weeklyTotal)}
                    </div>
                  </div>
                  <div className="stat-summary-divider"></div>
                  <div className="stat-summary-item">
                    <div className="stat-summary-label">Promedio Diario</div>
                    <div className="stat-summary-value">
                      {formatCurrency(averageDaily)}
                    </div>
                  </div>
                  <div className="stat-summary-divider"></div>
                  <div className="stat-summary-item">
                    <div className="stat-summary-label">Días con Meta</div>
                    <div className="stat-summary-value highlight">
                      {daysExceedingGoal}/7
                    </div>
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="bar-chart">
                  {/* Goal line at 100% */}
                  <div className="goal-line"></div>
                  {revenueData.map((bar, index) => {
                    const exceeds = exceedsGoal(bar.value);
                    const percentage = (bar.value / DAILY_GOAL) * 100;
                    return (
                      <div key={index} className="chart-item">
                        <div className="chart-value-wrapper">
                          <div
                            className={`chart-value ${
                              exceeds ? 'exceeds-goal' : ''
                            }`}
                          >
                            {formatCurrency(bar.value)}
                            {exceeds && (
                              <span className="goal-badge">
                                <TrendUp size={12} weight="bold" />
                              </span>
                            )}
                          </div>
                          {bar.value > 0 && (
                            <div className="chart-percentage-indicator">
                              {percentage.toFixed(0)}%
                            </div>
                          )}
                        </div>
                        <div
                          className={`chart-bar-wrapper ${
                            exceeds ? 'exceeds-goal-wrapper' : ''
                          }`}
                        >
                          <div
                            className={`chart-bar ${
                              bar.pattern ? 'pattern' : ''
                            } ${exceeds ? 'exceeds-goal-bar' : ''}`}
                            style={{
                              height: getBarHeight(bar.value),
                              background: exceeds
                                ? `linear-gradient(180deg, ${bar.color} 0%, #db2777 100%)`
                                : `linear-gradient(180deg, ${bar.color} 0%, #f472b6 100%)`,
                            }}
                            title={`${bar.day}: ${formatCurrency(bar.value)} ${
                              exceeds ? '(Meta superada ✓)' : ''
                            }`}
                          ></div>
                        </div>
                        <div className="chart-label">{bar.day}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Chart Legend */}
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-color"></div>
                    <span>Ingreso del día</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color goal-color"></div>
                    <span>Meta alcanzada</span>
                  </div>
                </div>
              </div>

              {/* Recent Sales */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h2 className="card-title">Ventas Recientes</h2>
                  <button
                    className="btn-icon-small btn-new-sale"
                    onClick={() => navigate('/dashboard/sales')}
                  >
                    <Plus size={16} weight="bold" />
                    Nueva
                  </button>
                </div>
                <div className="sales-list">
                  {preparedRecentSales.length > 0 ? (
                    preparedRecentSales.map(sale => (
                      <div key={sale.id} className="sale-item">
                        <div className="sale-avatar">
                          {sale.customer?.charAt(0)?.toUpperCase() || 'C'}
                        </div>
                        <div className="sale-content">
                          <div className="sale-info">
                            <div className="sale-header">
                              <h4 className="sale-customer">{sale.customer}</h4>
                              <div className="sale-amount">{sale.amount}</div>
                            </div>
                            <div className="sale-meta">
                              <span className="sale-product">
                                <Package size={12} weight="regular" />
                                {sale.product}
                              </span>
                            </div>
                          </div>
                          <div className="sale-footer">
                            <span
                              className={`status-badge status-${sale.statusColor}`}
                            >
                              {sale.status}
                            </span>
                            <span className="sale-date">
                              <Clock size={12} weight="regular" />
                              {sale.date}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="sales-empty">
                      <ShoppingCart size={48} weight="light" />
                      <p>No hay ventas recientes</p>
                      <span>Las ventas aparecerán aquí</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Products */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h2 className="card-title">Productos Top</h2>
                  <button
                    type="button"
                    className="btn-icon-small btn-view-all"
                    onClick={() => {
                      console.log('Navegando a /dashboard/products');
                      navigate('/dashboard/products');
                    }}
                  >
                    <ChartLineUp size={16} weight="regular" />
                    Ver Todos
                  </button>
                </div>
                <div className="products-list">
                  {preparedTopProducts.length > 0 ? (
                    preparedTopProducts.map((product, index) => (
                      <div key={product.id} className="product-item">
                        <div className="product-rank">
                          {index === 0 ? (
                            <Trophy size={18} weight="fill" />
                          ) : (
                            <span className="rank-number">{index + 1}</span>
                          )}
                        </div>
                        <div
                          className="product-indicator"
                          style={{ backgroundColor: product.color }}
                        ></div>
                        <div className="product-content">
                          <div className="product-header">
                            <h4 className="product-name">{product.name}</h4>
                            <div className="product-revenue">
                              {product.revenue}
                            </div>
                          </div>
                          <div className="product-meta">
                            <span className="product-sales">
                              <Package size={12} weight="regular" />
                              {product.sales}{' '}
                              {product.sales === 1 ? 'venta' : 'ventas'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="products-empty">
                      <Package size={48} weight="light" />
                      <p>No hay productos vendidos</p>
                      <span>Los productos más vendidos aparecerán aquí</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Goal Modal */}
      {isGoalModalOpen && (
        <div className="goal-modal-overlay" onClick={handleCloseGoalModal}>
          <div className="goal-modal" onClick={e => e.stopPropagation()}>
            <div className="goal-modal-header">
              <h3 className="goal-modal-title">Editar Meta Diaria</h3>
              <button
                className="goal-modal-close"
                onClick={handleCloseGoalModal}
                aria-label="Cerrar"
              >
                <X size={20} weight="bold" />
              </button>
            </div>
            <div className="goal-modal-body">
              <label htmlFor="goal-input" className="goal-modal-label">
                Meta diaria (Q)
              </label>
              <input
                id="goal-input"
                type="number"
                className="goal-modal-input"
                value={goalInputValue}
                onChange={e => setGoalInputValue(e.target.value)}
                onKeyDown={handleGoalInputKeyDown}
                placeholder="Ingrese la meta diaria"
                min="1"
                step="0.01"
                autoFocus
              />
              <div className="goal-modal-info">
                <span>La meta actual es: {formatCurrency(dailyGoal)}</span>
              </div>
            </div>
            <div className="goal-modal-footer">
              <button
                className="goal-modal-btn goal-modal-btn-cancel"
                onClick={handleCloseGoalModal}
              >
                Cancelar
              </button>
              <button
                className="goal-modal-btn goal-modal-btn-save"
                onClick={handleSaveGoal}
                disabled={
                  !goalInputValue ||
                  isNaN(parseFloat(goalInputValue)) ||
                  parseFloat(goalInputValue) <= 0
                }
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
