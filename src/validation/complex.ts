import {
  JSONataSchema,
  ValidationResult,
  ValidationContext,
  ValidationError,
} from "./index.js";

/**
 * Object validation schema
 */
export class JSONataObjectSchema<
  T extends Record<string, any> = Record<string, any>
> extends JSONataSchema<T> {
  private shape: Record<string, JSONataSchema> = {};
  private _strict = false;
  private _passthrough = false;

  constructor(shape?: Record<string, JSONataSchema>) {
    super();
    if (shape) {
      this.shape = shape;
    }
  }

  _parse(value: any, context: ValidationContext): ValidationResult<T> {
    const optionalCheck = this.handleOptionalAndNullable(value, context);
    if (optionalCheck) return optionalCheck;

    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return {
        success: false,
        errors: [
          {
            code: "invalid_type",
            message: `Expected object, received ${
              Array.isArray(value) ? "array" : typeof value
            }`,
            path: context.path,
            received: value,
            expected: "object",
          },
        ],
      };
    }

    const errors: ValidationError[] = [];
    const result: any = this._passthrough ? { ...value } : {};

    // Validate each property in the shape
    for (const [key, schema] of Object.entries(this.shape)) {
      const propertyValue = value[key];
      const propertyContext: ValidationContext = {
        ...context,
        path: [...context.path, key],
        data: propertyValue,
      };

      const propertyResult = schema._parse(propertyValue, propertyContext);
      if (!propertyResult.success) {
        errors.push(...(propertyResult.errors || []));
      } else {
        result[key] = propertyResult.data;
      }
    }

    // Check for unknown keys if strict mode
    if (this._strict) {
      const shapeKeys = new Set(Object.keys(this.shape));
      for (const key of Object.keys(value)) {
        if (!shapeKeys.has(key)) {
          errors.push({
            code: "unknown_key",
            message: `Unknown key: ${key}`,
            path: [...context.path, key],
            received: value[key],
          });
        }
      }
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return this.runCustomValidators(result, context);
  }

  /**
   * Make object validation strict (no unknown keys allowed)
   */
  strict(): JSONataObjectSchema<T> {
    const schema = this.clone();
    schema._strict = true;
    return schema;
  }

  /**
   * Allow passthrough of unknown keys
   */
  passthrough(): JSONataObjectSchema<T> {
    const schema = this.clone();
    schema._passthrough = true;
    return schema;
  }

  /**
   * Pick specific keys from the object schema
   */
  pick<K extends keyof T>(keys: K[]): JSONataObjectSchema<Pick<T, K>> {
    const newShape: Record<string, JSONataSchema> = {};
    for (const key of keys) {
      if (this.shape[key as string]) {
        newShape[key as string] = this.shape[key as string];
      }
    }
    return new JSONataObjectSchema(newShape);
  }

  /**
   * Omit specific keys from the object schema
   */
  omit<K extends keyof T>(keys: K[]): JSONataObjectSchema<Omit<T, K>> {
    const keySet = new Set(keys as string[]);
    const newShape: Record<string, JSONataSchema> = {};
    for (const [key, schema] of Object.entries(this.shape)) {
      if (!keySet.has(key)) {
        newShape[key] = schema;
      }
    }
    return new JSONataObjectSchema(newShape);
  }

  /**
   * Extend the object schema with additional properties
   */
  extend<U extends Record<string, JSONataSchema>>(
    extension: U
  ): JSONataObjectSchema<
    T & { [K in keyof U]: U[K] extends JSONataSchema<infer R> ? R : never }
  > {
    const newShape = { ...this.shape, ...extension };
    return new JSONataObjectSchema(newShape);
  }

  protected clone(): JSONataObjectSchema<T> {
    const schema = new JSONataObjectSchema<T>(this.shape);
    schema._strict = this._strict;
    schema._passthrough = this._passthrough;
    schema.optional = this.optional;
    schema.nullable = this.nullable;
    schema.defaultValue = this.defaultValue;
    schema.validators = [...this.validators];
    return schema;
  }
}

/**
 * Array validation schema
 */
export class JSONataArraySchema<T = any> extends JSONataSchema<T[]> {
  private elementSchema?: JSONataSchema<T>;
  private minLength?: number;
  private maxLength?: number;
  private exactLength?: number;

  constructor(elementSchema?: JSONataSchema<T>) {
    super();
    this.elementSchema = elementSchema;
  }

  _parse(value: any, context: ValidationContext): ValidationResult<T[]> {
    const optionalCheck = this.handleOptionalAndNullable(value, context);
    if (optionalCheck) return optionalCheck;

    if (!Array.isArray(value)) {
      return {
        success: false,
        errors: [
          {
            code: "invalid_type",
            message: `Expected array, received ${typeof value}`,
            path: context.path,
            received: value,
            expected: "array",
          },
        ],
      };
    }

    // Length validation
    if (this.minLength !== undefined && value.length < this.minLength) {
      return {
        success: false,
        errors: [
          {
            code: "array_too_small",
            message: `Array must have at least ${this.minLength} elements`,
            path: context.path,
            received: value.length,
          },
        ],
      };
    }

    if (this.maxLength !== undefined && value.length > this.maxLength) {
      return {
        success: false,
        errors: [
          {
            code: "array_too_large",
            message: `Array must have at most ${this.maxLength} elements`,
            path: context.path,
            received: value.length,
          },
        ],
      };
    }

    if (this.exactLength !== undefined && value.length !== this.exactLength) {
      return {
        success: false,
        errors: [
          {
            code: "array_wrong_length",
            message: `Array must have exactly ${this.exactLength} elements`,
            path: context.path,
            received: value.length,
          },
        ],
      };
    }

    const errors: ValidationError[] = [];
    const result: T[] = [];

    // Validate each element
    if (this.elementSchema) {
      for (let i = 0; i < value.length; i++) {
        const elementContext: ValidationContext = {
          ...context,
          path: [...context.path, i],
          data: value[i],
        };

        const elementResult = this.elementSchema._parse(
          value[i],
          elementContext
        );
        if (!elementResult.success) {
          errors.push(...(elementResult.errors || []));
        } else if (elementResult.data !== undefined) {
          result[i] = elementResult.data;
        }
      }
    } else {
      result.push(...value);
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return this.runCustomValidators(result, context);
  }

  min(length: number): JSONataArraySchema<T> {
    const schema = this.clone();
    schema.minLength = length;
    return schema;
  }

  max(length: number): JSONataArraySchema<T> {
    const schema = this.clone();
    schema.maxLength = length;
    return schema;
  }

  length(length: number): JSONataArraySchema<T> {
    const schema = this.clone();
    schema.exactLength = length;
    return schema;
  }

  nonempty(): JSONataArraySchema<T> {
    return this.min(1);
  }

  protected clone(): JSONataArraySchema<T> {
    const schema = new JSONataArraySchema(this.elementSchema);
    schema.minLength = this.minLength;
    schema.maxLength = this.maxLength;
    schema.exactLength = this.exactLength;
    schema.optional = this.optional;
    schema.nullable = this.nullable;
    schema.defaultValue = this.defaultValue;
    schema.validators = [...this.validators];
    return schema;
  }
}

/**
 * Union validation schema (one of several types)
 */
export class JSONataUnionSchema<T = any> extends JSONataSchema<T> {
  private schemas: JSONataSchema<T>[] = [];

  constructor(schemas: JSONataSchema<T>[]) {
    super();
    this.schemas = schemas;
  }

  _parse(value: any, context: ValidationContext): ValidationResult<T> {
    const optionalCheck = this.handleOptionalAndNullable(value, context);
    if (optionalCheck) return optionalCheck;

    const errors: ValidationError[] = [];

    // Try each schema until one succeeds
    for (const schema of this.schemas) {
      const result = schema._parse(value, context);
      if (result.success && result.data !== undefined) {
        return this.runCustomValidators(result.data, context);
      }
      errors.push(...(result.errors || []));
    }

    // If none succeeded, return all errors
    return {
      success: false,
      errors: [
        {
          code: "union_mismatch",
          message: "Value does not match any of the union types",
          path: context.path,
          received: value,
        },
      ],
    };
  }

  protected clone(): JSONataUnionSchema<T> {
    const schema = new JSONataUnionSchema(this.schemas);
    schema.optional = this.optional;
    schema.nullable = this.nullable;
    schema.defaultValue = this.defaultValue;
    schema.validators = [...this.validators];
    return schema;
  }
}

/**
 * Literal validation schema (exact value match)
 */
export class JSONataLiteralSchema<
  T extends string | number | boolean
> extends JSONataSchema<T> {
  constructor(private value: T) {
    super();
  }

  _parse(value: any, context: ValidationContext): ValidationResult<T> {
    const optionalCheck = this.handleOptionalAndNullable(value, context);
    if (optionalCheck) return optionalCheck;

    if (value !== this.value) {
      return {
        success: false,
        errors: [
          {
            code: "literal_mismatch",
            message: `Expected literal value ${JSON.stringify(this.value)}`,
            path: context.path,
            received: value,
            expected: JSON.stringify(this.value),
          },
        ],
      };
    }

    return this.runCustomValidators(value, context);
  }

  protected clone(): JSONataLiteralSchema<T> {
    const schema = new JSONataLiteralSchema(this.value);
    schema.optional = this.optional;
    schema.nullable = this.nullable;
    schema.defaultValue = this.defaultValue;
    schema.validators = [...this.validators];
    return schema;
  }
}
