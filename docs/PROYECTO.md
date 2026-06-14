# Documentacion de Academia Chico

## 1. Descripcion

Academia Chico es el prototipo de una plataforma de educacion en linea. El
proyecto incluye una pagina comercial, registro e inicio de sesion con
Firebase, paneles separados para estudiantes y administradores, y navegacion
por rutas mediante una aplicacion de una sola pagina (SPA).

## 2. Estado actual

### Implementado

- Landing page responsive.
- Secciones de cursos, beneficios, planes, empresas y preguntas frecuentes.
- Router del lado del cliente con History API.
- Rutas limpias sin archivos `.html` visibles.
- Registro con correo y contrasena.
- Validacion de formularios.
- Verificacion de correo electronico.
- Inicio de sesion con persistencia local o de sesion.
- Recuperacion de contrasena.
- Creacion de perfiles en Cloud Firestore.
- Separacion de vistas para cliente y administrador.
- Redireccion despues del login segun el rol almacenado en Firestore.
- Proteccion basica de paneles por autenticacion y rol.
- Cierre de sesion.
- Pagina para rutas no encontradas.

### Pendiente

- Catalogo de cursos administrable.
- Inscripciones reales.
- Pagos y suscripciones.
- Reproductor y contenido de cursos.
- Seguimiento del progreso.
- Certificados.
- Administracion de usuarios y cursos.
- Reportes y metricas.
- Reglas de Firestore incluidas en el repositorio.
- Pruebas automatizadas.
- Backend propio para operaciones privilegiadas.

## 3. Tecnologias

- HTML5.
- CSS3.
- JavaScript con ES Modules.
- Apache y XAMPP.
- Firebase Authentication.
- Cloud Firestore.
- Font Awesome.

No se utiliza actualmente un framework frontend ni un servidor backend propio.
Firebase funciona como Backend-as-a-Service.

## 4. Ejecucion local

El proyecto debe estar dentro de:

```text
C:\xampp\htdocs\CHICO
```

Inicia Apache desde XAMPP y abre:

```text
http://localhost/CHICO/
```

No abras los archivos directamente mediante `file://`, porque los modulos de
JavaScript y las plantillas necesitan un servidor HTTP.

## 5. Rutas

| Ruta | Acceso | Descripcion |
| --- | --- | --- |
| `/CHICO/` | Publico | Pagina principal |
| `/CHICO/login` | Publico | Inicio de sesion |
| `/CHICO/registro` | Publico | Registro de estudiantes |
| `/CHICO/cliente/dashboard` | Estudiante | Panel del cliente |
| `/CHICO/admin/dashboard` | Administrador | Panel administrativo |
| `/CHICO/dashboard` | Estudiante | Alias del panel del cliente |

Apache usa `.htaccess` para enviar las rutas publicas al `index.html`
principal. El archivo `frontend/js/router.js` selecciona la plantilla, hoja de
estilos y controlador correspondientes sin recargar el documento completo.

## 6. Arquitectura

```text
Navegador
   |
   v
Apache / .htaccess
   |
   v
index.html
   |
   v
frontend/js/router.js
   |
   +--> Vista HTML
   +--> Hoja CSS
   +--> Controlador JavaScript
   |
   v
Firebase Authentication + Cloud Firestore
```

### Frontend

Contiene la interfaz, estilos, router, controladores y vistas.

### Backend

El directorio `backend/` contiene actualmente la inicializacion del SDK web de
Firebase. No contiene una API privada ni secretos de servidor.

## 7. Estructura del proyecto

```text
.
|-- .htaccess
|-- .gitignore
|-- index.html
|-- README.md
|-- docs/
|   `-- PROYECTO.md
|-- frontend/
|   |-- assets/
|   |   `-- logo.png
|   |-- css/
|   |   |-- admin.css
|   |   |-- dashboard.css
|   |   |-- login.css
|   |   |-- registro.css
|   |   `-- styles.css
|   |-- js/
|   |   |-- admin-dashboard.js
|   |   |-- dashboard.js
|   |   |-- login.js
|   |   |-- registro.js
|   |   |-- router.js
|   |   `-- script.js
|   `-- views/
|       |-- admin/
|       |   `-- dashboard.html
|       `-- client/
|           |-- dashboard.html
|           |-- home.html
|           |-- login.html
|           `-- registro.html
`-- backend/
    |-- README.md
    `-- firebase/
        `-- firebase-config.js
```

## 8. Router

El router se encuentra en:

```text
frontend/js/router.js
```

Cada ruta declara:

- Titulo del documento.
- Plantilla HTML.
- Hoja de estilos.
- Funcion de inicializacion.

La navegacion interna usa enlaces con el atributo `data-route`. El router
intercepta el clic, actualiza la URL mediante `history.pushState` y carga la
nueva vista.

El evento personalizado `app:navigate` permite que los controladores cambien
de ruta despues de operaciones como login, registro o cierre de sesion.

## 9. Autenticacion

### Registro

El formulario publico crea cuentas con:

```text
role: student
status: pending_verification
emailVerified: false
provider: email-password
policiesVersion: 2026-01
```

Flujo:

1. Valida nombre, correo, contrasena y aceptacion de politicas.
2. Crea la cuenta en Firebase Authentication.
3. Actualiza `displayName`.
4. Crea `users/{uid}` en Firestore.
5. Envia un correo de verificacion.
6. Cierra la sesion.
7. Dirige al usuario al login.

### Inicio de sesion

Flujo:

1. Valida correo y contrasena.
2. Configura persistencia local o de sesion.
3. Autentica con Firebase.
4. Comprueba la verificacion del correo.
5. Obtiene `users/{uid}` desde Firestore.
6. Actualiza el estado y la fecha del ultimo acceso.
7. Redirige segun el rol:

```text
student -> /cliente/dashboard
admin   -> /admin/dashboard
```

### Recuperacion de contrasena

El login envia un correo de recuperacion y configura `/login` como ruta de
retorno.

## 10. Modelo de usuario

Coleccion:

```text
users
```

Documento:

```text
users/{uid}
```

Campos actuales:

| Campo | Tipo | Descripcion |
| --- | --- | --- |
| `uid` | string | Identificador de Firebase Authentication |
| `name` | string | Nombre completo |
| `email` | string | Correo |
| `role` | string | `student` o `admin` |
| `emailVerified` | boolean | Estado de verificacion |
| `status` | string | Estado de la cuenta |
| `provider` | string | Proveedor de autenticacion |
| `policiesAccepted` | boolean | Aceptacion de politicas |
| `policiesAcceptedAt` | timestamp | Fecha de aceptacion |
| `policiesVersion` | string | Version aceptada |
| `createdAt` | timestamp | Fecha de creacion |
| `updatedAt` | timestamp | Ultima actualizacion |
| `lastLoginAt` | timestamp | Ultimo inicio de sesion |

## 11. Roles

### Estudiante

El registro publico siempre crea estudiantes. El panel de cliente comprueba
que exista una sesion y un perfil. Si detecta un administrador, lo envia a su
panel correspondiente.

### Administrador

El panel administrativo requiere:

```text
role: admin
```

Actualmente el rol debe establecerse desde Firebase Console o desde una
operacion administrativa confiable. Nunca debe permitirse que un usuario
cambie su propio rol desde el navegador.

## 12. Seguridad

- La configuracion web de Firebase es visible porque se ejecuta en el cliente.
- La seguridad real depende de las reglas de Firebase Authentication y
  Firestore.
- La clave API debe restringirse a los dominios y servicios necesarios.
- Firebase debe tener configurados los dominios autorizados.
- Las reglas de Firestore deben impedir que el usuario modifique `role`.
- Las operaciones administrativas sensibles deben migrarse a un backend
  confiable o a Cloud Functions.
- La proteccion visual de una ruta no sustituye la autorizacion en Firestore.

## 13. Archivos principales

| Archivo | Responsabilidad |
| --- | --- |
| `index.html` | Shell unico de la SPA |
| `.htaccess` | Reescritura de rutas para Apache |
| `frontend/js/router.js` | Resolucion y renderizado de rutas |
| `frontend/js/registro.js` | Registro y verificacion |
| `frontend/js/login.js` | Login y recuperacion |
| `frontend/js/dashboard.js` | Panel y proteccion del estudiante |
| `frontend/js/admin-dashboard.js` | Panel y proteccion del administrador |
| `backend/firebase/firebase-config.js` | Inicializacion de Firebase |

## 14. Historial de avances

1. Se creo la landing page y los formularios de acceso.
2. Se conectaron registro, login y Firestore.
3. Se inicializo el repositorio Git y se publico en GitHub.
4. Se separo el proyecto en `frontend/` y `backend/`.
5. Se convirtio la interfaz en una SPA con rutas limpias.
6. Se creo un dashboard inicial protegido.
7. Se separaron las vistas en carpetas `client/` y `admin/`.
8. Se agrego redireccion y autorizacion segun el rol de Firestore.

## 15. Repositorio

```text
https://github.com/DCNAVI/CHICO
```

