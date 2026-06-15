# Academia Chico

Prototipo de una plataforma de cursos en linea. El proyecto separa la interfaz
web de la integracion de backend proporcionada por Firebase.

La documentacion completa del estado actual se encuentra en
[`docs/PROYECTO.md`](docs/PROYECTO.md).

El plan para implementar cursos, ventas, suscripciones y administracion se
encuentra en
[`docs/PLAN_IMPLEMENTACION.md`](docs/PLAN_IMPLEMENTACION.md).

## Funcionalidades

- Landing page responsive con cursos, beneficios, planes, empresas y FAQ.
- Registro de estudiantes con correo y contrasena.
- Verificacion de correo electronico.
- Inicio de sesion con persistencia opcional.
- Recuperacion de contrasena.
- Creacion y actualizacion del perfil del usuario en Firestore.

## Tecnologias

- HTML5
- CSS3
- JavaScript ES Modules
- Firebase Authentication
- Cloud Firestore
- Font Awesome

## Ejecucion local

Coloca el proyecto dentro del directorio publico de XAMPP y abre:

```text
http://localhost/CHICO/
```

La aplicacion usa un router del lado del cliente. Apache dirige las rutas
publicas al mismo `index.html` mediante `.htaccess`:

```text
http://localhost/CHICO/
http://localhost/CHICO/login
http://localhost/CHICO/registro
http://localhost/CHICO/cliente/dashboard
http://localhost/CHICO/admin/dashboard
http://localhost/CHICO/error/401
http://localhost/CHICO/error/403
http://localhost/CHICO/error/404
http://localhost/CHICO/error/500
http://localhost/CHICO/error/offline
```

El proyecto debe servirse mediante HTTP; los modulos de JavaScript no deben
abrirse directamente mediante `file://`.

## Estructura

```text
.
|-- index.html
|-- .htaccess
|-- docs/
|   |-- PROYECTO.md
|   `-- PLAN_IMPLEMENTACION.md
|-- frontend/
|   |-- assets/
|   |   `-- logo.png
|   |-- css/
|   |   |-- styles.css
|   |   |-- login.css
|   |   |-- registro.css
|   |   |-- dashboard.css
|   |   |-- admin.css
|   |   `-- errors.css
|   |-- js/
|   |   |-- router.js
|   |   |-- script.js
|   |   |-- login.js
|   |   |-- registro.js
|   |   |-- dashboard.js
|   |   |-- admin-dashboard.js
|   |   `-- errors.js
|   `-- views/
|       |-- client/
|       |   |-- home.html
|       |   |-- login.html
|       |   |-- registro.html
|       |   `-- dashboard.html
|       |-- admin/
|       |   `-- dashboard.html
|       `-- errors/
|           |-- 401.html
|           |-- 403.html
|           |-- 404.html
|           |-- 500.html
|           `-- offline.html
`-- backend/
    |-- README.md
    `-- firebase/
        `-- firebase-config.js
```

## Estado

El registro y el inicio de sesion estan conectados a Firebase. Los paneles de
cliente y administrador estan separados y protegidos mediante el campo `role`
del perfil en Firestore. Las inscripciones, los pagos, el progreso y el
contenido real de los cursos todavia no estan implementados.

## Configuracion de Firebase

El backend actual es Firebase, no un servidor propio. Su configuracion cliente
se encuentra en `backend/firebase/firebase-config.js`. Consulta
`backend/README.md` para conocer el alcance y las consideraciones de seguridad.
