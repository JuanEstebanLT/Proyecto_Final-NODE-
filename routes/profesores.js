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

router.get('/profesores', authGet, (req, res) => {
    const { nombre, especialidad, email } = req.query;
    let query = 'SELECT * FROM Profesores WHERE 1=1';
    const params = [];
    if (nombre) { query += ' AND Nombre LIKE ?'; params.push(`%${nombre}%`); }
    if (especialidad) { query += ' AND Especialidad LIKE ?'; params.push(`%${especialidad}%`); }
    if (email) { query += ' AND Email LIKE ?'; params.push(`%${email}%`); }
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, total: rows.length, data: rows });
    });
});

router.get('/profesores/:id', authGet, (req, res) => {
    db.get('SELECT * FROM Profesores WHERE ProfesorId = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Profesor no encontrado' });
        res.json({ success: true, data: row });
    });
});

router.post('/profesores', authAdmin, (req, res) => {
    const { nombre, especialidad, email } = req.body;
    if (!nombre || !especialidad || !email)
        return res.status(400).json({ success: false, message: 'nombre, especialidad y email son obligatorios' });
    db.get('SELECT ProfesorId FROM Profesores WHERE Email = ?', [email], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (row) return res.status(400).json({ success: false, message: 'El email ya está registrado' });
        db.run('INSERT INTO Profesores (Nombre, Especialidad, Email) VALUES (?, ?, ?)',
            [nombre, especialidad, email],
            function (err) {
                if (err) return res.status(500).json({ success: false, message: err.message });
                res.status(201).json({ success: true, data: { id: this.lastID, nombre, especialidad, email } });
            }
        );
    });
});

router.put('/profesores/:id', authAdmin, (req, res) => {
    const { nombre, especialidad, email } = req.body;
    if (!nombre || !especialidad || !email)
        return res.status(400).json({ success: false, message: 'nombre, especialidad y email son obligatorios' });
    db.get('SELECT ProfesorId FROM Profesores WHERE ProfesorId = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Profesor no encontrado' });
        db.run('UPDATE Profesores SET Nombre = ?, Especialidad = ?, Email = ? WHERE ProfesorId = ?',
            [nombre, especialidad, email, req.params.id],
            function (err) {
                if (err) return res.status(500).json({ success: false, message: err.message });
                res.json({ success: true, data: { id: req.params.id, nombre, especialidad, email } });
            }
        );
    });
});

router.delete('/profesores/:id', authAdmin, (req, res) => {
    db.get('SELECT ProfesorId FROM Profesores WHERE ProfesorId = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!row) return res.status(404).json({ success: false, message: 'Profesor no encontrado' });
        db.run('DELETE FROM Profesores WHERE ProfesorId = ?', [req.params.id], function (err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, message: 'El profesor ha sido eliminado' });
        });
    });
});

module.exports = router;