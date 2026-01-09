import { JSONataSchema, type ValidationContext, type ValidationResult } from './index.js';

/**
 * String validation schema
 */
export class JSONataStringSchema extends JSONataSchema<string> {
  private minLength?: number;
  private maxLength?: number;
  private pattern?: RegExp;
  private format?: 'email' | 'url' | 'uuid' | 'date' | 'datetime';

  _parse(value: any, context: ValidationContext): ValidationResult<string> {
    const optionalCheck = this.handleOptionalAndNullable(value, context);
    if (optionalCheck) return optionalCheck;

    if (typeof value !== 'string') {
      return {
        success: false,
        errors: [
          {
            code: 'invalid_type',
            message: `Expected string, received ${typeof value}`,
            path: context.path,
            received: value,
            expected: 'string',
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
            code: 'string_too_short',
            message: `String must be at least ${this.minLength} characters long`,
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
            code: 'string_too_long',
            message: `String must be at most ${this.maxLength} characters long`,
            path: context.path,
            received: value.length,
          },
        ],
      };
    }

    // Pattern validation
    if (this.pattern && !this.pattern.test(value)) {
      return {
        success: false,
        errors: [
          {
            code: 'string_pattern_mismatch',
            message: `String does not match pattern ${this.pattern}`,
            path: context.path,
            received: value,
          },
        ],
      };
    }

    // Format validation
    if (this.format) {
      const formatResult = this.validateFormat(value);
      if (!formatResult.success) {
        return formatResult;
      }
    }

    return this.runCustomValidators(value, context);
  }

  min(length: number): JSONataStringSchema {
    const schema = this.clone();
    schema.minLength = length;
    return schema;
  }

  max(length: number): JSONataStringSchema {
    const schema = this.clone();
    schema.maxLength = length;
    return schema;
  }

  length(length: number): JSONataStringSchema {
    const schema = this.clone();
    schema.minLength = length;
    schema.maxLength = length;
    return schema;
  }

  regex(pattern: RegExp): JSONataStringSchema {
    const schema = this.clone();
    schema.pattern = pattern;
    return schema;
  }

  email(): JSONataStringSchema {
    const schema = this.clone();
    schema.format = 'email';
    return schema;
  }

  url(): JSONataStringSchema {
    const schema = this.clone();
    schema.format = 'url';
    return schema;
  }

  uuid(): JSONataStringSchema {
    const schema = this.clone();
    schema.format = 'uuid';
    return schema;
  }

  date(): JSONataStringSchema {
    const schema = this.clone();
    schema.format = 'date';
    return schema;
  }

  datetime(): JSONataStringSchema {
    const schema = this.clone();
    schema.format = 'datetime';
    return schema;
  }

  protected clone(): JSONataStringSchema {
    const schema = new JSONataStringSchema();
    schema.minLength = this.minLength;
    schema.maxLength = this.maxLength;
    schema.pattern = this.pattern;
    schema.format = this.format;
    schema.optional = this.optional;
    schema.nullable = this.nullable;
    schema.defaultValue = this.defaultValue;
    schema.validators = [...this.validators];
    return schema;
  }

  private validateFormat(value: string): ValidationResult<string> {
    switch (this.format) {
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return {
            success: false,
            errors: [
              {
                code: 'invalid_email',
                message: 'Invalid email format',
                path: [],
                received: value,
              },
            ],
          };
        }
        break;
      }

      case 'url':
        try {
          new URL(value);
        } catch {
          return {
            success: false,
            errors: [
              {
                code: 'invalid_url',
                message: 'Invalid URL format',
                path: [],
                received: value,
              },
            ],
          };
        }
        break;

      case 'uuid': {
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(value)) {
          return {
            success: false,
            errors: [
              {
                code: 'invalid_uuid',
                message: 'Invalid UUID format',
                path: [],
                received: value,
              },
            ],
          };
        }
        break;
      }

      case 'date': {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(value) || Number.isNaN(Date.parse(value))) {
          return {
            success: false,
            errors: [
              {
                code: 'invalid_date',
                message: 'Invalid date format (expected YYYY-MM-DD)',
                path: [],
                received: value,
              },
            ],
          };
        }
        break;
      }

      case 'datetime':
        if (Number.isNaN(Date.parse(value))) {
          return {
            success: false,
            errors: [
              {
                code: 'invalid_datetime',
                message: 'Invalid datetime format',
                path: [],
                received: value,
              },
            ],
          };
        }
        break;
    }

    return { success: true, data: value };
  }
}

/**
 * Number validation schema
 */
export class JSONataNumberSchema extends JSONataSchema<number> {
  private minValue?: number;
  private maxValue?: number;
  private isInteger = false;
  private isPositive = false;
  private isNegative = false;

  _parse(value: any, context: ValidationContext): ValidationResult<number> {
    const optionalCheck = this.handleOptionalAndNullable(value, context);
    if (optionalCheck) return optionalCheck;

    if (typeof value !== 'number' || Number.isNaN(value)) {
      return {
        success: false,
        errors: [
          {
            code: 'invalid_type',
            message: `Expected number, received ${typeof value}`,
            path: context.path,
            received: value,
            expected: 'number',
          },
        ],
      };
    }

    // Integer validation
    if (this.isInteger && !Number.isInteger(value)) {
      return {
        success: false,
        errors: [
          {
            code: 'not_integer',
            message: 'Expected integer',
            path: context.path,
            received: value,
          },
        ],
      };
    }

    // Range validation
    if (this.minValue !== undefined && value < this.minValue) {
      return {
        success: false,
        errors: [
          {
            code: 'number_too_small',
            message: `Number must be greater than or equal to ${this.minValue}`,
            path: context.path,
            received: value,
          },
        ],
      };
    }

    if (this.maxValue !== undefined && value > this.maxValue) {
      return {
        success: false,
        errors: [
          {
            code: 'number_too_large',
            message: `Number must be less than or equal to ${this.maxValue}`,
            path: context.path,
            received: value,
          },
        ],
      };
    }

    // Sign validation
    if (this.isPositive && value <= 0) {
      return {
        success: false,
        errors: [
          {
            code: 'not_positive',
            message: 'Number must be positive',
            path: context.path,
            received: value,
          },
        ],
      };
    }

    if (this.isNegative && value >= 0) {
      return {
        success: false,
        errors: [
          {
            code: 'not_negative',
            message: 'Number must be negative',
            path: context.path,
            received: value,
          },
        ],
      };
    }

    return this.runCustomValidators(value, context);
  }

  min(value: number): JSONataNumberSchema {
    const schema = this.clone();
    schema.minValue = value;
    return schema;
  }

  max(value: number): JSONataNumberSchema {
    const schema = this.clone();
    schema.maxValue = value;
    return schema;
  }

  int(): JSONataNumberSchema {
    const schema = this.clone();
    schema.isInteger = true;
    return schema;
  }

  positive(): JSONataNumberSchema {
    const schema = this.clone();
    schema.isPositive = true;
    return schema;
  }

  negative(): JSONataNumberSchema {
    const schema = this.clone();
    schema.isNegative = true;
    return schema;
  }

  protected clone(): JSONataNumberSchema {
    const schema = new JSONataNumberSchema();
    schema.minValue = this.minValue;
    schema.maxValue = this.maxValue;
    schema.isInteger = this.isInteger;
    schema.isPositive = this.isPositive;
    schema.isNegative = this.isNegative;
    schema.optional = this.optional;
    schema.nullable = this.nullable;
    schema.defaultValue = this.defaultValue;
    schema.validators = [...this.validators];
    return schema;
  }
}
