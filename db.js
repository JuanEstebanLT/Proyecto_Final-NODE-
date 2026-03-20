const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error conectando:', err.message);
  } else {
    console.log('Base de datos conectada');
  }
  db.run("PRAGMA foreign_keys = ON");
});

db.serialize(() => {
  db.run(`PRAGMA foreign_keys = ON`);

  db.run(`CREATE TABLE IF NOT EXISTS Profesores (
    ProfesorId INTEGER PRIMARY KEY AUTOINCREMENT,
    Nombre TEXT NOT NULL,
    Especialidad TEXT NOT NULL,
    Email TEXT UNIQUE NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Estudiantes (
    EstudianteId INTEGER PRIMARY KEY AUTOINCREMENT,
    Nombre TEXT NOT NULL,
    Apellido TEXT NOT NULL,
    Genero TEXT NOT NULL,
    Email TEXT UNIQUE NOT NULL,
    Documento TEXT UNIQUE NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Materias (
    MateriaId INTEGER PRIMARY KEY AUTOINCREMENT,
    Nombre TEXT NOT NULL,
    Descripcion TEXT NOT NULL,
    Activa INTEGER DEFAULT 1
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Cursos (
    CursoId INTEGER PRIMARY KEY AUTOINCREMENT,
    Nombre TEXT NOT NULL,
    ProfesorId INTEGER NOT NULL,
    MateriaId INTEGER NOT NULL,
    Periodo TEXT NOT NULL,
    FOREIGN KEY (ProfesorId) REFERENCES Profesores(ProfesorId),
    FOREIGN KEY (MateriaId) REFERENCES Materias(MateriaId)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Horarios (
    HorarioId INTEGER PRIMARY KEY AUTOINCREMENT,
    CursoId INTEGER NOT NULL,
    Dia TEXT NOT NULL,
    HorarioInicio TEXT NOT NULL,
    HorarioFin TEXT NOT NULL,
    Salon TEXT NOT NULL,
    FOREIGN KEY (CursoId) REFERENCES Cursos(CursoId)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Inscripciones (
    InscripcionId INTEGER PRIMARY KEY AUTOINCREMENT,
    EstudianteId INTEGER NOT NULL,
    CursoId INTEGER NOT NULL,
    Estado TEXT NOT NULL CHECK(Estado IN ('activo', 'retirado')),
    FOREIGN KEY (EstudianteId) REFERENCES Estudiantes(EstudianteId),
    FOREIGN KEY (CursoId) REFERENCES Cursos(CursoId)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Notas (
    NotaId INTEGER PRIMARY KEY AUTOINCREMENT,
    InscripcionId INTEGER NOT NULL,
    Valor REAL NOT NULL CHECK(Valor >= 0.0 AND Valor <= 5.0),
    Periodo TEXT NOT NULL,
    Observacion TEXT,
    FOREIGN KEY (InscripcionId) REFERENCES Inscripciones(InscripcionId)
  )`);
});

module.exports = db;