import jsonata from 'jsonata';
import { JSONataSchema, type ValidationResult } from './index.js';

/**
 * JSONata Integration Functions
 *
 * These functions allow validation schemas to be used directly within JSONata expressions
 */

/**
 * Create a JSONata expression that includes validation functions
 */
export function createValidatedJSONata(
  expression: string,
  schemas: Record<string, JSONataSchema> = {}
): jsonata.Expression {
  const expr = jsonata(expression);

  // Register validation functions
  Object.entries(schemas).forEach(([name, schema]) => {
    expr.registerFunction(name, (value: any, path: string = '') => {
      const pathArray = path ? path.split('.') : [];
      const result = schema.parse(value, pathArray);

      if (!result.success) {
        // Return validation errors in a JSONata-friendly format
        return {
          isValid: false,
          errors: result.errors,
          value: value,
        };
      }

      return {
        isValid: true,
        value: result.data,
        errors: null,
      };
    });
  });

  // Register utility validation functions
  registerUtilityFunctions(expr);

  return expr;
}

/**
 * Register common utility validation functions
 */
function registerUtilityFunctions(expr: jsonata.Expression) {
  // String validation
  expr.registerFunction('isEmail', (value: any) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return typeof value === 'string' && emailRegex.test(value);
  });

  expr.registerFunction('isURL', (value: any) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  });

  expr.registerFunction('isUUID', (value: any) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return typeof value === 'string' && uuidRegex.test(value);
  });

  expr.registerFunction('isDate', (value: any) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return typeof value === 'string' && dateRegex.test(value) && !Number.isNaN(Date.parse(value));
  });

  // Number validation
  expr.registerFunction('isPositive', (value: any) => {
    return typeof value === 'number' && value > 0;
  });

  expr.registerFunction('isNegative', (value: any) => {
    return typeof value === 'number' && value < 0;
  });

  expr.registerFunction('isInteger', (value: any) => {
    return typeof value === 'number' && Number.isInteger(value);
  });

  expr.registerFunction('inRange', (value: any, min: number, max: number) => {
    return typeof value === 'number' && value >= min && value <= max;
  });

  // Array validation
  expr.registerFunction('hasLength', (array: any, length: number) => {
    return Array.isArray(array) && array.length === length;
  });

  expr.registerFunction('minLength', (array: any, minLen: number) => {
    return Array.isArray(array) && array.length >= minLen;
  });

  expr.registerFunction('maxLength', (array: any, maxLen: number) => {
    return Array.isArray(array) && array.length <= maxLen;
  });

  // Object validation
  expr.registerFunction('hasKeys', (obj: any, keys: string[]) => {
    if (typeof obj !== 'object' || obj === null) return false;
    return keys.every((key) => key in obj);
  });

  expr.registerFunction('hasNoExtraKeys', (obj: any, allowedKeys: string[]) => {
    if (typeof obj !== 'object' || obj === null) return false;
    const objKeys = Object.keys(obj);
    return objKeys.every((key) => allowedKeys.includes(key));
  });

  // Validation result helpers
  expr.registerFunction('validate', (value: any, validatorName: string, ..._args: any[]) => {
    // This is a meta-function that can call other validators
    try {
      // Simple validation dispatch - you would extend this based on your needs
      switch (validatorName) {
        case 'isEmail':
          return expr.evaluate('$isEmail($)', { $: value });
        case 'isURL':
          return expr.evaluate('$isURL($)', { $: value });
        default:
          return false;
      }
    } catch {
      return false;
    }
  });

  expr.registerFunction(
    'createError',
    (code: string, message: string, path: string, received?: any) => {
      return {
        code,
        message,
        path: path.split('.').filter((p) => p !== ''),
        received,
      };
    }
  );
}

/**
 * Validate an entire JSONata transformation result
 */
export function validateJSONataResult<T>(
  expression: string,
  data: any,
  resultSchema: JSONataSchema<T>,
  schemas: Record<string, JSONataSchema> = {}
): ValidationResult<T> {
  try {
    const expr = createValidatedJSONata(expression, schemas);
    const result = expr.evaluate(data);

    return resultSchema.parse(result);
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          code: 'jsonata_evaluation_error',
          message: error instanceof Error ? error.message : 'Unknown JSONata evaluation error',
          path: [],
          received: data,
        },
      ],
    };
  }
}

/**
 * Create a validation schema from a JSONata expression
 * This allows defining validation rules using JSONata syntax
 */
export function schemaFromJSONata(expression: string): JSONataSchema {
  return new (class extends JSONataSchema {
    _parse(value: any, context: any): ValidationResult {
      try {
        const expr = jsonata(expression);
        const result = expr.evaluate(value);

        // Handle both synchronous and asynchronous results
        const handleResult = (evalResult: any) => {
          if (evalResult === true) {
            return { success: true, data: value };
          } else if (typeof evalResult === 'object' && evalResult && evalResult.isValid === false) {
            return { success: false, errors: evalResult.errors || [] };
          } else {
            return {
              success: false,
              errors: [
                {
                  code: 'jsonata_validation_failed',
                  message: 'JSONata validation expression returned false',
                  path: context.path,
                  received: value,
                },
              ],
            };
          }
        };

        // Check if result is a Promise
        if (result && typeof result.then === 'function') {
          // For async results, we'll need to handle this differently
          // For now, treat as validation failure
          return {
            success: false,
            errors: [
              {
                code: 'async_validation_not_supported',
                message: 'Asynchronous JSONata validation is not supported',
                path: context.path,
                received: value,
              },
            ],
          };
        }

        return handleResult(result);
      } catch (error) {
        return {
          success: false,
          errors: [
            {
              code: 'jsonata_expression_error',
              message: error instanceof Error ? error.message : 'JSONata expression error',
              path: context.path,
              received: value,
            },
          ],
        };
      }
    }

    protected clone() {
      return schemaFromJSONata(expression);
    }
  })();
}

/**
 * Export type for validated JSONata expressions
 */
export type ValidatedJSONataExpression = {
  expression: jsonata.Expression;
  validate: <T>(data: any, schema: JSONataSchema<T>) => ValidationResult<T>;
  evaluate: (data: any) => any;
};
