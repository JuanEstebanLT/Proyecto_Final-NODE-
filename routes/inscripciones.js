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

router.get('/inscripciones', authGet, (req, res) => {
    const { estado, estudianteId, cursoId } = req.query;
    let query = `SELECT i.*, e.Nombre as NombreEstudiante, e.Apellido as ApellidoEstudiante,
                 c.Nombre as NombreCurso FROM Inscripciones i
                 JOIN Estudiantes e ON i.EstudianteId = e.EstudianteId
                 JOIN Cursos c ON i.CursoId = c.CursoId WHERE 1=1`;
    const params = [];
    if (estado) { query += ' AND i.Estado LIKE ?'; params.push(`%${estado}%`); }
    if (estudianteId) { query += ' AND i.EstudianteId = ?'; params.push(estudianteId); }
    if (cursoId) { query += ' AND i.CursoId = ?'; params.push(cursoId); }
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, total: rows.length, data: rows });
    });
});

router.get('/inscripciones/:id', authGet, (req, res) => {
    const query = `SELECT i.*, e.Nombre as NombreEstudiante, e.Apellido as ApellidoEstudiante,
                   c.Nombre as NombreCurso FROM Inscripciones i
                   JOIN Estudiantes e ON i.EstudianteId = e.EstudianteId
                   JOIN Cursos c ON i.CursoId = c.CursoId WHERE i.InscripcionId = ?`;
    db.get(query, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Inscripción no encontrada' });
        res.json({ success: true, data: row });
    });
});

router.post('/inscripciones', authAdmin, (req, res) => {
    const { estudianteId, cursoId, estado = 'activo' } = req.body;
    if (!estudianteId || !cursoId)
        return res.status(400).json({ success: false, message: 'estudianteId y cursoId son obligatorios' });
    if (!['activo', 'retirado'].includes(estado))
        return res.status(400).json({ success: false, message: 'Estado debe ser activo o retirado' });

    db.get('SELECT EstudianteId FROM Estudiantes WHERE EstudianteId = ?', [estudianteId], (err, estudiante) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!estudiante) return res.status(404).json({ success: false, message: 'El estudiante no existe' });

        db.get('SELECT CursoId FROM Cursos WHERE CursoId = ?', [cursoId], (err, curso) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            if (!curso) return res.status(404).json({ success: false, message: 'El curso no existe' });

            db.get('SELECT InscripcionId FROM Inscripciones WHERE EstudianteId = ? AND CursoId = ?', [estudianteId, cursoId], (err, existe) => {
                if (err) return res.status(500).json({ success: false, message: err.message });
                if (existe) return res.status(400).json({ success: false, message: 'El estudiante ya está inscrito en este curso' });

                db.run('INSERT INTO Inscripciones (EstudianteId, CursoId, Estado) VALUES (?, ?, ?)',
                    [estudianteId, cursoId, estado],
                    function (err) {
                        if (err) return res.status(500).json({ success: false, message: err.message });
                        res.status(201).json({ success: true, data: { id: this.lastID, estudianteId, cursoId, estado } });
                    }
                );
            });
        });
    });
});

router.put('/inscripciones/:id', authAdmin, (req, res) => {
    const { estudianteId, cursoId, estado } = req.body;
    if (!estudianteId || !cursoId || !estado)
        return res.status(400).json({ success: false, message: 'estudianteId, cursoId y estado son obligatorios' });
    if (!['activo', 'retirado'].includes(estado))
        return res.status(400).json({ success: false, message: 'Estado debe ser activo o retirado' });

    db.get('SELECT InscripcionId FROM Inscripciones WHERE InscripcionId = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Inscripción no encontrada' });

        db.get('SELECT EstudianteId FROM Estudiantes WHERE EstudianteId = ?', [estudianteId], (err, estudiante) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            if (!estudiante) return res.status(404).json({ success: false, message: 'El estudiante no existe' });

            db.get('SELECT CursoId FROM Cursos WHERE CursoId = ?', [cursoId], (err, curso) => {
                if (err) return res.status(500).json({ success: false, message: err.message });
                if (!curso) return res.status(404).json({ success: false, message: 'El curso no existe' });

                db.run('UPDATE Inscripciones SET EstudianteId = ?, CursoId = ?, Estado = ? WHERE InscripcionId = ?',
                    [estudianteId, cursoId, estado, req.params.id],
                    function (err) {
                        if (err) return res.status(500).json({ success: false, message: err.message });
                        res.json({ success: true, data: { id: req.params.id, estudianteId, cursoId, estado } });
                    }
                );
            });
        });
    });
});

router.delete('/inscripciones/:id', authAdmin, (req, res) => {
    db.get('SELECT InscripcionId FROM Inscripciones WHERE InscripcionId = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Inscripción no encontrada' });
        db.run('DELETE FROM Inscripciones WHERE InscripcionId = ?', [req.params.id], function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, message: 'La inscripción ha sido eliminada' });
        });
    });
});

module.exports = router;