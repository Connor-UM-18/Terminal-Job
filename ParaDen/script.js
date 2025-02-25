// Definición de las reglas
function aplicarReglas(a, b, c) {
    if (a === 0 && b === 0 && c === 0) return 0;
    if (a === 0 && b === 0 && c === 1) return 0;
    if (a === 0 && b === 1 && c === 0) return 0;
    if (a === 0 && b === 1 && c === 1) return 1;
    if (a === 1 && b === 0 && c === 0) return 1;
    if (a === 1 && b === 0 && c === 1) return 1;
    if (a === 1 && b === 1 && c === 0) return 0;
    if (a === 1 && b === 1 && c === 1) return 1;
    return 0; // Por defecto, si no coincide con ninguna regla
}

// Función para actualizar la calle
function actualizarCalle(calle) {
    const nuevaCalle = new Array(calle.length);

    for (let i = 0; i < calle.length; i++) {
        const a = (i === 0) ? 0 : calle[i - 1]; // Celda anterior
        const b = calle[i];                     // Celda actual
        const c = (i === calle.length - 1) ? 0 : calle[i + 1]; // Celda siguiente

        nuevaCalle[i] = aplicarReglas(a, b, c);
    }

    return nuevaCalle;
}

// Función para renderizar la calle en el DOM
function renderizarCalle(calle) {
    const calleElement = document.getElementById("calle");
    calleElement.innerHTML = ""; // Limpiar el contenido anterior

    calle.forEach((valor) => {
        const celda = document.createElement("div");
        celda.classList.add("celda");
        if (valor === 1) {
            celda.classList.add("carro");
            celda.textContent = "🚗"; // Emoji de carro
        } else {
            celda.textContent = ""; // Espacio vacío
        }
        calleElement.appendChild(celda);
    });
}

// Función para generar un carro en la posición 0 con una probabilidad dada
function generarCarro(calle, probabilidad) {
    if (Math.random() < probabilidad) {
        calle[0] = 1; // Generar un carro en la posición 0
    }
}

// Estado inicial de la calle
let calle = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1,1,1,1,1,1,1,1,0,0,0]; // Calle vacía al inicio

// Probabilidad de generar un carro en la posición 0 (entre 0 y 1)
const probabilidadGenerarCarro = 0.01; // 50% de probabilidad

// Función para iniciar la simulación
function iniciarSimulacion() {
    setInterval(() => {
        // Generar un carro en la posición 0 si está vacía y se cumple la probabilidad
        generarCarro(calle, probabilidadGenerarCarro);

        // Actualizar la calle según las reglas
        calle = actualizarCalle(calle);

        // Renderizar la calle en el DOM
        renderizarCalle(calle);
    }, 200); // Intervalo de 1 segundo (1000 ms)
}

// Iniciar la simulación al cargar la página
document.addEventListener("DOMContentLoaded", iniciarSimulacion);