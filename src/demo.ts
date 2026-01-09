import { jv } from './validation/factory.js';
import { validateInvoice } from './validation-examples.js';
import { runTests, testData } from './validation-test.js';

/**
 * Demo script for the JSONata Validation Library
 */

console.log('🚀 JSONata Validation Library Demo\n');
console.log('=====================================\n');

// Quick demo of the API
console.log('📝 Quick API Demo:');

// 1. Simple validation
const nameSchema = jv.string().min(2).max(50);
console.log('Name validation:', nameSchema.parse('John Doe'));

// 2. Email validation
const emailSchema = jv.email();
console.log('Email validation:', emailSchema.parse('user@example.com'));

// 3. Object validation
const userSchema = jv.object({
  name: jv.string().min(1),
  email: jv.email(),
  age: jv.number().int().min(0).max(120),
  isActive: jv.boolean().default(true),
});

console.log(
  'User validation:',
  userSchema.parse({
    name: 'Jane Smith',
    email: 'jane@example.com',
    age: 28,
    isActive: true,
  })
);

// 4. Invoice validation with your data structure
console.log('\n📋 Invoice Validation Demo:');
try {
  const validatedInvoice = validateInvoice(testData.validInvoice);
  console.log('✅ Invoice validation successful!');
  console.log('Invoice ID:', validatedInvoice.invoice_id);
  console.log('Total Amount:', validatedInvoice.invoice_total_amount);
  console.log('Items Count:', validatedInvoice.items.length);
} catch (error) {
  console.log('❌ Invoice validation failed:', error);
}

console.log('\n🧪 Running Full Test Suite:');
console.log('=============================\n');

// Run the full test suite
runTests();

console.log('\n📚 Usage Examples:');
console.log('==================\n');

console.log(`
// Basic usage:
import { jv } from './validation/factory.js';

// Create schemas
const userSchema = jv.object({
  name: jv.string().min(1),
  email: jv.email(),
  age: jv.number().int().positive()
});

// Validate data
const result = userSchema.parse(userData);
if (result.success) {
  console.log('Valid data:', result.data);
} else {
  console.log('Validation errors:', result.errors);
}

// Or throw on error
const validData = userSchema.safeParse(userData);

// JSONata integration:
import { createValidatedJSONata } from './validation/jsonata-integration.js';

const expr = createValidatedJSONata(
  'items.$map(function($item) { {"id": $item.id, "valid": $validateItem($item)} })',
  { validateItem: itemSchema }
);

const result = expr.evaluate(data);
`);

console.log('\n🎯 Key Features:');
console.log('================');
console.log('✅ Type-safe validation schemas');
console.log('✅ Fluent API similar to Zod');
console.log('✅ JSONata integration');
console.log('✅ Custom validation rules');
console.log('✅ Detailed error messages');
console.log('✅ Schema composition');
console.log('✅ Optional and nullable fields');
console.log('✅ Default values');
console.log('✅ Array and object validation');
console.log('✅ Union types');
console.log('✅ Built-in validators (email, URL, UUID, etc.)');

console.log('\n🔧 Next Steps:');
console.log('==============');
console.log('1. Install as npm package: npm install jsonata-validation');
console.log('2. Import schemas: import { jv } from "jsonata-validation"');
console.log('3. Create validation schemas for your data');
console.log('4. Integrate with your JSONata transformations');
console.log('5. Enjoy type-safe data validation! 🎉');
