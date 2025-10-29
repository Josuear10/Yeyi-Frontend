import { API_URL } from './config.js';

// Get details by sale ID
export const getDetailsBySaleId = async saleId => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/details/sale/${saleId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sale details');
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Error fetching sale details:', error);
    throw error;
  }
};

// Get all details
export const getDetails = async (limit = 100, offset = 0) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${API_URL}/details?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch details');
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Error fetching details:', error);
    throw error;
  }
};

// Create a new detail
export const createDetail = async detailData => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/details`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(detailData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create detail');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating detail:', error);
    throw error;
  }
};

// Update a detail
export const updateDetail = async (id, detailData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/details/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(detailData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update detail');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating detail:', error);
    throw error;
  }
};

// Delete a detail
export const deleteDetail = async id => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/details/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete detail');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting detail:', error);
    throw error;
  }
};
