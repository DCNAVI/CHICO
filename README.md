# Academia Chico

Prototipo de una plataforma de cursos en linea. El proyecto separa la interfaz
web de la integracion de backend proporcionada por Firebase.

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

La raiz redirige automaticamente a `frontend/`. Tambien puede abrirse
directamente:

```text
http://localhost/CHICO/frontend/
```

El proyecto debe servirse mediante HTTP; los modulos de JavaScript no deben
abrirse directamente mediante `file://`.

## Estructura

```text
.
|-- index.html
|-- frontend/
|   |-- index.html
|   |-- login.html
|   |-- registro.html
|   |-- assets/
|   |   `-- logo.png
|   |-- css/
|   |   |-- styles.css
|   |   |-- login.css
|   |   `-- registro.css
|   `-- js/
|       |-- script.js
|       |-- login.js
|       `-- registro.js
`-- backend/
    |-- README.md
    `-- firebase/
        `-- firebase-config.js
```

## Estado

El registro y el inicio de sesion estan conectados a Firebase. El dashboard,
las inscripciones, los pagos y el contenido real de los cursos todavia no
estan implementados.

## Configuracion de Firebase

El backend actual es Firebase, no un servidor propio. Su configuracion cliente
se encuentra en `backend/firebase/firebase-config.js`. Consulta
`backend/README.md` para conocer el alcance y las consideraciones de seguridad.
