import { API_URL } from './config.js';

// Get all payment methods
export const getPayments = async (limit = 100, offset = 0) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${API_URL}/payments?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch payment methods');
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }
};
