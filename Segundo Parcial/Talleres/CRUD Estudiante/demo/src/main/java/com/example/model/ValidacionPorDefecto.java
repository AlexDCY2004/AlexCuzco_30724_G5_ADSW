package com.example.model;

/**
 * Implementación por defecto de la estrategia de validación.
 */
public class ValidacionPorDefecto implements EstrategiaValidacionEstudiante {

    @Override
    public Resultado validar(int id, String nombre, int edad) {
        if (id <= 0) return new Resultado(false, "ID debe ser mayor que 0");
        if (nombre == null || nombre.trim().isEmpty())
            return new Resultado(false, "Nombre no puede estar vacío");
        if (!nombre.matches("[A-Za-zÁÉÍÓÚáéíóúÑñ\\s]+"))
            return new Resultado(false, "Nombre solo debe contener letras y espacios");
        if (edad <= 0) return new Resultado(false, "Edad debe ser mayor que 0");
        return new Resultado(true, "OK");
    }
}
