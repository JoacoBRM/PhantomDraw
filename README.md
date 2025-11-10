# 📐 Visor de Calco AR - Calculador de Dibujos

Aplicación web para superponer imágenes sobre la cámara en tiempo real, ideal para calcar dibujos o realizar trazados de referencia.

## ✨ Características

- 📹 **Acceso a cámara en tiempo real** (trasera preferentemente)
- 🖼️ **Carga y superposición de imágenes** con transparencia ajustable
- 🎨 **Controles intuitivos**:
  - 🔄 **Rotación de imagen** (0-360°)
  - 🌫️ **Opacidad ajustable** (0-100%)
  - 📍 **Posicionamiento libre** (arrastrar con toque o mouse)
  - 🔍 **Zoom con pellizco o rueda del mouse**
  - 🔒 **Bloqueo de imagen** para evitar movimientos accidentales
  - ↩️ **Reset** para centrar la imagen y resetear rotación
- 📱 **Totalmente responsive** (optimizado para iPhone y móviles)
- 🎯 **Interfaz moderna** con Tailwind CSS

## 🏗️ Estructura del Proyecto

```
proyecto_ar_jb/
├── index.html          # Estructura HTML principal
├── styles.css          # Estilos personalizados y responsive
├── app.js             # Lógica JavaScript modularizada
└── README.md          # Documentación
```

### Arquitectura Modular

- **`index.html`**: Estructura semántica del DOM con controles de UI
- **`styles.css`**: CSS puro con media queries para responsive design
- **`app.js`**: JavaScript vanilla con:
  - Gestión de cámara
  - Manejo de eventos táctiles y mouse
  - Transformaciones de imagen (posición, escala, rotación)
  - Sistema de mensajes

## 🚀 Cómo usar en iPhone desde Laragon

### Opción 1: Acceso desde la misma red WiFi (Recomendado)

1. **Asegúrate que Laragon esté corriendo**
   - Inicia Laragon
   - Verifica que Apache esté activo (luz verde)

2. **Encuentra tu IP local**
   - Abre PowerShell
   - Ejecuta: `ipconfig`
   - Busca "IPv4 Address" en tu adaptador WiFi (ejemplo: `192.168.1.100`)

3. **Accede desde tu iPhone**
   - Conecta tu iPhone a la **misma red WiFi** que tu PC
   - Abre Safari en tu iPhone
   - Navega a: `http://TU_IP_LOCAL/proyecto_ar_jb/index.html`
   - Ejemplo: `http://192.168.1.100/proyecto_ar_jb/index.html`

4. **Permitir acceso a la cámara**
   - Safari te pedirá permiso para usar la cámara
   - Toca "Permitir"
   - ¡Listo! 🎉

### Opción 2: GitHub Pages (Acceso desde cualquier lugar)

1. **Sube el proyecto a GitHub**
   ```bash
   git add .
   git commit -m "Actualización con rotación y código modular"
   git push origin main
   ```

2. **Activa GitHub Pages**
   - Ve a Settings > Pages en tu repositorio
   - Selecciona rama "main"
   - Guarda los cambios

3. **Accede desde tu iPhone**
   - URL: `https://joacobrm.github.io/proyecto_ar_jb`
   - Funciona desde cualquier lugar con internet

## 📱 Controles

### Móviles (iOS/Android)
- **1 dedo**: Mover imagen
- **2 dedos (pellizco)**: Hacer zoom
- **Slider Opacidad**: Ajustar transparencia (0-100%)
- **Slider Rotación**: Rotar imagen (0-360°)
- **Botón Subir**: Cargar imagen desde galería
- **Botón Reset**: Centrar, resetear zoom y rotación
- **Botón Libre/Fijo**: Bloquear/desbloquear imagen

### Desktop
- **Click + Arrastrar**: Mover imagen
- **Rueda del mouse**: Hacer zoom
- **Sliders**: Opacidad y rotación
- **Botones**: Subir, Reset, Bloquear

## 📲 Agregar a pantalla de inicio (iPhone)

Para usarla como una app nativa:

1. Abre la página en Safari
2. Toca el botón "Compartir" (cuadro con flecha hacia arriba)
3. Desplázate y toca "Agregar a pantalla de inicio"
4. Dale un nombre (ej: "Calco AR")
5. ¡Ahora tienes un ícono en tu pantalla! 📱

## 🛠️ Tecnologías

- HTML5 (Canvas API, Media Devices API)
- CSS3 (Flexbox, Grid, Custom Properties, Media Queries)
- JavaScript ES6+ (Async/Await, Event Listeners, Modules)
- Tailwind CSS (Framework de utilidades)

## 📋 Requisitos

- **Navegador moderno** con soporte para:
  - `getUserMedia()` API
  - CSS Grid y Flexbox
  - ES6+ JavaScript
  - CSS Transform (rotate, scale, translate)
- **HTTPS** o `localhost` para acceso a cámara
- **Permisos de cámara** habilitados

## 🔧 Desarrollo Local

```bash
# Clonar repositorio
git clone https://github.com/JoacoBRM/proyecto_ar_jb.git
cd proyecto_ar_jb

# Opción 1: Servidor con Python
python -m http.server 8000

# Opción 2: Servidor con Node.js
npx http-server

# Abrir en navegador
# http://localhost:8000
```

## ⚠️ Solución de Problemas

### La cámara no funciona
- ✅ Verifica que estés en Safari (no Chrome en iOS)
- ✅ Asegúrate de haber dado permisos de cámara
- ✅ Si usas IP local, verifica que estés en la misma WiFi
- ✅ Intenta recargar la página

### No puedo acceder a la página
- ✅ Verifica que Laragon esté corriendo
- ✅ Confirma que tu IP sea correcta (`ipconfig`)
- ✅ Asegúrate de estar en la misma red WiFi
- ✅ Desactiva temporalmente el firewall de Windows

### La imagen no se mueve o rota
- ✅ Verifica que el candado esté "Libre" (no "Fijo")
- ✅ Asegúrate de haber cargado una imagen primero
- ✅ Prueba con diferentes gestos (1 dedo, 2 dedos)

### Los botones no se ven (iPhone)
- ✅ Scroll hacia abajo si no ves los controles
- ✅ La cámara ocupa 55% superior, controles 45% inferior
- ✅ Prueba en modo vertical y horizontal

## 🎯 Características iOS Específicas

- ✅ Meta tags específicos para iPhone/iPad
- ✅ Soporte para agregar a pantalla de inicio
- ✅ Reproducción automática de video
- ✅ Gestos táctiles optimizados (pellizco, arrastre)
- ✅ Sin zoom accidental del navegador
- ✅ Safe area support (respeta notch y barra inferior)
- ✅ Dynamic Viewport Height (ajuste automático del teclado)

## 📝 Notas Técnicas

- Safari en iOS funciona mejor que Chrome para esta app
- La cámara trasera se usa por defecto (ideal para calcar)
- La rotación se aplica en conjunto con zoom y posición
- Los controles ocupan 40-45% de la pantalla en móviles
- Compatible con Chrome, Safari, Firefox, Edge
- Código completamente modular y mantenible

## 🤝 Contribuciones

Las contribuciones son bienvenidas:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/mejora`)
3. Commit los cambios (`git commit -m 'Añadir mejora'`)
4. Push a la rama (`git push origin feature/mejora`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👤 Autor

**JoacoBRM**
- GitHub: [@JoacoBRM](https://github.com/JoacoBRM)

---

⭐ Si te gusta este proyecto, dale una estrella en GitHub!
