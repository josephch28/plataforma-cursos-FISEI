# 🔒 Política de Seguridad - Plataforma de Cursos FISEI

## 🛡️ Versión de Soporte

Actualmente, solo la última versión del proyecto recibe actualizaciones de seguridad. Se recomienda mantener el proyecto actualizado con las últimas versiones de las dependencias.

## 🚨 Reportar una Vulnerabilidad

Si descubres una vulnerabilidad de seguridad, **NO** crees un issue público. En su lugar, sigue estos pasos:

### 📧 Proceso de Reporte

1. **Contacto directo**: Envía un correo electrónico al equipo de seguridad del proyecto:
   - **Líder técnico**: Damián
   - **Comité de control de cambios**: Sebastián y Mauricio

2. **Información a incluir**:
   - Descripción detallada de la vulnerabilidad
   - Pasos para reproducir el problema
   - Impacto potencial de la vulnerabilidad
   - Sugerencias de solución (si las tienes)
   - Tu información de contacto

3. **Tiempo de respuesta**: El equipo se compromete a responder dentro de **48 horas** y proporcionar una actualización del estado dentro de **7 días**.

4. **Proceso de resolución**:
   - El equipo evaluará la vulnerabilidad
   - Se creará un issue privado para rastrear el problema
   - Se desarrollará y probará un parche
   - Se publicará una actualización de seguridad
   - Se reconocerá tu contribución (si lo deseas)

## 🔐 Áreas de Seguridad Críticas

### 🔑 Autenticación y Autorización

- **Contraseñas**: Deben almacenarse usando hash seguro (bcrypt, argon2)
- **Tokens JWT**: Deben tener tiempo de expiración adecuado
- **Sesiones**: Deben invalidarse correctamente al cerrar sesión
- **Control de acceso**: Verificar permisos en cada endpoint sensible

### 🗄️ Base de Datos

- **Inyección SQL**: Usar consultas parametrizadas o ORM
- **Credenciales**: Nunca exponer credenciales de base de datos en el código
- **Backups**: Realizar backups regulares y seguros
- **Permisos**: Usar el principio de menor privilegio

### 🌐 API y Endpoints

- **Validación de entrada**: Validar y sanitizar todos los datos de entrada
- **Rate limiting**: Implementar límites de tasa para prevenir abusos
- **CORS**: Configurar correctamente los orígenes permitidos
- **HTTPS**: Usar siempre conexiones cifradas en producción

### 📁 Manejo de Archivos

- **Validación de tipos**: Verificar tipos de archivo permitidos
- **Tamaño de archivo**: Limitar el tamaño máximo de carga
- **Almacenamiento seguro**: Guardar archivos fuera del directorio web público
- **Escaneo de malware**: Considerar escaneo de archivos subidos

### 🔒 Datos Sensibles

- **Información personal**: Cumplir con regulaciones de privacidad
- **Datos de pago**: Nunca almacenar información de tarjetas de crédito completas
- **Logs**: No registrar información sensible en logs
- **Variables de entorno**: Usar archivos `.env` y nunca commitearlos

## 🧪 Buenas Prácticas de Seguridad

### Para Desarrolladores

1. **Dependencias**:
   ```bash
   npm audit
   npm audit fix
   ```
   - Revisar regularmente las vulnerabilidades en dependencias
   - Mantener las dependencias actualizadas

2. **Variables de entorno**:
   - Nunca commitear archivos `.env`
   - Usar diferentes credenciales para desarrollo y producción
   - Rotar credenciales regularmente

3. **Código**:
   - Revisar código antes de hacer merge
   - Usar herramientas de análisis estático
   - Seguir principios de seguridad por diseño

4. **Testing**:
   - Incluir pruebas de seguridad en el proceso de desarrollo
   - Realizar pruebas de penetración básicas
   - Validar casos extremos y entradas maliciosas

### Para el Equipo

1. **Control de acceso**:
   - Limitar acceso al repositorio solo a miembros del equipo
   - Usar autenticación de dos factores (2FA) en GitHub
   - Revisar permisos regularmente

2. **Documentación**:
   - Documentar decisiones de seguridad importantes
   - Mantener registro de vulnerabilidades resueltas
   - Compartir conocimiento de seguridad en el equipo

3. **Monitoreo**:
   - Monitorear logs de acceso y errores
   - Configurar alertas para actividades sospechosas
   - Revisar regularmente los registros de auditoría

## 🔍 Checklist de Seguridad

Antes de cada release, verificar:

- [ ] Todas las dependencias están actualizadas y sin vulnerabilidades conocidas
- [ ] No hay credenciales hardcodeadas en el código
- [ ] Las variables de entorno están correctamente configuradas
- [ ] Los endpoints están protegidos con autenticación/autorización adecuada
- [ ] La validación de entrada está implementada en todos los endpoints
- [ ] Los archivos sensibles están en `.gitignore`
- [ ] Las conexiones a la base de datos usan credenciales seguras
- [ ] Los tokens y sesiones tienen expiración configurada
- [ ] Los errores no exponen información sensible
- [ ] HTTPS está configurado en producción

## 📋 Tipos de Vulnerabilidades que Buscamos

Estamos especialmente interesados en:

- **Inyección SQL**: Vulnerabilidades en consultas a base de datos
- **Cross-Site Scripting (XSS)**: Ejecución de scripts maliciosos
- **Cross-Site Request Forgery (CSRF)**: Solicitudes no autorizadas
- **Autenticación débil**: Problemas en el sistema de login
- **Exposición de datos**: Acceso no autorizado a información sensible
- **Configuración incorrecta**: Problemas de configuración de seguridad
- **Dependencias vulnerables**: Paquetes con vulnerabilidades conocidas

## 🎓 Contexto Académico

Este proyecto es parte de un trabajo académico. Aunque no está en producción con datos reales, es importante:

- Aplicar buenas prácticas de seguridad desde el inicio
- Aprender sobre seguridad en aplicaciones web
- Documentar las decisiones de seguridad tomadas
- Considerar la seguridad como parte integral del desarrollo

## 📚 Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [React Security Best Practices](https://reactjs.org/docs/security.html)
- [MySQL Security Guidelines](https://dev.mysql.com/doc/refman/8.0/en/security.html)

## ✅ Reconocimiento

Agradecemos a todos los que reportan vulnerabilidades de manera responsable. Tu contribución ayuda a mantener seguro el proyecto y a mejorar las prácticas de seguridad del equipo.

---

**Versión**: 1.0  
**Última actualización**: 2024  
**Proyecto**: Plataforma de Cursos - FISEI (U.T.A.)  
**Contacto de seguridad**: Equipo de desarrollo del proyecto

