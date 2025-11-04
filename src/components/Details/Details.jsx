import React, { useState, useEffect } from 'react';
import {
  Plus,
  PencilSimple,
  Trash,
  ListBullets,
  MagnifyingGlass,
  X,
  ArrowLeft,
  ArrowRight,
} from 'phosphor-react';
import Swal from 'sweetalert2';
import './Details.css';
import {
  getDetails,
  createDetail,
  updateDetail,
  deleteDetail,
} from '../../api/detailsService.js';
import { getSales } from '../../api/salesService.js';
import { getProducts } from '../../api/productsService.js';

export default function Details() {
  const [details, setDetails] = useState([]);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDetail, setEditingDetail] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formData, setFormData] = useState({
    sale_id: '',
    prod_id: '',
    det_quantity: '',
    det_unit_price: '',
  });

  // Load data on component mount
  useEffect(() => {
    loadDetails();
    loadSales();
    loadProducts();
  }, []);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const response = await getDetails(100, 0);
      const detailsData = response.data || response;
      setDetails(detailsData);
    } catch (error) {
      setError('Error al cargar los detalles');
      console.error('Error loading details:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSales = async () => {
    try {
      const salesData = await getSales(100, 0);
      const salesList = salesData.data || salesData;
      setSales(salesList);
    } catch (error) {
      console.error('Error loading sales:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const productsData = await getProducts(100, 0);
      const productsList = productsData.data || productsData;
      setProducts(productsList);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;

    // Si cambia el producto, cargar el precio automáticamente
    if (name === 'prod_id' && value) {
      const product = products.find(p => p.prod_id === parseInt(value));
      if (product && product.prod_price) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          det_unit_price: product.prod_price.toString(),
        }));
        return;
      }
    }

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

      const detailData = {
        sale_id: parseInt(formData.sale_id),
        prod_id: parseInt(formData.prod_id),
        det_quantity: parseFloat(formData.det_quantity),
        det_unit_price: parseFloat(formData.det_unit_price),
      };

      // Validate required fields
      if (!detailData.sale_id || isNaN(detailData.sale_id)) {
        throw new Error('La venta es requerida');
      }
      if (!detailData.prod_id || isNaN(detailData.prod_id)) {
        throw new Error('El producto es requerido');
      }
      if (
        !detailData.det_quantity ||
        isNaN(detailData.det_quantity) ||
        detailData.det_quantity <= 0
      ) {
        throw new Error('La cantidad debe ser un número válido mayor a 0');
      }
      if (
        !detailData.det_unit_price ||
        isNaN(detailData.det_unit_price) ||
        detailData.det_unit_price <= 0
      ) {
        throw new Error(
          'El precio unitario debe ser un número válido mayor a 0'
        );
      }

      if (editingDetail) {
        await updateDetail(editingDetail.det_id, detailData);
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Detalle actualizado correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await createDetail(detailData);
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Detalle creado correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
      }

      setShowModal(false);
      setEditingDetail(null);
      setFormData({
        sale_id: '',
        prod_id: '',
        det_quantity: '',
        det_unit_price: '',
      });
      loadDetails();
    } catch (error) {
      console.error('Error submitting detail:', error);
      setError(error.message || 'Error al procesar el detalle');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error al procesar el detalle',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = detail => {
    setEditingDetail(detail);
    setFormData({
      sale_id: detail.sale_id?.toString() || '',
      prod_id: detail.prod_id?.toString() || '',
      det_quantity: detail.det_quantity?.toString() || '',
      det_unit_price: detail.det_unit_price?.toString() || '',
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
        await deleteDetail(id);
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'El detalle ha sido eliminado correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
        loadDetails();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Error al eliminar el detalle',
        });
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDetail(null);
    setFormData({
      sale_id: '',
      prod_id: '',
      det_quantity: '',
      det_unit_price: '',
    });
  };

  const formatCurrency = amount => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
    }).format(amount);
  };

  const getSaleInfo = saleId => {
    const sale = sales.find(s => s.sale_id === saleId);
    return sale
      ? `Venta #${saleId} - ${formatCurrency(sale.sale_total)}`
      : `Venta #${saleId}`;
  };

  const getProductName = prodId => {
    const product = products.find(p => p.prod_id === prodId);
    return product
      ? product.prod_name || `Producto #${prodId}`
      : `Producto #${prodId}`;
  };

  const filteredDetails = details.filter(detail => {
    const searchLower = searchTerm.toLowerCase();
    const saleInfo = getSaleInfo(detail.sale_id).toLowerCase();
    const productName = getProductName(detail.prod_id).toLowerCase();
    const quantity = detail.det_quantity?.toString() || '';
    const price = formatCurrency(detail.det_unit_price).toLowerCase();
    const subtotal = formatCurrency(detail.det_subtotal).toLowerCase();

    return (
      detail.det_id?.toString().includes(searchLower) ||
      saleInfo.includes(searchLower) ||
      productName.includes(searchLower) ||
      quantity.includes(searchLower) ||
      price.includes(searchLower) ||
      subtotal.includes(searchLower)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredDetails.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedDetails = filteredDetails.slice(startIndex, endIndex);

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
      <div className="details-container">
        <div className="loading">Cargando detalles...</div>
      </div>
    );
  }

  return (
    <div className="details-container">
      <div className="details-header">
        <div className="header-left">
          <h1 className="details-title">
            <ListBullets size={24} weight="bold" />
            Detalles de Ventas
          </h1>
          <p className="details-subtitle">
            Gestiona los detalles de las ventas
          </p>
        </div>
        <button className="add-detail-btn" onClick={() => setShowModal(true)}>
          <Plus size={20} weight="bold" />
          Agregar Detalle
        </button>
      </div>

      <div className="details-filters">
        <div className="search-container">
          <MagnifyingGlass size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar detalles..."
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

      <div className="details-table-container">
        <table className="details-main-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Venta</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Subtotal</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDetails.map(detail => (
              <tr key={detail.det_id}>
                <td>{detail.det_id}</td>
                <td className="detail-sale">{getSaleInfo(detail.sale_id)}</td>
                <td className="detail-product-name">
                  {getProductName(detail.prod_id)}
                </td>
                <td className="detail-quantity">{detail.det_quantity}</td>
                <td className="detail-unit-price">
                  {formatCurrency(detail.det_unit_price)}
                </td>
                <td className="detail-subtotal">
                  {formatCurrency(
                    detail.det_subtotal ||
                      detail.det_quantity * detail.det_unit_price
                  )}
                </td>
                <td className="detail-actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEdit(detail)}
                    title="Editar"
                  >
                    <PencilSimple size={16} weight="bold" />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(detail.det_id)}
                    title="Eliminar"
                  >
                    <Trash size={16} weight="bold" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredDetails.length === 0 && (
          <div className="no-details">
            <ListBullets size={48} weight="light" />
            <p>No se encontraron detalles</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredDetails.length > 0 && (
        <div className="pagination">
          <div className="pagination-info">
            Mostrando {startIndex + 1} -{' '}
            {Math.min(endIndex, filteredDetails.length)} de{' '}
            {filteredDetails.length} detalles
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
              <h2>{editingDetail ? 'Editar Detalle' : 'Agregar Detalle'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <X size={24} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="detail-form">
              <div className="form-group">
                <label htmlFor="sale_id">Venta</label>
                <select
                  id="sale_id"
                  name="sale_id"
                  value={formData.sale_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar venta</option>
                  {sales.map(sale => (
                    <option key={sale.sale_id} value={sale.sale_id}>
                      Venta #{sale.sale_id} - {formatCurrency(sale.sale_total)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="prod_id">Producto</label>
                <select
                  id="prod_id"
                  name="prod_id"
                  value={formData.prod_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar producto</option>
                  {products.map(product => (
                    <option key={product.prod_id} value={product.prod_id}>
                      {product.prod_name} - {formatCurrency(product.prod_price)}
                    </option>
                  ))}
                </select>
                {formData.prod_id && (
                  <small className="form-hint">
                    El precio se actualizará automáticamente
                  </small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="det_quantity">Cantidad</label>
                <input
                  type="number"
                  id="det_quantity"
                  name="det_quantity"
                  value={formData.det_quantity}
                  onChange={handleInputChange}
                  required
                  min="1"
                  step="1"
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="det_unit_price">Precio Unitario</label>
                <input
                  type="number"
                  id="det_unit_price"
                  name="det_unit_price"
                  value={formData.det_unit_price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
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
                    : (editingDetail ? 'Actualizar' : 'Crear') + ' Detalle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
