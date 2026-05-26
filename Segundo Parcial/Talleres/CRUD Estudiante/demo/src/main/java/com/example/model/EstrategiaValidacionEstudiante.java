package com.example.model;

/**
 * Strategy: contrato para validar datos de un estudiante.
 */
public interface EstrategiaValidacionEstudiante {
    /**
     * Valida los datos básicos de un estudiante.
     * @return Resultado con exito=true si pasa la validación.
     */
    Resultado validar(int id, String nombre, int edad);
}
