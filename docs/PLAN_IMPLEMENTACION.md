# Plan de implementacion de Academia Chico

## 1. Objetivo

Convertir el prototipo actual en una plataforma comercial donde:

- Los visitantes puedan consultar y comprar cursos.
- Los clientes puedan adquirir cursos individuales o una suscripcion.
- Los estudiantes consuman contenido y consulten su progreso.
- Las empresas administren usuarios y licencias.
- Los administradores creen, publiquen y gestionen cursos.
- Los pagos, accesos y renovaciones se procesen de forma segura.

## 2. Modelo comercial

La plataforma soportara dos formas de compra.

### Compra individual

El cliente paga una sola vez y obtiene acceso permanente al curso adquirido,
salvo que los terminos comerciales definan otra vigencia.

### Suscripcion

El cliente paga mensualmente y accede al catalogo incluido en su plan mientras
la suscripcion permanezca activa.

Los pagos no deben confirmarse desde el navegador. El acceso se habilitara
solamente cuando el backend reciba y valide el evento del proveedor de pagos.

## 3. Tipos de cliente

Los tipos comerciales se basan en los planes mostrados actualmente en la
pagina principal.

### Basico

- Precio inicial propuesto en la landing: `$29/mes`.
- Acceso al catalogo marcado como basico.
- Certificados de finalizacion.
- Soporte por correo.
- Limite inicial de un dispositivo o sesion concurrente.
- Contenido descargable cuando el curso lo permita.

### Profesional

- Precio inicial propuesto en la landing: `$59/mes`.
- Incluye todo el catalogo basico.
- Acceso a cursos premium.
- Certificados profesionales.
- Proyectos practicos.
- Soporte prioritario.
- Mentorias grupales cuando esten disponibles.

### Empresarial

- Precio inicial propuesto en la landing: `$199/mes`.
- Incluye las funciones del plan profesional.
- Paquete inicial de diez licencias.
- Gestor de empresa.
- Invitacion y baja de miembros.
- Reportes de progreso del equipo.
- Soporte dedicado.
- Posibilidad futura de ampliar el numero de licencias.

Los precios y beneficios finales deben administrarse desde Stripe y Firestore,
no permanecer escritos directamente en el HTML.

## 4. Roles y permisos

El rol de seguridad no debe confundirse con el plan contratado.

| Rol | Responsabilidad |
| --- | --- |
| `student` | Compra y consume cursos |
| `company_admin` | Administra miembros de una empresa |
| `company_member` | Consume cursos asignados por una empresa |
| `admin` | Gestiona toda la plataforma |

El plan se almacenara por separado:

```text
basic
professional
business
none
```

La autorizacion administrativa debe migrarse a Custom Claims de Firebase. El
campo visible en Firestore puede conservarse para mostrar informacion, pero no
debe ser la unica fuente de autorizacion.

## 5. Modulos funcionales

### Modulo publico

- Inicio.
- Catalogo.
- Busqueda y filtros.
- Detalle del curso.
- Vista previa gratuita.
- Planes y precios.
- Registro y login.
- Terminos, privacidad y politica de reembolso.

### Modulo del estudiante

- Dashboard.
- Mis cursos.
- Reproductor de lecciones.
- Progreso por curso y leccion.
- Descargas permitidas.
- Evaluaciones.
- Certificados.
- Historial de compras.
- Gestion de suscripcion.
- Perfil y seguridad.

### Modulo empresarial

- Dashboard de empresa.
- Gestion de miembros.
- Invitaciones.
- Asignacion de licencias.
- Asignacion de cursos.
- Progreso del equipo.
- Reportes exportables.
- Gestion de facturacion.

### Modulo administrativo

- Resumen de ventas y actividad.
- CRUD de cursos.
- CRUD de categorias.
- Constructor de modulos y lecciones.
- Carga y ordenamiento de contenido.
- Publicacion y despublicacion.
- Gestion de precios y planes.
- Gestion de estudiantes y empresas.
- Gestion de compras, suscripciones y reembolsos.
- Cupones y promociones.
- Reportes.
- Auditoria de acciones administrativas.

## 6. Flujo de creacion de cursos

El administrador seguira este flujo:

1. Crear un curso en estado `draft`.
2. Capturar titulo, slug, descripcion, instructor y categoria.
3. Definir nivel, idioma, imagen, objetivos y requisitos.
4. Elegir modalidad de venta:
   - Compra individual.
   - Incluido en plan basico.
   - Incluido en plan profesional.
   - Incluido en plan empresarial.
5. Crear modulos.
6. Crear y ordenar lecciones.
7. Cargar videos, documentos y recursos.
8. Configurar vistas previas gratuitas.
9. Configurar evaluacion y certificado.
10. Revisar el curso.
11. Publicar el curso.

Estados recomendados:

```text
draft
review
published
archived
```

## 7. Flujo de compra individual

1. El cliente abre el detalle del curso.
2. Selecciona `Comprar curso`.
3. El frontend llama una Cloud Function autenticada.
4. La funcion crea una sesion de pago en Stripe.
5. Stripe procesa el pago.
6. Stripe envia un webhook firmado al backend.
7. El backend valida la firma y evita procesar dos veces el mismo evento.
8. El backend registra la orden y crea el derecho de acceso.
9. El curso aparece en `Mis cursos`.
10. Se envia el recibo correspondiente.

Nunca se concedera acceso basandose solamente en la pagina de pago exitoso.

## 8. Flujo de suscripcion

1. El cliente elige un plan.
2. El backend crea o recupera el cliente de Stripe.
3. Se abre Stripe Checkout.
4. El webhook registra la suscripcion.
5. Se crea o actualiza el documento de suscripcion.
6. El motor de acceso calcula los cursos disponibles.
7. Renovaciones, cancelaciones y pagos fallidos se sincronizan por webhook.
8. El cliente administra su metodo de pago mediante Stripe Customer Portal.

Estados recomendados:

```text
trialing
active
past_due
canceled
unpaid
incomplete
```

## 9. Acceso a cursos

El acceso debe resolverse mediante derechos o `entitlements`, no mediante
condiciones dispersas en la interfaz.

Un usuario puede tener acceso porque:

- Compro el curso.
- Su suscripcion lo incluye.
- Su empresa le asigno una licencia.
- Un administrador le concedio acceso manualmente.

Ejemplo:

```text
entitlements/{entitlementId}
  userId
  courseId
  sourceType: purchase | subscription | company | manual
  sourceId
  status: active | revoked | expired
  startsAt
  expiresAt
```

El backend y las reglas de Firestore decidiran si un entitlement es valido.

## 10. Modelo de datos propuesto

### Usuarios

```text
users/{userId}
```

Campos adicionales:

```text
role
plan
companyId
stripeCustomerId
status
```

### Cursos

```text
courses/{courseId}
```

Campos principales:

```text
title
slug
summary
description
categoryId
instructorId
level
language
thumbnailUrl
status
price
currency
includedPlans[]
totalDuration
publishedAt
createdAt
updatedAt
```

### Contenido

```text
courses/{courseId}/modules/{moduleId}
courses/{courseId}/modules/{moduleId}/lessons/{lessonId}
```

Cada leccion puede contener:

```text
title
type: video | text | quiz | file
position
duration
isPreview
contentUrl
status
```

### Compras

```text
orders/{orderId}
```

Campos:

```text
userId
items[]
subtotal
discount
total
currency
status
stripeCheckoutSessionId
stripePaymentIntentId
createdAt
paidAt
```

### Suscripciones

```text
subscriptions/{subscriptionId}
```

Campos:

```text
userId
planId
stripeCustomerId
stripeSubscriptionId
status
currentPeriodStart
currentPeriodEnd
cancelAtPeriodEnd
```

### Progreso

```text
users/{userId}/courseProgress/{courseId}
users/{userId}/courseProgress/{courseId}/lessons/{lessonId}
```

### Empresas

```text
companies/{companyId}
companies/{companyId}/members/{userId}
companies/{companyId}/invitations/{invitationId}
```

### Auditoria

```text
auditLogs/{logId}
```

Debe registrar acciones administrativas importantes, actor, recurso, fecha y
resultado.

## 11. Arquitectura objetivo

```text
Frontend SPA
   |
   +--> Firebase Authentication
   +--> Firestore para lecturas permitidas
   +--> Cloud Storage para recursos permitidos
   |
   v
Cloud Functions 2nd gen
   |
   +--> Firebase Admin SDK
   +--> Stripe API
   +--> Webhooks de Stripe
   +--> Asignacion de roles y permisos
   +--> Creacion de compras y suscripciones
   +--> Generacion de certificados
```

Las funciones callable son apropiadas para solicitudes iniciadas desde la
aplicacion porque reciben automaticamente los tokens de Authentication y App
Check. Los webhooks de Stripe deben exponerse como funciones HTTP y validar la
firma del evento.

## 12. Backend requerido

Crear un directorio:

```text
backend/functions/
```

Funciones iniciales:

| Funcion | Tipo | Responsabilidad |
| --- | --- | --- |
| `createCheckoutSession` | Callable | Compra individual |
| `createSubscriptionCheckout` | Callable | Contratar un plan |
| `createBillingPortalSession` | Callable | Gestionar facturacion |
| `stripeWebhook` | HTTP | Sincronizar pagos y suscripciones |
| `setUserRole` | Callable admin | Asignar roles |
| `inviteCompanyMember` | Callable company admin | Invitar miembros |
| `assignCourseToMember` | Callable company admin | Asignar cursos |
| `publishCourse` | Callable admin | Validar y publicar cursos |
| `issueCertificate` | Trigger/backend | Crear certificado |

Todas deben:

- Validar autenticacion.
- Validar rol o claim.
- Validar datos de entrada.
- Usar secretos administrados.
- Registrar errores.
- Ser idempotentes cuando procesen pagos o eventos.

## 13. Seguridad obligatoria

Antes de vender:

- Crear `firestore.rules`.
- Crear `storage.rules`.
- Añadir pruebas de reglas.
- Activar Firebase App Check.
- Usar Custom Claims para administradores.
- Prohibir que clientes modifiquen roles, pagos o suscripciones.
- Verificar firmas de webhooks de Stripe.
- Guardar secretos de Stripe fuera del repositorio.
- Aplicar MFA a administradores.
- Activar proteccion contra enumeracion de correos.
- Configurar politica de contrasenas.
- Limitar archivos por tipo y tamano.
- Servir videos mediante URLs autorizadas o un proveedor especializado.
- Crear logs de auditoria.
- Separar proyectos Firebase de desarrollo y produccion.

## 14. Rutas objetivo

### Publicas

```text
/
/catalogo
/curso/:slug
/planes
/login
/registro
/pago/exitoso
/pago/cancelado
```

### Cliente

```text
/cliente/dashboard
/cliente/cursos
/cliente/curso/:courseId
/cliente/curso/:courseId/leccion/:lessonId
/cliente/compras
/cliente/suscripcion
/cliente/certificados
/cliente/perfil
```

### Empresa

```text
/empresa/dashboard
/empresa/miembros
/empresa/asignaciones
/empresa/reportes
/empresa/facturacion
```

### Administrador

```text
/admin/dashboard
/admin/cursos
/admin/cursos/nuevo
/admin/cursos/:courseId/editar
/admin/usuarios
/admin/empresas
/admin/ordenes
/admin/suscripciones
/admin/cupones
/admin/reportes
/admin/auditoria
```

## 15. Fases de implementacion

### Fase 0: definicion comercial

Duracion estimada: 3 a 5 dias.

Entregables:

- Moneda y pais de cobro.
- Impuestos y facturacion.
- Precios finales.
- Beneficios exactos de cada plan.
- Politica de reembolso.
- Vigencia de compras individuales.
- Limites del plan empresarial.

Criterio de salida:

- Documento comercial aprobado.

### Fase 1: fundamentos tecnicos y seguridad

Duracion estimada: 1 a 2 semanas.

Entregables:

- Firebase CLI y configuracion por ambientes.
- Cloud Functions 2nd gen.
- Reglas de Firestore y Storage.
- Custom Claims.
- App Check.
- Emulator Suite.
- GitHub Actions.
- Manejo centralizado de errores.

Criterio de salida:

- Un estudiante no puede modificar roles ni datos comerciales.
- Las reglas tienen pruebas automatizadas.

### Fase 2: catalogo y administrador de cursos

Duracion estimada: 2 a 3 semanas.

Entregables:

- Colecciones de cursos, modulos y lecciones.
- CRUD administrativo.
- Carga de imagenes y archivos.
- Ordenamiento de contenido.
- Estados `draft`, `review`, `published` y `archived`.
- Catalogo publico y detalle del curso.

Criterio de salida:

- Un administrador puede crear y publicar un curso completo sin editar codigo.

### Fase 3: compra individual

Duracion estimada: 1 a 2 semanas.

Entregables:

- Integracion de Stripe Checkout.
- Ordenes.
- Webhook firmado.
- Entitlements por compra.
- Historial de compras.
- Paginas de resultado de pago.

Criterio de salida:

- Una compra confirmada concede acceso exactamente una vez.

### Fase 4: suscripciones y planes

Duracion estimada: 2 semanas.

Entregables:

- Productos y precios en Stripe.
- Planes sincronizados.
- Suscripcion Basico y Profesional.
- Customer Portal.
- Cancelaciones y pagos fallidos.
- Control de acceso por plan.

Criterio de salida:

- El acceso cambia automaticamente al renovarse, cancelarse o fallar el pago.

### Fase 5: experiencia de aprendizaje

Duracion estimada: 2 a 3 semanas.

Entregables:

- Mis cursos.
- Reproductor.
- Navegacion entre lecciones.
- Marcado de progreso.
- Continuar donde se quedo.
- Evaluaciones iniciales.
- Certificados basicos.

Criterio de salida:

- Un estudiante puede completar un curso y obtener un certificado.

### Fase 6: plan empresarial

Duracion estimada: 2 a 3 semanas.

Entregables:

- Empresas.
- Gestor empresarial.
- Invitaciones.
- Licencias.
- Asignacion de cursos.
- Reportes de progreso.
- Facturacion empresarial.

Criterio de salida:

- Una empresa puede administrar diez usuarios y consultar su avance.

### Fase 7: operacion administrativa

Duracion estimada: 1 a 2 semanas.

Entregables:

- Gestion de usuarios.
- Ordenes y reembolsos.
- Suscripciones.
- Cupones.
- Reportes de ventas.
- Auditoria.

Criterio de salida:

- El equipo puede operar ventas y clientes sin usar Firebase Console.

### Fase 8: calidad y lanzamiento

Duracion estimada: 1 a 2 semanas.

Entregables:

- Pruebas end-to-end.
- Pruebas de pagos en sandbox.
- Revision de accesibilidad.
- Optimizacion de rendimiento.
- Monitoreo y alertas.
- Backups.
- Terminos y privacidad.
- Lista de lanzamiento.

Criterio de salida:

- No existen vulnerabilidades criticas ni flujos de pago sin probar.

## 16. Orden recomendado del MVP

Para comenzar a vender cuanto antes, el primer lanzamiento debe incluir:

1. Seguridad y backend.
2. CRUD de cursos.
3. Catalogo y detalle.
4. Compra individual.
5. Mis cursos.
6. Reproductor y progreso.
7. Administracion de ventas.

Las suscripciones y el plan empresarial pueden entrar en una segunda entrega si
se necesita reducir el tiempo inicial. Sin embargo, el modelo de datos debe
prepararse desde el principio para soportarlos.

## 17. Pruebas necesarias

### Unitarias

- Validaciones.
- Calculo de acceso.
- Estados de orden y suscripcion.
- Permisos por rol.

### Reglas

- Lectura y escritura por propietario.
- Rechazo de cambio de rol.
- Acceso administrativo.
- Acceso empresarial.
- Restricciones de Storage.

### Integracion

- Registro y verificacion.
- Login.
- Creacion y publicacion de cursos.
- Compra.
- Webhooks.
- Renovacion y cancelacion.
- Progreso.

### End-to-end

- Visitante compra un curso y comienza una leccion.
- Cliente contrata y cancela un plan.
- Administrador crea y publica un curso.
- Empresa invita usuarios y asigna cursos.

## 18. Indicadores del negocio

El dashboard administrativo debe medir:

- Usuarios registrados.
- Usuarios activos.
- Conversion de visitante a registro.
- Conversion de registro a compra.
- Ingreso mensual recurrente.
- Ventas por curso.
- Cancelaciones.
- Pagos fallidos.
- Cursos iniciados y completados.
- Tiempo promedio de finalizacion.
- Uso de licencias empresariales.

## 19. Riesgos principales

| Riesgo | Mitigacion |
| --- | --- |
| Acceso sin pago | Entitlements creados solo por webhook |
| Usuario se asigna admin | Custom Claims y reglas |
| Webhook duplicado | Idempotencia por identificador de evento |
| Registro incompleto | Creacion de perfil desde backend o compensacion |
| Videos compartidos | URLs temporales y proveedor de video |
| Costos inesperados | Presupuestos y alertas de Firebase/Google Cloud |
| Perdida de datos | Backups y exportaciones programadas |
| Fraude o contracargos | Revision de riesgo y trazabilidad de ordenes |

## 20. Estimacion general

Para una primera version comercial completa:

```text
14 a 20 semanas
```

La estimacion supone una persona desarrollando de forma continua. Puede
reducirse priorizando un MVP con compra individual y aplazando suscripciones,
empresas, evaluaciones avanzadas y reportes.

## 21. Primera iteracion propuesta

El siguiente bloque de trabajo debe ser:

1. Inicializar Firebase CLI y Cloud Functions 2nd gen.
2. Crear reglas de Firestore y pruebas.
3. Definir las colecciones de cursos.
4. Crear las rutas administrativas de cursos.
5. Implementar el formulario `Nuevo curso`.
6. Implementar listado, edicion y publicacion.
7. Renderizar el catalogo desde Firestore.

Al terminar esta iteracion, el administrador podra crear cursos reales y la
pagina principal dejara de depender de cursos escritos directamente en HTML.

## 22. Referencias tecnicas

- [Stripe Subscriptions](https://docs.stripe.com/billing/subscriptions/overview)
- [Stripe Webhooks](https://docs.stripe.com/webhooks)
- [Firebase Callable Functions](https://firebase.google.com/docs/functions/callable)
- [Cloud Functions for Firebase](https://firebase.google.com/docs/functions)
- [Modelo de datos de Firestore](https://firebase.google.com/docs/firestore/data-model)
- [Firebase Emulator para Functions](https://firebase.google.com/docs/functions/local-emulator)
