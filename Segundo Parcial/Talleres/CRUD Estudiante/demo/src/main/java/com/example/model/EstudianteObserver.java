package com.example.model;

import java.util.List;

public interface EstudianteObserver {
    // Este método se ejecutará automáticamente en la vista al haber un cambio
    void actualizar(List<Estudiante> estudiantes);
}