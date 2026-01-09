/**
 * JSONata Validation Library - A Zod-like validation library for JSONata
 *
 * This library provides a fluent API for creating validation schemas
 * that can be used both standalone and integrated with JSONata expressions.
 */

export type ValidationResult<T = any> = {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
};

export type ValidationError = {
  code: string;
  message: string;
  path: (string | number)[];
  received?: any;
  expected?: string;
};

export type ValidationContext = {
  path: (string | number)[];
  data: any;
  root: any;
};

export type ValidatorFunction<T = any> = (
  value: any,
  context: ValidationContext
) => ValidationResult<T>;

/**
 * Base class for all validation schemas
 */
export abstract class JSONataSchema<T = any> {
  protected validators: ValidatorFunction<T>[] = [];
  protected optional = false;
  protected nullable = false;
  protected defaultValue?: T;

  abstract _parse(value: any, context: ValidationContext): ValidationResult<T>;

  /**
   * Parse and validate a value
   */
  parse(value: any, path: (string | number)[] = []): ValidationResult<T> {
    const context: ValidationContext = {
      path,
      data: value,
      root: value,
    };

    return this._parse(value, context);
  }

  /**
   * Parse and validate, throwing on error
   */
  safeParse(value: any, path: (string | number)[] = []): T {
    const result = this.parse(value, path);
    if (!result.success) {
      throw new JSONataValidationError(result.errors || []);
    }
    return result.data!;
  }

  /**
   * Make this schema optional
   */
  opt(): JSONataSchema<T | undefined> {
    const schema = this.clone();
    schema.optional = true;
    return schema;
  }

  /**
   * Make this schema nullable
   */
  null(): JSONataSchema<T | null> {
    const schema = this.clone();
    schema.nullable = true;
    return schema;
  }

  /**
   * Add a default value
   */
  default(value: T): JSONataSchema<T> {
    const schema = this.clone();
    schema.defaultValue = value;
    return schema;
  }

  /**
   * Add custom validation
   */
  refine(
    validator: (value: T) => boolean,
    message: string | ((value: T) => string)
  ): JSONataSchema<T> {
    const schema = this.clone();
    schema.validators.push((value, context) => {
      if (!validator(value)) {
        const errorMessage = typeof message === 'function' ? message(value) : message;
        return {
          success: false,
          errors: [
            {
              code: 'custom_validation_failed',
              message: errorMessage,
              path: context.path,
              received: value,
            },
          ],
        };
      }
      return { success: true, data: value };
    });
    return schema;
  }

  /**
   * Convert schema to JSONata function
   */
  toJSONataFunction(): string {
    // This will generate a JSONata function that can be used in expressions
    return `function($value, $path) { /* validation logic will be injected */ }`;
  }

  protected abstract clone(): JSONataSchema<T>;

  protected handleOptionalAndNullable(
    value: any,
    context: ValidationContext
  ): ValidationResult<T> | null {
    if (value === undefined) {
      if (this.optional) {
        return { success: true, data: this.defaultValue };
      }
      return {
        success: false,
        errors: [
          {
            code: 'required',
            message: 'Required field is missing',
            path: context.path,
            received: undefined,
          },
        ],
      };
    }

    if (value === null) {
      if (this.nullable) {
        return { success: true, data: null as any };
      }
      return {
        success: false,
        errors: [
          {
            code: 'not_nullable',
            message: 'Field cannot be null',
            path: context.path,
            received: null,
          },
        ],
      };
    }

    return null; // Continue with normal validation
  }

  protected runCustomValidators(value: T, context: ValidationContext): ValidationResult<T> {
    for (const validator of this.validators) {
      const result = validator(value, context);
      if (!result.success) {
        return result;
      }
    }
    return { success: true, data: value };
  }
}

/**
 * Custom error class for validation failures
 */
export class JSONataValidationError extends Error {
  constructor(public errors: ValidationError[]) {
    super(
      `Validation failed: ${errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`
    );
    this.name = 'JSONataValidationError';
  }
}
