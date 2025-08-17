import { JSONataStringSchema, JSONataNumberSchema } from "./primitives.js";
import {
  JSONataObjectSchema,
  JSONataArraySchema,
  JSONataUnionSchema,
  JSONataLiteralSchema,
} from "./complex.js";
import { JSONataSchema } from "./index.js";

/**
 * Boolean validation schema
 */
class JSONataBooleanSchema extends JSONataSchema<boolean> {
  _parse(value: any, context: any) {
    const optionalCheck = this.handleOptionalAndNullable(value, context);
    if (optionalCheck) return optionalCheck;

    if (typeof value !== "boolean") {
      return {
        success: false,
        errors: [
          {
            code: "invalid_type",
            message: `Expected boolean, received ${typeof value}`,
            path: context.path,
            received: value,
            expected: "boolean",
          },
        ],
      };
    }

    return this.runCustomValidators(value, context);
  }

  protected clone(): JSONataBooleanSchema {
    const schema = new JSONataBooleanSchema();
    schema.optional = this.optional;
    schema.nullable = this.nullable;
    schema.defaultValue = this.defaultValue;
    schema.validators = [...this.validators];
    return schema;
  }
}

/**
 * Any validation schema (accepts any value)
 */
class JSONataAnySchema extends JSONataSchema<any> {
  _parse(value: any, context: any) {
    const optionalCheck = this.handleOptionalAndNullable(value, context);
    if (optionalCheck) return optionalCheck;

    return this.runCustomValidators(value, context);
  }

  protected clone(): JSONataAnySchema {
    const schema = new JSONataAnySchema();
    schema.optional = this.optional;
    schema.nullable = this.nullable;
    schema.defaultValue = this.defaultValue;
    schema.validators = [...this.validators];
    return schema;
  }
}

/**
 * Main factory object - similar to Zod's `z`
 */
export const jv = {
  // Primitive types
  string: () => new JSONataStringSchema(),
  number: () => new JSONataNumberSchema(),
  boolean: () => new JSONataBooleanSchema(),
  any: () => new JSONataAnySchema(),

  // Complex types
  object: <T extends Record<string, JSONataSchema>>(shape: T) =>
    new JSONataObjectSchema(shape),

  array: <T>(elementSchema?: JSONataSchema<T>) =>
    new JSONataArraySchema(elementSchema),

  union: <T>(...schemas: JSONataSchema<T>[]) => new JSONataUnionSchema(schemas),

  // Literal values
  literal: <T extends string | number | boolean>(value: T) =>
    new JSONataLiteralSchema(value),

  // Convenience methods
  enum: <T extends readonly [string, ...string[]]>(values: T) => {
    const schemas = values.map((value) => new JSONataLiteralSchema(value));
    return new JSONataUnionSchema(schemas);
  },

  // Utility types
  optional: <T>(schema: JSONataSchema<T>) => schema.opt(),
  nullable: <T>(schema: JSONataSchema<T>) => schema.null(),

  // Presets for common patterns
  email: () => new JSONataStringSchema().email(),
  url: () => new JSONataStringSchema().url(),
  uuid: () => new JSONataStringSchema().uuid(),
  date: () => new JSONataStringSchema().date(),
  datetime: () => new JSONataStringSchema().datetime(),

  // Numbers
  integer: () => new JSONataNumberSchema().int(),
  positive: () => new JSONataNumberSchema().positive(),
  negative: () => new JSONataNumberSchema().negative(),

  // Arrays
  nonEmptyArray: <T>(elementSchema?: JSONataSchema<T>) =>
    new JSONataArraySchema(elementSchema).nonempty(),
};

// Type inference helpers
export type Infer<T extends JSONataSchema> = T extends JSONataSchema<infer U>
  ? U
  : never;

// Export all schemas for direct usage
export {
  JSONataStringSchema,
  JSONataNumberSchema,
  JSONataBooleanSchema,
  JSONataAnySchema,
  JSONataObjectSchema,
  JSONataArraySchema,
  JSONataUnionSchema,
  JSONataLiteralSchema,
};
