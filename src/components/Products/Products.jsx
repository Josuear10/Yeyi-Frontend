import React, { useState, useEffect } from 'react';
import {
  Plus,
  PencilSimple,
  Trash,
  Package,
  MagnifyingGlass,
  X,
  ArrowLeft,
  ArrowRight,
} from 'phosphor-react';
import Swal from 'sweetalert2';
import './Products.css';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from '../../api/productsService.js';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formData, setFormData] = useState({
    prod_name: '',
    prod_description: '',
    prod_price: '',
    prod_stock: '',
    cat_id: '',
  });

  // Load data on component mount
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts(100, 0);
      const productsData = response.data || response;

      // Ensure all products have valid numeric prices
      const validatedProducts = productsData.map(product => ({
        ...product,
        prod_price:
          typeof product.prod_price === 'number'
            ? product.prod_price
            : parseFloat(product.prod_price) || 0,
        prod_stock:
          typeof product.prod_stock === 'number'
            ? product.prod_stock
            : parseInt(product.prod_stock) || 0,
      }));

      setProducts(validatedProducts);
    } catch (error) {
      setError('Error al cargar los productos');
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response);
    } catch (error) {
      console.error('Error loading categories:', error);
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

      const productData = {
        ...formData,
        prod_price: parseFloat(formData.prod_price) || 0,
        prod_stock: parseInt(formData.prod_stock) || 0,
        cat_id: parseInt(formData.cat_id) || 1,
      };

      // Validate required fields
      if (!productData.prod_name.trim()) {
        throw new Error('El nombre del producto es requerido');
      }
      if (!productData.prod_description.trim()) {
        throw new Error('La descripción del producto es requerida');
      }
      if (productData.prod_price <= 0) {
        throw new Error('El precio debe ser mayor a 0');
      }
      if (productData.prod_stock < 0) {
        throw new Error('El stock no puede ser negativo');
      }

      if (editingProduct) {
        await updateProduct(editingProduct.prod_id, productData);
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Producto actualizado correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await createProduct(productData);
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Producto creado correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
      }

      setShowModal(false);
      setEditingProduct(null);
      setFormData({
        prod_name: '',
        prod_description: '',
        prod_price: '',
        prod_stock: '',
        cat_id: '',
      });
      loadProducts();
    } catch (error) {
      console.error('Error submitting product:', error);
      setError(error.message || 'Error al procesar el producto');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error al procesar el producto',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = product => {
    setEditingProduct(product);
    setFormData({
      prod_name: product.prod_name,
      prod_description: product.prod_description,
      prod_price: product.prod_price.toString(),
      prod_stock: product.prod_stock.toString(),
      cat_id: product.cat_id.toString(),
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
        await deleteProduct(id);
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'El producto ha sido eliminado correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
        loadProducts();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Error al eliminar el producto',
        });
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      prod_name: '',
      prod_description: '',
      prod_price: '',
      prod_stock: '',
      cat_id: '',
    });
  };

  const filteredProducts = products.filter(
    product =>
      product.prod_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.prod_description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

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

  const getCategoryName = catId => {
    const category = categories.find(cat => cat.cat_id === catId);
    return category ? category.cat_name : 'Sin categoría';
  };

  if (loading) {
    return (
      <div className="products-container">
        <div className="loading">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="products-container">
      <div className="products-header">
        <div className="header-left">
          <h1 className="products-title">
            <Package size={24} weight="bold" />
            Productos
          </h1>
          <p className="products-subtitle">
            Gestiona tu inventario de productos
          </p>
        </div>
        <button className="add-product-btn" onClick={() => setShowModal(true)}>
          <Plus size={20} weight="bold" />
          Agregar Producto
        </button>
      </div>

      <div className="products-filters">
        <div className="search-container">
          <MagnifyingGlass size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar productos..."
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

      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>NOMBRE</th>
              <th>DESCRIPCIÓN</th>
              <th>PRECIO</th>
              <th>STOCK</th>
              <th>CATEGORÍA</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map(product => (
              <tr key={product.prod_id}>
                <td>{product.prod_id}</td>
                <td className="product-name">{product.prod_name}</td>
                <td className="product-description">
                  {product.prod_description}
                </td>
                <td className="product-price">
                  Q{product.prod_price.toFixed(2)}
                </td>
                <td className="product-stock">{product.prod_stock}</td>
                <td className="product-category">
                  {getCategoryName(product.cat_id)}
                </td>
                <td className="product-actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEdit(product)}
                    title="Editar"
                  >
                    <PencilSimple size={16} weight="bold" />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(product.prod_id)}
                    title="Eliminar"
                  >
                    <Trash size={16} weight="bold" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="no-products">
            <Package size={48} weight="light" />
            <p>No se encontraron productos</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredProducts.length > 0 && (
        <div className="pagination">
          <div className="pagination-info">
            Mostrando {startIndex + 1} -{' '}
            {Math.min(endIndex, filteredProducts.length)} de{' '}
            {filteredProducts.length} productos
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
              <h2>{editingProduct ? 'Editar Producto' : 'Agregar Producto'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <X size={24} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-group">
                <label htmlFor="prod_name">Nombre del Producto</label>
                <input
                  type="text"
                  id="prod_name"
                  name="prod_name"
                  value={formData.prod_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Ingresa el nombre del producto"
                />
              </div>

              <div className="form-group">
                <label htmlFor="prod_description">Descripción</label>
                <textarea
                  id="prod_description"
                  name="prod_description"
                  value={formData.prod_description}
                  onChange={handleInputChange}
                  required
                  placeholder="Ingresa la descripción del producto"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="prod_price">Precio</label>
                  <input
                    type="number"
                    id="prod_price"
                    name="prod_price"
                    value={formData.prod_price}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="prod_stock">Stock</label>
                  <input
                    type="number"
                    id="prod_stock"
                    name="prod_stock"
                    value={formData.prod_stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="cat_id">Categoría</label>
                <select
                  id="cat_id"
                  name="cat_id"
                  value={formData.cat_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map(category => (
                    <option key={category.cat_id} value={category.cat_id}>
                      {category.cat_name}
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
                    : (editingProduct ? 'Actualizar' : 'Crear') + ' Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
