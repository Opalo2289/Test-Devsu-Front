export const environment = {
  production: true,
  // En Netlify, consumimos la API por misma-origen y Netlify hace proxy por redirects.
  // Esto evita problemas de CORS en producción.
  apiUrl: ''
};
