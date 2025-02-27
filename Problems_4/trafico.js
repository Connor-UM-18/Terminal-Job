const canvas = document.getElementById("simuladorCanvas");
const ctx = canvas.getContext("2d");

// Ajustar tamaño inicial del canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Obtener elementos del menú
const calleSelect = document.getElementById("selectCalle");
const probabilidadInput = document.getElementById("inputProbabilidad");
const btnActualizarCalle = document.getElementById("btnActualizarCalle");

// Variable para almacenar la calle seleccionada
let calleSeleccionada = null;

// Reglas de tráfico
const reglas = {
    "0,0,0": 0, "0,0,1": 0, "0,1,0": 0, "0,1,1": 1,
    "1,0,0": 1, "1,0,1": 1, "1,1,0": 0, "1,1,1": 1
};

// Configuración
let calles = [];
let conexiones = [];
const celda_tamano = 5;
let escala = 1;
let offsetX = 0, offsetY = 0;
let isDragging = false, startX, startY;
let lastTouchX, lastTouchY;

// Cargar imágenes
// Cargar la imagen del carro
const carroImg = new Image();
carroImg.src = "carro.png";

// Cargar la imagen del carretera
const carreteraImg = new Image();
carreteraImg.src = "carretera.png";

// Lista de edificios estáticos
const edificios = [
    { x: 100, y: 100, width: 30, height: 41, color: "green", angle: 10 },
    { x: 200, y: 150, width: 50, height: 60, color: "green", angle: -15 },
    { x: 300, y: 180, width: 40, height: 55, color: "green", angle: 5 }
];

// Función para crear una calle con posición, ángulo y tamaño
function crearCalle(nombre, tamano, tipoInicio, tipoFinal, x, y, angulo, probabilidadGeneracion) {
    let calle = {
        nombre: nombre,
        tamano: tamano,
        tipoInicio: tipoInicio,
        tipoFinal: tipoFinal,
        probabilidadGeneracion: probabilidadGeneracion,
        arreglo: new Array(tamano).fill(0),
        x: x * celda_tamano,             // Coordenada x de inicio
        y: y * celda_tamano,             // Coordenada y de inicio
        angulo: angulo    // Ángulo de rotación
    };
    // Si es generador, inicializa las primeras celdas
    if (tipoInicio === "generador") {
        for (let i = 0; i < tamano; i++) {
            calle.arreglo[i] = Math.random() < 0.1 ? 1 : 0;// Carros iniciales al azar
        }
    }

    calles.push(calle);
    return calle;
}

// Función para conectar dos calles
function conexion_calle_de_2(calle1, calle2) {
    if (calle1.tipoFinal === "conexion" && calle2.tipoInicio === "conexion") {
        conexiones.push({ origen: calle1, destino: calle2 });
    } else {
        console.error("Las calles no son compatibles para conexión.");
    }
}

// Actualiza el estado de una calle
function actualizarCalle(calle) {
    let nuevaCalle = [...calle.arreglo];
    if (calle.tipoInicio === "generador" && Math.random() < calle.probabilidadGeneracion) {
        nuevaCalle[0] = 1;
    } else {
        nuevaCalle[0] = 0;
    }
    for (let i = 1; i < calle.tamano; i++) {
        let izquierda = i > 0 ? calle.arreglo[i - 1] : 0;
        let actual = calle.arreglo[i];
        let derecha = i < calle.tamano - 1 ? calle.arreglo[i + 1] : 0;
        let reglaKey = `${izquierda},${actual},${derecha}`;
        nuevaCalle[i] = reglas[reglaKey];
    }
    calle.arreglo = nuevaCalle;
}

// Dibujar edificios
function dibujarEdificios() {
    edificios.forEach(edificio => {
        ctx.save();
        ctx.translate(edificio.x, edificio.y);
        ctx.rotate(edificio.angle * Math.PI / 180);
        ctx.fillStyle = edificio.color;
        ctx.fillRect(-edificio.width / 2, -edificio.height / 2, edificio.width, edificio.height);
        ctx.restore();
    });
}


// Dibujar calles
function dibujarCalles() {
    calles.forEach(calle => {
        ctx.save(); // Guarda el estado del contexto antes de aplicar transformaciones
        ctx.translate(calle.x, calle.y); // Traslada el contexto al inicio de la calle
        ctx.rotate(-calle.angulo * Math.PI / 180); // Rota el contexto según el ángulo de la calle
        // Dibujar rectángulo amarillo si la calle está seleccionada
        if (calleSeleccionada && calle.nombre === calleSeleccionada.nombre) {
            ctx.strokeStyle = "yellow";
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, calle.tamano * celda_tamano, celda_tamano);
        }
        // Dibujar imagen de la carretera
        for (let i = 0; i < calle.tamano; i++) {
            ctx.drawImage(carreteraImg, i * celda_tamano, 0, celda_tamano, celda_tamano);
        }

        calle.arreglo.forEach((celda, i) => {
           //Asi se hace con imagenes
            if (celda === 1) {
                ctx.drawImage(carroImg, i * celda_tamano, 0, celda_tamano, celda_tamano);
            }
        });

        ctx.restore(); // Restaura el estado original del contexto
    });
}

// Renderizar canvas
function renderizarCanvas() {
    ctx.fillStyle = "#c6cbcd"; // Color de fondo personalizado (gris oscuro)

    // Restablecer la transformación antes de limpiar
    ctx.setTransform(1, 0, 0, 1, 0, 0); 
    
    
    ctx.clearRect(0, 0, canvas.width, canvas.height); //Soluciona problema de tilling
    ctx.fillRect(0, 0, canvas.width, canvas.height); //Rellena el esapcio

    // Aplicar la transformación de escala y desplazamiento
    ctx.setTransform(escala, 0, 0, escala, offsetX, offsetY); 
    dibujarEdificios();
    dibujarCalles();
}

let animationId; // Variable para guardar el ID de la animación
let tiempoAnterior = 0;
const intervaloDeseado = 60; // Intervalo en milisegundos (100ms = 10 actualizaciones por segundo)

// Iniciar la simulación
function iniciarSimulacion() {
    // Calles con posiciones ajustadas
    const Avenida_Miguel_Othon_de_Mendizabal = crearCalle("Av. Miguel Othon de Mendizabal",277, "generador", "conexion", 108, 192, 39, 0.2);
    const Avenida_Miguel_Bernard = crearCalle("Av. Miguel Bernard",148, "conexion", "devorador", 324, 17, -39, 0.2);
    const Avenida_Cien_Metros = crearCalle("Av. Cien Metros", 250, "generador", "devorador", 134, 115, -73, 0.2);
    const Avenida_Juan_de_Dios_Batiz = crearCalle("Av. Juan de Dios Batiz", 422, "generador", "devorador", 210, 110, 0, 0.2);
    const Avenida_IPN = crearCalle("Av. IPN", 305, "generador", "devorador", 489, 50, -90, 0.2);
    const Avenida_Guanajuato = crearCalle("Av. Guanajuato", 150, "generador", "devorador", 192, 305, 0, 0.2);
    const Avenida_Montevideo = crearCalle("Av. Montevideo", 330, "generador", "devorador", 200, 333, 0, 0.2);
    const Avenida_Otavalo = crearCalle("Av. Otavalo", 210, "generador", "devorador", 342, 292, 0, 0.2);
    const Avenida_17_de_mayo = crearCalle("Av. 17 de mayo", 92, "generador", "devorador", 313, 353, 90, 0.2);
    const Calle_Luis_Enrique_Erro_1 = crearCalle("Calle Luis Enrique Erro 1", 220, "generador", "conexion", 342, 306, 90, 0.2);
    const Calle_Luis_Enrique_Erro_2 = crearCalle("Calle Luis Enrique Erro 2", 41, "conexion", "devorador", 342, 86, 55, 0.2);
    const Calle_Miguel_Anda_y_Barredo = crearCalle("Calle Miguel Anda y Barredo", 153, "generador", "devorador", 415, 264, 90, 0.2);
    const Avenida_Wilfrido_Massieu_1 = crearCalle("Av. Wilfrido Massieu 1", 152, "generador", "conexion", 488, 265, 180, 0.2);
    const Avenida_Wilfrido_Massieu_2 = crearCalle("Av. Wilfrido Massieu 2", 164, "conexion", "devorador", 336, 265, 173, 0.2);
    const Avenida_Sierravista = crearCalle("Av. Sierravista", 61, "generador", "devorador", 541, 185, 150, 0.2);
    const Avenida_Lindavista = crearCalle("Av. Lindavista", 60, "generador", "devorador", 541, 230, 152, 0.2);
    const Avenida_Buenavista = crearCalle("Av. Buenavista", 60, "generador", "devorador", 540, 293, 152, 0.2);
    
    // Conectar calles
    conexion_calle_de_2(Avenida_Wilfrido_Massieu_1, Avenida_Wilfrido_Massieu_2);
    conexion_calle_de_2(Avenida_Miguel_Othon_de_Mendizabal, Avenida_Miguel_Bernard);
    conexion_calle_de_2(Calle_Luis_Enrique_Erro_1, Calle_Luis_Enrique_Erro_2);

    function animate(tiempoActual) {
        if (!tiempoAnterior) tiempoAnterior = tiempoActual;
        const tiempoTranscurrido = tiempoActual - tiempoAnterior;
    
        if (tiempoTranscurrido >= intervaloDeseado) {
            calles.forEach(actualizarCalle);
            conexiones.forEach(({ origen, destino }) => {
                destino.arreglo[0] = origen.arreglo[origen.tamano - 1];
            });
            renderizarCanvas();
            tiempoAnterior = tiempoActual; // Reiniciar el contador
        }
    
        animationId = requestAnimationFrame(animate);
    }

    animate(); // Iniciar la animación
}

// --- Zoom y Desplazamiento ---
canvas.addEventListener("wheel", event => {
    event.preventDefault();
    escala *= event.deltaY < 0 ? 1.1 : 0.9;
    renderizarCanvas();
});

canvas.addEventListener("mousedown", event => {
    isDragging = true;
    startX = event.clientX - offsetX;
    startY = event.clientY - offsetY;
});

canvas.addEventListener("mousemove", event => {
    if (isDragging) {
        offsetX = event.clientX - startX;
        offsetY = event.clientY - startY;
        renderizarCanvas();
    }
});

canvas.addEventListener("mouseup", () => isDragging = false);
canvas.addEventListener("mouseleave", () => isDragging = false);

canvas.addEventListener("touchstart", event => {
    lastTouchX = event.touches[0].clientX;
    lastTouchY = event.touches[0].clientY;
});

canvas.addEventListener("touchmove", event => {
    event.preventDefault();
    offsetX += event.touches[0].clientX - lastTouchX;
    offsetY += event.touches[0].clientY - lastTouchY;
    lastTouchX = event.touches[0].clientX;
    lastTouchY = event.touches[0].clientY;
    renderizarCanvas();
});

// Ajustar tamaño del canvas si cambia la ventana
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    renderizarCanvas();
});

// --- Funciones del Menú ---
function actualizarMenuCalles() {
    calleSelect.innerHTML = '<option value="">Seleccione una calle...</option>';
    calles.forEach(calle => {
      const option = document.createElement('option');
      option.value = calle.nombre; // Puedes usar un ID u otro método para identificar la calle
      option.text = calle.nombre; // Mostrar el nombre de la calle en el menú
      calleSelect.add(option);
    });
}


function aplicarCambiosCalle() {
    const nombreCalleSeleccionada = calleSelect.value;
    calleSeleccionada = calles.find(calle => calle.nombre === nombreCalleSeleccionada);
    if (calleSeleccionada) {
        calleSeleccionada.probabilidadGeneracion = parseFloat(probabilidadInput.value);
    }
}


// --- Event Listeners ---
btnActualizarCalle.addEventListener('click', aplicarCambiosCalle);
calleSelect.addEventListener('change', () => {
    const nombreCalleSeleccionada = calleSelect.value;
    calleSeleccionada = calles.find(calle => calle.nombre === nombreCalleSeleccionada);
    renderizarCanvas(); // Vuelve a dibujar el canvas para mostrar el rectángulo
});

// --- Inicialización ---
iniciarSimulacion();
actualizarMenuCalles();
