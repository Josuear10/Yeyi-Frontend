import { API_URL } from './config.js';

// Get dashboard statistics
export const getDashboardStats = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/dashboard/stats`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Get recent sales
export const getRecentSales = async (limit = 10) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${API_URL}/dashboard/recent-sales?limit=${limit}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch recent sales');
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Error fetching recent sales:', error);
    throw error;
  }
};

// Get weekly revenue
export const getWeeklyRevenue = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/dashboard/weekly-revenue`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch weekly revenue');
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Error fetching weekly revenue:', error);
    throw error;
  }
};

// Get top products
export const getTopProducts = async (limit = 5) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${API_URL}/dashboard/top-products?limit=${limit}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch top products');
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Error fetching top products:', error);
    throw error;
  }
};

// Get categories with product counts
export const getCategoriesWithProducts = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/dashboard/categories`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Get sales status
export const getSalesStatus = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/dashboard/sales-status`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sales status');
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Error fetching sales status:', error);
    throw error;
  }
};
