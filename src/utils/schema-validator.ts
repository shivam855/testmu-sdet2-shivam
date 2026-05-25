import Ajv, { Schema } from 'ajv';

const ajv = new Ajv({ allErrors: true });

/**
 * Validate a JSON body against a JSON Schema.
 * Returns { valid, errors } for assertion in tests.
 */
export function validateSchema(data: unknown, schema: Schema): { valid: boolean; errors: string[] } {
  const validate = ajv.compile(schema);
  const valid = validate(data) as boolean;
  const errors = (validate.errors ?? []).map(
    (e) => `${e.instancePath || '/'} ${e.message}`,
  );
  return { valid, errors };
}
