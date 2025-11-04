import React, { useState, useEffect } from 'react';
import {
  Plus,
  PencilSimple,
  Trash,
  Users,
  MagnifyingGlass,
  X,
  ArrowLeft,
  ArrowRight,
} from 'phosphor-react';
import Swal from 'sweetalert2';
import './Employees.css';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../../api/employeesService.js';
import { getCurrentUser, decodeToken } from '../../api/userService.js';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formData, setFormData] = useState({
    emp_name: '',
    emp_phone: '',
    emp_email: '',
    emp_position: '',
    emp_commission: '',
    emp_dpi: '',
    emp_is_active: true,
    user_id: null,
  });

  // Load current user ID on component mount
  useEffect(() => {
    loadCurrentUserId();
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadCurrentUserId = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await getCurrentUser();
          setCurrentUserId(userData.user_id);
          setFormData(prev => ({ ...prev, user_id: userData.user_id }));
        } catch (apiError) {
          console.warn('API call failed, using token decode:', apiError);
          const decodedToken = decodeToken(token);
          if (decodedToken && decodedToken.user_id) {
            setCurrentUserId(decodedToken.user_id);
            setFormData(prev => ({ ...prev, user_id: decodedToken.user_id }));
          }
        }
      }
    } catch (error) {
      console.error('Error loading user ID:', error);
    }
  };

  // Helper function para determinar si un empleado está activo
  const isEmployeeActive = status => {
    // Trabajar directamente con booleanos
    return status === true || status === 1 || status === 'true';
  };

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await getEmployees(100, 0);
      // El backend devuelve { data: employees, total: ... }
      const employeesData = response.data || response;

      setEmployees(employeesData);
    } catch (error) {
      setError('Error al cargar los empleados');
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    // Convertir el valor del select de estado a booleano
    const finalValue = name === 'emp_is_active' ? value === 'true' : value;
    setFormData(prev => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      setError(''); // Clear previous errors
      setSubmitting(true);

      const employeeData = {
        emp_name: formData.emp_name,
        emp_phone: formData.emp_phone || null,
        emp_email: formData.emp_email || null,
        emp_position: formData.emp_position,
        emp_commission: formData.emp_commission
          ? parseFloat(formData.emp_commission)
          : 0,
        emp_dpi: formData.emp_dpi ? parseInt(formData.emp_dpi) : null,
        emp_is_active: formData.emp_is_active, // Enviar booleano directamente
        user_id: currentUserId || formData.user_id,
      };

      // Validate required fields
      if (!employeeData.emp_name.trim()) {
        throw new Error('El nombre del empleado es requerido');
      }
      if (!employeeData.emp_position.trim()) {
        throw new Error('La posición del empleado es requerida');
      }

      if (editingEmployee) {
        await updateEmployee(editingEmployee.emp_id, employeeData);
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Empleado actualizado correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await createEmployee(employeeData);
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Empleado creado correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
      }

      setShowModal(false);
      setEditingEmployee(null);
      setFormData({
        emp_name: '',
        emp_phone: '',
        emp_email: '',
        emp_position: '',
        emp_commission: '',
        emp_dpi: '',
        emp_is_active: true,
        user_id: currentUserId,
      });
      loadEmployees();
    } catch (error) {
      console.error('Error submitting employee:', error);
      setError(error.message || 'Error al procesar el empleado');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error al procesar el empleado',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = employee => {
    setEditingEmployee(employee);
    // Convertir el valor a booleano
    const statusBoolean = isEmployeeActive(employee.emp_is_active);

    setFormData({
      emp_name: employee.emp_name || '',
      emp_phone: employee.emp_phone || '',
      emp_email: employee.emp_email || '',
      emp_position: employee.emp_position || '',
      emp_commission: employee.emp_commission || '',
      emp_dpi: employee.emp_dpi || '',
      emp_is_active: statusBoolean,
      user_id: employee.user_id || currentUserId,
    });
    setShowModal(true);
  };

  const handleDelete = async id => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await deleteEmployee(id);
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'El empleado ha sido eliminado correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
        loadEmployees();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Error al eliminar el empleado',
        });
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    setFormData({
      emp_name: '',
      emp_phone: '',
      emp_email: '',
      emp_position: '',
      emp_commission: '',
      emp_dpi: '',
      emp_is_active: true,
      user_id: currentUserId,
    });
  };

  const filteredEmployees = employees.filter(
    employee =>
      employee.emp_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.emp_position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.emp_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.emp_phone?.includes(searchTerm)
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);

  const handlePageSizeChange = e => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="employees-container">
        <div className="loading">Cargando empleados...</div>
      </div>
    );
  }

  return (
    <div className="employees-container">
      <div className="employees-header">
        <div className="header-left">
          <h1 className="employees-title">
            <Users size={24} weight="bold" />
            Empleados
          </h1>
          <p className="employees-subtitle">
            Gestiona los empleados del sistema
          </p>
        </div>
        <button className="add-employee-btn" onClick={() => setShowModal(true)}>
          <Plus size={20} weight="bold" />
          Agregar Empleado
        </button>
      </div>

      <div className="employees-filters">
        <div className="search-container">
          <MagnifyingGlass size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar empleados..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="pagination-controls">
          <label htmlFor="page-size-select" className="page-size-label">
            Mostrar:
          </label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={handlePageSizeChange}
            className="page-size-select"
          >
            <option value={5}>5</option>
            <option value={7}>7</option>
            <option value={10}>10</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="employees-table-container">
        <table className="employees-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Posición</th>
              <th>Comisión %</th>
              <th>DPI</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEmployees.map(employee => (
              <tr key={employee.emp_id}>
                <td>{employee.emp_id}</td>
                <td className="employee-name">{employee.emp_name}</td>
                <td className="employee-phone">{employee.emp_phone || '-'}</td>
                <td className="employee-email">{employee.emp_email || '-'}</td>
                <td className="employee-position">{employee.emp_position}</td>
                <td className="employee-commission">
                  {employee.emp_commission
                    ? `Q${employee.emp_commission}`
                    : 'Q0'}
                </td>
                <td className="employee-dpi">{employee.emp_dpi || '-'}</td>
                <td className="employee-status">
                  <span
                    className={`status-badge ${
                      isEmployeeActive(employee.emp_is_active)
                        ? 'active'
                        : 'inactive'
                    }`}
                  >
                    {isEmployeeActive(employee.emp_is_active)
                      ? 'ACTIVO'
                      : 'INACTIVO'}
                  </span>
                </td>
                <td className="employee-actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEdit(employee)}
                    title="Editar"
                  >
                    <PencilSimple size={16} weight="bold" />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(employee.emp_id)}
                    title="Eliminar"
                  >
                    <Trash size={16} weight="bold" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredEmployees.length === 0 && (
          <div className="no-employees">
            <Users size={48} weight="light" />
            <p>No se encontraron empleados</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredEmployees.length > 0 && (
        <div className="pagination">
          <div className="pagination-info">
            Mostrando {startIndex + 1} -{' '}
            {Math.min(endIndex, filteredEmployees.length)} de{' '}
            {filteredEmployees.length} empleados
          </div>
          <div className="pagination-buttons">
            <button
              className="pagination-btn"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              title="Página anterior"
            >
              <ArrowLeft size={20} weight="bold" />
            </button>
            <span className="pagination-page-info">
              Página {currentPage} de {totalPages}
            </span>
            <button
              className="pagination-btn"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              title="Página siguiente"
            >
              <ArrowRight size={20} weight="bold" />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {editingEmployee ? 'Editar Empleado' : 'Agregar Empleado'}
              </h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <X size={24} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="employee-form">
              <div className="form-group">
                <label htmlFor="emp_name">Nombre del Empleado</label>
                <input
                  type="text"
                  id="emp_name"
                  name="emp_name"
                  value={formData.emp_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Ingresa el nombre del empleado"
                />
              </div>

              <div className="form-group">
                <label htmlFor="emp_phone">Teléfono</label>
                <input
                  type="text"
                  id="emp_phone"
                  name="emp_phone"
                  value={formData.emp_phone}
                  onChange={handleInputChange}
                  placeholder="Ingresa el teléfono"
                />
              </div>

              <div className="form-group">
                <label htmlFor="emp_email">Email</label>
                <input
                  type="email"
                  id="emp_email"
                  name="emp_email"
                  value={formData.emp_email}
                  onChange={handleInputChange}
                  placeholder="Ingresa el email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="emp_position">Posición</label>
                <input
                  type="text"
                  id="emp_position"
                  name="emp_position"
                  value={formData.emp_position}
                  onChange={handleInputChange}
                  required
                  placeholder="Ingresa la posición"
                />
              </div>

              <div className="form-group">
                <label htmlFor="emp_commission">Comisión %</label>
                <input
                  type="number"
                  id="emp_commission"
                  name="emp_commission"
                  value={formData.emp_commission}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="emp_dpi">DPI</label>
                <input
                  type="number"
                  id="emp_dpi"
                  name="emp_dpi"
                  value={formData.emp_dpi}
                  onChange={handleInputChange}
                  placeholder="Ingresa el DPI"
                />
              </div>

              <div className="form-group">
                <label htmlFor="emp_is_active">Estado</label>
                <select
                  id="emp_is_active"
                  name="emp_is_active"
                  value={formData.emp_is_active ? 'true' : 'false'}
                  onChange={handleInputChange}
                  required
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCloseModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={submitting}
                >
                  {submitting
                    ? 'Procesando...'
                    : (editingEmployee ? 'Actualizar' : 'Crear') + ' Empleado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
