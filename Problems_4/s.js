const canvas = document.getElementById("simuladorCanvas");
const ctx = canvas.getContext("2d");

// Ajustar tamaño del canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Configuración
const celda_tamano = 5;
let escala = 1;
let offsetX = 0, offsetY = 0;
let isDragging = false, startX, startY;
let lastTouchX, lastTouchY;

// Reglas de tráfico
const reglas = {
    "0,0,0": 0, "0,0,1": 0, "0,1,0": 0, "0,1,1": 1,
    "1,0,0": 1, "1,0,1": 1, "1,1,0": 0, "1,1,1": 1
};

// Calles y conexiones
let calles = [], conexiones = [];

// Cargar imágenes
const carroImg = new Image();
carroImg.src = "carro.png";

const carreteraImg = new Image();
carreteraImg.src = "carretera.png";

// Función para crear una calle con posición, ángulo y tamaño
function crearCalle(nombre, tamano, tipoInicio, tipoFinal, x, y, angulo, probabilidadGeneracion) {
    let calle = {
        nombre,
        tamano,
        tipoInicio,
        tipoFinal,
        probabilidadGeneracion,
        arreglo: new Array(tamano).fill(0),
        x: x * celda_tamano,
        y: y * celda_tamano,
        angulo
    };

    if (tipoInicio === "generador") {
        for (let i = 0; i < tamano; i++) {
            calle.arreglo[i] = Math.random() < 0.1 ? 1 : 0;
        }
    }

    calles.push(calle);
    return calle;
}

// Actualizar calles
function actualizarCalle(calle) {
    let nuevaCalle = [...calle.arreglo];
    if (calle.tipoInicio === "generador" && Math.random() < calle.probabilidadGeneracion) {
        nuevaCalle[0] = 1;
    }

    for (let i = 1; i < calle.tamano; i++) {
        let reglaKey = `${calle.arreglo[i - 1]},${calle.arreglo[i]},${calle.arreglo[i + 1] || 0}`;
        nuevaCalle[i] = reglas[reglaKey];
    }

    calle.arreglo = nuevaCalle;
}

// Dibujar calles
function dibujarCalles() {
    calles.forEach(calle => {
        ctx.save();
        ctx.translate(calle.x, calle.y);
        ctx.rotate(-calle.angulo * Math.PI / 180);
        for (let i = 0; i < calle.tamano; i++) {
            ctx.drawImage(carreteraImg, i * celda_tamano, 0, celda_tamano, celda_tamano);
        }

        calle.arreglo.forEach((celda, i) => {
            if (celda === 1) {
                ctx.drawImage(carroImg, i * celda_tamano, 0, celda_tamano, celda_tamano);
            }
        });

        ctx.restore();
    });
}

// Renderizar canvas
function renderizarCanvas() {
    ctx.fillStyle = "#c6cbcd";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(escala, 0, 0, escala, offsetX, offsetY);
    dibujarCalles();
}

// Iniciar simulación con calles predefinidas
function iniciarSimulacion() {
    crearCalle("Avenida Miguel Othon de Mendizabal", 277, "generador", "conexion", 108, 192, 39, 0.2);
    crearCalle("Avenida Cien Metros", 250, "generador", "devorador", 134, 115, -73, 0.2);
    crearCalle("Avenida Juan de Dios Batiz", 422, "generador", "devorador", 210, 110, 0, 0.2);

    function animate() {
        calles.forEach(actualizarCalle);
        renderizarCanvas();
        requestAnimationFrame(animate);
    }
    animate();
}

// Llenar opciones del `select`
function cargarCallesEnSelect() {
    const select = document.getElementById("selectCalle");
    calles.forEach(calle => {
        let option = document.createElement("option");
        option.value = calle.nombre;
        option.textContent = calle.nombre;
        select.appendChild(option);
    });
}

// Modificar `probabilidadGeneracion`
document.getElementById("btnActualizarCalle").addEventListener("click", () => {
    let nombreCalle = document.getElementById("selectCalle").value;
    let nuevaProbabilidad = parseFloat(document.getElementById("inputProbabilidad").value);
    let calle = calles.find(c => c.nombre === nombreCalle);
    if (calle) calle.probabilidadGeneracion = nuevaProbabilidad;
});

window.onload = () => {
    iniciarSimulacion();
    cargarCallesEnSelect();
};
