package com.example.model;

import java.util.ArrayList;
import java.util.List;

public class RepositorioEstudiante implements EstudianteSubject {

    private List<Estudiante> estudiantes = new ArrayList<>();
    private List<EstudianteObserver> observadores = new ArrayList<>();

    @Override
    public void registrarObservador(EstudianteObserver o) {
        if (!observadores.contains(o)) {
            observadores.add(o);
        }
    }

    @Override
    public void removerObservador(EstudianteObserver o) {
        observadores.remove(o);
    }

    @Override
    public void notificarObservadores() {
        for (EstudianteObserver observer : observadores) {
            observer.actualizar(new ArrayList<>(estudiantes));
        }
    }

    public boolean existeId(int id) {
        for (Estudiante e : estudiantes) {
            if (e.getId() == id) return true;
        }
        return false;
    }

    public void guardar(Estudiante estudiante) {
        estudiantes.add(estudiante);
        notificarObservadores(); // Notificación automática
    }

    public Estudiante buscarPorId(int id) {
        for (Estudiante e : estudiantes) {
            if (e.getId() == id) return e;
        }
        return null;
    }

    public void actualizar(Estudiante estudiante) {
        for (int i = 0; i < estudiantes.size(); i++) {
            if (estudiantes.get(i).getId() == estudiante.getId()) {
                estudiantes.set(i, estudiante);
                notificarObservadores(); // Notificación automática
                return;
            }
        }
    }

    public void eliminar(int id) {
        estudiantes.removeIf(e -> e.getId() == id);
        notificarObservadores(); // Notificación automática
    }

    public List<Estudiante> listarTodos() {
        return estudiantes;
    }
}