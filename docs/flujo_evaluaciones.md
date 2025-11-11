# 📋 Flujo del Módulo de Evaluaciones y Asistencia

## 1. Objetivo

Permitir al encargado (docente) registrar notas y asistencia de estudiantes inscritos en cursos, validar automáticamente la aprobación/reprobación y preparar la información para la generación de certificados.

---

## 2. Flujo de operación

### Carga de estudiantes
El sistema muestra la lista de estudiantes inscritos en el curso asignado al encargado.

### Edición de notas y asistencia
El encargado edita la nota final y el porcentaje de asistencia de cada estudiante en una tabla editable.

### Validación automática
Al modificar los datos, el sistema valida:
- Si la nota es mayor o igual a la nota mínima del curso.
- Si la asistencia cumple el mínimo requerido (si aplica).
- Actualiza el estado a “aprobado” o “reprobado”.

### Guardado de calificaciones
Al guardar, se valida que todos los campos estén completos y que no haya estudiantes en estado “pendiente”.
Se envía la información al backend (API de Boris) en formato JSON.

### Notificación para certificados
Los estudiantes con estado “aprobado” muestran un ícono 📃 indicando que están listos para la generación de certificado.
La función `getAprobadosParaCertificado` retorna el listado de estos estudiantes para el módulo de certificados.

---

## 3. Dependencias y comunicación

### Backend (Boris)
- **Endpoint esperado:** `POST /api/evaluaciones`
- **Datos enviados:**  
  ```json
  [
    {
      "id_inscripcion": 1,
      "nota_final": 8.5,
      "asistencia": 90,
      "estado": "aprobado"
    },
    ...
  ]
  ```