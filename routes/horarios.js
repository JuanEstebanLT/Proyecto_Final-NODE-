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

router.get('/horarios', authGet, (req, res) => {
    const { dia, salon, cursoId } = req.query;
    let query = `SELECT h.*, c.Nombre as NombreCurso FROM Horarios h
                 JOIN Cursos c ON h.CursoId = c.CursoId WHERE 1=1`;
    const params = [];
    if (dia) { query += ' AND h.Dia LIKE ?'; params.push(`%${dia}%`); }
    if (salon) { query += ' AND h.Salon LIKE ?'; params.push(`%${salon}%`); }
    if (cursoId) { query += ' AND h.CursoId = ?'; params.push(cursoId); }
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, total: rows.length, data: rows });
    });
});

router.get('/horarios/:id', authGet, (req, res) => {
    const query = `SELECT h.*, c.Nombre as NombreCurso FROM Horarios h
                   JOIN Cursos c ON h.CursoId = c.CursoId WHERE h.HorarioId = ?`;
    db.get(query, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Horario no encontrado' });
        res.json({ success: true, data: row });
    });
});

router.post('/horarios', authAdmin, (req, res) => {
    const { cursoId, dia, horarioInicio, horarioFin, salon } = req.body;
    if (!cursoId || !dia || !horarioInicio || !horarioFin || !salon)
        return res.status(400).json({ success: false, message: 'cursoId, dia, horarioInicio, horarioFin y salon son obligatorios' });

    db.get('SELECT CursoId FROM Cursos WHERE CursoId = ?', [cursoId], (err, curso) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!curso) return res.status(404).json({ success: false, message: 'El curso no existe' });

        db.run('INSERT INTO Horarios (CursoId, Dia, HorarioInicio, HorarioFin, Salon) VALUES (?, ?, ?, ?, ?)',
            [cursoId, dia, horarioInicio, horarioFin, salon],
            function (err) {
                if (err) return res.status(500).json({ success: false, message: err.message });
                res.status(201).json({ success: true, data: { id: this.lastID, cursoId, dia, horarioInicio, horarioFin, salon } });
            }
        );
    });
});

router.put('/horarios/:id', authAdmin, (req, res) => {
    const { cursoId, dia, horarioInicio, horarioFin, salon } = req.body;
    if (!cursoId || !dia || !horarioInicio || !horarioFin || !salon)
        return res.status(400).json({ success: false, message: 'cursoId, dia, horarioInicio, horarioFin y salon son obligatorios' });

    db.get('SELECT HorarioId FROM Horarios WHERE HorarioId = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Horario no encontrado' });

        db.get('SELECT CursoId FROM Cursos WHERE CursoId = ?', [cursoId], (err, curso) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            if (!curso) return res.status(404).json({ success: false, message: 'El curso no existe' });

            db.run('UPDATE Horarios SET CursoId = ?, Dia = ?, HorarioInicio = ?, HorarioFin = ?, Salon = ? WHERE HorarioId = ?',
                [cursoId, dia, horarioInicio, horarioFin, salon, req.params.id],
                function (err) {
                    if (err) return res.status(500).json({ success: false, message: err.message });
                    res.json({ success: true, data: { id: req.params.id, cursoId, dia, horarioInicio, horarioFin, salon } });
                }
            );
        });
    });
});

router.delete('/horarios/:id', authAdmin, (req, res) => {
    db.get('SELECT HorarioId FROM Horarios WHERE HorarioId = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Horario no encontrado' });
        db.run('DELETE FROM Horarios WHERE HorarioId = ?', [req.params.id], function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, message: 'El horario ha sido eliminado' });
        });
    });
});

module.exports = router;