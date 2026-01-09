import { type Infer, jv } from './validation/factory.js';
import { createValidatedJSONata } from './validation/jsonata-integration.js';

/**
 * Example usage of the JSONata Validation Library
 */

// Define validation schemas
const UserSchema = jv.object({
  id: jv.string().uuid(),
  name: jv.string().min(2).max(50),
  email: jv.email(),
  age: jv.number().int().min(0).max(120),
  isActive: jv.boolean(),
  tags: jv.array(jv.string()).opt(),
  metadata: jv
    .object({
      createdAt: jv.datetime(),
      updatedAt: jv.datetime().opt(),
    })
    .opt(),
});

const InvoiceSchema = jv.object({
  invoice_id: jv.string(),
  invoice_date: jv.date(),
  invoice_currency: jv.enum(['USD', 'EUR', 'GBP'] as const),
  invoice_total_amount: jv.number().positive(),
  items: jv
    .array(
      jv.object({
        invoice_item_no: jv.number().int().positive(),
        invoice_item_quantity: jv.number().int().positive(),
        invoice_item_unit_price: jv.number().positive(),
        invoice_item_description: jv.string().min(1),
        invoice_item_commodity_code: jv.string().min(1),
      })
    )
    .nonempty(),
});

// Type inference (similar to Zod)
type User = Infer<typeof UserSchema>;
type Invoice = Infer<typeof InvoiceSchema>;

// Example usage functions
export function validateUser(userData: any): User {
  const result = UserSchema.parse(userData);
  if (!result.success) {
    throw new Error(`User validation failed: ${result.errors?.map((e) => e.message).join(', ')}`);
  }
  return result.data!;
}

export function validateInvoice(invoiceData: any): Invoice {
  const result = InvoiceSchema.parse(invoiceData);
  if (!result.success) {
    throw new Error(
      `Invoice validation failed: ${result.errors?.map((e) => e.message).join(', ')}`
    );
  }
  return result.data!;
}

// JSONata integration examples
export function createValidatedInvoiceTransform() {
  const transformExpression = `
    {
      "A": "MAL KODU - Default",
      "B": items.invoice_item_quantity,
      "C": "Adet", 
      "D": "",
      "E": items.invoice_item_unit_price,
      "F": items.invoice_item_commodity_code,
      "G": null,
      "H": "BRUT - Default",
      "I": "NET - Default", 
      "J": items.invoice_item_description,
      "K": "ANTREPO KODU - Default",
      "L": "ANTREPO SIRA - Default",
      "M": "KULLANILMIS - Default",
      "N": "ATR-DIGER - Default",
      "O": null,
      "P": "KAP CINSI - Default",
      "Q": "MALIN CINSI - Default",
      "R": "MARKA - Default",
      "S": items.invoice_item_no,
      "T": "CIF DIGER - Default",
      "U": "KDV - Default",
      "V": invoice_id,
      "W": "FCA",
      "X": "OLCU MIKTARI - Default",
      "Y": "",
      "Z": "OLCU BIRIMI - Default"
    }
  `;

  // Create JSONata expression with validation schemas
  return createValidatedJSONata(transformExpression, {
    validateInvoice: InvoiceSchema,
    validateUser: UserSchema,
  });
}

// Example with custom validation rules
export function createCustomValidationSchema() {
  const TurkishTaxIdSchema = jv
    .string()
    .length(10)
    .regex(/^\d{10}$/)
    .refine((value) => {
      // Turkish tax ID validation algorithm
      const digits = value.split('').map(Number);
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += digits[i] * (10 - i);
      }
      const checkDigit = (11 - (sum % 11)) % 11;
      return checkDigit === digits[9];
    }, 'Invalid Turkish Tax ID');

  return TurkishTaxIdSchema;
}

// Validation with JSONata transformation
export function validateAndTransformInvoice(invoiceData: any) {
  const expression = createValidatedInvoiceTransform();

  // First validate the input
  const validatedInvoice = validateInvoice(invoiceData);

  // Then transform
  const result = expression.evaluate(validatedInvoice);

  return result;
}

// Example usage with error handling
export function processInvoiceWithValidation(rawData: any) {
  try {
    // Validate input data
    console.log('Validating invoice data...');
    const validatedInvoice = validateInvoice(rawData);
    console.log('✅ Invoice validation passed');

    // Transform data
    console.log('Transforming invoice data...');
    const transformed = validateAndTransformInvoice(validatedInvoice);
    console.log('✅ Transformation completed');

    return {
      success: true,
      data: transformed,
      originalData: validatedInvoice,
    };
  } catch (error) {
    console.error('❌ Validation/transformation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      originalData: rawData,
    };
  }
}

// Schema composition example
export function createComplexSchema() {
  const AddressSchema = jv.object({
    street: jv.string().min(1),
    city: jv.string().min(1),
    postalCode: jv.string().regex(/^\d{4,6}$/),
    country: jv.string().length(2), // ISO country code
  });

  const CompanySchema = jv.object({
    name: jv.string().min(1).max(100),
    taxId: createCustomValidationSchema(), // Turkish tax ID
    address: AddressSchema,
    contactEmail: jv.email(),
    website: jv.url().opt(),
  });

  const ExportDeclarationSchema = jv.object({
    id: jv.string(),
    date: jv.date(),
    buyer: jv.string(),
    sender: jv.string(),
    items: jv
      .array(
        jv.object({
          id: jv.string(),
          index: jv.string(),
          origin: jv.string().length(2),
          quantity: jv.number().positive(),
          commodity_code: jv.string().min(1),
          commodity_description: jv.string().min(1),
        })
      )
      .nonempty(),
    delivery_term: jv.enum(['FCA', 'FOB', 'CIF', 'DAP'] as const),
    total_value: jv.string().regex(/^\d+\.?\d*$/), // Money as string
    destination_country: jv.string().length(2),
  });

  return {
    AddressSchema,
    CompanySchema,
    ExportDeclarationSchema,
  };
}

// Export schemas for use in other files
export { UserSchema, InvoiceSchema };
