require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());

app.use('/Api', require('./routes/profesores'));
app.use('/Api', require('./routes/estudiantes'));
app.use('/Api', require('./routes/materias'));
app.use('/Api', require('./routes/cursos'));
app.use('/Api', require('./routes/horarios'));
app.use('/Api', require('./routes/inscripciones'));
app.use('/Api', require('./routes/notas'));

app.get('/', (req, res) => {
    res.json({ success: true, message: 'Bienvenido a la API del Proyecto Final - Sistema Educativo (SENA)' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`Proyecto Final: Sistema Educativo listo.`);
    console.log(`-----------------------------------------`);
});