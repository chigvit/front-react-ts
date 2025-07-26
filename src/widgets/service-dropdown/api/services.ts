export const fetchServices = async (): Promise<ServicesResponse> => {
  const response = await fetch("http://localhost:8080/services");
  
  if (!response.ok) {
    throw new Error("Помилка при завантаженні послуг");
  }

  const data = await response.json();
  
  // Валідація даних (опціонально)
  if (typeof data !== 'object' || data === null) {
    throw new Error("Некоректний формат даних послуг");
  }
  
  return data;
};