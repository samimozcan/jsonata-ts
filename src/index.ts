/**
 * JSONata Validation Library
 *
 * A Zod-like validation library designed specifically for JSONata transformations
 */

// Complex schemas
export {
  JSONataArraySchema,
  JSONataLiteralSchema,
  JSONataObjectSchema,
  JSONataUnionSchema,
} from './validation/complex.js';
// Main validation factory
export { Infer, jv } from './validation/factory.js';
// Core validation classes
export {
  JSONataSchema,
  JSONataValidationError,
  ValidationContext,
  ValidationError,
  ValidationResult,
} from './validation/index.js';
// JSONata integration
export {
  createValidatedJSONata,
  schemaFromJSONata,
  ValidatedJSONataExpression,
  validateJSONataResult,
} from './validation/jsonata-integration.js';
// Primitive schemas
export {
  JSONataNumberSchema,
  JSONataStringSchema,
} from './validation/primitives.js';

// Re-export factory for convenience
import { jv } from './validation/factory.js';
export default jv;
