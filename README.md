
# ⛩️ TR-KUMIKO | Guía de Lanzamiento y Solución de Errores

Tu web está lista. Si has tenido problemas al subirla a Netlify, sigue estos pasos:

## 🚨 Solución al Error: "Could not find Git ref main"

Este error ocurre porque Netlify busca una rama llamada `main`, pero es posible que tu proyecto use `master`.

### Cómo arreglarlo en 1 minuto:
1. Entra en tu panel de **Netlify**.
2. Ve a **Site configuration** -> **Build & deploy** -> **Continuous Deployment**.
3. Busca la sección **Branches** y haz clic en **Edit settings**.
4. En **Production branch**, cambia `main` por `master`.
5. Haz clic en **Save** y luego ve a la pestaña **Deploys** y pulsa **Trigger deploy** -> **Deploy site**.

---

## 🛠️ Pasos para un Despliegue Exitoso

### 1. Haz tu contenido PERMANENTE (Crítico)
El panel `/admin` guarda los cambios solo en tu navegador actual. Para que sean públicos:
1. Diseña tu web en `/admin`.
2. Haz clic en **"COPIAR CONFIGURACIÓN (JSON)"** al final del panel.
3. Pega ese código en `services/cmsStore.ts`, dentro de la variable `DEFAULT_CONFIG`.
4. Sube este cambio a tu repositorio de GitHub.

### 2. Sube a Netlify (Vía GitHub)
1. Crea un repositorio en GitHub y sube tu código:
   ```bash
   git init
   git add .
   git commit -m "Primer despliegue TR-KUMIKO"
   git branch -M main
   git remote add origin TU_URL_DE_GITHUB
   git push -u origin main
   ```
2. En Netlify: **Add new site** -> **Import from GitHub**.
3. Selecciona tu repositorio y deja los ajustes por defecto (`npm run build` y carpeta `dist`).

### 3. Registro en Google (SEO)
1. Ve a [Google Search Console](https://search.google.com/search-console).
2. Verifica tu URL de Netlify usando el método de **Etiqueta HTML**.
3. Pega esa etiqueta en el `<head>` de tu `index.html`.

---
*Si el error persiste, asegúrate de que el repositorio en GitHub no sea 'Privado' o que hayas dado permisos a Netlify para acceder a él.*
