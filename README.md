# 🏦 NovaBank Digital — Plataforma Fintech en Next.js 16 (Vibe Coding)

Aplicación web bancaria moderna construida desde cero con **Next.js 16 (App Router)**, **TypeScript** y **Tailwind CSS**, desarrollada bajo la metodología de **Vibe Coding** (desarrollo iterativo guiado por IA).

---

## ✨ Características Principales y Cumplimiento Técnico

- **Next.js 16+ con App Router y TypeScript Estricto**: Arquitectura modular en `src/app/`.
- **5 Rutas Funcionales Diferenciadas**:
  1. `/` — **Dashboard Financiero** (Server Component + Client Component interactivo con modo privacidad de saldos y filtrado en vivo de movimientos).
  2. `/transferencias` — **Centro de Transferencias UNI** (Formulario con `useState` y `useEffect` conectado a `POST /api/accounts` con validación de saldo y generación de referencia).
  3. `/tarjetas` — **Bóveda de Tarjetas Digitales y Físicas** (Congelamiento instantáneo de tarjetas, visualización segura de CVV y ajuste dinámico de límite mensual).
  4. `/divisas` — **Mercado FX & Conversor Multidivisa** (Consumo de API externa en tiempo real a través del Route Handler `GET /api/fx` con `useEffect`).
  5. `/metas` — **Bóvedas de Ahorro Inteligente** (Seguimiento de metas con APY y abonos en tiempo real).
- **Route Handlers Internos y Consumo de API Externa**:
  - `GET / POST /api/accounts`: Gestión de cuentas y ejecución de transferencias.
  - `GET /api/fx`: Consume `https://open.er-api.com/v6/latest/USD` parametrizado mediante variables de entorno.
- **Manejo de Estados de Carga y Error**:
  - `src/app/loading.tsx`: Skeleton UI automático durante transiciones asíncronas.
  - `src/app/error.tsx`: Error Boundary interactivo con botón de reintento (`reset()`).

---

## 🚀 Instrucciones de Instalación y Uso Local

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone https://github.com/TU_USUARIO/novabank-nextjs.git
cd novabank-nextjs
npm install
```

### 2. Configurar las variables de entorno
Copia el archivo `.env.example` hacia `.env.local`:
```bash
cp .env.example .env.local
```

Variables incluidas en `.env.example`:
- `NEXT_PUBLIC_BANK_NAME`: Nombre visible de la entidad financiera.
- `NEXT_PUBLIC_FX_API_URL`: Endpoint externo de tipos de cambio (`https://open.er-api.com/v6/latest/USD`).
- `NEXT_PUBLIC_BASE_CURRENCY`: Moneda base (`USD`).
- `BANK_INTERNAL_API_SECRET`: Clave privada del servidor para los Route Handlers.

### 3. Ejecutar el servidor de desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🌐 Despliegue en Producción (Vercel)

1. Sube este proyecto a un repositorio público en tu cuenta de **GitHub** (puedes usar el script `bash init-git-commits.sh` incluido para generar el historial de commits paso a paso automáticamente).
2. Ingresa a [https://vercel.com/new](https://vercel.com/new) e importa tu repositorio `novabank-nextjs`.
3. En la sección **Environment Variables** de Vercel, añade las variables definidas en `.env.example`.
4. Haz clic en **Deploy**. Una vez publicado, reemplaza el siguiente enlace con tu URL de producción:
   - 🔗 **URL de Producción (Vercel)**: `https://novabank-nextjs-demo.vercel.app` *(Reemplazar con tu enlace generado en Vercel)*

---

## 📄 Documentación de Vibe Coding

Consulta el archivo [`VIBE_CODING.md`](./VIBE_CODING.md) incluido en la raíz del proyecto para revisar los prompts utilizados, las iteraciones realizadas con la IA, las decisiones de arquitectura y la resolución de problemas técnicos.
