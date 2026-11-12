# NovaBank Digital

Aplicación web bancaria de demostración construida con **Next.js 16 (App Router)**, **TypeScript** y **Tailwind CSS v4**, desarrollada con la metodología de **Vibe Coding** (desarrollo iterativo guiado por IA).

**Demo en producción:** [https://aplicaci-n-next-js-mediante-vibe-co-three.vercel.app](https://aplicaci-n-next-js-mediante-vibe-co-three.vercel.app)
**Documentación de la API (Swagger):** [/docs](https://aplicaci-n-next-js-mediante-vibe-co-three.vercel.app/docs)

> Es un proyecto de demostración: los datos son ficticios y viven en memoria del servidor. No tiene autenticación ni base de datos todavía (ver [Hacia producción](#hacia-producción)).

## ¿Qué hace esta aplicación?

NovaBank Digital simula el panel de un banco en línea. Con un único cliente de ejemplo (con tres cuentas, tres tarjetas y tres metas de ahorro) puedes:

- **Ver tu situación financiera:** el panel suma el saldo de todas tus cuentas en dólares (convierte la cuenta en euros con el tipo de cambio actual), calcula un rendimiento mensual estimado a partir del APY de cada cuenta y lista tus movimientos, con buscador y filtro por categoría. Un botón oculta los saldos.
- **Enviar dinero:** eliges la cuenta de origen, el beneficiario, el monto y la categoría. El servidor valida los datos, descuenta el saldo y devuelve un comprobante con código de referencia (`NV-123456`). El movimiento aparece de inmediato en el panel.
- **Gestionar tus tarjetas:** congelas o descongelas una tarjeta, ves su CVV solo cuando lo pides (y nunca si está congelada) y ajustas el límite mensual de gasto.
- **Consultar divisas:** conviertes dólares a otras 9 monedas con tasas reales de una API externa. Si el proveedor no responde, la app usa tasas de respaldo y te avisa.
- **Ahorrar para metas:** abonas dinero desde una cuenta en dólares a una meta (fondo de emergencia, viaje, inversión) y ves el avance en una barra de progreso.
- **Probar la API:** `/docs` muestra todos los endpoints en Swagger y permite ejecutarlos desde el navegador.

### Reglas que aplica el servidor

| Operación | Reglas |
| :--- | :--- |
| Transferencia | Monto mayor a 0, máximo 2 decimales y hasta 100,000. Beneficiario de 2 a 80 caracteres. La cuenta debe existir y tener fondos suficientes. |
| Abono a meta | Debe salir de una cuenta en USD con fondos y no puede superar lo que falta para la meta. |
| Tarjeta | Límite entero entre 1,000 y 15,000, nunca menor al consumo del mes. El CVV no se entrega si la tarjeta está congelada. |

Cada error responde con un código HTTP (400, 403, 404 o 422) y un mensaje claro.

### Cómo está construida

- **Server Components y Client Components:** el panel se renderiza en el servidor con los datos reales y le pasa la información a un componente de cliente que maneja la interactividad (`useState`).
- **Route Handlers:** la API vive en `src/app/api/`. Las reglas de negocio están en `src/lib/bank.ts` y los datos en `src/lib/store.ts`.
- **API externa:** `/api/fx` consulta `open.er-api.com` con caché de 5 minutos y un tiempo máximo de espera de 4 segundos.
- **Estados de carga y error:** `loading.tsx`, `error.tsx` y mensajes en cada formulario.
- **Diseño responsive:** menú colapsable en móvil y cuadrículas que se adaptan al tamaño de pantalla.

### Importante al probar la demo en línea

Los datos se guardan en la memoria del servidor, no en una base de datos. En Vercel cada instancia tiene su propia copia, así que una transferencia puede "desaparecer" al recargar o el saldo puede volver al valor inicial. Es una limitación conocida de la demo, no un error.

## Funcionalidades

| Ruta | Descripción |
| :--- | :--- |
| `/` | Panel financiero (Server Component + Client Component): patrimonio consolidado en USD, rendimiento estimado, modo privacidad y filtro de movimientos. |
| `/transferencias` | Formulario de transferencias con validación y comprobante. Usa `POST /api/accounts`. |
| `/tarjetas` | Congelar/descongelar, ver CVV bajo demanda y ajustar el límite mensual. Usa `/api/cards`. |
| `/divisas` | Conversor y cotizaciones. Usa `GET /api/fx` (API externa con respaldo local). |
| `/metas` | Bóvedas de ahorro con abonos desde una cuenta USD. Usa `/api/goals`. |
| `/docs` | Documentación interactiva de la API (Swagger UI). |

Además: `loading.tsx` (skeleton), `error.tsx` (error boundary con reintento) y `not-found.tsx`.

## Requisitos

- Node.js 20 o superior
- npm

## Instalación y uso local

```bash
npm install
```

Crea tu archivo de variables de entorno:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env.local

# macOS / Linux
cp .env.example .env.local
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Si el puerto está ocupado, Next.js usará el siguiente disponible y lo indicará en la terminal.

### Scripts

| Comando | Qué hace |
| :--- | :--- |
| `npm run dev` | Servidor de desarrollo (Turbopack) |
| `npm run build` | Compila para producción |
| `npm run start` | Sirve la build de producción |
| `npm run typecheck` | Verifica los tipos con TypeScript |

## Variables de entorno

| Variable | Alcance | Descripción |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_BANK_NAME` | Cliente y servidor | Nombre visible de la entidad. |
| `FX_API_URL` | Solo servidor | Endpoint de tipos de cambio. Por defecto `https://open.er-api.com/v6/latest/USD`. |

`.env.local` no se sube al repositorio. Las variables con prefijo `NEXT_PUBLIC_` se exponen al navegador, por eso nunca deben contener secretos.

## API y Swagger

Con la app corriendo:

- Swagger UI: [`/docs`](http://localhost:3000/docs)
- Especificación OpenAPI 3.0 (JSON): [`/api/openapi`](http://localhost:3000/api/openapi)

Swagger UI se carga desde un CDN (versión fija), por lo que `/docs` necesita conexión a internet. La especificación en sí se genera localmente.

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| GET | `/api/health` | Estado del servicio |
| GET | `/api/accounts` | Cuentas y movimientos |
| POST | `/api/accounts` | Ejecuta una transferencia |
| GET | `/api/cards` | Lista tarjetas (sin CVV) |
| PATCH | `/api/cards/{id}` | Congela/descongela o cambia el límite mensual |
| GET | `/api/cards/{id}/reveal` | Devuelve el CVV (403 si la tarjeta está congelada) |
| GET | `/api/goals` | Lista metas de ahorro |
| POST | `/api/goals/{id}/deposit` | Abona a una meta desde una cuenta USD |
| GET | `/api/fx` | Tipos de cambio respecto al USD |
| GET | `/api/openapi` | Especificación OpenAPI |

Todos los errores usan el mismo formato:

```json
{ "error": "Fondos insuficientes en la cuenta seleccionada.", "code": "INSUFFICIENT_FUNDS", "details": { "available": 100, "requested": 500 } }
```

Ejemplo:

```bash
curl -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -d '{"fromAccountId":"acc-1","recipient":"Carlos Mendoza","amount":150.5,"category":"Servicios"}'
```

## Estructura del proyecto

```
src/
├─ app/
│  ├─ api/            Route Handlers (accounts, cards, goals, fx, health, openapi)
│  ├─ docs/           Swagger UI
│  ├─ divisas/ metas/ tarjetas/ transferencias/
│  ├─ page.tsx        Dashboard (Server Component)
│  └─ loading.tsx · error.tsx · not-found.tsx
├─ components/        Navbar, DashboardClient
├─ lib/
│  ├─ bank.ts         Reglas de negocio y validaciones
│  ├─ store.ts        Almacén en memoria compartido
│  ├─ fx.ts           Cliente de la API de divisas (con respaldo)
│  ├─ openapi.ts      Especificación OpenAPI
│  ├─ http.ts · client.ts   Utilidades de API (servidor y cliente)
│  └─ mock-data.ts    Datos iniciales
└─ types/banking.ts   Interfaces compartidas
```

## Hacia producción

Pendiente antes de publicar:

- [ ] Reemplazar el almacén en memoria (`src/lib/store.ts`) por una base de datos. En plataformas serverless cada instancia tendría su propia copia de los datos.
- [ ] Añadir autenticación y autorización a los endpoints.
- [ ] Limitar la tasa de peticiones (rate limiting) en los endpoints que modifican datos.
- [ ] Definir una política CSP (hoy `/docs` carga Swagger UI desde un CDN).
- [ ] Añadir pruebas automatizadas y un pipeline de CI (`typecheck` + `build`).
- [x] Desplegar en Vercel (la demo ya está publicada; no requiere variables de entorno porque `FX_API_URL` y `NEXT_PUBLIC_BANK_NAME` tienen valores por defecto).

## Documentación del proceso

Los prompts, iteraciones, decisiones técnicas y desafíos están en [`VIBE_CODING.md`](./VIBE_CODING.md).
