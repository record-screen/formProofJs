# 🚀 Sistema de Deploy Automático - FormProof v1.1.0

## 📋 Resumen

Este proyecto utiliza **GitHub Actions** para automatizar el proceso de build y deploy en dos ambientes:
- **Staging** (rama `staging`)
- **Production** (rama `main`)

---

## 🔄 Flujo de Trabajo

### **Staging**
```bash
# 1. Haces cambios en tu código
git checkout staging
# ... editas archivos ...

# 2. Commit y push
git add .
git commit -m "Nueva funcionalidad"
git push origin staging

# 3. GitHub Actions automáticamente:
#    ✅ Ejecuta npm install
#    ✅ Ejecuta gulp buildStaging
#    ✅ Genera archivos en /dist
#    ✅ Commitea los cambios
#    ✅ Push automático a staging
```

### **Production**
```bash
# 1. Merge de staging a main
git checkout main
git merge staging

# 2. Push
git push origin main

# 3. GitHub Actions automáticamente:
#    ✅ Ejecuta npm install
#    ✅ Ejecuta gulp buildProduction
#    ✅ Genera archivos en /dist
#    ✅ Commitea los cambios
#    ✅ Push automático a main
```

---

## 📦 Archivos Generados

Cada build genera **4 archivos**:

### **Staging:**
```
dist/
├── formtrace-staging.js                    # Minificado - URL estable
├── formtrace-staging-concat.js             # Legible - Debug
├── formtrace-staging-v1.1.0.js            # Minificado - Versión específica
└── formtrace-staging-concat-v1.1.0.js     # Legible - Versión específica
```

### **Production:**
```
dist/
├── formtrace-production.js                 # Minificado - URL estable
├── formtrace-production-concat.js          # Legible - Debug
├── formtrace-production-v1.1.0.js         # Minificado - Versión específica
└── formtrace-production-concat-v1.1.0.js  # Legible - Versión específica
```

---

## 🌐 URLs de CDN

### **Staging (siempre la última versión):**
```html
<script id="formproofScript" 
        src="https://cdn.jsdelivr.net/gh/record-screen/formProofJs@staging/dist/formtrace-staging.js?token=TU_TOKEN" 
        crossorigin="anonymous" defer></script>
```

### **Production (siempre la última versión):**
```html
<script id="formproofScript" 
        src="https://cdn.jsdelivr.net/gh/record-screen/formProofJs@main/dist/formtrace-production.js?token=TU_TOKEN" 
        crossorigin="anonymous" defer></script>
```

### **Versión específica (sin auto-actualización):**
```html
<!-- Staging v1.1.0 -->
<script src="https://cdn.jsdelivr.net/gh/record-screen/formProofJs@staging/dist/formtrace-staging-v1.1.0.js?token=TU_TOKEN"></script>

<!-- Production v1.1.0 -->
<script src="https://cdn.jsdelivr.net/gh/record-screen/formProofJs@main/dist/formtrace-production-v1.1.0.js?token=TU_TOKEN"></script>
```

---

## 🔧 Configuración de Ambientes

Cada ambiente apunta a una API diferente:

| Ambiente | API URL |
|----------|---------|
| **Staging** | `https://splendid-binary-uynxj.ampt.app/api` |
| **Production** | `https://intelligent-src-r12j9.ampt.app/api` |

Estas URLs se configuran automáticamente durante el build en `gulpfile.js`.

---

## 📝 Versionado

### **Actualizar versión:**
```bash
# Edita package.json
{
  "version": "1.2.0"  # Cambia aquí
}

# Commit y push
git add package.json
git commit -m "Bump version to 1.2.0"
git push origin staging  # o main
```

El build automáticamente usará la nueva versión.

---

## 🛠️ Comandos Útiles

```bash
# Build manual de staging
npm run buildStaging

# Build manual de production
npm run buildProduction

# Build con gulp directamente
npx gulp buildStaging
npx gulp buildProduction

# Ver archivos generados
ls -lh dist/ | grep -E "(staging|production)"
```

---

## ⚙️ GitHub Actions

Los workflows están en:
- `.github/workflows/deploy-staging.yml`
- `.github/workflows/deploy-production.yml`

### **Ver estado de los workflows:**
1. Ve a: https://github.com/record-screen/formProofJs/actions
2. Verás el historial de builds

---

## 🐛 Troubleshooting

### **El build no se ejecutó automáticamente**
- Verifica que el commit no tenga `[skip ci]` en el mensaje
- Revisa los logs en GitHub Actions

### **Los archivos no se actualizaron en el CDN**
- jsDelivr puede tardar hasta 12 horas en actualizar
- Fuerza la actualización agregando `?v=1.1.0` a la URL

### **Error en el build**
- Revisa los logs en GitHub Actions
- Verifica que `package.json` tenga una versión válida
- Asegúrate de que `gulpfile.js` no tenga errores de sintaxis

---

**Última actualización:** Enero 19, 2026

