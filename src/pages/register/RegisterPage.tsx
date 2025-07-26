import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BigActionButton } from '@/shared/ui/BigActionButton/BigActionButton';
import styles from './RegisterPage.module.css';
import { Header } from '@/widgets/Header';
import React from 'react';

type RegistrationType = 'customer' | 'worker';

export const RegisterPage = () => {
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [registrationType, setRegistrationType] = useState<RegistrationType | null>(null);
  const [workerType, setWorkerType] = useState<'master' | 'company'>('master');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    postcode: '',
  });

  const navigate = useNavigate();

  const handleSelectType = (type: RegistrationType) => {
    setRegistrationType(type);
    setStep('form');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    console.log('Дані, які відправляються:', {
      ...formData,
      registrationType,
      workerType: registrationType === 'worker' ? workerType : undefined,
    });



    try {
      const response = await fetch('http://localhost:8080/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Успішно зареєстровано!');
        navigate('/');
      } else {
        const errorText = await response.text();
        alert('Помилка реєстрації: ' + errorText);
      }
    } catch (error) {
      alert('Помилка з’єднання з сервером');
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
              onClick={() => handleSelectType('worker')}
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
            {registrationType === 'customer'
              ? 'Реєстрація замовника'
              : 'Реєстрація працівника'}
          </h2>

          {registrationType === 'worker' && (
            <div className={styles.workerTypeSelection}>
              <button
                className={`${styles.workerTypeButton} ${
                  workerType === 'master' ? styles.active : ''
                }`}
                onClick={() => setWorkerType('master')}
              >
                Майстер
              </button>
              <button
                className={`${styles.workerTypeButton} ${
                  workerType === 'company' ? styles.active : ''
                }`}
                onClick={() => setWorkerType('company')}
              >
                Компанія
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.registrationForm}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Ім'я:</label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="phone">Телефон:</label>
              <input
                id="phone"
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
                type="text"
                required
                value={formData.postcode}
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
