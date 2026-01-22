# Banco - Productos Financieros

Aplicación web para la gestión de productos financieros de una institución bancaria, desarrollada con Angular 19.

## Tecnologías

- **Angular 19** - Framework frontend con componentes standalone
- **TypeScript 5.7** - Lenguaje de programación tipado
- **SASS/SCSS** - Preprocesador CSS (sin frameworks de estilos)
- **Jest** - Framework de pruebas unitarias
- **RxJS** - Programación reactiva

## Requisitos Previos

- Node.js 18.x o superior
- npm 9.x o superior
- Backend API corriendo en `http://localhost:3002`

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Opalo2289/Test-Devsu-Front.git
cd Test-Devsu-Front

# Instalar dependencias
npm install
```

## Ejecución

```bash
# Iniciar servidor de desarrollo
npm start

# La aplicación estará disponible en http://localhost:4200
```

## Pruebas

```bash
# Ejecutar pruebas unitarias
npm test

# Ejecutar pruebas con watch mode
npm run test:watch

# Ejecutar pruebas con cobertura
npm run test:coverage
```

## Estructura del Proyecto

```
src/
├── app/
│   ├── core/                    # Servicios singleton, interceptores
│   │   ├── services/
│   │   │   └── product.service.ts
│   │   └── interceptors/
│   │       └── error.interceptor.ts
│   ├── shared/                  # Componentes reutilizables
│   │   ├── components/
│   │   │   ├── header/
│   │   │   ├── confirm-modal/
│   │   │   └── skeleton-loader/
│   │   └── validators/
│   │       └── product.validators.ts
│   ├── features/                # Módulos por funcionalidad
│   │   └── products/
│   │       ├── models/
│   │       └── pages/
│   │           ├── product-list/
│   │           └── product-form/
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
├── styles/
│   ├── _variables.scss
│   ├── _mixins.scss
│   └── _base.scss
└── environments/
```

## Funcionalidades

### F1 - Listado de Productos
- Visualización de productos financieros en tabla
- Columnas: Logo, Nombre, Descripción, Fecha liberación, Fecha revisión

### F2 - Búsqueda
- Campo de texto para filtrar productos por nombre o descripción
- Filtrado en tiempo real

### F3 - Paginación
- Selector de cantidad de registros (5, 10, 20)
- Contador de resultados totales

### F4 - Crear Producto
- Formulario con validaciones:
  - ID: Requerido, 3-10 caracteres, único
  - Nombre: Requerido, 5-100 caracteres
  - Descripción: Requerido, 10-200 caracteres
  - Logo: Requerido (URL)
  - Fecha Liberación: Requerido, >= fecha actual
  - Fecha Revisión: Auto-calculada (liberación + 1 año)

### F5 - Editar Producto
- Menú contextual con opción de edición
- Campo ID deshabilitado
- Mismas validaciones que creación

### F6 - Eliminar Producto
- Menú contextual con opción de eliminación
- Modal de confirmación

## API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /bp/productos | Obtener todos los productos |
| POST | /bp/productos | Crear producto |
| PUT | /bp/productos/:id | Actualizar producto |
| DELETE | /bp/productos/:id | Eliminar producto |
| GET | /bp/productos/verificacion/:id | Verificar si ID existe |

## Arquitectura

La aplicación sigue los principios de Clean Architecture:

- **Core**: Servicios e interceptores singleton
- **Shared**: Componentes, pipes y validadores reutilizables
- **Features**: Módulos organizados por funcionalidad

### Patrones Utilizados

- **Standalone Components**: Componentes independientes sin módulos
- **Signals**: Gestión de estado reactivo con Angular Signals
- **Reactive Forms**: Formularios reactivos con validaciones
- **Functional Interceptors**: Interceptores HTTP funcionales
- **Async Validators**: Validadores asíncronos para verificación de ID

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia servidor de desarrollo |
| `npm run build` | Compila la aplicación para producción |
| `npm test` | Ejecuta pruebas unitarias |
| `npm run test:watch` | Ejecuta pruebas en modo watch |
| `npm run test:coverage` | Ejecuta pruebas con reporte de cobertura |

## Estándares de Código

- **TypeScript Strict Mode**: Activado para máxima seguridad de tipos
- **ESLint**: Reglas de linting configuradas
- **Prettier**: Formateo de código consistente
- **Cobertura mínima**: 70% en pruebas unitarias

## Autor

Desarrollado como prueba técnica para Devsu.
