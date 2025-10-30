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

// Create a new payment method
export const createPayment = async paymentData => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create payment method');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment method:', error);
    throw error;
  }
};

// Update a payment method
export const updatePayment = async (id, paymentData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/payments/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update payment method');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating payment method:', error);
    throw error;
  }
};

// Delete a payment method
export const deletePayment = async id => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/payments/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete payment method');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting payment method:', error);
    throw error;
  }
};
