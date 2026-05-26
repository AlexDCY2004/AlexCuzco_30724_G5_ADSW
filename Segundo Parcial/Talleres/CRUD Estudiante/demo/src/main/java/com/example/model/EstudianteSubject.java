package com.example.model;

public interface EstudianteSubject {
    void registrarObservador(EstudianteObserver o);
    void removerObservador(EstudianteObserver o);
    void notificarObservadores();
}
