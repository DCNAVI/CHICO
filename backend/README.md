# Backend

El backend actual de Academia Chico usa Firebase como Backend-as-a-Service:

- Firebase Authentication administra las cuentas, sesiones, verificacion de
  correo y recuperacion de contrasena.
- Cloud Firestore almacena los perfiles de los estudiantes.

`firebase/firebase-config.js` inicializa el SDK cliente que consume el
frontend. Por esta razon, aunque se encuentra dentro de `backend/` para
separar responsabilidades, el navegador debe poder descargar este archivo.

La configuracion web de Firebase no sustituye las medidas de seguridad. La
proteccion de los datos debe implementarse mediante reglas de Firestore,
restricciones de la clave API y dominios autorizados en Firebase.

Todavia no existe un servidor propio con API REST, funciones administrativas
o manejo de secretos.

## Roles

Cada documento `users/{uid}` contiene un campo `role`:

- `student`: accede a `/cliente/dashboard`.
- `admin`: accede a `/admin/dashboard`.

El formulario publico siempre crea usuarios con rol `student`. Para habilitar
un administrador, cambia el campo `role` a `admin` desde una operacion
administrativa confiable, como Firebase Console. No permitas que un usuario
modifique su propio rol en las reglas de Firestore.
