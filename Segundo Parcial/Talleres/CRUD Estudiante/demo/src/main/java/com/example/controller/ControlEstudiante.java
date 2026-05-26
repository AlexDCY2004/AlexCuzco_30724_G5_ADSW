package com.example.controller;

import com.example.flyweight.EstudianteFlyweight;
import com.example.flyweight.FabricaFlyweight;
import com.example.model.Estudiante;
import com.example.model.EstrategiaValidacionEstudiante;
import com.example.model.ValidacionPorDefecto;
import com.example.model.EstudianteObserver;
import com.example.model.RepositorioEstudiante;
import com.example.model.Resultado;

import java.util.List;

public class ControlEstudiante {

    private final RepositorioEstudiante repo;

    // Strategy: validación de estudiantes (inyectable)
    private final EstrategiaValidacionEstudiante estrategiaValidacion;

    // ── Patrón Flyweight ──────────────────────────────────────────────────────
    // Una sola fábrica centralizada para toda la sesión del controlador.
    private final FabricaFlyweight fabricaFlyweight = new FabricaFlyweight();
    // ─────────────────────────────────────────────────────────────────────────

    /** Carrera y turno por defecto cuando se agrega sin especificarlos. */
    private static final String CARRERA_DEFAULT = "Sistemas";
    private static final String TURNO_DEFAULT   = "Mañana";

    // CONSTRUCTORES: Recibe la instancia compartida del repositorio
    public ControlEstudiante(RepositorioEstudiante repo) {
        this(repo, null);
    }

    public ControlEstudiante(RepositorioEstudiante repo, EstrategiaValidacionEstudiante estrategia) {
        this.repo = repo;
        this.estrategiaValidacion = (estrategia != null) ? estrategia : new ValidacionPorDefecto();
    }

    // MÉTODO PUENTE: Registra la vista como observadora en el repositorio
    public void registrarObservador(EstudianteObserver o) {
        this.repo.registrarObservador(o);
    }

    /**
     * Agrega un estudiante con carrera y turno por defecto.
     * El Flyweight correspondiente es obtenido (o reutilizado) de la fábrica.
     */
    public Resultado agregarEstudiante(int id, String nombre, int edad) {
        return agregarEstudiante(id, nombre, edad, CARRERA_DEFAULT, TURNO_DEFAULT);
    }

    /**
     * Agrega un estudiante especificando carrera y turno.
     * Aquí se aplica el patrón Flyweight: la fábrica garantiza que dos
     * estudiantes con la misma carrera y turno compartan el mismo objeto
     * EstudianteEstadoCompartido en memoria.
     */
    public Resultado agregarEstudiante(int id, String nombre, int edad,
                                       String carrera, String turno) {
        Resultado valid = this.estrategiaValidacion.validar(id, nombre, edad);
        if (!valid.isExito()) return valid;
        if (repo.existeId(id)) {
            return new Resultado(false, "El ID ya existe");
        }

        // ── Flyweight en acción ───────────────────────────────────────────────
        EstudianteFlyweight fw = fabricaFlyweight.obtenerFlyweight(carrera, turno);
        // El estado extrínseco (id, nombre, edad) se pasa en cada llamada;
        // el estado intrínseco (carrera, turno) ya está dentro del flyweight.
        System.out.println(fw.mostrarInfo(id, nombre, edad));
        // ─────────────────────────────────────────────────────────────────────

        Estudiante estudiante = new Estudiante(id, nombre, edad);
        repo.guardar(estudiante);
        return new Resultado(true, "Estudiante agregado");
    }

    public Resultado actualizarEstudiante(int id, String nombre, int edad) {
        Resultado valid = this.estrategiaValidacion.validar(id, nombre, edad);
        if (!valid.isExito()) return valid;
        Estudiante existente = repo.buscarPorId(id);
        if (existente == null) {
            return new Resultado(false, "Estudiante no encontrado");
        }
        Estudiante actualizado = new Estudiante(id, nombre, edad);
        repo.actualizar(actualizado);
        return new Resultado(true, "Estudiante actualizado");
    }

    public Resultado eliminarEstudiante(int id) {
        if (!repo.existeId(id)) {
            return new Resultado(false, "Estudiante no encontrado");
        }
        repo.eliminar(id);
        return new Resultado(true, "Estudiante eliminado");
    }

    public List<Estudiante> mostrarTodos() {
        return repo.listarTodos();
    }

    /** Muestra el estado actual del pool de flyweights (útil para depuración). */
    public void mostrarPoolFlyweights() {
        fabricaFlyweight.mostrarPool();
    }

    /** Cantidad de instancias únicas en el pool de flyweights. */
    public int cantidadFlyweights() {
        return fabricaFlyweight.cantidadFlyweights();
    }

    // NOTE: La validación ahora está delegada a la estrategia `EstrategiaValidacionEstudiante`.
}
