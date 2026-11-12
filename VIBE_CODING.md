# 🤖 Documento de Proceso de Vibe Coding — NovaBank Digital (Next.js 16)

Este documento registra de forma estructurada el flujo de desarrollo guiado por Inteligencia Artificial (**Vibe Coding**) empleado para concebir, diseñar, iterar, depurar y desplegar **NovaBank Digital**, cumpliendo con todos los requisitos técnicos de la Actividad Evaluada.

---

## 1. Concepción Inicial del Proyecto

### Problema a resolver
Desarrollar en tiempo récord una plataforma de banca digital moderna (**NovaBank Digital**) que permita a los usuarios consultar su patrimonio consolidado en múltiples cuentas, ejecutar transferencias interbancarias con validación de fondos, gestionar tarjetas físicas/virtuales (congelamiento, visualización de CVV y ajuste de límites), consultar tipos de cambio en tiempo real desde una API externa y administrar bóvedas de ahorro con rendimiento anual (APY).

### Stack Tecnológico Seleccionado
| Capa | Tecnología | Justificación |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Soporte nativo para React Server Components, Route Handlers (`app/api/...`), `loading.tsx` y `error.tsx`. |
| **Lenguaje** | TypeScript (`strict: true`) | Tipado estático de extremo a extremo para entidades críticas (`BankAccount`, `Transaction`, `BankCard`, `SavingsGoal`). |
| **Estilos** | Tailwind CSS v4 | Diseño oscuro (*dark fintech aesthetic*) responsive mobile-first con efectos *glassmorphism*. |
| **Iconografía** | Lucide React | Iconos vectoriales ligeros y consistentes para interfaces financieras. |
| **Despliegue** | Vercel + GitHub | Integración continua (CI/CD) automática desde el repositorio público. |

---

## 2. Registro de Prompts Principales Utilizados

Durante el ciclo de Vibe Coding se aplicó ingeniería de prompts incremental dividida en 5 fases:

### Prompt 1 — Arquitectura Base y Tipado Financiero
> *"Actúa como un Arquitecto Senior de Next.js 16. Necesito estructurar una aplicación de banca digital llamada NovaBank Digital usando App Router y TypeScript estricto. Genera las interfaces en `src/types/banking.ts` para cuentas bancarias (USD/EUR), transacciones con categorías y referencias, tarjetas físicas/virtuales con estado de bloqueo y límites mensuales, y metas de ahorro con APY. Incluye datos iniciales realistas en `src/lib/mock-data.ts`."*

### Prompt 2 — Route Handlers (API Interna y Consumo de API Externa de Divisas)
> *"Crea dos Route Handlers en Next.js 16 dentro de `src/app/api/`:
> 1. `/api/accounts/route.ts`: con métodos `GET` (retorna cuentas y transacciones) y `POST` (procesa una nueva transferencia validando monto positivo, cuenta existente y saldo suficiente, devolviendo HTTP 400 o 422 si falla).
> 2. `/api/fx/route.ts`: que consuma la API pública de tasas de cambio configurada en `process.env.NEXT_PUBLIC_FX_API_URL` (`https://open.er-api.com/v6/latest/USD`) usando `fetch` con revalidación cada 300 segundos y un objeto de contingencia (`FALLBACK_RATES`) en caso de caída de red."*

### Prompt 3 — Combinación de Server Components y Client Components en el Dashboard
> *"Diseña `src/app/page.tsx` como un Server Component que carga los datos iniciales de las cuentas y transacciones, e inyecta esos datos en un Client Component `src/components/DashboardClient.tsx`. En el componente cliente utiliza `useState` para: 1) un modo de privacidad que oculte/muestre los saldos con asteriscos, 2) un buscador en tiempo real por comercio o referencia, y 3) un selector de categoría contable."*

### Prompt 4 — Módulos Interactivos: Transferencias, Tarjetas 3D y Metas de Ahorro
> *"Genera tres páginas adicionales en el App Router:
> - `/transferencias/page.tsx`: formulario controlado con `useState` y `useEffect` que consuma `GET /api/accounts` y envíe nuevas transferencias vía `POST /api/accounts`, mostrando alertas de error o el recibo con código de referencia.
> - `/tarjetas/page.tsx`: gestor de tarjetas Visa Infinite y Mastercard Black con botones para congelar/descongelar (aplicando escala de grises a la tarjeta bloqueada), revelar el CVV y ajustar el límite mensual con un slider `<input type='range'>`.
> - `/metas/page.tsx`: bóvedas de ahorro con barras de progreso animadas y abonos instantáneos."*

### Prompt 5 — Resiliencia UX: Estados de Carga (`loading.tsx`) y Errores (`error.tsx`)
> *"Implementa `src/app/loading.tsx` con skeletons animados en Tailwind CSS que imiten la estructura de las tarjetas bancarias, y `src/app/error.tsx` como un Client Component (`'use client'`) que capture errores de ejecución en cualquier ruta y ofrezca el botón de recuperación mediante la función `reset()`."*

### Prompt 6 — Revisión, endurecimiento y documentación de la API
> *"Revisa todo el proyecto y aplica las mejoras necesarias para un funcionamiento óptimo antes de pensar en producción: que el dashboard y las demás páginas compartan los mismos datos, que tarjetas y metas pasen por la API, que las validaciones vivan en el servidor, y documenta todos los endpoints con OpenAPI para verlos en Swagger. Deja el README sin pasos de despliegue definitivos."*

---

## 3. Iteraciones Realizadas con la IA

| Iteración | Resultado Inicial de la IA | Ajuste / Refinamiento Humano Aplicado |
| :--- | :--- | :--- |
| **Iteración 1: Hidratación de Fechas y Monedas** | La IA usó `toLocaleDateString()` sin parámetros fijos, lo que podía provocar diferencias de hidratación (*hydration mismatch*) entre servidor Node y navegador. | Se estandarizaron las fechas en formato ISO legible y el formateo monetario con `toLocaleString('en-US', { minimumFractionDigits: 2 })` determinista. |
| **Iteración 2: Validación de Sobregiros en Transferencias** | El primer borrador del formulario de transferencias restaba el monto directamente en el cliente sin validar si superaba el saldo de la cuenta seleccionada. | Se movió la validación de saldo al Route Handler `POST /api/accounts` (retornando código HTTP `422 Unprocessable Entity` cuando `balance < numericAmount`) y se conectó el estado `errorMsg` en la interfaz. |
| **Iteración 3: Resiliencia de la API Externa de Divisas** | Si la API externa `open.er-api.com` tardaba en responder o había bloqueo de red, la página `/divisas` rompía la vista. | Se añadió un bloque `try/catch` en `/api/fx/route.ts` con tasas de respaldo (`FALLBACK_RATES`) e indicador visual de la fuente de datos. |
| **Iteración 5: Endurecimiento y Swagger** | Tarjetas y metas solo existían en el estado del navegador; las validaciones estaban en el cliente o repetidas. | Nuevos endpoints `/api/cards`, `/api/goals`, `/api/health`, validación en servidor y documentación OpenAPI visible en `/docs`. |
| **Iteración 4: Navegación Responsive Móvil** | La barra de navegación horizontal desbordaba en pantallas menores a `768px`. | Se incorporó un menú colapsable móvil controlado con `useState` en `Navbar.tsx` y grillas adaptativas (`grid-cols-1 md:grid-cols-3`). |

---

## 4. Decisiones Técnicas Tomadas

1. **Arquitectura Híbrida Server + Client Components**:
   - Se mantuvieron `layout.tsx` y `page.tsx` como **Server Components** para reducir el JavaScript enviado al cliente en la carga inicial y aprovechar el renderizado en servidor de Next.js 16.
   - Se aislaron las piezas con interactividad intensiva (`Navbar`, `DashboardClient`, `TransferenciasPage`, `TarjetasPage`, `DivisasPage`, `MetasPage`, `error.tsx`) con la directiva `'use client'`.
2. **Proxy de API Externa mediante Route Handler (`/api/fx`)**:
   - En lugar de hacer llamadas directas no controladas desde el navegador, el cliente consulta `/api/fx`, que lee `FX_API_URL` (solo servidor) desde `.env.local`, aplica caché de servidor (`revalidate: 300`), un timeout de 4 s y tasas de respaldo con el indicador `fallback`.
   - En la revisión de la fase 6 se eliminó `BANK_INTERNAL_API_SECRET`: se había documentado pero ningún código la usaba, así que daba una falsa sensación de seguridad.
3. **Lógica de negocio centralizada (`src/lib/bank.ts`) y almacén compartido (`src/lib/store.ts`)**:
   - Los Route Handlers solo parsean la petición y delegan; las reglas (montos, fondos, límites) viven en un único lugar y devuelven errores con formato uniforme `{ error, code, details? }`.
   - Dashboard y APIs leen el mismo almacén, por lo que una transferencia se refleja en el panel.
4. **Contrato de API documentado (`src/lib/openapi.ts`)**: la especificación OpenAPI se sirve en `/api/openapi` y se visualiza en `/docs` con Swagger UI.
5. **Separación Estricta de Tipos (`src/types/banking.ts`)**:
   - Evita el uso de `any` y garantiza que los componentes y los Route Handlers compartan exactamente el mismo contrato de datos.

---

## 5. Desafíos Encontrados y Resolución con Apoyo de IA

- **Desafío 1: Error de compilación en `error.tsx` en Next.js App Router**
  - *Causa*: Next.js exige que los límites de error (`error.tsx`) sean obligatoriamente Client Components.
  - *Solución guiada por IA*: Se agregó `'use client'` en la primera línea de `src/app/error.tsx` y se tiparon las props `{ error: Error & { digest?: string }; reset: () => void }`.
- **Desafío 2: Sincronización de saldo tras realizar una transferencia**
  - *Causa*: Al enviar una transferencia en `/transferencias`, la lista de cuentas debía reflejar inmediatamente el nuevo saldo descontado sin recargar toda la página.
  - *Solución guiada por IA*: El endpoint `POST /api/accounts` devuelve tanto la nueva transacción (`transaction`) como el arreglo actualizado de cuentas (`accounts`), permitiendo actualizar ambos estados locales (`setAccounts` y `setTransactions`) en una sola respuesta.
- **Desafío 3: Inconsistencias detectadas en la revisión de la fase 6**
  - *Causa*: El dashboard leía datos de ejemplo directamente y no veía las transferencias; el patrimonio ignoraba la cuenta en EUR; el rendimiento mensual estaba escrito a mano; el abono a metas topaba el monto sin descontar el exceso de la cuenta; el CVV viajaba siempre en el JSON de tarjetas.
  - *Solución guiada por IA*: Almacén compartido, conversión a USD con las tasas de `/api/fx`, rendimiento calculado como Σ(saldo × APY / 12), rechazo con 422 de abonos que superan la meta y endpoint `/api/cards/{id}/reveal` para entregar el CVV solo bajo demanda y nunca con la tarjeta congelada.
  - *Verificación*: se probaron los endpoints con casos válidos e inválidos (400, 403, 404, 422) y se comprobó que los saldos y la meta cambiaron como se esperaba.
