package com.example.view;

import com.example.controller.ControlEstudiante;
import com.example.model.Estudiante;
import com.example.model.Resultado;
import com.example.model.EstudianteObserver;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.List;

// Implementamos la interfaz del observador
public class FormularioCrudEstudiante extends JFrame implements EstudianteObserver {

    private final ControlEstudiante control;
    private JTextField txtIdInput;
    private JTextField txtNombreInput;
    private JTextField txtEdadInput;
    private JButton btnAgregar;
    private JButton btnActualizar;
    private JButton btnEliminar;
    private JButton btnMostrar;
    private JTable tabla;

    // Pasamos el controlador ya configurado desde el Main
    public FormularioCrudEstudiante(ControlEstudiante control) {
        this.control = control;
        
        // Nos suscribimos para escuchar los cambios del repositorio
        this.control.registrarObservador(this);

        setTitle("CRUD Estudiante");
        setSize(700, 500);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout(8, 8));

        // Panel de entrada
        JPanel pnlEntrada = new JPanel(new GridBagLayout());
        GridBagConstraints c = new GridBagConstraints();
        c.insets = new Insets(4, 4, 4, 4);
        c.fill = GridBagConstraints.HORIZONTAL;

        c.gridx = 0; c.gridy = 0; pnlEntrada.add(new JLabel("ID:"), c);
        txtIdInput = new JTextField(10);
        c.gridx = 1; c.gridy = 0; pnlEntrada.add(txtIdInput, c);

        c.gridx = 0; c.gridy = 1; pnlEntrada.add(new JLabel("Nombre:"), c);
        txtNombreInput = new JTextField(20);
        c.gridx = 1; c.gridy = 1; pnlEntrada.add(txtNombreInput, c);

        c.gridx = 0; c.gridy = 2; pnlEntrada.add(new JLabel("Edad:"), c);
        txtEdadInput = new JTextField(5);
        c.gridx = 1; c.gridy = 2; pnlEntrada.add(txtEdadInput, c);

        // Botones
        JPanel pnlBtns = new JPanel(new FlowLayout(FlowLayout.LEFT, 8, 0));
        btnAgregar = new JButton("Agregar");
        btnActualizar = new JButton("Actualizar");
        btnEliminar = new JButton("Eliminar");
        btnMostrar = new JButton("Mostrar todos");
        pnlBtns.add(btnAgregar);
        pnlBtns.add(btnActualizar);
        pnlBtns.add(btnEliminar);
        pnlBtns.add(btnMostrar);

        c.gridx = 0; c.gridy = 3; c.gridwidth = 2; pnlEntrada.add(pnlBtns, c);

        add(pnlEntrada, BorderLayout.NORTH);

        // Tabla
        tabla = new JTable(new DefaultTableModel(new Object[]{"ID", "Nombre", "Edad"}, 0));
        add(new JScrollPane(tabla), BorderLayout.CENTER);

        // Listeners
        btnAgregar.addActionListener(e -> clickAgregar());
        btnActualizar.addActionListener(e -> clickActualizar());
        btnEliminar.addActionListener(e -> clickEliminar());
        btnMostrar.addActionListener(e -> clickMostrarTodo());
    }

    // --- AQUÍ ESTÁ LA MAGIA DEL OBSERVER ---
    @Override
    public void actualizar(List<Estudiante> estudiantes) {
        // Cada vez que el repositorio cambie, la tabla se refrescará sola sin llamarla desde los clics
        mostrarTabla(estudiantes);
        
        // Aquí podrías agregar lo que mencionabas:
        // actualizarContadores(estudiantes.size());
        // lblEstado.setText("Lista actualizada automáticamente.");
    }

    public void clickAgregar() {
        Integer id = parseInteger(txtIdInput.getText(), "ID");
        Integer edad = parseInteger(txtEdadInput.getText(), "Edad");
        if (id == null || edad == null) return;
        String nombre = txtNombreInput.getText();
        Resultado r = control.agregarEstudiante(id, nombre, edad);
        if (r.isExito()) {
            limpiarCampos();
            return;
        }
        mostrarMensaje(r.getMensaje());
    }

    public void clickActualizar() {
        Integer id = parseInteger(txtIdInput.getText(), "ID");
        Integer edad = parseInteger(txtEdadInput.getText(), "Edad");
        if (id == null || edad == null) return;
        String nombre = txtNombreInput.getText();
        Resultado r = control.actualizarEstudiante(id, nombre, edad);
        if (r.isExito()) {
            limpiarCampos();
            return;
        }
        mostrarMensaje(r.getMensaje());
    }

    public void clickEliminar() {
        Integer id = parseInteger(txtIdInput.getText(), "ID");
        if (id == null) return;
        Resultado r = control.eliminarEstudiante(id);
        if (r.isExito()) {
            limpiarCampos();
            return;
        }
        mostrarMensaje(r.getMensaje());
    }

    public void clickMostrarTodo() {
        List<Estudiante> lista = control.mostrarTodos();
        mostrarTabla(lista);
    }

    public void mostrarMensaje(String mensaje) {
        JOptionPane.showMessageDialog(this, mensaje);
    }

    private void limpiarCampos() {
        txtIdInput.setText("");
        txtNombreInput.setText("");
        txtEdadInput.setText("");
    }

    public void mostrarTabla(List<Estudiante> estudiantes) {
        JTable t = this.tabla != null ? this.tabla : encontrarTabla();
        if (t == null) return;

        DefaultTableModel modelo = (DefaultTableModel) t.getModel();
        modelo.setRowCount(0);
        for (Estudiante e : estudiantes) {
            modelo.addRow(new Object[]{e.getId(), e.getNombre(), e.getEdad()});
        }
    }

    private Integer parseInteger(String text, String fieldName) {
        try {
            return Integer.parseInt(text.trim());
        } catch (Exception ex) {
            mostrarMensaje(fieldName + " debe ser un número entero");
            return null;
        }
    }

    private JTable encontrarTabla() {
        Deque<Component> pendientes = new ArrayDeque<>();
        pendientes.add(getContentPane());

        while (!pendientes.isEmpty()) {
            Component componente = pendientes.removeFirst();
            if (componente instanceof JTable) return (JTable) componente;
            if (componente instanceof Container) {
                for (Component hijo : ((Container) componente).getComponents()) {
                    pendientes.addLast(hijo);
                }
            }
        }
        return null;
    }

    // ... (Métodos de validación numérica y de texto se quedan igual) ...
}