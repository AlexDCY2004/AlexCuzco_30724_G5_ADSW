package com.example.flyweight;

/**
 * Flyweight — Estado INTRÍNSECO (compartido, inmutable).
 *
 * Representa la "categoría" de un estudiante: datos que se repiten
 * entre muchos registros y que no cambian por estudiante individual.
 * En este dominio: la carrera y el turno.
 *
 * Una única instancia de esta clase puede ser reutilizada por
 * múltiples objetos EstudianteFlyweight que compartan los mismos
 * valores de carrera y turno.
 */
public class EstudianteEstadoCompartido {

    // Estado intrínseco: inmutable y compartido
    private final String carrera;
    private final String turno;   // "Mañana", "Tarde", "Noche"

    public EstudianteEstadoCompartido(String carrera, String turno) {
        this.carrera = carrera;
        this.turno   = turno;
    }

    public String getCarrera() { return carrera; }
    public String getTurno()   { return turno;   }

    @Override
    public String toString() {
        return carrera + " / " + turno;
    }
}
