package com.example;

import com.example.controller.ControlEstudiante;
import com.example.model.RepositorioEstudiante;
import com.example.view.FormularioCrudEstudiante;

import javax.swing.*;

public class Main {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            // 1. Instancia única del repositorio en memoria (Sujeto)
            RepositorioEstudiante repo = new RepositorioEstudiante();
            
            // 2. Se inyecta la instancia del repositorio en el controlador
            ControlEstudiante control = new ControlEstudiante(repo);
            
            // 3. Se pasa el controlador configurado al formulario visual
            FormularioCrudEstudiante formulario = new FormularioCrudEstudiante(control);
            
            formulario.setVisible(true);
        });
    }
}