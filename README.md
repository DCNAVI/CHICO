# Academia Chico

Prototipo frontend de una plataforma de cursos en linea, construido con HTML,
CSS y JavaScript puro. Incluye una pagina comercial y un flujo de autenticacion
con Firebase Authentication y Cloud Firestore.

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

Tambien puede servirse con cualquier servidor HTTP estatico. Los modulos de
JavaScript no deben abrirse directamente mediante `file://`.

## Estructura

```text
.
|-- index.html
|-- styles.css
|-- script.js
|-- login.html
|-- login.css
|-- login.js
|-- registro.html
|-- registro.css
|-- registro.js
|-- firebase-config.js
`-- logo.png
```

## Estado

El registro y el inicio de sesion estan conectados a Firebase. El dashboard,
las inscripciones, los pagos y el contenido real de los cursos todavia no
estan implementados.

## Configuracion de Firebase

La configuracion cliente se encuentra en `firebase-config.js`. Antes de
publicar el sitio, configura reglas adecuadas para Firestore y restringe la
clave API a los dominios y servicios necesarios desde Google Cloud Console.

