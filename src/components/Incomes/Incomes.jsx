import './Incomes.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlass,
  Bell,
  Envelope,
  ChartLineUp,
  CurrencyDollar,
  CreditCard,
  UserCircle,
  Package,
  ChartLine,
  ArrowUp,
  ArrowDown,
  Trophy,
} from 'phosphor-react';
import { getCurrentUser, decodeToken } from '../../api/userService';
import { getSales } from '../../api/salesService';
import { getPayments } from '../../api/paymentsService';
import { getEmployees } from '../../api/employeesService';
import { getCategories } from '../../api/categoriesService';
import { getDetails } from '../../api/detailsService';
import { getProducts } from '../../api/productsService';

export default function Incomes() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    user_first_name: 'Usuario',
    user_last_name: '',
    user_role: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState([]);
  const [payments, setPayments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [details, setDetails] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    fetchUserData();
    fetchAllData();
  }, [navigate]);

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

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [
        salesData,
        paymentsData,
        employeesData,
        categoriesData,
        detailsData,
        productsData,
      ] = await Promise.all([
        getSales(1000, 0),
        getPayments(100, 0),
        getEmployees(100, 0),
        getCategories(100, 0),
        getDetails(1000, 0),
        getProducts(1000, 0),
      ]);

      setSales(salesData?.data || salesData || []);
      setPayments(
        Array.isArray(paymentsData) ? paymentsData : paymentsData?.data || []
      );
      setEmployees(
        Array.isArray(employeesData) ? employeesData : employeesData?.data || []
      );
      setCategories(
        Array.isArray(categoriesData)
          ? categoriesData
          : categoriesData?.data || []
      );
      setDetails(
        Array.isArray(detailsData) ? detailsData : detailsData?.data || []
      );
      setProducts(productsData?.data || productsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = value => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-GT', { day: '2-digit', month: 'short' });
  };

  // Calculate earnings data for chart - cumulative amounts by date
  const calculateEarningsData = () => {
    if (!sales || sales.length === 0) return [];

    // Group all sales by date
    const salesByDate = {};
    sales.forEach(sale => {
      if (sale.sale_date && sale.sale_total) {
        const date = new Date(sale.sale_date);
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        if (!salesByDate[dateKey]) {
          salesByDate[dateKey] = 0;
        }
        salesByDate[dateKey] += Number(sale.sale_total) || 0;
      }
    });

    // Get all dates and sort them
    const sortedDates = Object.keys(salesByDate).sort();

    if (sortedDates.length === 0) return [];

    // Calculate cumulative earnings
    let cumulativeTotal = 0;
    const earningsData = sortedDates.map(dateKey => {
      cumulativeTotal += salesByDate[dateKey] || 0;
      return {
        date: dateKey,
        earnings: cumulativeTotal,
        displayDate: formatDate(dateKey),
      };
    });

    // Limit to maximum 10 points if there are too many
    if (earningsData.length > 10) {
      const step = Math.ceil(earningsData.length / 10);
      const selectedData = [];
      for (
        let i = 0;
        i < earningsData.length && selectedData.length < 10;
        i += step
      ) {
        selectedData.push(earningsData[i]);
      }
      // Always include the last point
      if (
        selectedData[selectedData.length - 1]?.date !==
        earningsData[earningsData.length - 1]?.date
      ) {
        selectedData.push(earningsData[earningsData.length - 1]);
      }
      return selectedData;
    }

    return earningsData;
  };

  const earningsData = calculateEarningsData();

  // Calculate growth/decrement indicator
  const calculateGrowthIndicator = () => {
    if (earningsData.length < 2) return null;

    const firstValue = earningsData[0].earnings;
    const lastValue = earningsData[earningsData.length - 1].earnings;

    if (firstValue === 0) return null;

    const growthPercentage = ((lastValue - firstValue) / firstValue) * 100;

    return {
      percentage: Math.abs(growthPercentage).toFixed(1),
      isPositive: growthPercentage >= 0,
    };
  };

  const growthIndicator = calculateGrowthIndicator();

  // Calculate max earnings for scaling
  const actualMax = Math.max(...earningsData.map(d => d.earnings), 0);
  // Round up to the nearest 2000, but minimum 8000 for better visualization
  const chartMax = Math.max(Math.ceil(actualMax / 2000) * 2000, 8000);

  // Calculate Y-axis values (0 to chartMax in increments of 2000)
  const yAxisValues = [];
  for (let i = chartMax; i >= 0; i -= 2000) {
    yAxisValues.push(i);
  }

  // Get most used payment method
  const getMostUsedPaymentMethod = () => {
    if (!sales || sales.length === 0 || !payments || payments.length === 0)
      return null;

    const paymentCount = {};
    sales.forEach(sale => {
      if (sale.pay_id) {
        paymentCount[sale.pay_id] = (paymentCount[sale.pay_id] || 0) + 1;
      }
    });

    const mostUsedId = Object.keys(paymentCount).reduce((a, b) =>
      paymentCount[a] > paymentCount[b] ? a : b
    );

    const payment = payments.find(p => p.pay_id === Number(mostUsedId));
    return payment
      ? {
          name: payment.pay_method || 'Método de pago',
          count: paymentCount[mostUsedId],
          percentage: ((paymentCount[mostUsedId] / sales.length) * 100).toFixed(
            1
          ),
        }
      : null;
  };

  const mostUsedPayment = getMostUsedPaymentMethod();

  // Get employee who sold the most
  const getTopEmployee = () => {
    if (!sales || sales.length === 0 || !employees || employees.length === 0)
      return null;

    const employeeSales = {};
    sales.forEach(sale => {
      if (sale.emp_id && sale.sale_total) {
        if (!employeeSales[sale.emp_id]) {
          employeeSales[sale.emp_id] = { count: 0, total: 0 };
        }
        employeeSales[sale.emp_id].count += 1;
        employeeSales[sale.emp_id].total += Number(sale.sale_total) || 0;
      }
    });

    const topEmpId = Object.keys(employeeSales).reduce((a, b) =>
      employeeSales[a].total > employeeSales[b].total ? a : b
    );

    const employee = employees.find(e => e.emp_id === Number(topEmpId));
    return employee
      ? {
          name: employee.emp_name || 'Empleado',
          salesCount: employeeSales[topEmpId].count,
          totalSales: employeeSales[topEmpId].total,
        }
      : null;
  };

  const topEmployee = getTopEmployee();

  // Get products by category (sold products)
  const getProductsByCategory = () => {
    if (
      !details ||
      details.length === 0 ||
      !products ||
      products.length === 0 ||
      !categories ||
      categories.length === 0
    )
      return [];

    // Create a map of product_id to cat_id
    const productCategoryMap = {};
    products.forEach(product => {
      if (product.prod_id && product.cat_id) {
        productCategoryMap[product.prod_id] = product.cat_id;
      }
    });

    // Count quantity sold by category
    const categoryCount = {};
    details.forEach(detail => {
      if (detail.prod_id && detail.det_quantity) {
        const catId = productCategoryMap[detail.prod_id];
        if (catId) {
          if (!categoryCount[catId]) {
            categoryCount[catId] = 0;
          }
          categoryCount[catId] += Number(detail.det_quantity) || 0;
        }
      }
    });

    // Map to category names and sort by count
    const categoryProducts = categories
      .filter(cat => categoryCount[cat.cat_id] > 0)
      .map(cat => ({
        id: cat.cat_id,
        name: cat.cat_name || 'Categoría',
        count: categoryCount[cat.cat_id] || 0,
      }))
      .sort((a, b) => b.count - a.count);

    return categoryProducts;
  };

  const productsByCategory = getProductsByCategory();

  // Get total revenue
  const totalRevenue = sales.reduce(
    (sum, sale) => sum + (Number(sale.sale_total) || 0),
    0
  );

  // Get average order value
  const averageOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0;

  // Get total number of sales
  const totalSales = sales.length;

  return (
    <>
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="search-box">
            <MagnifyingGlass size={20} weight="regular" />
            <input type="text" placeholder="Buscar..." />
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
            {/* Chart Row */}
            <div className="middle-grid">
              {/* Earnings Chart */}
              <div className="dashboard-card incomes-chart-card">
                <div className="card-header">
                  <h2 className="card-title">Evolución de Ingresos</h2>
                  {growthIndicator && (
                    <div
                      className={`growth-indicator ${
                        growthIndicator.isPositive
                          ? 'growth-positive'
                          : 'growth-negative'
                      }`}
                    >
                      {growthIndicator.isPositive ? (
                        <ArrowUp size={16} weight="bold" />
                      ) : (
                        <ArrowDown size={16} weight="bold" />
                      )}
                      <span className="growth-percentage">
                        {growthIndicator.percentage}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="chart-container incomes-chart">
                  <div className="chart-y-axis">
                    {yAxisValues.map(value => {
                      const y = 170 - (value / chartMax) * 150; // misma escala que el SVG
                      return (
                        <div
                          key={value}
                          className="y-axis-label"
                          style={{
                            top: `${y + 1.5}px`,
                            transform: 'translateY(-48%)',
                          }}
                        >
                          {formatCurrency(value)}
                        </div>
                      );
                    })}
                  </div>

                  <div className="chart-area">
                    {earningsData.length > 0 ? (
                      <>
                        <svg
                          className="line-chart"
                          viewBox="0 0 1000 200"
                          preserveAspectRatio="xMidYMid meet"
                        >
                          {/* Grid lines */}
                          {yAxisValues.map(value => {
                            const y = 170 - (value / chartMax) * 150;
                            return (
                              <line
                                key={value}
                                x1="50"
                                y1={y}
                                x2="950"
                                y2={y}
                                stroke="#e5e7eb"
                                strokeWidth="1"
                                strokeDasharray="4 4"
                              />
                            );
                          })}

                          {/* Line chart */}
                          <polyline
                            points={earningsData
                              .map((point, index) => {
                                const x =
                                  50 +
                                  (earningsData.length > 1
                                    ? (index / (earningsData.length - 1)) * 900
                                    : 450);
                                const y =
                                  170 - (point.earnings / chartMax) * 150;
                                return `${x},${y}`;
                              })
                              .join(' ')}
                            fill="none"
                            stroke="#ec4899"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          {/* Data points */}
                          {earningsData.map((point, index) => {
                            const x =
                              50 +
                              (earningsData.length > 1
                                ? (index / (earningsData.length - 1)) * 900
                                : 450);
                            const y = 170 - (point.earnings / chartMax) * 150;
                            return (
                              <g key={index}>
                                <circle
                                  cx={x}
                                  cy={y}
                                  r="6"
                                  fill="#ec4899"
                                  stroke="white"
                                  strokeWidth="2"
                                />
                                <text
                                  x={x}
                                  y={y - 10}
                                  textAnchor="middle"
                                  fontSize="10"
                                  fill="#1f2937"
                                  fontWeight="600"
                                >
                                  {formatCurrency(point.earnings)}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                        <div className="chart-x-axis">
                          {earningsData.map((point, index) => {
                            const svgX =
                              50 +
                              (earningsData.length > 1
                                ? (index / (earningsData.length - 1)) * 900
                                : 450);
                            return (
                              <div
                                key={index}
                                className="x-axis-label"
                                style={{
                                  position: 'absolute',
                                  left: `${svgX / 10}%`,
                                  transform: 'translateX(-50%)',
                                }}
                              >
                                {point.displayDate}
                              </div>
                            );
                          })}
                          <div className="x-axis-title"></div>
                        </div>
                      </>
                    ) : (
                      <div className="chart-empty">
                        <ChartLine size={48} weight="light" />
                        <p>No hay datos de ingresos disponibles</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Stats - Moved here */}
              <div className="dashboard-card additional-stats-card">
                <div className="card-header">
                  <h2 className="card-title">Estadísticas Adicionales</h2>
                </div>
                <div className="additional-stats">
                  <div className="additional-stat-item">
                    <div className="additional-stat-label">Métodos de Pago</div>
                    <div className="additional-stat-value">
                      {payments.length}
                    </div>
                  </div>
                  <div className="additional-stat-item">
                    <div className="additional-stat-label">
                      Empleados Activos
                    </div>
                    <div className="additional-stat-value">
                      {employees.filter(e => e.emp_is_active !== 0).length}
                    </div>
                  </div>
                  <div className="additional-stat-item">
                    <div className="additional-stat-label">
                      Productos Vendidos
                    </div>
                    <div className="additional-stat-value">
                      {details.reduce(
                        (sum, d) => sum + (Number(d.det_quantity) || 0),
                        0
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Row */}
            <div className="bottom-grid">
              {/* Most Used Payment Method */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h2 className="card-title">Método de Pago Más Usado</h2>
                </div>
                <div className="stat-card-content">
                  {mostUsedPayment ? (
                    <>
                      <div className="stat-icon-wrapper">
                        <CreditCard size={36} weight="light" />
                      </div>
                      <h3 className="stat-main-value">
                        {mostUsedPayment.name}
                      </h3>
                      <div className="stat-meta">
                        <span className="stat-label">Usado en</span>
                        <span className="stat-value">
                          {mostUsedPayment.count} ventas
                        </span>
                      </div>
                      <div className="stat-percentage">
                        {mostUsedPayment.percentage}% del total
                      </div>
                    </>
                  ) : (
                    <div className="stat-empty">
                      <CreditCard size={48} weight="light" />
                      <p>No hay datos disponibles</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Employee */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h2 className="card-title">Empleado con Más Ventas</h2>
                </div>
                <div className="stat-card-content">
                  {topEmployee ? (
                    <>
                      <div className="stat-icon-wrapper">
                        <Trophy size={36} weight="fill" color="#fbbf24" />
                      </div>
                      <h3 className="stat-main-value">{topEmployee.name}</h3>
                      <div className="stat-meta">
                        <span className="stat-label">Ventas realizadas</span>
                        <span className="stat-value">
                          {topEmployee.salesCount}
                        </span>
                      </div>
                      <div className="stat-meta">
                        <span className="stat-label">Total vendido</span>
                        <span className="stat-value">
                          {formatCurrency(topEmployee.totalSales)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="stat-empty">
                      <UserCircle size={48} weight="light" />
                      <p>No hay datos disponibles</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Products by Category */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h2 className="card-title">Productos por Categoría</h2>
                </div>
                <div className="category-stats">
                  {productsByCategory.length > 0 ? (
                    productsByCategory.slice(0, 5).map((category, index) => (
                      <div key={category.id} className="category-stat-item">
                        <div className="category-stat-info">
                          <div className="category-stat-name">
                            {category.name}
                          </div>
                          <div className="category-stat-count">
                            {category.count} productos
                          </div>
                        </div>
                        <div className="category-stat-bar-wrapper">
                          <div
                            className="category-stat-bar"
                            style={{
                              width: `${
                                (category.count /
                                  Math.max(
                                    ...productsByCategory.map(c => c.count),
                                    1
                                  )) *
                                100
                              }%`,
                              backgroundColor: `hsl(${330 + index * 15}, ${
                                70 + index * 5
                              }%, ${50 + index * 5}%)`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="stat-empty">
                      <Package size={48} weight="light" />
                      <p>No hay datos disponibles</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
