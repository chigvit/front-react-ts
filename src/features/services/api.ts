

  // src/shared/api/services.ts
// export const fetchServices = async () => {
//   const response = await fetch("http://localhost:8080/services");
//   if (!response.ok) {
//     throw new Error("Помилка при завантаженні Services");
//   }
//   return response.json();
// };

export const fetchServices = async (): Promise<ServicesData> => {
  const response = await fetch("http://localhost:8080/services");
  if (!response.ok) {
    throw new Error("Помилка при завантаженні Services");
  }
  return response.json();
};