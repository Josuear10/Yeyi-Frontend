import React, { useState, useEffect } from 'react';
import {
  Plus,
  PencilSimple,
  Trash,
  CreditCard,
  MagnifyingGlass,
  X,
  ArrowLeft,
  ArrowRight,
} from 'phosphor-react';
import Swal from 'sweetalert2';
import './PaymentMethods.css';
import {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
} from '../../api/paymentsService.js';

export default function PaymentMethods() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formData, setFormData] = useState({
    pay_method: '',
    pay_description: '',
    pay_is_active: 'active',
  });

  // Load data on component mount
  useEffect(() => {
    loadPayments();
  }, []);

  // Helper function para determinar si un método de pago está activo
  const isPaymentActive = status => {
    // Si es boolean, devolver directamente
    if (typeof status === 'boolean') {
      return status;
    }
    // Si es string 'active', devolver true
    if (
      typeof status === 'string' &&
      status.toLowerCase().trim() === 'active'
    ) {
      return true;
    }
    // Si es true (1, true, etc), devolver true
    if (
      status === 1 ||
      status === '1' ||
      status === true ||
      status === 'true'
    ) {
      return true;
    }
    // Por defecto, inactivo
    return false;
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await getPayments(100, 0);
      // El backend devuelve { data: payments, total: ... }
      const paymentsData = response.data || response;

      // Debug: Log para ver qué datos estamos recibiendo
      console.log('Response completa:', response);
      console.log('Payments data:', paymentsData);
      if (paymentsData && paymentsData.length > 0) {
        console.log('Primer método de pago:', paymentsData[0]);
        console.log(
          'Estado del primer método de pago:',
          paymentsData[0].pay_is_active
        );
      }

      setPayments(paymentsData);
    } catch (error) {
      setError('Error al cargar los métodos de pago');
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      setError(''); // Clear previous errors
      setSubmitting(true);

      const paymentData = {
        ...formData,
        // Convertir 'active'/'inactive' a boolean según el backend
        pay_is_active: formData.pay_is_active === 'active' ? true : false,
      };

      // Validate required fields
      if (!paymentData.pay_method.trim()) {
        throw new Error('El nombre del método de pago es requerido');
      }
      if (!paymentData.pay_description.trim()) {
        throw new Error('La descripción del método de pago es requerida');
      }

      if (editingPayment) {
        await updatePayment(editingPayment.pay_id, paymentData);
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Método de pago actualizado correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await createPayment(paymentData);
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Método de pago creado correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
      }

      setShowModal(false);
      setEditingPayment(null);
      setFormData({
        pay_method: '',
        pay_description: '',
        pay_is_active: 'active',
      });
      loadPayments();
    } catch (error) {
      console.error('Error submitting payment:', error);
      setError(error.message || 'Error al procesar el método de pago');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error al procesar el método de pago',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = payment => {
    setEditingPayment(payment);
    // Convertir el boolean a string para el select
    const statusString = isPaymentActive(payment.pay_is_active)
      ? 'active'
      : 'inactive';

    setFormData({
      pay_method: payment.pay_method,
      pay_description: payment.pay_description,
      pay_is_active: statusString,
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
        await deletePayment(id);
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'El método de pago ha sido eliminado correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
        loadPayments();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Error al eliminar el método de pago',
        });
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPayment(null);
    setFormData({
      pay_method: '',
      pay_description: '',
      pay_is_active: 'active',
    });
  };

  const filteredPayments = payments.filter(
    payment =>
      payment.pay_method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.pay_description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredPayments.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

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
      <div className="payments-container">
        <div className="loading">Cargando métodos de pago...</div>
      </div>
    );
  }

  return (
    <div className="payments-container">
      <div className="payments-header">
        <div className="header-left">
          <h1 className="payments-title">
            <CreditCard size={24} weight="bold" />
            Métodos de Pago
          </h1>
          <p className="payments-subtitle">
            Gestiona los métodos de pago disponibles
          </p>
        </div>
        <button className="add-payment-btn" onClick={() => setShowModal(true)}>
          <Plus size={20} weight="bold" />
          Agregar Método de Pago
        </button>
      </div>

      <div className="payments-filters">
        <div className="search-container">
          <MagnifyingGlass size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar métodos de pago..."
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

      <div className="payments-table-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPayments.map(payment => (
              <tr key={payment.pay_id}>
                <td>{payment.pay_id}</td>
                <td className="payment-name">{payment.pay_method}</td>
                <td className="payment-description">
                  {payment.pay_description}
                </td>
                <td className="payment-status">
                  <span
                    className={`status-badge ${
                      isPaymentActive(payment.pay_is_active)
                        ? 'active'
                        : 'inactive'
                    }`}
                  >
                    {isPaymentActive(payment.pay_is_active)
                      ? 'ACTIVO'
                      : 'INACTIVO'}
                  </span>
                </td>
                <td className="payment-actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEdit(payment)}
                    title="Editar"
                  >
                    <PencilSimple size={16} weight="bold" />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(payment.pay_id)}
                    title="Eliminar"
                  >
                    <Trash size={16} weight="bold" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPayments.length === 0 && (
          <div className="no-payments">
            <CreditCard size={48} weight="light" />
            <p>No se encontraron métodos de pago</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredPayments.length > 0 && (
        <div className="pagination">
          <div className="pagination-info">
            Mostrando {startIndex + 1} -{' '}
            {Math.min(endIndex, filteredPayments.length)} de{' '}
            {filteredPayments.length} métodos de pago
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
                {editingPayment
                  ? 'Editar Método de Pago'
                  : 'Agregar Método de Pago'}
              </h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <X size={24} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="payment-form">
              <div className="form-group">
                <label htmlFor="pay_method">Nombre del Método de Pago</label>
                <input
                  type="text"
                  id="pay_method"
                  name="pay_method"
                  value={formData.pay_method}
                  onChange={handleInputChange}
                  required
                  placeholder="Ingresa el nombre del método de pago"
                />
              </div>

              <div className="form-group">
                <label htmlFor="pay_description">Descripción</label>
                <textarea
                  id="pay_description"
                  name="pay_description"
                  value={formData.pay_description}
                  onChange={handleInputChange}
                  required
                  placeholder="Ingresa la descripción del método de pago"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="pay_is_active">Estado</label>
                <select
                  id="pay_is_active"
                  name="pay_is_active"
                  value={formData.pay_is_active}
                  onChange={handleInputChange}
                  required
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
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
                    : (editingPayment ? 'Actualizar' : 'Crear') +
                      ' Método de Pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
