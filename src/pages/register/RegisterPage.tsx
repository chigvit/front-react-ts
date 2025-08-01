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
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    postcode: '',
    password: '',
    confirmPassword: '',
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

    if (formData.password !== formData.confirmPassword) {
      alert('Паролі не співпадають!');
      return;
    }

    // ИСПРАВЛЕНО: Формируем правильные данные для отправки
    const submitData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      email: formData.email,
      postcode: formData.postcode,
      password: formData.password,
      role: userRole, // Используем актуальное значение userRole
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
              <label htmlFor="firstName">Ім'я:</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="lastName">Прізвище:</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
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
              <label htmlFor="confirmPassword">Підтвердіть пароль:</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
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