
# ⛩️ TR-KUMIKO | Solución Definitiva de Despliegue

Si Netlify te da el error `git ref refs/heads/master (o main) does not exist`, sigue estos pasos exactos:

## 1. Asegura tu rama en el Terminal
Cierra cualquier proceso y pega estos comandos uno a uno en la terminal de tu proyecto:

```bash
# 1. Forzar que tu rama local se llame 'main'
git branch -M main

# 2. Añadir todos los archivos
git add .

# 3. Guardar cambios
git commit -m "Fix: Forzando rama main para despliegue"

# 4. Subir a GitHub (cambia TU_URL por la tuya si no la has puesto)
# git remote add origin https://github.com/USUARIO/REPOSITORIO.git
git push -u origin main --force
```

## 2. Configura Netlify para 'main'
Ahora que sabemos SEGURO que tu rama se llama `main`:

1. Entra en [Netlify](https://app.netlify.com/).
2. Ve a tu sitio -> **Site configuration** -> **Build & deploy** -> **Continuous Deployment**.
3. En la sección **Branches**, haz clic en **Edit settings**.
4. En **Production branch**, escribe: `main`.
5. Pulsa **Save**.
6. Ve a la pestaña **Deploys** y haz clic en el botón **Trigger deploy** -> **Deploy site**.

## 3. ¿Cómo saber el nombre de mi rama?
Si entras en tu repositorio de GitHub, verás un botón desplegable a la izquierda que dice "Branch". El nombre que aparezca ahí (normalmente `main`) es el que DEBE estar escrito en la configuración de Netlify.

---

### Recordatorio: Contenido Permanente
No olvides que para que tus cambios del panel `/admin` no se borren:
1. Copia el JSON desde el panel de control de tu web.
2. Pégalo en el archivo `services/cmsStore.ts`.
3. Sube el archivo a GitHub (`git add .`, `git commit...`, `git push...`).
