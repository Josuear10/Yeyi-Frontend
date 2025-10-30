import React, { useState, useEffect } from 'react';
import {
  Gear,
  User,
  Lock,
  CheckCircle,
  XCircle,
  Eye,
  EyeSlash,
  PencilSimple,
} from 'phosphor-react';
import Swal from 'sweetalert2';
import './Configuration.css';
import {
  getCurrentUser,
  updateUser,
  changePassword,
  decodeToken,
} from '../../api/userService.js';

export default function Configuration() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    user_id: null,
    user_username: '',
    user_first_name: '',
    user_last_name: '',
    user_role: 0,
  });

  // Profile update form
  const [profileForm, setProfileForm] = useState({
    user_first_name: '',
    user_last_name: '',
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
  });

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Update password strength indicator
  useEffect(() => {
    if (passwordForm.new_password) {
      calculatePasswordStrength(passwordForm.new_password);
    } else {
      setPasswordStrength({ score: 0, feedback: '' });
    }
  }, [passwordForm.new_password]);

  const calculatePasswordStrength = password => {
    let score = 0;
    let feedback = [];

    if (password.length >= 8) score += 1;
    else feedback.push('Al menos 8 caracteres');

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    else feedback.push('Mayúsculas y minúsculas');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Al menos un número');

    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else feedback.push('Al menos un carácter especial');

    const strengthLabels = [
      'Muy débil',
      'Débil',
      'Regular',
      'Fuerte',
      'Muy fuerte',
    ];
    setPasswordStrength({
      score,
      feedback: feedback.length > 0 ? feedback.join(', ') : 'Contraseña segura',
    });
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (token) {
        try {
          const user = await getCurrentUser();
          setUserData(user);
          setProfileForm({
            user_first_name: user.user_first_name || '',
            user_last_name: user.user_last_name || '',
          });
        } catch (apiError) {
          console.warn('API call failed, using token decode:', apiError);
          const decodedToken = decodeToken(token);
          if (decodedToken) {
            const user = {
              user_id: decodedToken.user_id,
              user_username: decodedToken.user_username,
              user_first_name: decodedToken.user_first_name || '',
              user_last_name: decodedToken.user_last_name || '',
              user_role: decodedToken.user_role || 0,
            };
            setUserData(user);
            setProfileForm({
              user_first_name: user.user_first_name || '',
              user_last_name: user.user_last_name || '',
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la información del usuario',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileInputChange = e => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordInputChange = e => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = field => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const getRoleText = role => {
    switch (role) {
      case 1:
        return 'Administrador';
      case 2:
        return 'Empleado';
      default:
        return 'Usuario';
    }
  };

  const handleProfileSubmit = async e => {
    e.preventDefault();
    try {
      setSavingProfile(true);

      if (
        !profileForm.user_first_name.trim() &&
        !profileForm.user_last_name.trim()
      ) {
        throw new Error('Al menos el nombre o apellido debe ser completado');
      }

      const response = await updateUser(profileForm);
      setUserData(prev => ({
        ...prev,
        user_first_name: response.user.user_first_name,
        user_last_name: response.user.user_last_name,
      }));

      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Perfil actualizado correctamente',
        timer: 2000,
        showConfirmButton: false,
      });

      // Dispatch custom event to notify other components
      window.dispatchEvent(
        new CustomEvent('userProfileUpdated', {
          detail: {
            user_first_name: response.user.user_first_name,
            user_last_name: response.user.user_last_name,
          },
        })
      );

      setEditingProfile(false);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error al actualizar el perfil',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async e => {
    e.preventDefault();
    try {
      setChangingPassword(true);

      if (!passwordForm.current_password || !passwordForm.new_password) {
        throw new Error('Todos los campos son requeridos');
      }

      if (passwordForm.new_password.length < 6) {
        throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
      }

      if (passwordForm.new_password !== passwordForm.confirm_password) {
        throw new Error('Las contraseñas no coinciden');
      }

      if (passwordForm.current_password === passwordForm.new_password) {
        throw new Error('La nueva contraseña debe ser diferente a la actual');
      }

      await changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });

      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Contraseña actualizada correctamente',
        timer: 2000,
        showConfirmButton: false,
      });

      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error al cambiar la contraseña',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const cancelProfileEdit = () => {
    setProfileForm({
      user_first_name: userData.user_first_name || '',
      user_last_name: userData.user_last_name || '',
    });
    setEditingProfile(false);
  };

  const getPasswordStrengthColor = score => {
    if (score <= 1) return '#dc2626';
    if (score === 2) return '#f59e0b';
    if (score === 3) return '#10b981';
    return '#059669';
  };

  if (loading) {
    return (
      <div className="configuration-container">
        <div className="loading">Cargando configuración...</div>
      </div>
    );
  }

  return (
    <div className="configuration-container">
      <div className="configuration-header">
        <div className="header-left">
          <h1 className="configuration-title">
            <Gear size={24} weight="bold" />
            Configuración
          </h1>
          <p className="configuration-subtitle">
            Gestiona tu perfil y preferencias de cuenta
          </p>
        </div>
      </div>

      <div className="configuration-content">
        {/* Profile Section */}
        <div className="config-card">
          <div className="card-header">
            <div className="card-title">
              <User size={20} weight="bold" />
              <span>Información del Perfil</span>
            </div>
            {!editingProfile && (
              <button
                className="edit-btn"
                onClick={() => setEditingProfile(true)}
              >
                <PencilSimple size={16} weight="bold" />
                Editar
              </button>
            )}
          </div>

          <div className="card-content">
            {!editingProfile ? (
              <div className="profile-display">
                <div className="profile-field">
                  <label>Usuario</label>
                  <div className="field-value">{userData.user_username}</div>
                </div>
                <div className="profile-field">
                  <label>Nombre</label>
                  <div className="field-value">
                    {userData.user_first_name || 'No especificado'}
                  </div>
                </div>
                <div className="profile-field">
                  <label>Apellido</label>
                  <div className="field-value">
                    {userData.user_last_name || 'No especificado'}
                  </div>
                </div>
                <div className="profile-field">
                  <label>Rol</label>
                  <div className="field-value">
                    {getRoleText(userData.user_role)}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit} className="profile-form">
                <div className="form-group">
                  <label htmlFor="user_first_name">Nombre</label>
                  <input
                    type="text"
                    id="user_first_name"
                    name="user_first_name"
                    value={profileForm.user_first_name}
                    onChange={handleProfileInputChange}
                    placeholder="Ingresa tu nombre"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="user_last_name">Apellido</label>
                  <input
                    type="text"
                    id="user_last_name"
                    name="user_last_name"
                    value={profileForm.user_last_name}
                    onChange={handleProfileInputChange}
                    placeholder="Ingresa tu apellido"
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={cancelProfileEdit}
                    disabled={savingProfile}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={savingProfile}
                  >
                    {savingProfile ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Password Section */}
        <div className="config-card">
          <div className="card-header">
            <div className="card-title">
              <Lock size={20} weight="bold" />
              <span>Cambiar Contraseña</span>
            </div>
          </div>

          <div className="card-content">
            <form onSubmit={handlePasswordSubmit} className="password-form">
              <div className="form-group">
                <label htmlFor="current_password">Contraseña Actual</label>
                <div className="input-with-icon">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    id="current_password"
                    name="current_password"
                    value={passwordForm.current_password}
                    onChange={handlePasswordInputChange}
                    placeholder="Ingresa tu contraseña actual"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPasswords.current ? (
                      <EyeSlash size={20} weight="bold" />
                    ) : (
                      <Eye size={20} weight="bold" />
                    )}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="new_password">Nueva Contraseña</label>
                <div className="input-with-icon">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    id="new_password"
                    name="new_password"
                    value={passwordForm.new_password}
                    onChange={handlePasswordInputChange}
                    placeholder="Ingresa tu nueva contraseña"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? (
                      <EyeSlash size={20} weight="bold" />
                    ) : (
                      <Eye size={20} weight="bold" />
                    )}
                  </button>
                </div>
                {passwordForm.new_password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      {[0, 1, 2, 3].map(level => (
                        <div
                          key={level}
                          className={`strength-segment ${
                            level < passwordStrength.score ? 'active' : ''
                          }`}
                          style={{
                            backgroundColor:
                              level < passwordStrength.score
                                ? getPasswordStrengthColor(
                                    passwordStrength.score
                                  )
                                : '#e5e7eb',
                          }}
                        />
                      ))}
                    </div>
                    <span
                      className="strength-text"
                      style={{
                        color: getPasswordStrengthColor(passwordStrength.score),
                      }}
                    >
                      {passwordStrength.feedback ||
                        (passwordStrength.score === 0
                          ? ''
                          : passwordStrength.score <= 1
                          ? 'Muy débil'
                          : passwordStrength.score === 2
                          ? 'Débil'
                          : passwordStrength.score === 3
                          ? 'Regular'
                          : passwordStrength.score === 4
                          ? 'Fuerte'
                          : 'Muy fuerte')}
                    </span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirm_password">
                  Confirmar Nueva Contraseña
                </label>
                <div className="input-with-icon">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    id="confirm_password"
                    name="confirm_password"
                    value={passwordForm.confirm_password}
                    onChange={handlePasswordInputChange}
                    placeholder="Confirma tu nueva contraseña"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? (
                      <EyeSlash size={20} weight="bold" />
                    ) : (
                      <Eye size={20} weight="bold" />
                    )}
                  </button>
                </div>
                {passwordForm.confirm_password &&
                  passwordForm.new_password &&
                  passwordForm.confirm_password !==
                    passwordForm.new_password && (
                    <div className="field-error">
                      <XCircle size={16} weight="bold" />
                      Las contraseñas no coinciden
                    </div>
                  )}
                {passwordForm.confirm_password &&
                  passwordForm.new_password &&
                  passwordForm.confirm_password ===
                    passwordForm.new_password && (
                    <div className="field-success">
                      <CheckCircle size={16} weight="bold" />
                      Las contraseñas coinciden
                    </div>
                  )}
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={
                    changingPassword ||
                    !passwordForm.current_password ||
                    !passwordForm.new_password ||
                    !passwordForm.confirm_password ||
                    passwordForm.new_password !== passwordForm.confirm_password
                  }
                >
                  {changingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
