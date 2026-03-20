const express = require('express');
const router = express.Router();
const db = require('../db');

function authGet(req, res, next) {
    const apiKey = req.headers['password'];
    if (!apiKey) return res.status(401).json({ success: false, message: 'API key es requerida' });
    if (apiKey !== process.env.API_PASSWORD_GET && apiKey !== process.env.API_PASSWORD_ADMIN)
        return res.status(403).json({ success: false, message: 'Error la password no es correcta' });
    next();
}

function authAdmin(req, res, next) {
    const apiKey = req.headers['password'];
    const role = req.headers['x-user-role'];
    if (!apiKey) return res.status(401).json({ success: false, message: 'API key es requerida' });
    if (apiKey !== process.env.API_PASSWORD_ADMIN) return res.status(403).json({ success: false, message: 'Error la password no es correcta' });
    if (role !== 'admin') return res.status(403).json({ success: false, message: 'No tienes permisos para realizar esta acción' });
    next();
}

router.get('/cursos', authGet, (req, res) => {
    const { nombre, periodo } = req.query;
    let query = `SELECT c.*, p.Nombre as NombreProfesor, m.Nombre as NombreMateria 
                 FROM Cursos c
                 JOIN Profesores p ON c.ProfesorId = p.ProfesorId
                 JOIN Materias m ON c.MateriaId = m.MateriaId
                 WHERE 1=1`;
    const params = [];
    if (nombre) { query += ' AND c.Nombre LIKE ?'; params.push(`%${nombre}%`); }
    if (periodo) { query += ' AND c.Periodo LIKE ?'; params.push(`%${periodo}%`); }
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, total: rows.length, data: rows });
    });
});

router.get('/cursos/:id', authGet, (req, res) => {
    const query = `SELECT c.*, p.Nombre as NombreProfesor, m.Nombre as NombreMateria 
                   FROM Cursos c
                   JOIN Profesores p ON c.ProfesorId = p.ProfesorId
                   JOIN Materias m ON c.MateriaId = m.MateriaId
                   WHERE c.CursoId = ?`;
    db.get(query, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Curso no encontrado' });
        res.json({ success: true, data: row });
    });
});

router.post('/cursos', authAdmin, (req, res) => {
    const { nombre, profesorId, materiaId, periodo } = req.body;
    if (!nombre || !profesorId || !materiaId || !periodo)
        return res.status(400).json({ success: false, message: 'nombre, profesorId, materiaId y periodo son obligatorios' });

    db.get('SELECT ProfesorId FROM Profesores WHERE ProfesorId = ?', [profesorId], (err, profesor) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!profesor) return res.status(404).json({ success: false, message: 'El profesor no existe' });

        db.get('SELECT MateriaId FROM Materias WHERE MateriaId = ?', [materiaId], (err, materia) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            if (!materia) return res.status(404).json({ success: false, message: 'La materia no existe' });

            db.run('INSERT INTO Cursos (Nombre, ProfesorId, MateriaId, Periodo) VALUES (?, ?, ?, ?)',
                [nombre, profesorId, materiaId, periodo],
                function (err) {
                    if (err) return res.status(500).json({ success: false, message: err.message });
                    res.status(201).json({ success: true, data: { id: this.lastID, nombre, profesorId, materiaId, periodo } });
                }
            );
        });
    });
});

router.put('/cursos/:id', authAdmin, (req, res) => {
    const { nombre, profesorId, materiaId, periodo } = req.body;
    if (!nombre || !profesorId || !materiaId || !periodo)
        return res.status(400).json({ success: false, message: 'nombre, profesorId, materiaId y periodo son obligatorios' });

    db.get('SELECT CursoId FROM Cursos WHERE CursoId = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Curso no encontrado' });

        db.get('SELECT ProfesorId FROM Profesores WHERE ProfesorId = ?', [profesorId], (err, profesor) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            if (!profesor) return res.status(404).json({ success: false, message: 'El profesor no existe' });

            db.get('SELECT MateriaId FROM Materias WHERE MateriaId = ?', [materiaId], (err, materia) => {
                if (err) return res.status(500).json({ success: false, message: err.message });
                if (!materia) return res.status(404).json({ success: false, message: 'La materia no existe' });

                db.run('UPDATE Cursos SET Nombre = ?, ProfesorId = ?, MateriaId = ?, Periodo = ? WHERE CursoId = ?',
                    [nombre, profesorId, materiaId, periodo, req.params.id],
                    function (err) {
                        if (err) return res.status(500).json({ success: false, message: err.message });
                        res.json({ success: true, data: { id: req.params.id, nombre, profesorId, materiaId, periodo } });
                    }
                );
            });
        });
    });
});

router.delete('/cursos/:id', authAdmin, (req, res) => {
    db.get('SELECT CursoId FROM Cursos WHERE CursoId = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Curso no encontrado' });
        db.run('DELETE FROM Cursos WHERE CursoId = ?', [req.params.id], function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, message: 'El curso ha sido eliminado' });
        });
    });
});

module.exports = router;