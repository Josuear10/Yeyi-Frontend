import { API_URL } from './config.js';

// Get all employees
export const getEmployees = async (limit = 100, offset = 0) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${API_URL}/employees?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};

// Create a new employee
export const createEmployee = async employeeData => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/employees`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employeeData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create employee');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
};

// Update an employee
export const updateEmployee = async (id, employeeData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/employees/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employeeData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update employee');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating employee:', error);
    throw error;
  }
};

// Delete an employee
export const deleteEmployee = async id => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/employees/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete employee');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting employee:', error);
    throw error;
  }
};
