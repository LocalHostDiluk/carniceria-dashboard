# Estado del Proyecto

> ⚠ **Importante:** Este README funciona como guía de progreso y prioridades para el desarrollo. Mantener este documento actualizado conforme se vayan completando módulos o se detecten nuevas necesidades.


## ✅ Funcionalidades Completadas

- **Login funcional**
- **Dashboard - Pantalla principal**
- **Pantalla de Inventario (vista base)**
- **Pantalla de Ventas (vista base)**

---

## 🚧 Funcionalidades Pendientes

### 🟠 Pantalla de Cierre de Caja

- Diseño e implementación de la vista
- Lógica de cierre de caja (cálculos, resumen y confirmación)
- Registro de historial de cierres
- Validaciones y bloqueo según permisos de usuario

### 🛡️ Seguridad

- Restricción de acceso a pantalla de cierre de caja por rol/permiso
- Validaciones de acciones críticas (ej. confirmación de cierre)

### 👤 Administración de Usuario

- Cambio de contraseña
- Configuración de perfil básico (si aplica)
- Control de sesión y seguridad adicional

---

## 📍 Detalles por Módulo

### 📦 Pantalla de Inventario

**Faltante:**

- ➕ Agregar productos (individual y carga por lotes)
- ✏️ Actualizar productos (con opción de marcar como destacado)
- 🔁 Activar / desactivar productos (`active: true/false`)
- 🗑️ Eliminar productos
- 🎨 Posible mejora del diseño (paginación, tabla optimizada o reordenamiento visual)

### 🛒 Pantalla de Ventas

**Faltante:**

- 💾 Confirmar venta y guardarla correctamente en la base de datos
- ✅ Probar flujo completo de venta
- 🔍 Detectar y corregir posibles errores
- 🚀 Evaluar mejoras en la experiencia de uso

---

## 🎯 Objetivo General de Siguientes Entregables

- Finalizar inventario para tener CRUD completo y funcional
- Implementar flujo de venta totalmente operativo y registrado en BD
- Desarrollar cierre de caja con seguridad y control de usuario
- Añadir administración de usuario para control interno del sistema

---