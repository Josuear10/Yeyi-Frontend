import { API_URL } from './config.js';

// Get all sales
export const getSales = async (limit = 10, offset = 0) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${API_URL}/sales?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch sales');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching sales:', error);
    throw error;
  }
};

// Create a new sale
export const createSale = async saleData => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/sales`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(saleData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create sale');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating sale:', error);
    throw error;
  }
};

// Update a sale
export const updateSale = async (id, saleData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/sales/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(saleData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update sale');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating sale:', error);
    throw error;
  }
};

// Delete a sale
export const deleteSale = async id => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/sales/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete sale');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting sale:', error);
    throw error;
  }
};
