import React, { useState, useEffect } from 'react';
import {
  Plus,
  PencilSimple,
  Trash,
  ShoppingCart,
  MagnifyingGlass,
  X,
  ListBullets,
} from 'phosphor-react';
import Swal from 'sweetalert2';
import './Sales.css';
import {
  getSales,
  createSale,
  updateSale,
  deleteSale,
} from '../../api/salesService.js';
import { getEmployees } from '../../api/employeesService.js';
import { getPayments } from '../../api/paymentsService.js';
import { getDetailsBySaleId } from '../../api/detailsService.js';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [saleDetails, setSaleDetails] = useState([]);
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [formData, setFormData] = useState({
    emp_id: '',
    sale_date: '',
    sale_total: '',
    pay_id: '',
  });

  // Load data on component mount
  useEffect(() => {
    loadSales();
    loadEmployees();
    loadPayments();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const response = await getSales(100, 0);
      const salesData = response.data || response;

      setSales(salesData);
    } catch (error) {
      setError('Error al cargar las ventas');
      console.error('Error loading sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const employeesData = await getEmployees(100, 0);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadPayments = async () => {
    try {
      const paymentsData = await getPayments(100, 0);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error loading payment methods:', error);
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
      setError('');
      setSubmitting(true);

      const saleData = {
        emp_id: parseInt(formData.emp_id),
        sale_date: formData.sale_date,
        sale_total: parseFloat(formData.sale_total),
        pay_id: parseInt(formData.pay_id),
      };

      // Validate required fields
      if (!saleData.emp_id || isNaN(saleData.emp_id)) {
        throw new Error('El empleado es requerido');
      }
      if (!saleData.sale_date.trim()) {
        throw new Error('La fecha de venta es requerida');
      }
      if (
        !saleData.sale_total ||
        isNaN(saleData.sale_total) ||
        saleData.sale_total <= 0
      ) {
        throw new Error(
          'El total de la venta debe ser un número válido mayor a 0'
        );
      }
      if (!saleData.pay_id || isNaN(saleData.pay_id)) {
        throw new Error('El método de pago es requerido');
      }

      if (editingSale) {
        await updateSale(editingSale.sale_id, saleData);
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Venta actualizada correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await createSale(saleData);
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Venta creada correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
      }

      setShowModal(false);
      setEditingSale(null);
      setFormData({
        emp_id: '',
        sale_date: '',
        sale_total: '',
        pay_id: '',
      });
      loadSales();
    } catch (error) {
      console.error('Error submitting sale:', error);
      setError(error.message || 'Error al procesar la venta');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error al procesar la venta',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = sale => {
    setEditingSale(sale);
    setFormData({
      emp_id: sale.emp_id?.toString() || '',
      sale_date: sale.sale_date ? sale.sale_date.split('T')[0] : '',
      sale_total: sale.sale_total?.toString() || '',
      pay_id: sale.pay_id?.toString() || '',
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
        await deleteSale(id);
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'La venta ha sido eliminada correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
        loadSales();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Error al eliminar la venta',
        });
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSale(null);
    setFormData({
      emp_id: '',
      sale_date: '',
      sale_total: '',
      pay_id: '',
    });
  };

  const handleShowDetails = async saleId => {
    try {
      setLoadingDetails(true);
      setSelectedSaleId(saleId);
      const details = await getDetailsBySaleId(saleId);
      setSaleDetails(details);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error loading sale details:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los detalles de la venta',
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSaleDetails([]);
    setSelectedSaleId(null);
  };

  const formatDate = dateString => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = amount => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
    }).format(amount);
  };

  const getEmployeeName = empId => {
    const employee = employees.find(emp => emp.emp_id === empId);
    return employee
      ? employee.emp_name || `Empleado #${empId}`
      : `Empleado #${empId}`;
  };

  const getPaymentName = payId => {
    const payment = payments.find(pay => pay.pay_id === payId);
    return payment
      ? payment.pay_method || `Método #${payId}`
      : `Método #${payId}`;
  };

  const filteredSales = sales.filter(sale => {
    const searchLower = searchTerm.toLowerCase();
    const employeeName = getEmployeeName(sale.emp_id).toLowerCase();
    const paymentName = getPaymentName(sale.pay_id).toLowerCase();
    const dateStr = formatDate(sale.sale_date).toLowerCase();
    const totalStr = formatCurrency(sale.sale_total).toLowerCase();

    return (
      sale.sale_id?.toString().includes(searchLower) ||
      employeeName.includes(searchLower) ||
      paymentName.includes(searchLower) ||
      dateStr.includes(searchLower) ||
      totalStr.includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="sales-container">
        <div className="loading">Cargando ventas...</div>
      </div>
    );
  }

  return (
    <div className="sales-container">
      <div className="sales-header">
        <div className="header-left">
          <h1 className="sales-title">
            <ShoppingCart size={24} weight="bold" />
            Ventas
          </h1>
          <p className="sales-subtitle">Gestiona las ventas realizadas</p>
        </div>
        <button className="add-sale-btn" onClick={() => setShowModal(true)}>
          <Plus size={20} weight="bold" />
          Agregar Venta
        </button>
      </div>

      <div className="sales-filters">
        <div className="search-container">
          <MagnifyingGlass size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar ventas..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="sales-table-container">
        <table className="sales-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Empleado</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Método de Pago</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map(sale => (
              <tr key={sale.sale_id}>
                <td>{sale.sale_id}</td>
                <td className="sale-employee">
                  {getEmployeeName(sale.emp_id)}
                </td>
                <td className="sale-date">{formatDate(sale.sale_date)}</td>
                <td className="sale-total">
                  <span
                    className="sale-total-clickable"
                    onClick={() => handleShowDetails(sale.sale_id)}
                    onMouseEnter={e => {
                      e.currentTarget.style.cursor = 'pointer';
                    }}
                    title="Click para ver detalles"
                  >
                    {formatCurrency(sale.sale_total)}
                  </span>
                </td>
                <td className="sale-payment">{getPaymentName(sale.pay_id)}</td>
                <td className="sale-actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEdit(sale)}
                    title="Editar"
                  >
                    <PencilSimple size={16} weight="bold" />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(sale.sale_id)}
                    title="Eliminar"
                  >
                    <Trash size={16} weight="bold" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSales.length === 0 && (
          <div className="no-sales">
            <ShoppingCart size={48} weight="light" />
            <p>No se encontraron ventas</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingSale ? 'Editar Venta' : 'Agregar Venta'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <X size={24} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="sale-form">
              <div className="form-group">
                <label htmlFor="emp_id">Empleado</label>
                <select
                  id="emp_id"
                  name="emp_id"
                  value={formData.emp_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar empleado</option>
                  {employees.map(employee => (
                    <option key={employee.emp_id} value={employee.emp_id}>
                      {employee.emp_name || `Empleado #${employee.emp_id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="sale_date">Fecha de Venta</label>
                <input
                  type="date"
                  id="sale_date"
                  name="sale_date"
                  value={formData.sale_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="sale_total">Total</label>
                <input
                  type="number"
                  id="sale_total"
                  name="sale_total"
                  value={formData.sale_total}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="pay_id">Método de Pago</label>
                <select
                  id="pay_id"
                  name="pay_id"
                  value={formData.pay_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar método de pago</option>
                  {payments.map(payment => (
                    <option key={payment.pay_id} value={payment.pay_id}>
                      {payment.pay_method}
                    </option>
                  ))}
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
                    : (editingSale ? 'Actualizar' : 'Crear') + ' Venta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && (
        <div className="modal-overlay" onClick={handleCloseDetailsModal}>
          <div
            className="modal-content details-modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                <ListBullets
                  size={20}
                  weight="bold"
                  style={{ marginRight: '8px' }}
                />
                Detalles de la Venta #{selectedSaleId}
              </h2>
              <button className="close-btn" onClick={handleCloseDetailsModal}>
                <X size={24} weight="bold" />
              </button>
            </div>

            <div className="details-content">
              {loadingDetails ? (
                <div className="loading-details">Cargando detalles...</div>
              ) : saleDetails.length === 0 ? (
                <div className="no-details">
                  <ListBullets size={48} weight="light" />
                  <p>No se encontraron detalles para esta venta</p>
                </div>
              ) : (
                <div className="details-table-wrapper">
                  <table className="details-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio Unitario</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {saleDetails.map(detail => (
                        <tr key={detail.det_id}>
                          <td className="detail-product">
                            <div className="product-info">
                              <span className="product-name">
                                {detail.prod_name ||
                                  `Producto #${detail.prod_id}`}
                              </span>
                              {detail.prod_description && (
                                <span className="product-description">
                                  {detail.prod_description}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="detail-quantity">
                            {detail.det_quantity}
                          </td>
                          <td className="detail-unit-price">
                            {formatCurrency(detail.det_unit_price)}
                          </td>
                          <td className="detail-subtotal">
                            {formatCurrency(
                              (() => {
                                // Intentar usar det_subtotal si existe y es válido
                                if (
                                  detail.det_subtotal != null &&
                                  !isNaN(detail.det_subtotal)
                                ) {
                                  return Number(detail.det_subtotal);
                                }
                                // Calcular: cantidad * precio unitario
                                const quantity =
                                  detail.det_quantity != null &&
                                  !isNaN(detail.det_quantity)
                                    ? Number(detail.det_quantity)
                                    : 0;
                                const unitPrice =
                                  detail.det_unit_price != null &&
                                  !isNaN(detail.det_unit_price)
                                    ? Number(detail.det_unit_price)
                                    : 0;
                                return quantity * unitPrice;
                              })()
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" className="total-label">
                          <strong>Total de la Venta:</strong>
                        </td>
                        <td className="total-amount">
                          <strong>
                            {formatCurrency(
                              (() => {
                                // Primero intentar usar el sale_total de la venta
                                const selectedSale = sales.find(
                                  s => s.sale_id === selectedSaleId
                                );
                                if (
                                  selectedSale &&
                                  selectedSale.sale_total != null &&
                                  !isNaN(selectedSale.sale_total)
                                ) {
                                  return selectedSale.sale_total;
                                }
                                // Si no está disponible, calcular sumando los detalles
                                return saleDetails.reduce((sum, detail) => {
                                  let subtotal = 0;
                                  // Intentar usar det_subtotal si existe y es válido
                                  if (
                                    detail.det_subtotal != null &&
                                    !isNaN(detail.det_subtotal)
                                  ) {
                                    subtotal = Number(detail.det_subtotal);
                                  } else {
                                    // Calcular: cantidad * precio unitario
                                    const quantity =
                                      detail.det_quantity != null &&
                                      !isNaN(detail.det_quantity)
                                        ? Number(detail.det_quantity)
                                        : 0;
                                    const unitPrice =
                                      detail.det_unit_price != null &&
                                      !isNaN(detail.det_unit_price)
                                        ? Number(detail.det_unit_price)
                                        : 0;
                                    subtotal = quantity * unitPrice;
                                  }
                                  return sum + subtotal;
                                }, 0);
                              })()
                            )}
                          </strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
