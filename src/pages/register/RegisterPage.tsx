import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BigActionButton } from '@/shared/ui/BigActionButton/BigActionButton';
import styles from './RegisterPage.module.css';
import { Header } from '@/widgets/Header';
import React from 'react';

type UserRole = 'customer' | 'contractor';

export const RegisterPage = () => {
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [contractorType, setContractorType] = useState<'master' | 'company'>('master');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    postcode: '',
    password: '',
    confirm_password: '',
  });

  const navigate = useNavigate();

  const handleSelectType = (type: UserRole) => {
    setUserRole(type);
    setStep('form');
  };

  // ИСПРАВЛЕНО: Используем e.target.name вместо e.target.id
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value, // Изменено с e.target.id на e.target.name
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      alert('Паролі не співпадають!');
      return;
    }

    // ИСПРАВЛЕНО: Формируем правильные данные для отправки
    const submitData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
      email: formData.email,
      postcode: formData.postcode,
      password: formData.password,
      confirm_password: formData.confirm_password,
      user_role: userRole, // Используем актуальное значение userRole
      contractorType: userRole === 'contractor' ? contractorType : undefined,
    };

    console.log('Дані, які відправляються:', submitData);

    try {
      const response = await fetch('http://localhost:8080/api/account/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData), // Отправляем правильные данные
      });

      if (response.ok) {
        alert('Успішно зареєстровано!');
        navigate('/');
      } else {
        const errorText = await response.text();
        alert('Помилка реєстрації: ' + errorText);
      }
    } catch (error) {
      alert('Помилка з\'єднання з сервером');
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      {step === 'select' ? (
        <div className={styles.selectionScreen}>
          <h1 className={styles.title}>Оберіть дію</h1>
          <div className={styles.buttonsContainer}>
            <BigActionButton
              text="Почати заробляти"
              onClick={() => handleSelectType('contractor')}
              iconSrc=""
            />
            <BigActionButton
              text="Замовити послугу"
              onClick={() => handleSelectType('customer')}
              iconSrc=""
            />
          </div>
        </div>
      ) : (
        <div className={styles.formContainer}>
          <h2>
            {userRole === 'customer'
              ? 'Реєстрація замовника'
              : 'Реєстрація працівника'}
          </h2>

          {userRole === 'contractor' && (
            <div className={styles.workerTypeSelection}>
              <button
                className={`${styles.workerTypeButton} ${
                  contractorType === 'master' ? styles.active : ''
                }`}
                onClick={() => setContractorType('master')}
              >
                Майстер
              </button>
              <button
                className={`${styles.workerTypeButton} ${
                  contractorType === 'company' ? styles.active : ''
                }`}
                onClick={() => setContractorType('company')}
              >
                Компанія
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.registrationForm}>
            <div className={styles.formGroup}>
              <label htmlFor="first_name">Ім'я:</label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="last_name">Прізвище:</label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="phone">Телефон:</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email:</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="postcode">Postcode:</label>
              <input
                id="postcode"
                name="postcode"
                type="text"
                required
                value={formData.postcode}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password">Пароль:</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="confirm_password">Підтвердіть пароль:</label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                required
                value={formData.confirm_password}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className={styles.submitButton}>
              Зареєструватись
            </button>
          </form>
        </div>
      )}
    </div>
  );
};