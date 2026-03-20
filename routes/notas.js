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

router.get('/notas', authGet, (req, res) => {
    const { periodo, inscripcionId } = req.query;
    let query = `SELECT n.*, e.Nombre as NombreEstudiante, e.Apellido as ApellidoEstudiante,
                 c.Nombre as NombreCurso FROM Notas n
                 JOIN Inscripciones i ON n.InscripcionId = i.InscripcionId
                 JOIN Estudiantes e ON i.EstudianteId = e.EstudianteId
                 JOIN Cursos c ON i.CursoId = c.CursoId WHERE 1=1`;
    const params = [];
    if (periodo) { query += ' AND n.Periodo LIKE ?'; params.push(`%${periodo}%`); }
    if (inscripcionId) { query += ' AND n.InscripcionId = ?'; params.push(inscripcionId); }
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, total: rows.length, data: rows });
    });
});

router.get('/notas/:id', authGet, (req, res) => {
    const query = `SELECT n.*, e.Nombre as NombreEstudiante, e.Apellido as ApellidoEstudiante,
                   c.Nombre as NombreCurso FROM Notas n
                   JOIN Inscripciones i ON n.InscripcionId = i.InscripcionId
                   JOIN Estudiantes e ON i.EstudianteId = e.EstudianteId
                   JOIN Cursos c ON i.CursoId = c.CursoId WHERE n.NotaId = ?`;
    db.get(query, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Nota no encontrada' });
        res.json({ success: true, data: row });
    });
});

router.post('/notas', authAdmin, (req, res) => {
    const { inscripcionId, valor, periodo, observacion } = req.body;
    if (!inscripcionId || valor === undefined || valor === null || !periodo)
        return res.status(400).json({ success: false, message: 'inscripcionId, valor y periodo son obligatorios' });
    if (isNaN(valor) || valor < 0 || valor > 5)
        return res.status(400).json({ success: false, message: 'El valor debe ser un número entre 0.0 y 5.0' });

    db.get('SELECT InscripcionId FROM Inscripciones WHERE InscripcionId = ?', [inscripcionId], (err, inscripcion) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!inscripcion) return res.status(404).json({ success: false, message: 'La inscripción no existe' });

        db.run('INSERT INTO Notas (InscripcionId, Valor, Periodo, Observacion) VALUES (?, ?, ?, ?)',
            [inscripcionId, valor, periodo, observacion || null],
            function (err) {
                if (err) return res.status(500).json({ success: false, message: err.message });
                res.status(201).json({ success: true, data: { id: this.lastID, inscripcionId, valor, periodo, observacion } });
            }
        );
    });
});

router.put('/notas/:id', authAdmin, (req, res) => {
    const { inscripcionId, valor, periodo, observacion } = req.body;
    if (!inscripcionId || valor === undefined || valor === null || !periodo)
        return res.status(400).json({ success: false, message: 'inscripcionId, valor y periodo son obligatorios' });
    if (isNaN(valor) || valor < 0 || valor > 5)
        return res.status(400).json({ success: false, message: 'El valor debe ser un número entre 0.0 y 5.0' });

    db.get('SELECT NotaId FROM Notas WHERE NotaId = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Nota no encontrada' });

        db.get('SELECT InscripcionId FROM Inscripciones WHERE InscripcionId = ?', [inscripcionId], (err, inscripcion) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            if (!inscripcion) return res.status(404).json({ success: false, message: 'La inscripción no existe' });

            db.run('UPDATE Notas SET InscripcionId = ?, Valor = ?, Periodo = ?, Observacion = ? WHERE NotaId = ?',
                [inscripcionId, valor, periodo, observacion || null, req.params.id],
                function (err) {
                    if (err) return res.status(500).json({ success: false, message: err.message });
                    res.json({ success: true, data: { id: req.params.id, inscripcionId, valor, periodo, observacion } });
                }
            );
        });
    });
});

router.delete('/notas/:id', authAdmin, (req, res) => {
    db.get('SELECT NotaId FROM Notas WHERE NotaId = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Nota no encontrada' });
        db.run('DELETE FROM Notas WHERE NotaId = ?', [req.params.id], function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, message: 'La nota ha sido eliminada' });
        });
    });
});

module.exports = router;