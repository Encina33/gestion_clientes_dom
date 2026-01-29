# Gestión de Clientes

Aplicación web para gestión básica de clientes desarrollada con HTML, CSS y JavaScript

## 📋 Descripción

Sistema CRUD (Crear, Leer, Actualizar, Eliminar) que permite administrar una lista de clientes en el navegador con validación en tiempo real

## 🗂️ Estructura del Proyecto

### 📄 `index.html`

Estructura HTML de la aplicación que contiene:

- **Formulario de Alta**: Permite añadir nuevos clientes con campos para:
  - Nombre (mínimo 2 caracteres, solo letras)
  - Email (formato válido y único)
  - Teléfono (formato válido)

- **Tabla de Clientes**: Muestra la lista de clientes registrados con columnas:
  - ID (numeración automática)
  - Nombre
  - Email
  - Teléfono
  - Acciones (botones Editar y Eliminar)

- **Modal de Edición**: Ventana emergente (`<dialog>`) para modificar los datos de un cliente existente con validación

- **Atributos de Accesibilidad**: Incluye atributos ARIA para mejorar la accesibilidad (`aria-invalid`, `aria-live`, `aria-describedby`)

### 🎨 `style.css`

Hoja de estilos que define la apariencia visual:

- **Paleta de Colores**: Variables CSS personalizadas con tema oscuro/claro
  - Colores principales: verde para el header (`#4bae4f`)
  - Fondos, textos, estados de validación

- **Layout Responsivo**: Diseño flexible con:
  - Header superior fijo con título
  - Footer inferior con información del proyecto
  - Contenedores para formulario y tabla
  - Sistema de grid/flexbox

- **Estilos de Componentes**:
  - Inputs con estados visuales (válido/error)
  - Botones con variantes (primario, secundario, peligro)
  - Tabla con bordes y cabecera destacada
  - Modal de edición centrado

- **Estados de Validación**: Clases CSS para feedback visual (`.valid`, `.error`)

### ⚙️ `app.js`

Lógica de la aplicación en JavaScript:

#### Estado de la Aplicación
```javascript
let clientes = [];  // Array que almacena los clientes en memoria
let clienteEditandoId = null;  // ID del cliente siendo editado
```

#### Funcionalidades Principales

1. **Validaciones en Tiempo Real**:
   - `validarNombre()`: Solo letras y espacios, mínimo 2 caracteres
   - `validarEmailAlta()` / `validarEmailEdicion()`: Formato válido y unicidad
   - `validarTelefono()`: Formato numérico válido
   - Usa `debounce()` para optimizar validaciones durante escritura

2. **CRUD de Clientes**:
   - **Crear**: Captura datos del formulario, valida y añade a la lista
   - **Leer**: Renderiza la tabla con `pintarTabla()`
   - **Actualizar**: Abre modal con datos actuales, valida y guarda cambios
   - **Eliminar**: Filtra el array y repinta la tabla

3. **Gestión del DOM**:
   - `pintarTabla()`: Genera dinámicamente las filas de la tabla
   - `setFieldState()`: Actualiza clases CSS y atributos ARIA según validación
   - `toggleSubmit()`: Habilita/deshabilita botón submit según validez del formulario

4. **Modal de Edición**:
   - Usa la API nativa `<dialog>` del navegador
   - Precarga datos del cliente seleccionado
   - Validación independiente del formulario principal

5. **Event Listeners**:
   - Submit de formulario de alta
   - Input events para validación en tiempo real
   - Click en botones Editar/Eliminar (delegación de eventos)
   - Submit de formulario de edición

## 🚀 Funcionalidad

1. **Añadir Cliente**: Completa el formulario superior y presiona "Añadir cliente" (el botón se habilita solo cuando todos los campos son válidos)

2. **Ver Clientes**: La tabla muestra automáticamente todos los clientes registrados

3. **Editar Cliente**: Click en botón "Editar" → se abre modal → modifica datos → "Guardar"

4. **Eliminar Cliente**: Click en botón "Eliminar" → el cliente se borra inmediatamente

## 💾 Almacenamiento

Los datos se almacenan **solo en memoria** (variable `clientes`). Al recargar la página, todos los datos se pierden. No utiliza `localStorage` ni base de datos

## ✨ Características Destacadas

- ✅ Validación en tiempo real con feedback visual
- ✅ Email único (no permite duplicados)
- ✅ Accesibilidad con atributos ARIA
- ✅ Uso de API nativa `<dialog>` para el modal
- ✅ Código modular con funciones reutilizables
- ✅ Sin dependencias externas (JavaScript vanilla)

## 🎓 Proyecto Académico

Universidad Alfonso X el Sabio (UAX).
