import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import jsonata from 'jsonata';
import { fileURLToPath } from 'url';
import { assignFunctionList } from '../jsonata-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to load JSONata template
async function loadJsonataTemplate(filename: string): Promise<string> {
  const filePath = path.join(__dirname, '../jsonata/', filename);
  return fs.readFile(filePath, 'utf8');
}

// Helper function to load JSON test data from for-test folder
async function loadTestInputs(filename: string): Promise<{ output_body: Record<string, unknown> }[]> {
  const filePath = path.join(__dirname, '../jsonata/for-test/', filename);
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content);
}

// Helper function to evaluate JSONata expression with registered functions
async function evaluateJsonata(template: string, data: unknown): Promise<unknown> {
  const expression = jsonata(template);
  assignFunctionList.forEach((func) => {
    expression.registerFunction(func.name, func.func, func.type);
  });
  return expression.evaluate(data);
}

describe('Dakosy Multiple Inputs - All Templates', () => {
  let validationTemplate: string;
  let globalAiValidationTemplate: string;
  let jsonataMainTemplate: string;
  let testInputs: { output_body: Record<string, unknown> }[];

  beforeAll(async () => {
    // Load all three templates
    validationTemplate = await loadJsonataTemplate('dakosy-validation.jsonata');
    globalAiValidationTemplate = await loadJsonataTemplate('global-ai-validation.jsonata');
    jsonataMainTemplate = await loadJsonataTemplate('jsonata-template.v15-works.jsonata');
    
    // Load test inputs
    testInputs = await loadTestInputs('26-10-05-dakoy-ex-input.json');
  });

  describe('dakosy-validation.jsonata', () => {
    it('should have test inputs loaded', () => {
      expect(testInputs).toBeDefined();
      expect(Array.isArray(testInputs)).toBe(true);
      expect(testInputs.length).toBeGreaterThan(0);
    });

    it.each(
      Array.from({ length: 29 }, (_, i) => [i])
    )('should process input %i without throwing exceptions', async (index) => {
      const input = testInputs[index];
      expect(input).toBeDefined();
      expect(input.output_body).toBeDefined();

      // Should not throw an exception
      await expect(
        evaluateJsonata(validationTemplate, input.output_body)
      ).resolves.not.toThrow();

      const result = await evaluateJsonata(validationTemplate, input.output_body);
      expect(result).toBeDefined();
    });

    it('should return valid structure for all inputs', async () => {
      for (let i = 0; i < testInputs.length; i++) {
        const input = testInputs[i];
        const result = await evaluateJsonata(validationTemplate, input.output_body) as Record<string, unknown>;

        // Validation template should return an object with section results
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
      }
    });
  });

  describe('global-ai-validation.jsonata', () => {
    it.each(
      Array.from({ length: 29 }, (_, i) => [i])
    )('should process input %i without throwing exceptions', async (index) => {
      const input = testInputs[index];
      expect(input).toBeDefined();
      expect(input.output_body).toBeDefined();

      // Should not throw an exception
      await expect(
        evaluateJsonata(globalAiValidationTemplate, input.output_body)
      ).resolves.not.toThrow();

      const result = await evaluateJsonata(globalAiValidationTemplate, input.output_body);
      expect(result).toBeDefined();
    });

    it('should return valid structure for all inputs', async () => {
      for (let i = 0; i < testInputs.length; i++) {
        const input = testInputs[i];
        const result = await evaluateJsonata(globalAiValidationTemplate, input.output_body) as Record<string, unknown>;

        // Should return a defined result
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
      }
    });
  });

  describe('jsonata-template.v15-works.jsonata', () => {
    it.each(
      Array.from({ length: 29 }, (_, i) => [i])
    )('should process input %i without throwing exceptions', async (index) => {
      const input = testInputs[index];
      expect(input).toBeDefined();
      expect(input.output_body).toBeDefined();

      // Should not throw an exception
      await expect(
        evaluateJsonata(jsonataMainTemplate, input.output_body)
      ).resolves.not.toThrow();

      const result = await evaluateJsonata(jsonataMainTemplate, input.output_body);
      expect(result).toBeDefined();
    });

    it('should return valid structure for all inputs', async () => {
      for (let i = 0; i < testInputs.length; i++) {
        const input = testInputs[i];
        const result = await evaluateJsonata(jsonataMainTemplate, input.output_body) as Record<string, unknown>;

        // Main template should return a defined result
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
      }
    });
  });

  describe('All Templates Combined', () => {
    it('should process all inputs through all templates without any exceptions', async () => {
      const templates = [
        { name: 'dakosy-validation', template: validationTemplate },
        { name: 'global-ai-validation', template: globalAiValidationTemplate },
        { name: 'jsonata-template.v15-works', template: jsonataMainTemplate },
      ];

      const errors: string[] = [];

      for (let i = 0; i < testInputs.length; i++) {
        const input = testInputs[i];

        for (const { name, template } of templates) {
          try {
            const result = await evaluateJsonata(template, input.output_body);
            expect(result).toBeDefined();
          } catch (error) {
            errors.push(`Input ${i} failed on template "${name}": ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      }

      // Report all errors at once
      if (errors.length > 0) {
        throw new Error(`Template execution errors:\n${errors.join('\n')}`);
      }
    });

    it('should have consistent input count', () => {
      expect(testInputs.length).toBe(29);
    });
  });
});
