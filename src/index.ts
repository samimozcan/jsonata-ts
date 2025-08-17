/**
 * JSONata Validation Library
 *
 * A Zod-like validation library designed specifically for JSONata transformations
 */

// Main validation factory
export { jv, Infer } from "./validation/factory.js";

// Core validation classes
export {
  JSONataSchema,
  ValidationResult,
  ValidationError,
  ValidationContext,
  JSONataValidationError,
} from "./validation/index.js";

// Primitive schemas
export {
  JSONataStringSchema,
  JSONataNumberSchema,
} from "./validation/primitives.js";

// Complex schemas
export {
  JSONataObjectSchema,
  JSONataArraySchema,
  JSONataUnionSchema,
  JSONataLiteralSchema,
} from "./validation/complex.js";

// JSONata integration
export {
  createValidatedJSONata,
  validateJSONataResult,
  schemaFromJSONata,
  ValidatedJSONataExpression,
} from "./validation/jsonata-integration.js";

// Re-export factory for convenience
import { jv } from "./validation/factory.js";
export default jv;
