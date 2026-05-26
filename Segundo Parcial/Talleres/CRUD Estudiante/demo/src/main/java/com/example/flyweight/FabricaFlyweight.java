package com.example.flyweight;

import java.util.HashMap;
import java.util.Map;

/**
 * Fábrica Flyweight (FlyweightFactory).
 *
 * Mantiene un pool (caché) de instancias EstudianteFlyweight indexadas
 * por la clave "carrera|turno". Si la instancia ya existe la reutiliza;
 * si no, la crea y la almacena.
 *
 * Esto garantiza que dos estudiantes con la misma carrera y turno
 * compartan exactamente el mismo objeto EstudianteEstadoCompartido
 * en memoria, reduciendo el consumo cuando hay muchos registros.
 */
public class FabricaFlyweight {

    // Pool de flyweights: clave → instancia compartida
    private final Map<String, EstudianteFlyweight> pool = new HashMap<>();

    /**
     * Devuelve el Flyweight correspondiente a la combinación carrera+turno.
     * Crea uno nuevo solo si no existe todavía.
     */
    public EstudianteFlyweight obtenerFlyweight(String carrera, String turno) {
        String clave = generarClave(carrera, turno);

        if (!pool.containsKey(clave)) {
            EstudianteEstadoCompartido estado = new EstudianteEstadoCompartido(carrera, turno);
            pool.put(clave, new EstudianteFlyweight(estado));
            System.out.println("[FabricaFlyweight] Nuevo flyweight creado → " + clave);
        } else {
            System.out.println("[FabricaFlyweight] Flyweight reutilizado   → " + clave);
        }

        return pool.get(clave);
    }

    /** Cantidad de flyweights distintos actualmente en el pool. */
    public int cantidadFlyweights() {
        return pool.size();
    }

    /** Imprime el estado interno del pool para depuración. */
    public void mostrarPool() {
        System.out.println("\n=== Pool de Flyweights ===");
        pool.forEach((clave, fw) ->
            System.out.println("  Clave: " + clave + " → " + fw.getEstadoCompartido())
        );
        System.out.println("  Total instancias compartidas: " + pool.size());
        System.out.println("===========================\n");
    }

    private String generarClave(String carrera, String turno) {
        return carrera.trim().toLowerCase() + "|" + turno.trim().toLowerCase();
    }
}
