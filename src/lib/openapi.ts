import { SUPPORTED_CURRENCIES } from '@/lib/fx';
import {
  CARD_LIMIT_MAX,
  CARD_LIMIT_MIN,
  MAX_TRANSFER_AMOUNT,
  TRANSFER_CATEGORIES,
} from '@/lib/bank';

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });

const errorResponse = (description: string, example: Record<string, unknown>) => ({
  description,
  content: { 'application/json': { schema: ref('ApiError'), example } },
});

const idParam = (description: string, example: string) => ({
  name: 'id',
  in: 'path',
  required: true,
  description,
  schema: { type: 'string', example },
});

/** Especificación OpenAPI 3.0 de la API interna de NovaBank. */
export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'NovaBank Digital API',
    version: '1.1.0',
    description:
      'API interna (Route Handlers de Next.js) de la demo NovaBank Digital.\n\n' +
      '**Importante:** los datos viven en memoria del servidor y se reinician al reiniciar la app. ' +
      'No hay autenticación (entorno de demostración).\n\n' +
      'Todos los errores usan el formato `{ error, code, details? }`.',
  },
  servers: [{ url: '/', description: 'Servidor actual' }],
  tags: [
    { name: 'Sistema', description: 'Estado del servicio' },
    { name: 'Cuentas', description: 'Cuentas, movimientos y transferencias' },
    { name: 'Tarjetas', description: 'Gestión de tarjetas físicas y virtuales' },
    { name: 'Metas', description: 'Bóvedas de ahorro' },
    { name: 'Divisas', description: 'Tipos de cambio (API externa con respaldo local)' },
  ],
  paths: {
    '/api/health': {
      get: {
        tags: ['Sistema'],
        summary: 'Estado del servicio',
        operationId: 'getHealth',
        responses: {
          '200': {
            description: 'Servicio operativo',
            content: {
              'application/json': {
                schema: ref('Health'),
                example: {
                  status: 'ok',
                  service: 'NovaBank Digital',
                  uptimeSeconds: 120,
                  timestamp: '2026-11-08T15:00:00.000Z',
                },
              },
            },
          },
        },
      },
    },
    '/api/accounts': {
      get: {
        tags: ['Cuentas'],
        summary: 'Listar cuentas y movimientos',
        operationId: 'listAccounts',
        responses: {
          '200': {
            description: 'Cuentas y transacciones actuales',
            content: { 'application/json': { schema: ref('AccountsResponse') } },
          },
        },
      },
      post: {
        tags: ['Cuentas'],
        summary: 'Ejecutar una transferencia',
        description:
          'Descuenta el monto de la cuenta de origen y registra la transacción con un código de referencia.',
        operationId: 'createTransfer',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: ref('TransferRequest'),
              example: {
                fromAccountId: 'acc-1',
                recipient: 'Carlos Mendoza - Banco Cuscatlán',
                amount: 150.5,
                concept: 'Pago de consultoría',
                category: 'Servicios',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Transferencia procesada',
            content: { 'application/json': { schema: ref('TransferResponse') } },
          },
          '400': errorResponse('Datos inválidos', {
            error: 'El monto debe ser un número mayor a 0.',
            code: 'INVALID_AMOUNT',
          }),
          '404': errorResponse('Cuenta de origen inexistente', {
            error: 'Cuenta de origen no encontrada.',
            code: 'ACCOUNT_NOT_FOUND',
          }),
          '422': errorResponse('Fondos insuficientes o monto sobre el límite', {
            error: 'Fondos insuficientes en la cuenta seleccionada.',
            code: 'INSUFFICIENT_FUNDS',
            details: { available: 100, requested: 500 },
          }),
        },
      },
    },
    '/api/cards': {
      get: {
        tags: ['Tarjetas'],
        summary: 'Listar tarjetas',
        description: 'El CVV nunca se incluye; usa `/api/cards/{id}/reveal`.',
        operationId: 'listCards',
        responses: {
          '200': {
            description: 'Tarjetas del cliente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    cards: { type: 'array', items: ref('Card') },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/cards/{id}': {
      patch: {
        tags: ['Tarjetas'],
        summary: 'Congelar/descongelar o cambiar el límite mensual',
        operationId: 'updateCard',
        parameters: [idParam('ID de la tarjeta', 'card-1')],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: ref('CardUpdateRequest'),
              example: { frozen: true, monthlyLimit: 5000 },
            },
          },
        },
        responses: {
          '200': {
            description: 'Tarjeta actualizada',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { card: ref('Card') } },
              },
            },
          },
          '400': errorResponse('Campos inválidos', {
            error: `El límite debe ser un entero entre ${CARD_LIMIT_MIN} y ${CARD_LIMIT_MAX}.`,
            code: 'INVALID_LIMIT',
          }),
          '404': errorResponse('Tarjeta inexistente', {
            error: 'Tarjeta no encontrada.',
            code: 'CARD_NOT_FOUND',
          }),
          '422': errorResponse('Límite menor al consumo del mes', {
            error: 'El límite no puede ser menor al consumo actual del mes.',
            code: 'LIMIT_BELOW_SPENT',
            details: { currentSpent: 2430.5 },
          }),
        },
      },
    },
    '/api/cards/{id}/reveal': {
      get: {
        tags: ['Tarjetas'],
        summary: 'Obtener el CVV de una tarjeta',
        description: 'Falla con 403 si la tarjeta está congelada. Respuesta sin caché.',
        operationId: 'revealCard',
        parameters: [idParam('ID de la tarjeta', 'card-1')],
        responses: {
          '200': {
            description: 'CVV de la tarjeta',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: 'card-1' },
                    cvv: { type: 'string', example: '849' },
                  },
                },
              },
            },
          },
          '403': errorResponse('Tarjeta congelada', {
            error: 'La tarjeta está congelada. Descongélala para ver sus datos.',
            code: 'CARD_FROZEN',
          }),
          '404': errorResponse('Tarjeta inexistente', {
            error: 'Tarjeta no encontrada.',
            code: 'CARD_NOT_FOUND',
          }),
        },
      },
    },
    '/api/goals': {
      get: {
        tags: ['Metas'],
        summary: 'Listar metas de ahorro',
        operationId: 'listGoals',
        responses: {
          '200': {
            description: 'Metas de ahorro',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { goals: { type: 'array', items: ref('Goal') } },
                },
              },
            },
          },
        },
      },
    },
    '/api/goals/{id}/deposit': {
      post: {
        tags: ['Metas'],
        summary: 'Abonar a una meta desde una cuenta USD',
        description:
          'Descuenta el monto de la cuenta y lo suma a la meta. No puede superar lo que falta para el objetivo.',
        operationId: 'depositToGoal',
        parameters: [idParam('ID de la meta', 'goal-1')],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: ref('GoalDepositRequest'),
              example: { fromAccountId: 'acc-1', amount: 250 },
            },
          },
        },
        responses: {
          '201': {
            description: 'Abono registrado',
            content: { 'application/json': { schema: ref('GoalDepositResponse') } },
          },
          '400': errorResponse('Monto inválido', {
            error: 'El monto debe ser un número mayor a 0.',
            code: 'INVALID_AMOUNT',
          }),
          '404': errorResponse('Meta o cuenta inexistente', {
            error: 'Meta de ahorro no encontrada.',
            code: 'GOAL_NOT_FOUND',
          }),
          '422': errorResponse('Regla de negocio incumplida', {
            error: 'El abono supera lo que falta para la meta (5500.00 USD).',
            code: 'GOAL_EXCEEDS_TARGET',
            details: { remaining: 5500 },
          }),
        },
      },
    },
    '/api/fx': {
      get: {
        tags: ['Divisas'],
        summary: 'Tipos de cambio respecto al USD',
        description:
          'Consume la API externa configurada en `FX_API_URL` (caché de 5 min, timeout de 4 s). ' +
          'Si falla, responde con tasas locales y `fallback: true`.',
        operationId: 'getFxRates',
        responses: {
          '200': {
            description: 'Tasas de cambio',
            content: { 'application/json': { schema: ref('FxRates') } },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      ApiError: {
        type: 'object',
        required: ['error', 'code'],
        properties: {
          error: { type: 'string', description: 'Mensaje legible' },
          code: { type: 'string', description: 'Código estable para el cliente' },
          details: { type: 'object', additionalProperties: true },
        },
      },
      Health: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
          service: { type: 'string' },
          uptimeSeconds: { type: 'integer' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      Account: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'acc-1' },
          name: { type: 'string' },
          accountNumber: { type: 'string' },
          iban: { type: 'string' },
          balance: { type: 'number', example: 18450.75 },
          currency: { type: 'string', enum: ['USD', 'EUR'] },
          type: { type: 'string' },
          apy: { type: 'number', example: 1.25 },
        },
      },
      Transaction: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          recipientOrSender: { type: 'string' },
          amount: { type: 'number', description: 'Negativo = egreso' },
          currency: { type: 'string' },
          date: { type: 'string', example: '2026-11-08 09:15' },
          type: { type: 'string', enum: ['ingreso', 'egreso', 'transferencia'] },
          category: { type: 'string' },
          status: { type: 'string', enum: ['Completado', 'En Proceso', 'Rechazado'] },
          reference: { type: 'string', example: 'NV-123456' },
        },
      },
      AccountsResponse: {
        type: 'object',
        properties: {
          bankName: { type: 'string' },
          accounts: { type: 'array', items: ref('Account') },
          transactions: { type: 'array', items: ref('Transaction') },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      TransferRequest: {
        type: 'object',
        required: ['fromAccountId', 'recipient', 'amount'],
        properties: {
          fromAccountId: { type: 'string', example: 'acc-1' },
          recipient: { type: 'string', minLength: 2, maxLength: 80 },
          amount: {
            type: 'number',
            exclusiveMinimum: 0,
            maximum: MAX_TRANSFER_AMOUNT,
            description: 'Máximo 2 decimales',
          },
          concept: { type: 'string', maxLength: 120 },
          category: {
            type: 'string',
            enum: TRANSFER_CATEGORIES,
            default: 'Transferencia',
          },
        },
      },
      TransferResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          transaction: ref('Transaction'),
          accounts: { type: 'array', items: ref('Account') },
        },
      },
      Card: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'card-1' },
          alias: { type: 'string' },
          holder: { type: 'string' },
          last4: { type: 'string' },
          fullNumber: { type: 'string', description: 'Enmascarado' },
          expiry: { type: 'string', example: '09/29' },
          network: { type: 'string', enum: ['Visa Infinite', 'Mastercard Black'] },
          type: { type: 'string', enum: ['Física', 'Virtual'] },
          frozen: { type: 'boolean' },
          monthlyLimit: { type: 'number' },
          currentSpent: { type: 'number' },
          theme: { type: 'string', enum: ['emerald', 'indigo', 'obsidian'] },
        },
      },
      CardUpdateRequest: {
        type: 'object',
        minProperties: 1,
        properties: {
          frozen: { type: 'boolean' },
          monthlyLimit: {
            type: 'integer',
            minimum: CARD_LIMIT_MIN,
            maximum: CARD_LIMIT_MAX,
          },
        },
      },
      Goal: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'goal-1' },
          title: { type: 'string' },
          category: { type: 'string' },
          targetAmount: { type: 'number' },
          currentAmount: { type: 'number' },
          deadline: { type: 'string', format: 'date' },
          apy: { type: 'number' },
          iconName: { type: 'string' },
        },
      },
      GoalDepositRequest: {
        type: 'object',
        required: ['fromAccountId', 'amount'],
        properties: {
          fromAccountId: { type: 'string', example: 'acc-1' },
          amount: { type: 'number', exclusiveMinimum: 0 },
        },
      },
      GoalDepositResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          goal: ref('Goal'),
          transaction: ref('Transaction'),
          accounts: { type: 'array', items: ref('Account') },
        },
      },
      FxRates: {
        type: 'object',
        properties: {
          base: { type: 'string', example: 'USD' },
          updatedAt: { type: 'string' },
          source: { type: 'string' },
          fallback: {
            type: 'boolean',
            description: 'true si se usan tasas locales de contingencia',
          },
          rates: {
            type: 'object',
            additionalProperties: { type: 'number' },
            example: Object.fromEntries(SUPPORTED_CURRENCIES.map((c) => [c, 1])),
          },
        },
      },
    },
  },
} as const;
