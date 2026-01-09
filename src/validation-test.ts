import { jv } from './validation/factory.js';
import {
  createComplexSchema,
  processInvoiceWithValidation,
  validateInvoice,
} from './validation-examples.js';

/**
 * Test the JSONata Validation Library
 */

function runTests() {
  console.log('🧪 Running JSONata Validation Library Tests\n');

  // Test 1: Basic string validation
  console.log('Test 1: String Validation');
  const stringSchema = jv.string().min(3).max(10);

  console.log('✅ Valid string:', stringSchema.parse('hello'));
  try {
    stringSchema.safeParse('hi'); // Too short
  } catch (error) {
    console.log(
      '❌ Invalid string (too short):',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }

  // Test 2: Email validation
  console.log('\nTest 2: Email Validation');
  const emailSchema = jv.email();

  console.log('✅ Valid email:', emailSchema.parse('test@example.com'));
  try {
    emailSchema.safeParse('invalid-email');
  } catch (error) {
    console.log('❌ Invalid email:', error instanceof Error ? error.message : 'Unknown error');
  }

  // Test 3: Object validation
  console.log('\nTest 3: Object Validation');
  const personSchema = jv.object({
    name: jv.string().min(1),
    age: jv.number().int().min(0),
    email: jv.email().opt(),
  });

  const validPerson = {
    name: 'John Doe',
    age: 30,
    email: 'john@example.com',
  };

  const invalidPerson = {
    name: '',
    age: -5,
    email: 'invalid-email',
  };

  console.log('✅ Valid person:', personSchema.parse(validPerson));

  const invalidResult = personSchema.parse(invalidPerson);
  if (!invalidResult.success) {
    console.log('❌ Invalid person errors:');
    invalidResult.errors?.forEach((error) => {
      console.log(`  - ${error.path.join('.')}: ${error.message}`);
    });
  }

  // Test 4: Array validation
  console.log('\nTest 4: Array Validation');
  const numbersSchema = jv.array(jv.number().positive()).min(1).max(5);

  console.log('✅ Valid array:', numbersSchema.parse([1, 2, 3]));

  const invalidArrayResult = numbersSchema.parse([1, -2, 3, 4, 5, 6]);
  if (!invalidArrayResult.success) {
    console.log('❌ Invalid array errors:');
    invalidArrayResult.errors?.forEach((error) => {
      console.log(`  - ${error.path.join('.')}: ${error.message}`);
    });
  }

  // Test 5: Union validation
  console.log('\nTest 5: Union Validation');
  const stringOrNumberSchema = jv.union(jv.string() as any, jv.number() as any);

  console.log('✅ Valid string in union:', stringOrNumberSchema.parse('hello'));
  console.log('✅ Valid number in union:', stringOrNumberSchema.parse(42));

  const invalidUnionResult = stringOrNumberSchema.parse(true);
  if (!invalidUnionResult.success) {
    console.log('❌ Invalid union value:', invalidUnionResult.errors?.[0]?.message);
  }

  // Test 6: Custom validation with refine
  console.log('\nTest 6: Custom Validation');
  const evenNumberSchema = jv
    .number()
    .int()
    .refine((n) => n % 2 === 0, 'Number must be even');

  console.log('✅ Valid even number:', evenNumberSchema.parse(4));

  try {
    evenNumberSchema.safeParse(3);
  } catch (error) {
    console.log('❌ Invalid odd number:', error instanceof Error ? error.message : 'Unknown error');
  }

  // Test 7: Real-world invoice validation
  console.log('\nTest 7: Invoice Validation');
  const testInvoice = {
    invoice_id: 'INV-001',
    invoice_date: '2025-01-15',
    invoice_currency: 'EUR',
    invoice_total_amount: 1000.5,
    items: [
      {
        invoice_item_no: 1,
        invoice_item_quantity: 10,
        invoice_item_unit_price: 50.25,
        invoice_item_description: 'Test Product',
        invoice_item_commodity_code: '1234567890',
      },
    ],
  };

  try {
    const validatedInvoice = validateInvoice(testInvoice);
    console.log('✅ Invoice validation passed');
    console.log('Invoice ID:', validatedInvoice.invoice_id);
  } catch (error) {
    console.log(
      '❌ Invoice validation failed:',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }

  // Test 8: Complex schema composition
  console.log('\nTest 8: Complex Schema Composition');
  const { CompanySchema } = createComplexSchema();

  const testCompany = {
    name: 'Test Company Ltd.',
    taxId: '1234567890', // This would fail Turkish tax ID validation
    address: {
      street: '123 Test Street',
      city: 'Test City',
      postalCode: '12345',
      country: 'TR',
    },
    contactEmail: 'contact@testcompany.com',
  };

  const companyResult = CompanySchema.parse(testCompany);
  if (!companyResult.success) {
    console.log('❌ Company validation errors:');
    companyResult.errors?.forEach((error) => {
      console.log(`  - ${error.path.join('.')}: ${error.message}`);
    });
  } else {
    console.log('✅ Company validation passed');
  }

  // Test 9: Error handling in processing
  console.log('\nTest 9: Error Handling in Processing');
  const invalidInvoiceData = {
    invoice_id: '',
    invoice_date: 'invalid-date',
    invoice_currency: 'INVALID',
    invoice_total_amount: -100,
    items: [],
  };

  const processResult = processInvoiceWithValidation(invalidInvoiceData);
  if (!processResult.success) {
    console.log('❌ Processing failed as expected:', processResult.error);
  }

  console.log('\n🎉 All tests completed!');
}

// Export test data for use in other files
export const testData = {
  validUser: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    isActive: true,
    tags: ['developer', 'typescript'],
    metadata: {
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-15T12:00:00Z',
    },
  },

  validInvoice: {
    invoice_id: 'BAY2025000000424',
    invoice_date: '2025-03-28',
    invoice_currency: 'EUR',
    invoice_total_amount: 954.5,
    items: [
      {
        invoice_item_no: 1,
        invoice_item_quantity: 15,
        invoice_item_unit_price: 22.9,
        invoice_item_description: '%80 PAMUK %17 PES %3 EA DENIM BAYAN PANTOLON',
        invoice_item_commodity_code: '6204623190',
      },
      {
        invoice_item_no: 2,
        invoice_item_quantity: 15,
        invoice_item_unit_price: 19.5,
        invoice_item_description: '%80 PAMUK %17 PES %3 EA DENIM BAYAN PANTOLON',
        invoice_item_commodity_code: '6204623190',
      },
    ],
  },
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { runTests };
