# 🚀 Migración a v1.1.0 - Nuevo Sistema de Versionado

## 📅 Fecha: Enero 2026

---

## 🎯 ¿Qué cambió?

A partir de la versión **v1.1.0**, hemos mejorado el sistema de distribución de scripts para facilitar la actualización automática y mantener URLs estables.

### **Antes (v1.0.x):**
```html
<script src="https://cdn.jsdelivr.net/gh/record-screen/formProofJs@staging/dist/formtrace-v1.0.25.js"></script>
```
❌ Tenías que actualizar manualmente la versión en tu código cada vez que había una actualización.

### **Ahora (v1.1.0+):**
```html
<!-- OPCIÓN 1: Siempre la última versión (RECOMENDADO) -->
<script src="https://cdn.jsdelivr.net/gh/record-screen/formProofJs@staging/dist/formtrace-staging.js"></script>

<!-- OPCIÓN 2: Versión específica (si no quieres auto-actualizar) -->
<script src="https://cdn.jsdelivr.net/gh/record-screen/formProofJs@staging/dist/formtrace-staging-v1.1.0.js"></script>
```
✅ La URL no cambia, siempre obtienes la última versión automáticamente.

---

## 📦 Nuevos Archivos Disponibles

### **Para Staging:**
| Archivo | Descripción | Uso Recomendado |
|---------|-------------|-----------------|
| `formtrace-staging.js` | Versión minificada, siempre la última | ✅ **Producción** |
| `formtrace-staging-concat.js` | Versión legible, siempre la última | 🔍 **Debug** |
| `formtrace-staging-v{version}.js` | Versión específica minificada | 🔒 **Sin auto-actualización** |
| `formtrace-staging-concat-v{version}.js` | Versión específica legible | 🔍 **Debug versión específica** |

### **Para Production:**
| Archivo | Descripción | Uso Recomendado |
|---------|-------------|-----------------|
| `formtrace-production.js` | Versión minificada, siempre la última | ✅ **Producción** |
| `formtrace-production-concat.js` | Versión legible, siempre la última | 🔍 **Debug** |
| `formtrace-production-v{version}.js` | Versión específica minificada | 🔒 **Sin auto-actualización** |
| `formtrace-production-concat-v{version}.js` | Versión específica legible | 🔍 **Debug versión específica** |

---

## 🔄 Guía de Migración

### **Paso 1: Identifica tu ambiente actual**

¿Estás usando staging o production?
- Si usas `@staging` en la URL → Estás en **staging**
- Si usas `@main` en la URL → Estás en **production**

### **Paso 2: Actualiza tu código HTML**

#### **Si estás en STAGING:**
```html
<!-- ANTES -->
<script id="formproofScript" 
        src="https://cdn.jsdelivr.net/gh/record-screen/formProofJs@staging/dist/formtrace-v1.0.25.js?token=TU_TOKEN" 
        crossorigin="anonymous" defer></script>

<!-- DESPUÉS (Opción recomendada) -->
<script id="formproofScript" 
        src="https://cdn.jsdelivr.net/gh/record-screen/formProofJs@staging/dist/formtrace-staging.js?token=TU_TOKEN" 
        crossorigin="anonymous" defer></script>
```

#### **Si estás en PRODUCTION:**
```html
<!-- ANTES -->
<script id="formproofScript" 
        src="https://cdn.jsdelivr.net/gh/record-screen/formProofJs@main/dist/formtrace-v1.0.25.js?token=TU_TOKEN" 
        crossorigin="anonymous" defer></script>

<!-- DESPUÉS (Opción recomendada) -->
<script id="formproofScript" 
        src="https://cdn.jsdelivr.net/gh/record-screen/formProofJs@main/dist/formtrace-production.js?token=TU_TOKEN" 
        crossorigin="anonymous" defer></script>
```

### **Paso 3: Limpia caché del CDN (Opcional)**

Si no ves los cambios inmediatamente, puedes forzar la actualización del CDN agregando un parámetro de versión:

```html
<script src="https://cdn.jsdelivr.net/gh/record-screen/formProofJs@staging/dist/formtrace-staging.js?v=1.1.0&token=TU_TOKEN"></script>
```

---

## ⚠️ Importante: Versiones Antiguas

**Las versiones antiguas (v1.0.x) seguirán funcionando indefinidamente.**

No hay prisa para migrar, pero te recomendamos hacerlo para:
- ✅ Recibir actualizaciones automáticas
- ✅ Correcciones de bugs automáticas
- ✅ Nuevas funcionalidades sin cambiar código

---

## 🆘 Soporte

Si tienes dudas o problemas con la migración:
- 📧 Email: [Tu email de soporte]
- 🐛 Issues: https://github.com/record-screen/formProofJs/issues
- 📖 Documentación: https://github.com/record-screen/formProofJs

---

## 📊 Changelog v1.1.0

### ✨ Nuevas características:
- Archivos con nombres fijos por ambiente (`formtrace-staging.js`, `formtrace-production.js`)
- Versionado automático en commits
- Mejor organización de archivos en `/dist`

### 🔧 Mejoras:
- URLs estables para CDN
- No necesitas actualizar la versión en tu código
- Mantenemos versiones antiguas para compatibilidad

### 🐛 Correcciones:
- Ninguna (este es un cambio de infraestructura)

---

**Última actualización:** Enero 19, 2026

