# Sistema Educativo API - Proyecto Final Integrador SENA

## Integrantes
- Juan Esteban Lezcano Tejada
- Valeria Usuga

---

## Introducción

El presente documento corresponde al desarrollo del Proyecto Final Integrador de la formación en Análisis y Desarrollo de Software del SENA. Este proyecto consiste en el diseño, construcción y despliegue de un sistema backend completo para la gestión académica de una institución educativa. El sistema fue desarrollado utilizando Node.js como entorno de ejecución, Express como framework para la creación de la API REST, better-sqlite3 como motor de base de datos relacional y Render como plataforma de despliegue en la nube. El backend expone 35 endpoints organizados en 7 tablas relacionadas entre sí, con validaciones robustas, middleware de autenticación por roles y documentación completa de cada recurso.

---

## Objetivo General

Diseñar, construir y desplegar un sistema backend REST completo para la gestión académica de una institución educativa, implementando buenas prácticas de desarrollo como arquitectura modular, validaciones de datos, autenticación por roles y despliegue en la nube mediante la plataforma Render.

---

## Objetivos Específicos

- Diseñar un modelo de datos relacional con 7 tablas interconectadas mediante llaves foráneas que represente los procesos académicos de una institución educativa.
- Implementar el CRUD completo para cada una de las 7 tablas, garantizando respuestas estructuradas en formato JSON con los códigos HTTP correspondientes.
- Aplicar validaciones robustas en los endpoints de creación y actualización, verificando campos obligatorios, tipos de dato, unicidad y existencia de registros relacionados.
- Proteger los endpoints mediante un middleware de autenticación con dos niveles de acceso: usuario con permisos de consulta y administrador con permisos completos.
- Desplegar la API en la plataforma Render con variables de entorno configuradas y una URL pública funcional accesible desde cualquier cliente HTTP.

---

## URL en Producción

```
https://proyecto-final-node-4rnd.onrender.com
```

> **Nota:** El plan gratuito de Render suspende el servidor tras 15 minutos de inactividad. La primera petición puede tardar hasta 60 segundos (cold start). Esto es normal y esperado.

---

## Autenticación

Todos los endpoints requieren el header `password`. Existen dos niveles de acceso:

| Rol | Header password | Header x-user-role | Permisos |
|---|---|---|---|
| Usuario | `12345` | — | Solo GET |
| Administrador | `6789` | `admin` | GET, POST, PUT, DELETE |

---

## Tecnologías Utilizadas

- **Node.js** — Entorno de ejecución
- **Express.js** — Framework para la API REST
- **better-sqlite3** — Motor de base de datos relacional
- **dotenv** — Manejo de variables de entorno
- **Render** — Plataforma de despliegue en la nube
- **Postman** — Pruebas de endpoints

---

## Instrucciones para Correr Localmente

```bash
# 1. Clonar el repositorio
git clone https://github.com/usuario/proyecto-final-node.git
cd proyecto-final-node

# 2. Instalar dependencias
npm install

# 3. Crear el archivo .env en la raíz
PORT=3000
API_PASSWORD_GET=12345
API_PASSWORD_ADMIN=6789

# 4. Iniciar en modo desarrollo
npm run dev
```

---

## Modelo de Datos

### Relaciones entre tablas

- `Profesores` → `Cursos` (1 a N): un profesor dicta muchos cursos
- `Materias` → `Cursos` (1 a N): una materia pertenece a muchos cursos
- `Cursos` → `Horarios` (1 a N): un curso tiene muchos horarios
- `Cursos` → `Inscripciones` (1 a N): un curso tiene muchas inscripciones
- `Estudiantes` → `Inscripciones` (1 a N): un estudiante realiza muchas inscripciones
- `Inscripciones` → `Notas` (1 a N): una inscripción genera muchas notas

---

## Endpoints

La URL base de producción es: `https://proyecto-final-node-4rnd.onrender.com`

---

### Profesores `/Api/profesores`

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | `/Api/profesores` | Obtener todos los profesores | Usuario |
| GET | `/Api/profesores/:id` | Obtener un profesor por ID | Usuario |
| POST | `/Api/profesores` | Crear un profesor | Admin |
| PUT | `/Api/profesores/:id` | Actualizar un profesor | Admin |
| DELETE | `/Api/profesores/:id` | Eliminar un profesor | Admin |

**Filtros disponibles (query params):** `?nombre=&especialidad=&email=`

**Body POST/PUT:**
```json
{
  "nombre": "María López",
  "especialidad": "Matemáticas",
  "email": "maria.lopez@colegio.com"
}
```

---

### Estudiantes `/Api/estudiantes`

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | `/Api/estudiantes` | Obtener todos los estudiantes | Usuario |
| GET | `/Api/estudiantes/:id` | Obtener un estudiante por ID | Usuario |
| POST | `/Api/estudiantes` | Crear un estudiante | Admin |
| PUT | `/Api/estudiantes/:id` | Actualizar un estudiante | Admin |
| DELETE | `/Api/estudiantes/:id` | Eliminar un estudiante | Admin |

**Filtros disponibles (query params):** `?nombre=&apellido=&genero=&email=&documento=`

**Body POST/PUT:**
```json
{
  "nombre": "Juan",
  "apellido": "García",
  "genero": "Masculino",
  "email": "juan.garcia@gmail.com",
  "documento": "1234567890"
}
```

---

### Materias `/Api/materias`

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | `/Api/materias` | Obtener todas las materias | Usuario |
| GET | `/Api/materias/:id` | Obtener una materia por ID | Usuario |
| POST | `/Api/materias` | Crear una materia | Admin |
| PUT | `/Api/materias/:id` | Actualizar una materia | Admin |
| DELETE | `/Api/materias/:id` | Eliminar una materia | Admin |

**Filtros disponibles (query params):** `?nombre=&descripcion=&activa=`

**Body POST/PUT:**
```json
{
  "nombre": "Cálculo",
  "descripcion": "Fundamentos de cálculo diferencial e integral",
  "activa": 1
}
```

---

### Cursos `/Api/cursos`

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | `/Api/cursos` | Obtener todos los cursos | Usuario |
| GET | `/Api/cursos/:id` | Obtener un curso por ID | Usuario |
| POST | `/Api/cursos` | Crear un curso | Admin |
| PUT | `/Api/cursos/:id` | Actualizar un curso | Admin |
| DELETE | `/Api/cursos/:id` | Eliminar un curso | Admin |

**Filtros disponibles (query params):** `?nombre=&periodo=`

**Body POST/PUT:**
```json
{
  "nombre": "Cálculo Grupo A",
  "profesorId": 1,
  "materiaId": 1,
  "periodo": "2025-1"
}
```

---

### Horarios `/Api/horarios`

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | `/Api/horarios` | Obtener todos los horarios | Usuario |
| GET | `/Api/horarios/:id` | Obtener un horario por ID | Usuario |
| POST | `/Api/horarios` | Crear un horario | Admin |
| PUT | `/Api/horarios/:id` | Actualizar un horario | Admin |
| DELETE | `/Api/horarios/:id` | Eliminar un horario | Admin |

**Filtros disponibles (query params):** `?dia=&salon=&cursoId=`

**Body POST/PUT:**
```json
{
  "cursoId": 1,
  "dia": "Lunes",
  "horarioInicio": "07:00",
  "horarioFin": "09:00",
  "salon": "Aula 101"
}
```

---

### Inscripciones `/Api/inscripciones`

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | `/Api/inscripciones` | Obtener todas las inscripciones | Usuario |
| GET | `/Api/inscripciones/:id` | Obtener una inscripción por ID | Usuario |
| POST | `/Api/inscripciones` | Crear una inscripción | Admin |
| PUT | `/Api/inscripciones/:id` | Actualizar una inscripción | Admin |
| DELETE | `/Api/inscripciones/:id` | Eliminar una inscripción | Admin |

**Filtros disponibles (query params):** `?estado=&estudianteId=&cursoId=`

**Body POST/PUT:**
```json
{
  "estudianteId": 1,
  "cursoId": 1,
  "estado": "activo"
}
```

> El campo `estado` solo acepta los valores: `activo` o `retirado`

---

### Notas `/Api/notas`

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | `/Api/notas` | Obtener todas las notas | Usuario |
| GET | `/Api/notas/:id` | Obtener una nota por ID | Usuario |
| POST | `/Api/notas` | Crear una nota | Admin |
| PUT | `/Api/notas/:id` | Actualizar una nota | Admin |
| DELETE | `/Api/notas/:id` | Eliminar una nota | Admin |

**Filtros disponibles (query params):** `?periodo=&inscripcionId=`

**Body POST/PUT:**
```json
{
  "inscripcionId": 1,
  "valor": 4.5,
  "periodo": "2025-1",
  "observacion": "Buen desempeño"
}
```

> El campo `valor` debe ser un número entre 0.0 y 5.0. El campo `observacion` es opcional.

---

## Conclusiones

- El desarrollo del proyecto final permitió integrar todos los conocimientos adquiridos durante la formación, desde el diseño del modelo de datos hasta el despliegue en un entorno de producción real, demostrando la capacidad de construir un backend profesional de forma autónoma.

- El diseño del modelo entidad-relación con 7 tablas y 6 relaciones de llave foránea permitió comprender la importancia de una buena estructura de base de datos, ya que una mala planificación inicial genera problemas en cascada durante el desarrollo de los endpoints.

- La implementación de validaciones en cadena, especialmente en endpoints como `POST /inscripciones` y `POST /notas`, evidenció que la integridad de los datos no puede depender únicamente de las restricciones de la base de datos, sino que debe ser reforzada desde la lógica de la aplicación antes de cualquier operación.

- El sistema de autenticación con dos roles (usuario y administrador) demostró que proteger una API no requiere soluciones complejas. Un middleware sencillo basado en headers es suficiente para controlar el acceso a los recursos según el nivel de permisos requerido.

- El proceso de despliegue en Render evidenció que las dependencias utilizadas en desarrollo no siempre son compatibles con los entornos de producción, como ocurrió con `sqlite3` que debió ser reemplazado por `better-sqlite3` por incompatibilidad con la versión de Linux del servidor, lo que refuerza la importancia de probar el despliegue desde etapas tempranas del proyecto.

- La organización modular del proyecto, con archivos de rutas separados por tabla y un único punto de entrada en `index.js`, facilitó el mantenimiento del código y demostró que una buena arquitectura desde el inicio reduce significativamente el tiempo de desarrollo y corrección de errores.

---

## Referencias Bibliográficas

OpenJS Foundation. (2024). *Node.js documentation*. https://nodejs.org/en/docs/

OpenJS Foundation. (2024). *Express.js routing guide*. https://expressjs.com/es/guide/routing.html

Kelley, J. (2024). *better-sqlite3: The fastest and simplest library for SQLite3 in Node.js*. GitHub. https://github.com/WiseLibs/better-sqlite3

Mozilla Developer Network. (2024). *HTTP response status codes*. https://developer.mozilla.org/en-US/docs/Web/HTTP/Status

Render. (2024). *Deploy a Node.js Express app*. https://render.com/docs/deploy-node-express-app

npm. (2024). *dotenv: Loads environment variables from .env file*. https://www.npmjs.com/package/dotenv

SQLite Consortium. (2024). *SQLite documentation*. https://www.sqlite.org/docs.html

Fazt Code. (2023). *Node.js con SQLite desde cero* [Video]. YouTube. https://www.youtube.com/watch?v=ZRYn6tgnEgM

Fazt Code. (2022). *Despliegue de Node.js en Render* [Video]. YouTube. https://www.youtube.com/watch?v=bnCOyGaSe84

MoureDev. (2023). *API REST con Node.js y Express* [Video]. YouTube. https://www.youtube.com/watch?v=BZi44GOD8kY

Postman. (2024). *Postman API testing platform*. https://www.postman.com

dbdiagram.io. (2024). *Free database diagram tool*. https://dbdiagram.io

draw.io. (2024). *Diagrams online tool*. https://draw.io
EOF
