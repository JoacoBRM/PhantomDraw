document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM ---
    const cameraFeed = document.getElementById('cameraFeed');
    const traceImage = document.getElementById('traceImage');
    const drawingCanvas = document.getElementById('drawingCanvas');
    const ctx = drawingCanvas.getContext('2d');
    const gridCanvas = document.getElementById('gridCanvas');
    const gridCtx = gridCanvas.getContext('2d');
    const opacitySlider = document.getElementById('opacitySlider');
    const opacityValue = document.getElementById('opacityValue');
    const rotationSlider = document.getElementById('rotationSlider');
    const rotationValue = document.getElementById('rotationValue');
    const rotationIncrement = document.getElementById('rotationIncrement');
    const rotationDecrement = document.getElementById('rotationDecrement');
    const uploadInput = document.getElementById('upload');
    const lockButton = document.getElementById('lockButton');
    const resetButton = document.getElementById('resetButton');
    const filtersButton = document.getElementById('filtersButton');
    const closeFilters = document.getElementById('closeFilters');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const gridToggle = document.getElementById('gridToggle');
    const gridText = document.getElementById('gridText');
    const iconUnlocked = document.getElementById('icon-unlocked');
    const iconLocked = document.getElementById('icon-locked');
    const lockText = document.getElementById('lockText');
    const imageInfo = document.getElementById('imageInfo');
    const imageSize = document.getElementById('imageSize');
    const imageScale = document.getElementById('imageScale');
    const imagePosition = document.getElementById('imagePosition');
    const imageRotation = document.getElementById('imageRotation');
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    const closeMessage = document.getElementById('closeMessage');
    const restartCameraButton = document.getElementById('restartCameraButton');

    const toggleControls = document.getElementById('toggleControls');
    const iconMaximize = document.getElementById('icon-maximize');
    const iconMinimize = document.getElementById('icon-minimize');
    const controlsPanel = document.getElementById('controls');
    const mainMenu = document.getElementById('mainMenu');
    const filtersPanel = document.getElementById('filtersPanel');
    const backToMain = document.getElementById('backToMain');

    // --- Estado ---
    let isLocked = false;
    let isFullScreen = false; // Estado de pantalla completa
    let currentX = 0;
    let currentY = 0;
    let scale = 1;
    let rotation = 0; // Nueva variable para la rotación
    let currentFilter = 'none'; // Filtro actual aplicado
    let isGridVisible = false; // Estado de la cuadrícula
    let isDragging = false;
    let isPinching = false;
    let startTouchX = 0;
    let startTouchY = 0;
    let startX = 0;
    let startY = 0;
    let initialPinchDistance = 0;
    let initialScale = 1;

    let stream = null; // Variable global para el stream

    // --- 1. Iniciar la Cámara ---
    async function startCamera(deviceId = null) {
        // Detener stream anterior si existe
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showMessage("Error: Tu navegador no soporta la cámara.", "error");
            return;
        }

        try {
            // Configuración base
            let constraints = {
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            };

            // Si hay un deviceId específico (bloqueo activado), usarlo como 'exact'
            if (deviceId) {
                constraints.video.deviceId = { exact: deviceId };
            } else {
                // Si no, usar lógica estándar (ideal enviroment)
                constraints.video.facingMode = { ideal: 'environment' };
            }

            stream = await navigator.mediaDevices.getUserMedia(constraints);
            cameraFeed.srcObject = stream;

            // Asegurar que el video se reproduzca en iOS
            cameraFeed.setAttribute('playsinline', 'true');
            cameraFeed.setAttribute('webkit-playsinline', 'true');
            cameraFeed.play().catch(err => {
                console.warn("Error al reproducir video:", err);
            });

            setupCanvas();
        } catch (err) {
            console.warn("Error al iniciar cámara (trasera/específica):", err);

            // Si falló con un deviceId específico, desactivar el bloqueo y reintentar normal
            // Si falló con un deviceId específico, desactivar el bloqueo y reintentar normal
            // (Lógica removida al eliminar Lens Lock)


            try {
                // Fallback a cualquier cámara (solo si no estabamos forzando ID)
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1920 },
                        height: { ideal: 1080 }
                    },
                    audio: false
                });
                cameraFeed.srcObject = stream;
                cameraFeed.setAttribute('playsinline', 'true');
                cameraFeed.setAttribute('webkit-playsinline', 'true');
                cameraFeed.play().catch(err => {
                    console.warn("Error al reproducir video:", err);
                });
                setupCanvas();
                showMessage("Usando cámara frontal/alternativa.", "info");
                setTimeout(() => {
                    messageBox.classList.add('hidden');
                }, 3000);
            } catch (err2) {
                console.error("Error al acceder a la cámara:", err2);
                let errorMsg = `No se pudo acceder a la cámara: ${err2.message}`;
                showMessage(errorMsg, "error");
            }
        }
    }

    // --- 2. Configurar Canvas ---
    function setupCanvas() {
        const viewportHeight = window.innerHeight;

        drawingCanvas.width = window.innerWidth;
        drawingCanvas.height = viewportHeight;
        drawingCanvas.style.height = viewportHeight + 'px';

        gridCanvas.width = window.innerWidth;
        gridCanvas.height = viewportHeight;
        gridCanvas.style.height = viewportHeight + 'px';

        // Ajustar video también
        cameraFeed.style.height = viewportHeight + 'px';

        // Redibujar cuadrícula si está visible
        if (isGridVisible) {
            drawGrid();
        }
    }

    // --- 3. Manejar Subida de Imagen ---
    uploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                traceImage.src = e.target.result;
                traceImage.onload = () => {
                    traceImage.classList.remove('hidden');
                    resetTransform();
                    updateImageInfo();
                    imageInfo.classList.remove('hidden');
                    showMessage("Imagen cargada. Usa gestos para ajustar.", "info");
                    setTimeout(() => {
                        messageBox.classList.add('hidden');
                    }, 3000);
                };
            };
            reader.readAsDataURL(file);
            // IMPORTANTE: Limpiar el valor del input para permitir seleccionar el mismo archivo de nuevo
            uploadInput.value = '';
        }
    });

    // --- 4. Controles ---
    opacitySlider.addEventListener('input', (event) => {
        const value = event.target.value;
        traceImage.style.opacity = value / 100;
        opacityValue.textContent = value + '%';
    });

    // Nuevo control de rotación
    rotationSlider.addEventListener('input', (event) => {
        const value = event.target.value;
        rotation = parseInt(value);
        rotationValue.textContent = value + '°';
        applyTransform();
        updateImageInfo();
    });

    // Botones de incremento/decremento de rotación
    rotationIncrement.addEventListener('click', () => {
        rotation = (rotation + 1) % 361;
        if (rotation === 361) rotation = 0;
        rotationSlider.value = rotation;
        rotationValue.textContent = rotation + '°';
        applyTransform();
        updateImageInfo();
    });

    rotationDecrement.addEventListener('click', () => {
        rotation = rotation - 1;
        if (rotation < 0) rotation = 360;
        rotationSlider.value = rotation;
        rotationValue.textContent = rotation + '°';
        applyTransform();
        updateImageInfo();
    });

    // --- Control de Navegación de Menús ---
    filtersButton.addEventListener('click', () => {
        mainMenu.classList.add('hidden');
        filtersPanel.classList.remove('hidden');
        filtersButton.classList.add('bg-purple-800');
    });

    if (backToMain) {
        backToMain.addEventListener('click', () => {
            filtersPanel.classList.add('hidden');
            mainMenu.classList.remove('hidden');
            filtersButton.classList.remove('bg-purple-800');
        });
    }

    // Ya no necesitamos closeFilters tal cual, o lo reusamos si lo dejé en el HTML,
    // pero el usuario pidió que la flecha vuelva.
    // Si todavía existe closeFilters en el HTML viejo que no borré, lo ignoramos o lo reusamos.
    if (closeFilters) {
        closeFilters.addEventListener('click', () => {
            // Comportamiento "X": cerrar filtros y volver a main o cerrar todo?
            // Asumamos volver a main para consistencia
            filtersPanel.classList.add('hidden');
            mainMenu.classList.remove('hidden');
            filtersButton.classList.remove('bg-purple-800');
        });
    }

    // Aplicar filtros
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            currentFilter = filter;

            // Remover clase activa de todos los botones
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Agregar clase activa al botón seleccionado
            button.classList.add('active');

            // Aplicar filtro
            if (filter === 'none') {
                traceImage.style.filter = 'none';
            } else {
                traceImage.style.filter = filter;
            }

            showMessage(`Filtro aplicado: ${button.textContent}`, "success");
            setTimeout(() => {
                messageBox.classList.add('hidden');
            }, 2000);
        });
    });

    // Toggle de cuadrícula
    gridToggle.addEventListener('click', () => {
        isGridVisible = !isGridVisible;

        if (isGridVisible) {
            gridCanvas.classList.remove('hidden');
            drawGrid();
            gridText.textContent = 'Ocultar';
            gridToggle.classList.add('bg-green-600');
            gridToggle.classList.remove('bg-gray-600');
        } else {
            gridCanvas.classList.add('hidden');
            gridText.textContent = 'Mostrar';
            gridToggle.classList.remove('bg-green-600');
            gridToggle.classList.add('bg-gray-600');
        }
    });

    // Función para dibujar la cuadrícula
    function drawGrid() {
        const width = gridCanvas.width;
        const height = gridCanvas.height;
        const gridSize = 50; // Tamaño de cada celda de la cuadrícula

        gridCtx.clearRect(0, 0, width, height);
        gridCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        gridCtx.lineWidth = 1;

        // Líneas verticales
        for (let x = 0; x <= width; x += gridSize) {
            gridCtx.beginPath();
            gridCtx.moveTo(x, 0);
            gridCtx.lineTo(x, height);
            gridCtx.stroke();
        }

        // Líneas horizontales
        for (let y = 0; y <= height; y += gridSize) {
            gridCtx.beginPath();
            gridCtx.moveTo(0, y);
            gridCtx.lineTo(width, y);
            gridCtx.stroke();
        }
    }

    lockButton.addEventListener('click', () => {
        isLocked = !isLocked;
        iconUnlocked.classList.toggle('hidden', isLocked);
        iconLocked.classList.toggle('hidden', !isLocked);
        lockText.textContent = isLocked ? 'Fijo' : 'Libre';

        if (isLocked) {
            lockButton.classList.remove('bg-gray-700', 'hover:bg-gray-600');
            lockButton.classList.add('bg-red-600', 'hover:bg-red-700');
            traceImage.classList.add('locked');
        } else {
            lockButton.classList.remove('bg-red-600', 'hover:bg-red-700');
            lockButton.classList.add('bg-gray-700', 'hover:bg-gray-600');
            traceImage.classList.remove('locked');
        }
    });

    resetButton.addEventListener('click', () => {
        if (traceImage.src) {
            resetTransform();
            // Resetear filtros
            currentFilter = 'none';
            traceImage.style.filter = 'none';
            filterButtons.forEach(btn => btn.classList.remove('active'));
            filterButtons[0].classList.add('active'); // Activar "Normal"
            showMessage("Imagen recentrada y filtros reseteados", "info");
            setTimeout(() => {
                messageBox.classList.add('hidden');
            }, 2000);
        }
    });

    // --- 8. Ajustar canvas al redimensionar y Visibilidad ---


    // Toggle de Pantalla Completa / Menu Flotante
    if (toggleControls) {
        toggleControls.addEventListener('click', () => {
            isFullScreen = !isFullScreen; // Reusamos la variable para saber si el menu está abierto o cerrado

            // Alternar visibilidad del menú
            if (!isFullScreen) {
                // Estado "Cerrado" (Fullscreen real) -> Ocultar controles
                controlsPanel.classList.remove('visible');
                iconMaximize.classList.remove('hidden'); // Icono de "Abrir Menú"
                iconMinimize.classList.add('hidden');
            } else {
                // Estado "Abierto" (Menu visible)
                controlsPanel.classList.add('visible');
                iconMaximize.classList.add('hidden');
                iconMinimize.classList.remove('hidden'); // Icono de "Cerrar Menú"
            }
        });
    }

    // --- 5. Gestos Táctiles ---
    // --- 5. Gestos Táctiles ---
    // Touchstart sigue en la imagen para iniciar la interacción
    traceImage.addEventListener('touchstart', handleTouchStart, { passive: false });
    // Move y End van al DOCUMENTO para permitir salir de la imagen
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    function handleTouchStart(e) {
        if (isLocked) return;
        e.preventDefault();

        const touches = e.touches;

        if (touches.length === 1) {
            isDragging = true;
            isPinching = false;
            startTouchX = touches[0].clientX;
            startTouchY = touches[0].clientY;
            startX = currentX;
            startY = currentY;
            traceImage.classList.add('dragging');
        } else if (touches.length === 2) {
            isDragging = false;
            isPinching = true;
            initialPinchDistance = getDistance(touches[0], touches[1]);
            initialScale = scale;
            traceImage.classList.add('dragging');
        }
    }

    function handleTouchMove(e) {
        if (isLocked) return;
        // Solo prevenir default si estamos arrastrando o pellizcando
        if (isDragging || isPinching) {
            e.preventDefault();
        } else {
            return; // Si no estamos interactuando, no hacer nada
        }

        const touches = e.touches;

        if (isDragging && touches.length === 1) {
            const deltaX = touches[0].clientX - startTouchX;
            const deltaY = touches[0].clientY - startTouchY;
            currentX = startX + deltaX;
            currentY = startY + deltaY;
            applyTransform();
            updateImageInfo();
        } else if (isPinching && touches.length === 2) {
            const currentDistance = getDistance(touches[0], touches[1]);
            const scaleChange = currentDistance / initialPinchDistance;
            scale = Math.max(0.1, Math.min(5, initialScale * scaleChange));
            applyTransform();
            updateImageInfo();
        }
    }

    function handleTouchEnd(e) {
        if (e.touches.length < 2) {
            isPinching = false;
            initialPinchDistance = 0;
        }
        if (e.touches.length < 1) {
            isDragging = false;
            traceImage.classList.remove('dragging');
        }
    }

    // --- 6. Soporte para Mouse (escritorio) ---
    let isMouseDown = false;

    traceImage.addEventListener('mousedown', (e) => {
        if (isLocked) return;
        e.preventDefault();
        isMouseDown = true;
        startTouchX = e.clientX;
        startTouchY = e.clientY;
        startX = currentX;
        startY = currentY;
        traceImage.style.cursor = 'grabbing';
        traceImage.classList.add('dragging');
    });

    document.addEventListener('mousemove', (e) => {
        if (!isMouseDown || isLocked) return;
        const deltaX = e.clientX - startTouchX;
        const deltaY = e.clientY - startTouchY;
        currentX = startX + deltaX;
        currentY = startY + deltaY;
        applyTransform();
        updateImageInfo();
    });

    document.addEventListener('mouseup', () => {
        if (isMouseDown) {
            isMouseDown = false;
            traceImage.style.cursor = 'grab';
            traceImage.classList.remove('dragging');
        }
    });

    // Zoom con rueda del mouse
    traceImage.addEventListener('wheel', (e) => {
        if (isLocked) return;
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        scale = Math.max(0.1, Math.min(5, scale * delta));
        applyTransform();
        updateImageInfo();
    }, { passive: false });

    // --- 7. Funciones Auxiliares ---
    function getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function applyTransform() {
        // Aplicar transformación con rotación incluida
        traceImage.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale}) rotate(${rotation}deg)`;
    }

    function resetTransform() {
        const viewportHeight = window.innerHeight;

        // Safety check
        if (!traceImage.naturalWidth || !traceImage.naturalHeight) {
            console.warn("Imagen sin dimensiones, usando defaults.");
            currentX = window.innerWidth / 2;
            currentY = viewportHeight / 2;
        } else {
            // Simplemente centramos en el viewport width y height actual de la cámara (que ahora es full screen)
            currentX = (window.innerWidth - traceImage.naturalWidth) / 2;
            currentY = (viewportHeight - traceImage.naturalHeight) / 2;
        }

        scale = 1;
        rotation = 0; // Resetear rotación

        // Resetear slider de rotación
        rotationSlider.value = 0;
        rotationValue.textContent = '0°';

        traceImage.style.left = '0';
        traceImage.style.top = '0';
        applyTransform();
        updateImageInfo();
    }

    function updateImageInfo() {
        if (traceImage.src) {
            imageSize.textContent = `Tamaño: ${traceImage.naturalWidth}×${traceImage.naturalHeight}px`;
            imageScale.textContent = `Escala: ${Math.round(scale * 100)}%`;
            imagePosition.textContent = `Pos: (${Math.round(currentX)}, ${Math.round(currentY)})`;
            imageRotation.textContent = `Rot: ${rotation}°`;
        }
    }

    function showMessage(msg, type = "error") {
        messageText.textContent = msg;
        messageBox.classList.remove('bg-red-600', 'bg-blue-600', 'bg-green-600');

        if (type === "error") {
            messageBox.classList.add('bg-red-600');
        } else if (type === "info") {
            messageBox.classList.add('bg-blue-600');
        } else if (type === "success") {
            messageBox.classList.add('bg-green-600');
        }

        messageBox.classList.remove('hidden');
    }

    closeMessage.addEventListener('click', () => {
        messageBox.classList.add('hidden');
    });

    // --- 8. Ajustar canvas al redimensionar y Visibilidad ---
    window.addEventListener('resize', () => {
        setupCanvas();
    });

    // Recuperar cámara al volver a la pestaña/app
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            // Verificar si el video está pausado o el stream inactivo
            if (cameraFeed.paused || cameraFeed.ended || !stream || !stream.active) {
                console.log("App visible: Reiniciando cámara...");
                // Intentar mantener el bloqueo si estaba activo, pero para recuperar rápido mejor dejarlo en auto o re-leer el estado
                // Si estaba bloqueado, startCamera usará el ID si lo guardamos en una variable global, pero aquí lo pasamos por argumento.
                // Corrección: Debemos guardar el activeDeviceId si queremos persistirlo entre visibilidad, 
                // PERO, si se perdió el stream, quizás el ID ya no es válido o cambió.
                // Simple: Reiniciar en modo automático para asegurar que vuelva la imagen, o mejorar logica.
                // Por ahora: Reiniciar normal (desbloquea si estaba bloqueado implícitamente al no pasar argumentos, pero el UI quedaría desincronizado).

                // Mejor solución: Si isLensLocked es true, necesitaríamos saber qué ID era.
                // Como no guardé el ID en variable global, se perderá el bloqueo al reiniciar por visibilidad.
                // Esto es aceptable como fallback. Actualizaremos el UI para reflejar que se desbloqueó o intentaremos mantenerlo si guardamos el ID.

                // Decisión Rápida: Resetear a desbloqueado si se recupera del background para asegurar funcionamiento
                // Decisión Rápida: Resetear a desbloqueado si se recupera del background para asegurar funcionamiento
                startCamera();

            }
        }
    });

    // Botón de reinicio manual
    if (restartCameraButton) {
        restartCameraButton.addEventListener('click', () => {
            showMessage("Reiniciando cámara...", "info");
            startCamera();
            setTimeout(() => {
                messageBox.classList.add('hidden');
            }, 2000);
        });
    }

    // --- Iniciar App ---
    startCamera();

    // Mensaje de bienvenida
    showMessage("¡Bienvenido! Carga una imagen para empezar a calcar.", "info");
    setTimeout(() => {
        messageBox.classList.add('hidden');
    }, 4000);
});
