#include <stdio.h>
#include <stdlib.h>

// Definición de las reglas
int aplicar_reglas(int a, int b, int c) {
    if (a == 0 && b == 0 && c == 0) return 0;
    if (a == 0 && b == 0 && c == 1) return 0;
    if (a == 0 && b == 1 && c == 0) return 0;
    if (a == 0 && b == 1 && c == 1) return 1;
    if (a == 1 && b == 0 && c == 0) return 1;
    if (a == 1 && b == 0 && c == 1) return 1;
    if (a == 1 && b == 1 && c == 0) return 0;
    if (a == 1 && b == 1 && c == 1) return 1;
    return 0; // Por defecto, si no coincide con ninguna regla
}

// Función para imprimir el arreglo
void imprimir_arreglo(int *arreglo, int longitud) {
    for (int i = 0; i < longitud; i++) {
        printf("%d ", arreglo[i]);
    }
    printf("\n");
}

int main() {
    // Definir el tamaño del arreglo (calle)
    int longitud = 10;
    int calle[] = {0, 1, 1, 1, 0, 0, 0, 1, 0, 0}; // Estado inicial de la calle

    // Número de iteraciones de la simulación
    int iteraciones = 5;

    // Arreglo para almacenar el nuevo estado de la calle
    int nueva_calle[longitud];

    // Simulación
    for (int iter = 0; iter < iteraciones; iter++) {
        printf("Iteración %d:\n", iter + 1);

        // Imprimir el arreglo antiguo
        printf("Arreglo antiguo: ");
        imprimir_arreglo(calle, longitud);

        // Aplicar las reglas para actualizar la calle
        for (int i = 0; i < longitud; i++) {
            int a = (i == 0) ? 0 : calle[i - 1]; // Celda anterior
            int b = calle[i];                    // Celda actual
            int c = (i == longitud - 1) ? 0 : calle[i + 1]; // Celda siguiente

            nueva_calle[i] = aplicar_reglas(a, b, c);
        }

        // Imprimir el arreglo nuevo
        printf("Arreglo nuevo:   ");
        imprimir_arreglo(nueva_calle, longitud);

        // Copiar el nuevo arreglo al arreglo original para la siguiente iteración
        for (int i = 0; i < longitud; i++) {
            calle[i] = nueva_calle[i];
        }

        printf("\n");
    }

    return 0;
}