package com.example.flyweight;

/**
 * Flyweight Concreto.
 *
 * Combina el estado INTRÍNSECO (compartido, guardado en EstudianteEstadoCompartido)
 * con el estado EXTRÍNSECO (único por estudiante: id, nombre, edad).
 *
 * El cliente (RepositorioEstudiante) suministra el estado extrínseco
 * en cada llamada; el estado intrínseco proviene del objeto compartido
 * que entrega la FábricaFlyweight.
 */
public class EstudianteFlyweight {

    // Estado intrínseco — viene de la fábrica, compartido
    private final EstudianteEstadoCompartido estadoCompartido;

    public EstudianteFlyweight(EstudianteEstadoCompartido estadoCompartido) {
        this.estadoCompartido = estadoCompartido;
    }

    /**
     * Operación del Flyweight.
     * El cliente pasa el estado extrínseco (id, nombre, edad) en cada llamada.
     *
     * @return String con la representación completa del estudiante.
     */
    public String mostrarInfo(int id, String nombre, int edad) {
        return String.format(
            "[Flyweight] ID: %d | Nombre: %-20s | Edad: %2d | Carrera: %s | Turno: %s",
            id, nombre, edad,
            estadoCompartido.getCarrera(),
            estadoCompartido.getTurno()
        );
    }

    public EstudianteEstadoCompartido getEstadoCompartido() {
        return estadoCompartido;
    }
}
