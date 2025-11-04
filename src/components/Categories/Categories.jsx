import React, { useState, useEffect } from 'react';
import {
  Plus,
  PencilSimple,
  Trash,
  Tag,
  MagnifyingGlass,
  X,
  ArrowLeft,
  ArrowRight,
} from 'phosphor-react';
import Swal from 'sweetalert2';
import './Categories.css';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../api/categoriesService.js';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formData, setFormData] = useState({
    cat_name: '',
    cat_description: '',
    cat_status: 'active',
  });

  // Load data on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Helper function para determinar si una categoría está activa
  const isCategoryActive = status => {
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

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories(100, 0);
      // El backend devuelve { data: categories, total: ... }
      const categoriesData = response.data || response;

      // Debug: Log para ver qué datos estamos recibiendo
      console.log('Response completa:', response);
      console.log('Categories data:', categoriesData);
      if (categoriesData && categoriesData.length > 0) {
        console.log('Primera categoría:', categoriesData[0]);
        console.log(
          'Estado de la primera categoría:',
          categoriesData[0].cat_status
        );
      }

      setCategories(categoriesData);
    } catch (error) {
      setError('Error al cargar las categorías');
      console.error('Error loading categories:', error);
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

      const categoryData = {
        ...formData,
      };

      // Validate required fields
      if (!categoryData.cat_name.trim()) {
        throw new Error('El nombre de la categoría es requerido');
      }
      if (!categoryData.cat_description.trim()) {
        throw new Error('La descripción de la categoría es requerida');
      }

      if (editingCategory) {
        await updateCategory(editingCategory.cat_id, categoryData);
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Categoría actualizada correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await createCategory(categoryData);
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Categoría creada correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
      }

      setShowModal(false);
      setEditingCategory(null);
      setFormData({
        cat_name: '',
        cat_description: '',
        cat_status: 'active',
      });
      loadCategories();
    } catch (error) {
      console.error('Error submitting category:', error);
      setError(error.message || 'Error al procesar la categoría');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error al procesar la categoría',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = category => {
    setEditingCategory(category);
    // Convertir el boolean a string para el select
    const statusString = isCategoryActive(category.cat_status)
      ? 'active'
      : 'inactive';

    setFormData({
      cat_name: category.cat_name,
      cat_description: category.cat_description,
      cat_status: statusString,
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
        await deleteCategory(id);
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'La categoría ha sido eliminada correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
        loadCategories();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Error al eliminar la categoría',
        });
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      cat_name: '',
      cat_description: '',
      cat_status: 'active',
    });
  };

  const filteredCategories = categories.filter(
    category =>
      category.cat_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.cat_description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredCategories.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

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
      <div className="categories-container">
        <div className="loading">Cargando categorías...</div>
      </div>
    );
  }

  return (
    <div className="categories-container">
      <div className="categories-header">
        <div className="header-left">
          <h1 className="categories-title">
            <Tag size={24} weight="bold" />
            Categorías
          </h1>
          <p className="categories-subtitle">
            Gestiona las categorías de productos
          </p>
        </div>
        <button className="add-category-btn" onClick={() => setShowModal(true)}>
          <Plus size={20} weight="bold" />
          Agregar Categoría
        </button>
      </div>

      <div className="categories-filters">
        <div className="search-container">
          <MagnifyingGlass size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar categorías..."
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

      <div className="categories-table-container">
        <table className="categories-table">
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
            {paginatedCategories.map(category => (
              <tr key={category.cat_id}>
                <td>{category.cat_id}</td>
                <td className="category-name">{category.cat_name}</td>
                <td className="category-description">
                  {category.cat_description}
                </td>
                <td className="category-status">
                  <span
                    className={`status-badge ${
                      isCategoryActive(category.cat_status)
                        ? 'active'
                        : 'inactive'
                    }`}
                  >
                    {isCategoryActive(category.cat_status)
                      ? 'ACTIVO'
                      : 'INACTIVO'}
                  </span>
                </td>
                <td className="category-actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEdit(category)}
                    title="Editar"
                  >
                    <PencilSimple size={16} weight="bold" />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(category.cat_id)}
                    title="Eliminar"
                  >
                    <Trash size={16} weight="bold" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCategories.length === 0 && (
          <div className="no-categories">
            <Tag size={48} weight="light" />
            <p>No se encontraron categorías</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredCategories.length > 0 && (
        <div className="pagination">
          <div className="pagination-info">
            Mostrando {startIndex + 1} -{' '}
            {Math.min(endIndex, filteredCategories.length)} de{' '}
            {filteredCategories.length} categorías
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
                {editingCategory ? 'Editar Categoría' : 'Agregar Categoría'}
              </h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <X size={24} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="category-form">
              <div className="form-group">
                <label htmlFor="cat_name">Nombre de la Categoría</label>
                <input
                  type="text"
                  id="cat_name"
                  name="cat_name"
                  value={formData.cat_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Ingresa el nombre de la categoría"
                />
              </div>

              <div className="form-group">
                <label htmlFor="cat_description">Descripción</label>
                <textarea
                  id="cat_description"
                  name="cat_description"
                  value={formData.cat_description}
                  onChange={handleInputChange}
                  required
                  placeholder="Ingresa la descripción de la categoría"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="cat_status">Estado</label>
                <select
                  id="cat_status"
                  name="cat_status"
                  value={formData.cat_status}
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
                    : (editingCategory ? 'Actualizar' : 'Crear') + ' Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
