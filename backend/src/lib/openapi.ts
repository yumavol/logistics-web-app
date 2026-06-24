import { z } from 'zod';
import {
  orderSchema,
  createOrderSchema,
  updateStatusSchema,
  listOrdersQuerySchema,
} from '@/modules/order/order.schema';

const jsonSchemaOptions = {
  target: 'openapi-3.0',
  unrepresentable: 'any',
  override: (ctx: { zodSchema: { _zod: { def: { type: string } } }; jsonSchema: Record<string, unknown> }) => {
    if (ctx.zodSchema._zod.def.type === 'date') {
      ctx.jsonSchema.type = 'string';
      ctx.jsonSchema.format = 'date-time';
    }
  },
} as const;

const toSchema = (schema: z.ZodType) => z.toJSONSchema(schema, { ...jsonSchemaOptions, io: 'input' });

const orderJson = z.toJSONSchema(orderSchema, { ...jsonSchemaOptions, io: 'output' });

const success = (dataRef: object) => ({
  type: 'object',
  properties: { success: { type: 'boolean' }, data: dataRef },
});

const queryParameters = () => {
  const json = toSchema(listOrdersQuerySchema) as { properties?: Record<string, object>; required?: string[] };
  return Object.entries(json.properties ?? {}).map(([name, schema]) => ({
    name,
    in: 'query',
    required: (json.required ?? []).includes(name),
    schema,
  }));
};

const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'string' } };
const trackingParam = { name: 'trackingNumber', in: 'path', required: true, schema: { type: 'string' } };

const jsonBody = (schema: z.ZodType) => ({
  required: true,
  content: { 'application/json': { schema: toSchema(schema) } },
});

const orderResponse = {
  description: 'Order',
  content: { 'application/json': { schema: success({ $ref: '#/components/schemas/Order' }) } },
};

export const openapiDocument = {
  openapi: '3.0.3',
  info: { title: 'Logistics API', version: '1.0.0', description: 'Shipment order management API' },
  servers: [{ url: '/api' }],
  components: { schemas: { Order: orderJson } },
  paths: {
    '/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Create an order',
        requestBody: jsonBody(createOrderSchema),
        responses: { '201': orderResponse, '400': { description: 'Validation error' } },
      },
      get: {
        tags: ['Orders'],
        summary: 'List orders',
        parameters: queryParameters(),
        responses: {
          '200': {
            description: 'Orders',
            content: {
              'application/json': {
                schema: success({ type: 'array', items: { $ref: '#/components/schemas/Order' } }),
              },
            },
          },
        },
      },
    },
    '/orders/track/{trackingNumber}': {
      get: {
        tags: ['Orders'],
        summary: 'Track an order by tracking number',
        parameters: [trackingParam],
        responses: { '200': orderResponse, '404': { description: 'Not found' } },
      },
    },
    '/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Get an order',
        parameters: [idParam],
        responses: { '200': orderResponse, '404': { description: 'Not found' } },
      },
    },
    '/orders/{id}/status': {
      patch: {
        tags: ['Orders'],
        summary: 'Update order status',
        parameters: [idParam],
        requestBody: jsonBody(updateStatusSchema),
        responses: { '200': orderResponse, '400': { description: 'Validation error' }, '404': { description: 'Not found' } },
      },
    },
    '/orders/{id}/cancel': {
      post: {
        tags: ['Orders'],
        summary: 'Cancel an order (only when pending)',
        parameters: [idParam],
        responses: { '200': orderResponse, '404': { description: 'Not found' }, '409': { description: 'Not cancelable' } },
      },
    },
  },
};
