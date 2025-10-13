<img src="logo.png" alt="Astromanía" width="100" align="right" style="margin-bottom:-14px;">
<h1>Astromanía WEB</h1>




Astromanía es una aplicación web full‑stack para gestionar eventos astronómicos, servicios/productos y pagos online. Incluye autenticación con roles, panel de administración, integración con Mercado Pago, subida de imágenes a Cloudinary y contacto por email.


## Arquitectura
- Backend (Node.js/Express): API REST con MongoDB/Mongoose, JWT, Zod, Multer, Cloudinary y Mercado Pago.
- Frontend (React + Vite): SPA con Tailwind CSS v4 + DaisyUI y React Router.

## Despliegue

Estructura del repo:

```
Backend/              # (Node.js, Express)
  src/
    app.js            # App Express, middlewares y rutas
    index.js          # dotenv, DB, listen
    config/           # DB, Cloudinary, Mercado Pago
    controllers/      # Contacto, eventos, pagos, servicios/productos, usuarios
    middlewares/      # auth (JWT), authRol, validator (Zod)
    models/           # Mongoose models (User, Event, ServiceProductItem)
    routes/           # Rutas /api
    schemas/          # Esquemas Zod
    services/         # Lógica de Mercado Pago

Frontend/             # (React, Vite, Tailwind)
  src/
    api/              # Clientes Axios y servicios
    components/       # Layout, pagos, utilidades
    context/          # Estados (user, events, payments, products)
    pages/            # Vistas: Home, Eventos, Admin, etc.
    routes/           # Rutas protegidas (Private/Admin/Superuser)
    App.jsx, Router.jsx, main.jsx
```


## Tecnologías
- Backend: Node.js, Express 5, Mongoose 8, JWT, Zod, Nodemailer, Multer, Cloudinary, Mercado Pago SDK
- Frontend: React 19, Vite 7, Tailwind CSS 4, DaisyUI 5, React Router 7, Axios
- Base de datos: MongoDB Atlas


## Requisitos
- Node.js ≥ 18
- MongoDB URI (Atlas/local)
- Cuenta de Cloudinary (cloud name, api key, api secret)
- SMTP (Gmail u otro) para envío de correo
- Credenciales de Mercado Pago (Access Token y Public Key)


## Variables de Entorno

Backend (`Backend/.env`):

```
PORT=3000
SECRET=<JWT_SECRET>

# MongoDB
MONGODB_URI=<mongodb_connection_string>

# Correo (Nodemailer)
EMAIL_USER=<smtp_user>
EMAIL_PASS=<smtp_password>
EMAIL_JP=<destinatario_contacto>

# Cloudinary
CLD_CLOUD_NAME=<cloud_name>
CLD_API_KEY=<api_key>
CLD_API_SECRET=<api_secret>

# Mercado Pago (Checkout Pro)
MP_ACCESS_TOKEN=<access_token_privado>
MP_SUCCESS_URL=<https_public_success_url>
MP_FAILURE_URL=<https_public_failure_url>
MP_PENDING_URL=<https_public_pending_url>
MP_WEBHOOK_URL=<https_public_webhook_url>
```

Notas importantes:
- Las URLs de éxito/fracaso/pendiente y webhook deben ser públicas (HTTPS) en producción o al usar túneles (ngrok).
- Rota todas las credenciales que actualmente existan en el repo por seguridad (revoca y vuelve a emitir tokens/secretos).

Frontend (`Frontend/.env`):

```
VITE_BACKEND_URL=http://localhost:3000/api
VITE_MP_PUBLIC_KEY=<public_key>
```


## Instalación y Ejecución (Desarrollo)
Backend
1. `cd Backend`
2. `npm install`
3. Configura `Backend/.env`
4. `npm run dev` (Nodemon en `http://localhost:3000`)

Frontend
1. `cd Frontend`
2. `npm install`
3. Configura `Frontend/.env`
4. `npm run dev` (Vite en `http://localhost:5173`)

Notas CORS: el backend permite por defecto `http://localhost:5173` y `http://localhost:3000` con `credentials`.


## Scripts Disponibles
Backend
- `npm run dev` Inicia server con Nodemon (`src/index.js`)
- `npm start` Inicia server con Node

Frontend
- `npm run dev` Levanta Vite en desarrollo
- `npm run build` Compila producción
- `npm run preview` Sirve el build para prueba local


## API Backend (Resumen)
Base: `http://localhost:3000/api`

Autenticación y Usuarios (`Backend/src/routes/user.routes.js`)
- `POST /register` Registro (valida con Zod)
- `POST /login` Login (cookie `token`)
- `POST /logout` Logout
- `PUT /update` Actualizar usuario (auth)
- `GET /verify-user` Verificar sesión (auth)
- Admin:
  - `GET /admin/users` Listado de usuarios (auth + rol `admin`)
  - `POST /admin/user/promote/:id` Promover a `superuser` (auth + rol `admin`)

Eventos (`Backend/src/routes/event.route.js`)
- Público:
  - `GET /events/readall` Listar eventos
  - `GET /event/read/:id` Ver evento por id
- Privado (auth + `superuser` o `admin`):
  - `GET /user/events/readall` Listar
  - `POST /user/event/create` Crear
  - `PUT /user/event/update/:id` Actualizar
  - `DELETE /user/event/delete/:id` Eliminar
  - `GET /user/event/read/:id` Detalle

Servicios/Productos (`Backend/src/routes/service.product.route.js`)
- `GET /service-products/readall` Listar (público)
- `POST /user/service-product/create` Crear (auth + `admin`) [multipart/form-data]
- `PUT /user/service-product/update/:id` Actualizar (auth + `admin`) [multipart/form-data]
- `DELETE /user/service-product/delete/:id` Eliminar (auth + `admin`)

Carga de imágenes:
- Campo `images`: hasta 6 archivos (image/*, máx 5MB c/u)
- Campos (texto o JSON en multipart):
  - `title` (req), `type` (req: "product" | "service"), `category`, `shortDescription`, `description`
  - `price`, `currency` (default "CLP"), `active` (bool), `stock`
  - `delivery`
  - `durationMinutes`, `capacity`
  - `locations` (JSON array), `tags` (JSON array)
  - `mpMetadata` (JSON object)
  - `alts` (JSON array; alt por imagen)
- En update se puede enviar `removePublicIds` (JSON array) para eliminar imágenes existentes.

Pagos (Mercado Pago) (`Backend/src/routes/payment.route.js`)
- `POST /payments/create_preference` Crea preferencia de pago
- `GET /payments/status/:paymentId` Consulta estado del pago
- `GET /payments/success|failure|pending` Rutas de retorno (informativas)
- `POST /payments/notification` Webhook de Mercado Pago

Contacto (`Backend/src/routes/contact.route.js`)
- `POST /contact` Envía email (name, email, subject, message)


## Frontend (Rutas principales)
Públicas: `/`, `/nosotros`, `/servicios-productos-list`, `/servicios-productos/:id`, `/recursos`, `/comunidad`, `/contacto`, `/reserva`, `/eventos`

Auth: `/login`, `/registro`

Privadas:
- Usuario: `/perfil`
- Superuser: `/perfilsuperuser`, edición/gestión de eventos
- Admin: `/admin`, `/admin/usuarios`, `/admin/eventos/*`, `/admin/productos/*`

El cliente HTTP (`Frontend/src/api/client.js`) usa `VITE_BACKEND_URL` y `withCredentials` para cookies de sesión.


## Autenticación y Roles
- Cookie `token` (JWT) gestionada por el backend.
- Middlewares:
  - `auth`: requiere sesión válida
  - `authRol("admin"|"superuser"|...)`: restringe por rol


## Pagos (Flujo simplificado)
1. Frontend construye la preferencia con `createPaymentPreference()` y llama a `POST /payments/create_preference`.
2. Backend compone `items`, establece `back_urls` y `notification_url` desde el `.env` y crea la preferencia con Mercado Pago.
3. Usuario es redirigido a Checkout Pro; MP redirige a `SUCCESS/FAILURE/PENDING` y notifica el `WEBHOOK`.
4. Opcionalmente, el frontend consulta `GET /payments/status/:paymentId` para reflejar estado.


## Subida de Imágenes (Cloudinary)
- Multer en memoria (`memoryStorage`) + subida en base64 al uploader de Cloudinary.
- En errores, se realiza limpieza de imágenes subidas recientemente.


## Proyección a corto plazo

- Considera rate‑limiting/CAPTCHA en `/contact` para mitigar spam.