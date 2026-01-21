# Changelog - Banco Productos Financieros

Registro de cambios y versiones de la implementación del proyecto.

## [1.0.0] - 2026-01-21

### Configuración Inicial
- [x] Creación del proyecto Angular 19 con componentes standalone
- [x] Configuración de Jest para pruebas unitarias
- [x] Configuración de path aliases (@core, @shared, @features, @environments)
- [x] Estructura de carpetas según Clean Architecture

### Estilos Base (SASS)
- [x] Variables de diseño (_variables.scss)
  - Paleta de colores (primario, texto, fondos, estados)
  - Tipografía y espaciado
  - Sombras y bordes
  - Breakpoints responsive
- [x] Mixins reutilizables (_mixins.scss)
  - Flexbox utilities
  - Responsive breakpoints
  - Estilos de botones e inputs
  - Animación skeleton
- [x] Reset y estilos base (_base.scss)

### Core (Servicios e Interceptores)
- [x] ProductService
  - getProducts(): Obtener lista de productos
  - getProductById(id): Obtener producto por ID
  - createProduct(product): Crear nuevo producto
  - updateProduct(id, product): Actualizar producto
  - deleteProduct(id): Eliminar producto
  - verifyProductId(id): Verificar si ID existe
- [x] Error Interceptor
  - Manejo centralizado de errores HTTP
  - Mensajes personalizados por código de error

### Componentes Compartidos
- [x] HeaderComponent
  - Logo con enlace a listado
  - Título "BANCO"
- [x] ConfirmModalComponent
  - Modal de confirmación genérico
  - Soporte para estado de carga
  - Animaciones de entrada/salida
- [x] SkeletonLoaderComponent
  - Precarga animada para tablas
  - Configurable (filas y columnas)

### Funcionalidad F1: Listado de Productos
- [x] Tabla con columnas requeridas
- [x] Consumo de API GET /bp/productos
- [x] Estado de carga con skeleton
- [x] Manejo de errores

### Funcionalidad F2: Búsqueda
- [x] Campo de texto para filtrar
- [x] Filtrado por nombre y descripción
- [x] Búsqueda case-insensitive
- [x] Actualización en tiempo real

### Funcionalidad F3: Cantidad de Registros
- [x] Contador de resultados
- [x] Selector dropdown (5, 10, 20)
- [x] Paginación simple

### Funcionalidad F4: Agregar Producto
- [x] Botón "Agregar" en listado
- [x] Navegación a /productos/nuevo
- [x] Formulario con validaciones:
  - ID: Requerido, 3-10 chars, verificación async
  - Nombre: Requerido, 5-100 chars
  - Descripción: Requerido, 10-200 chars
  - Logo: Requerido
  - Fecha Liberación: >= fecha actual
  - Fecha Revisión: Auto-calculada
- [x] Mensajes de error visuales
- [x] Botón "Reiniciar"
- [x] Botón "Enviar"

### Funcionalidad F5: Editar Producto
- [x] Menú contextual (3 puntos)
- [x] Opción "Editar"
- [x] Navegación a /productos/editar/:id
- [x] Campo ID deshabilitado
- [x] Carga de datos existentes
- [x] Mismas validaciones que creación

### Funcionalidad F6: Eliminar Producto
- [x] Opción "Eliminar" en menú contextual
- [x] Modal de confirmación
- [x] Mensaje con nombre del producto
- [x] Botones Cancelar/Confirmar
- [x] Estado de carga durante eliminación

### Validadores Personalizados
- [x] minDateValidator: Valida fecha >= hoy
- [x] uniqueIdValidator: Valida ID único via API (async)

### Pruebas Unitarias (103 tests - 100% pasando)
- [x] ProductService (6 tests)
- [x] Product Validators (7 tests)
- [x] HeaderComponent (5 tests)
- [x] ConfirmModalComponent (9 tests)
- [x] SkeletonLoaderComponent (6 tests)
- [x] ProductListComponent (16 tests)
- [x] ProductFormComponent (19 tests)
- [x] ErrorInterceptor (7 tests)
- [x] AppComponent (5 tests)

### Cobertura de Tests
- **Statements:** 90.1%
- **Branches:** 77.61%
- **Functions:** 92.53%
- **Lines:** 91.16%

---

## Próximas Versiones (Pendiente)

### [1.1.0] - Mejoras de UX
- [ ] Animaciones de transición entre páginas
- [ ] Toast notifications para feedback
- [ ] Paginación avanzada con navegación

### [1.2.0] - Optimizaciones
- [ ] Lazy loading de imágenes
- [ ] Virtual scrolling para listas grandes
- [ ] Cache de productos

---

## Notas de Desarrollo

### Requisitos Técnicos Cumplidos
- ✅ Angular 19 (standalone components)
- ✅ TypeScript 5.7+
- ✅ SASS/CSS puro (sin frameworks)
- ✅ Jest para pruebas unitarias
- ✅ Clean Architecture
- ✅ Principios SOLID

### Consideraciones
- La aplicación consume una API local en `http://localhost:3002`
- Se implementó diseño responsivo con breakpoints móvil/tablet/desktop
- Los estilos siguen los diseños D1, D2, D3 y D4 proporcionados
- Se incluyen estados de carga (skeletons) y manejo de errores
