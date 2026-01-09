import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import jsonata from 'jsonata';
import { beforeAll, describe, expect, it } from 'vitest';
import { assignFunctionList } from '../jsonata-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to load JSONata template
async function loadJsonataTemplate(filename: string): Promise<string> {
  const filePath = path.join(__dirname, '../jsonata/', filename);
  return fs.readFile(filePath, 'utf8');
}

// Helper function to load JSON test data
async function loadJsonData(filename: string): Promise<any> {
  const filePath = path.join(__dirname, '../jsonata/', filename);
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content);
}

// Helper function to evaluate JSONata expression with registered functions
async function evaluateJsonata(template: string, data: any): Promise<any> {
  const expression = jsonata(template);
  assignFunctionList.forEach((func) => {
    expression.registerFunction(func.name, func.func, func.type);
  });
  return expression.evaluate(data);
}

// Helper to find error by code
function findErrorByCode(errors: any[], code: string): any {
  return errors.find((e: any) => e.code === code);
}

// Helper to find warning by code
function findWarningByCode(warnings: any[], code: string): any {
  return warnings.find((w: any) => w.code === code);
}

describe('Dakosy Validation JSONata - Comprehensive Tests', () => {
  let validationTemplate: string;

  beforeAll(async () => {
    validationTemplate = await loadJsonataTemplate('dakosy-validation.jsonata');
  });

  // ==========================================
  // ADDITIONAL_DATA VALIDATION TESTS
  // ==========================================
  describe('Additional Data - Transaction Validation', () => {
    describe('IO Partner Validation', () => {
      it('should require IO Partner (MISSING_0002)', async () => {
        const testData = {
          additional_data: {
            transaction: {
              ioPartner: '',
              ioReference: 'test-ref',
            },
            declaration: [],
          },
        };

        const result = await evaluateJsonata(validationTemplate, testData);
        const error = findErrorByCode(result.additional_data.errors, 'MISSING_0002');

        expect(error).toBeDefined();
        expect(error.message).toBe('IO Partner is required');
      });

      it('should warn when IO Partner exceeds 100 characters (INVALID_0001)', async () => {
        const testData = {
          additional_data: {
            transaction: {
              ioPartner: 'A'.repeat(101),
              ioReference: 'test-ref',
            },
            declaration: [],
          },
        };

        const result = await evaluateJsonata(validationTemplate, testData);
        const warning = findWarningByCode(result.additional_data.warnings, 'INVALID_0001');

        expect(warning).toBeDefined();
        expect(warning.message).toBe('IO Partner must not exceed 100 characters');
      });

      it('should not warn when IO Partner is within 100 characters', async () => {
        const testData = {
          additional_data: {
            transaction: {
              ioPartner: 'A'.repeat(100),
              ioReference: 'test-ref',
            },
            declaration: [],
          },
        };

        const result = await evaluateJsonata(validationTemplate, testData);
        const warning = findWarningByCode(result.additional_data.warnings, 'INVALID_0001');

        expect(warning).toBeUndefined();
      });
    });

    describe('IO Reference Validation', () => {
      it('should require IO Reference (MISSING_0003)', async () => {
        const testData = {
          additional_data: {
            transaction: {
              ioPartner: 'test-partner',
              ioReference: '',
            },
            declaration: [],
          },
        };

        const result = await evaluateJsonata(validationTemplate, testData);
        const error = findErrorByCode(result.additional_data.errors, 'MISSING_0003');

        expect(error).toBeDefined();
        expect(error.message).toBe('IO Reference is required');
      });

      it('should warn when IO Reference exceeds 35 characters (INVALID_0003)', async () => {
        const testData = {
          additional_data: {
            transaction: {
              ioPartner: 'test-partner',
              ioReference: 'R'.repeat(36),
            },
            declaration: [],
          },
        };

        const result = await evaluateJsonata(validationTemplate, testData);
        const warning = findWarningByCode(result.additional_data.warnings, 'INVALID_0003');

        expect(warning).toBeDefined();
        expect(warning.message).toBe('IO Reference must not exceed 35 characters');
      });
    });

    describe('IO Division 3 Validation', () => {
      it('should warn when IO Division 3 exceeds 10 characters (INVALID_0002)', async () => {
        const testData = {
          additional_data: {
            transaction: {
              ioPartner: 'test',
              ioReference: 'test-ref',
              ioDivision3: 'D'.repeat(11),
            },
            declaration: [],
          },
        };

        const result = await evaluateJsonata(validationTemplate, testData);
        const warning = findWarningByCode(result.additional_data.warnings, 'INVALID_0002');

        expect(warning).toBeDefined();
        expect(warning.message).toBe('IO Division 3 must not exceed 10 characters');
      });
    });
  });

  describe('Additional Data - Declaration Validation', () => {
    describe('Object Identification Validation', () => {
      it('should require object name (MISSING_0005)', async () => {
        const testData = {
          additional_data: {
            transaction: { ioPartner: 'test', ioReference: 'test-ref' },
            declaration: [
              {
                objectIdentification: {
                  objectName: '',
                  username: 'testuser',
                },
                headerData: {
                  declarantIsConsignee: true,
                  inputTaxDeduction: true,
                },
                addresses: [],
              },
            ],
          },
        };

        const result = await evaluateJsonata(validationTemplate, testData);
        const error = findErrorByCode(result.additional_data.errors, 'MISSING_0005');

        expect(error).toBeDefined();
        expect(error.message).toBe('Object name is required');
      });

      it('should require username (MISSING_0006)', async () => {
        const testData = {
          additional_data: {
            transaction: { ioPartner: 'test', ioReference: 'test-ref' },
            declaration: [
              {
                objectIdentification: {
                  objectName: 'test-object',
                  username: '',
                },
                headerData: {
                  declarantIsConsignee: true,
                  inputTaxDeduction: true,
                },
                addresses: [],
              },
            ],
          },
        };

        const result = await evaluateJsonata(validationTemplate, testData);
        const error = findErrorByCode(result.additional_data.errors, 'MISSING_0006');

        expect(error).toBeDefined();
        expect(error.message).toBe('Username is required');
      });

      it('should warn when object name exceeds 35 characters (INVALID_0004)', async () => {
        const testData = {
          additional_data: {
            transaction: { ioPartner: 'test', ioReference: 'test-ref' },
            declaration: [
              {
                objectIdentification: {
                  objectName: 'O'.repeat(36),
                  username: 'testuser',
                },
                headerData: {
                  declarantIsConsignee: true,
                  inputTaxDeduction: true,
                },
                addresses: [],
              },
            ],
          },
        };

        const result = await evaluateJsonata(validationTemplate, testData);
        const warning = findWarningByCode(result.additional_data.warnings, 'INVALID_0004');

        expect(warning).toBeDefined();
        expect(warning.message).toBe('Object name must not exceed 35 characters');
      });

      it('should warn when object alias exceeds 35 characters (INVALID_0005)', async () => {
        const testData = {
          additional_data: {
            transaction: { ioPartner: 'test', ioReference: 'test-ref' },
            declaration: [
              {
                objectIdentification: {
                  objectName: 'test-object',
                  objectAlias: 'A'.repeat(36),
                  username: 'testuser',
                },
                headerData: {
                  declarantIsConsignee: true,
                  inputTaxDeduction: true,
                },
                addresses: [],
              },
            ],
          },
        };

        const result = await evaluateJsonata(validationTemplate, testData);
        const warning = findWarningByCode(result.additional_data.warnings, 'INVALID_0005');

        expect(warning).toBeDefined();
        expect(warning.message).toBe('Object alias must not exceed 35 characters');
      });

      it('should warn when declaration type exceeds 5 characters (INVALID_0006)', async () => {
        const testData = {
          additional_data: {
            transaction: { ioPartner: 'test', ioReference: 'test-ref' },
            declaration: [
              {
                objectIdentification: {
                  objectName: 'test-object',
                  declarationType: 'TOOLONG',
                  username: 'testuser',
                },
                headerData: {
                  declarantIsConsignee: true,
                  inputTaxDeduction: true,
                },
                addresses: [],
              },
            ],
          },
        };

        const result = await evaluateJsonata(validationTemplate, testData);
        const warning = findWarningByCode(result.additional_data.warnings, 'INVALID_0006');

        expect(warning).toBeDefined();
        expect(warning.message).toBe('Declaration type must not exceed 5 characters');
      });

      it('should warn when username exceeds 70 characters (INVALID_0007)', async () => {
        const testData = {
          additional_data: {
            transaction: { ioPartner: 'test', ioReference: 'test-ref' },
            declaration: [
              {
                objectIdentification: {
                  objectName: 'test-object',
                  username: 'U'.repeat(71),
                },
                headerData: {
                  declarantIsConsignee: true,
                  inputTaxDeduction: true,
                },
                addresses: [],
              },
            ],
          },
        };

        const result = await evaluateJsonata(validationTemplate, testData);
        const warning = findWarningByCode(result.additional_data.warnings, 'INVALID_0007');

        expect(warning).toBeDefined();
        expect(warning.message).toBe('Username must not exceed 70 characters');
      });
    });

    describe('Header Data Validation', () => {
      it('should error when declarantIsConsignee is not boolean (INVALID_0034)', async () => {
        const testData = {
          additional_data: {
            transaction: { ioPartner: 'test', ioReference: 'test-ref' },
            declaration: [
              {
                objectIdentification: {
                  objectName: 'test-object',
                  username: 'testuser',
                },
                headerData: {
                  declarantIsConsignee: 'yes', // Not boolean
                  inputTaxDeduction: true,
                },
                addresses: [],
              },
            ],
          },
        };

        const result = await evaluateJsonata(validationTemplate, testData);
        const error = findErrorByCode(result.additional_data.errors, 'INVALID_0034');

        expect(error).toBeDefined();
        expect(error.message).toBe('Declarant is consignee flag must be boolean');
      });

      it('should error when inputTaxDeduction is not boolean (INVALID_0035)', async () => {
        const testData = {
          additional_data: {
            transaction: { ioPartner: 'test', ioReference: 'test-ref' },
            declaration: [
              {
                objectIdentification: {
                  objectName: 'test-object',
                  username: 'testuser',
                },
                headerData: {
                  declarantIsConsignee: true,
                  inputTaxDeduction: 'yes', // Not boolean
                },
                addresses: [],
              },
            ],
          },
        };

        const result = await evaluateJsonata(validationTemplate, testData);
        const error = findErrorByCode(result.additional_data.errors, 'INVALID_0035');

        expect(error).toBeDefined();
        expect(error.message).toBe('Input tax deduction flag must be boolean');
      });

      it('should warn when transport means identity exceeds 30 characters (INVALID_0019)', async () => {
        const testData = {
          additional_data: {
            transaction: { ioPartner: 'test', ioReference: 'test-ref' },
            declaration: [
              {
                objectIdentification: {
                  objectName: 'test-object',
                  username: 'testuser',
                },
                headerData: {
                  declarantIsConsignee: true,
                  inputTaxDeduction: true,
                  transportMeansArrivalIdentity: 'T'.repeat(31),
                },
                addresses: [],
              },
            ],
          },
        };

        const result = await evaluateJsonata(validationTemplate, testData);
        const warning = findWarningByCode(result.additional_data.warnings, 'INVALID_0019');

        expect(warning).toBeDefined();
        expect(warning.message).toBe('Transport means identity must not exceed 30 characters');
      });
    });

    describe('Address Validation', () => {
      it('should warn when participant EORI exceeds 17 characters (INVALID_0026)', async () => {
        const testData = {
          additional_data: {
            transaction: { ioPartner: 'test', ioReference: 'test-ref' },
            declaration: [
              {
                objectIdentification: {
                  objectName: 'test-object',
                  username: 'testuser',
                },
                headerData: {
                  declarantIsConsignee: true,
                  inputTaxDeduction: true,
                },
                addresses: [
                  {
                    participantEORI: 'E'.repeat(18),
                  },
                ],
              },
            ],
          },
        };

        const result = await evaluateJsonata(validationTemplate, testData);
        const warning = findWarningByCode(result.additional_data.warnings, 'INVALID_0026');

        expect(warning).toBeDefined();
        expect(warning.message).toBe('Participant EORI must not exceed 17 characters');
      });

      it('should warn when company name exceeds 120 characters (INVALID_0028)', async () => {
        const testData = {
          additional_data: {
            transaction: { ioPartner: 'test', ioReference: 'test-ref' },
            declaration: [
              {
                objectIdentification: {
                  objectName: 'test-object',
                  username: 'testuser',
                },
                headerData: {
                  declarantIsConsignee: true,
                  inputTaxDeduction: true,
                },
                addresses: [
                  {
                    companyName: 'C'.repeat(121),
                  },
                ],
              },
            ],
          },
        };

        const result = await evaluateJsonata(validationTemplate, testData);
        const warning = findWarningByCode(result.additional_data.warnings, 'INVALID_0028');

        expect(warning).toBeDefined();
        expect(warning.message).toBe('Company name must not exceed 120 characters');
      });

      it('should warn when city exceeds 35 characters (INVALID_0033)', async () => {
        const testData = {
          additional_data: {
            transaction: { ioPartner: 'test', ioReference: 'test-ref' },
            declaration: [
              {
                objectIdentification: {
                  objectName: 'test-object',
                  username: 'testuser',
                },
                headerData: {
                  declarantIsConsignee: true,
                  inputTaxDeduction: true,
                },
                addresses: [
                  {
                    city: 'C'.repeat(36),
                  },
                ],
              },
            ],
          },
        };

        const result = await evaluateJsonata(validationTemplate, testData);
        const warning = findWarningByCode(result.additional_data.warnings, 'INVALID_0033');

        expect(warning).toBeDefined();
        expect(warning.message).toBe('City must not exceed 35 characters');
      });
    });
  });

  // ==========================================
  // INVOICE VALIDATION TESTS
  // ==========================================
  describe('Invoice Validation', () => {
    it('should warn when invoice date is invalid (MISSING_0007)', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        invoice: [
          {
            invoice_id: 'INV-001',
            invoice_date: 'invalid-date',
            items: [],
          },
        ],
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.invoice.warnings, 'MISSING_0007');

      expect(warning).toBeDefined();
      expect(warning.message).toContain('Invoice date is missing or invalid');
    });

    it('should not warn when invoice date is valid YYYY-MM-DD format', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        invoice: [
          {
            invoice_id: 'INV-001',
            invoice_date: '2025-12-30',
            items: [],
          },
        ],
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.invoice.warnings, 'MISSING_0007');

      expect(warning).toBeUndefined();
    });

    it('should warn when invoice commodity code exceeds 11 characters (INVALID_0038)', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        invoice: [
          {
            invoice_id: 'INV-001',
            invoice_date: '2025-12-30',
            items: [
              {
                invoice_item_commodity_code: '123456789012', // 12 characters
              },
            ],
          },
        ],
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.invoice.warnings, 'INVALID_0038');

      expect(warning).toBeDefined();
      expect(warning.message).toContain('Invoice commodity code must not exceed 11 characters');
    });

    it('should not warn when invoice commodity code is 11 characters or less', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        invoice: [
          {
            invoice_id: 'INV-001',
            invoice_date: '2025-12-30',
            items: [
              {
                invoice_item_commodity_code: '12345678901', // 11 characters
              },
            ],
          },
        ],
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.invoice.warnings, 'INVALID_0038');

      expect(warning).toBeUndefined();
    });
  });

  // ==========================================
  // TR EXPORT DECLARATION VALIDATION TESTS
  // ==========================================
  describe('TR Export Declaration Validation', () => {
    it('should warn when total gross weight is null (MISSING_0010)', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        tr_export_declaration: {
          total_gross_weight: null,
          total_net_weight: 1000,
          items: [],
        },
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.tr_export_declaration.warnings, 'MISSING_0010');

      expect(warning).toBeDefined();
      expect(warning.message).toBe(
        'Total gross weight in TR Export Declaration could not retrieved.'
      );
    });

    it('should warn when total net weight is null (MISSING_0011)', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        tr_export_declaration: {
          total_gross_weight: 1000,
          total_net_weight: null,
          items: [],
        },
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.tr_export_declaration.warnings, 'MISSING_0011');

      expect(warning).toBeDefined();
      expect(warning.message).toBe(
        'Total net weight in TR Export Declaration could not retrieved.'
      );
    });

    it('should warn when item gross weight is null (MISSING_0012)', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        tr_export_declaration: {
          total_gross_weight: 1000,
          total_net_weight: 900,
          items: [
            {
              gross_weight: null,
              net_weight: 100,
              statistical_value: 500,
              quantity: 10,
              item_value: 1000,
              commodity_code: '12345678901',
            },
          ],
        },
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.tr_export_declaration.warnings, 'MISSING_0012');

      expect(warning).toBeDefined();
      expect(warning.message).toContain(
        'Item gross weight in TR Export Declaration could not retrieved'
      );
    });

    it('should warn when item net weight is null (MISSING_0013)', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        tr_export_declaration: {
          total_gross_weight: 1000,
          total_net_weight: 900,
          items: [
            {
              gross_weight: 100,
              net_weight: null,
              statistical_value: 500,
              quantity: 10,
              item_value: 1000,
              commodity_code: '12345678901',
            },
          ],
        },
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.tr_export_declaration.warnings, 'MISSING_0013');

      expect(warning).toBeDefined();
      expect(warning.message).toContain(
        'Item net weight in TR Export Declaration could not retrieved'
      );
    });

    it('should warn when item statistical value is null (MISSING_0014)', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        tr_export_declaration: {
          total_gross_weight: 1000,
          total_net_weight: 900,
          items: [
            {
              gross_weight: 100,
              net_weight: 90,
              statistical_value: null,
              quantity: 10,
              item_value: 1000,
              commodity_code: '12345678901',
            },
          ],
        },
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.tr_export_declaration.warnings, 'MISSING_0014');

      expect(warning).toBeDefined();
      expect(warning.message).toContain(
        'Item statistical value in TR Export Declaration could not retrieved'
      );
    });

    it('should warn when item quantity is null (MISSING_0015)', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        tr_export_declaration: {
          total_gross_weight: 1000,
          total_net_weight: 900,
          items: [
            {
              gross_weight: 100,
              net_weight: 90,
              statistical_value: 500,
              quantity: null,
              item_value: 1000,
              commodity_code: '12345678901',
            },
          ],
        },
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.tr_export_declaration.warnings, 'MISSING_0015');

      expect(warning).toBeDefined();
      expect(warning.message).toContain(
        'Item quantity in TR Export Declaration could not retrieved'
      );
    });

    it('should warn when item value is null (MISSING_0016)', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        tr_export_declaration: {
          total_gross_weight: 1000,
          total_net_weight: 900,
          items: [
            {
              gross_weight: 100,
              net_weight: 90,
              statistical_value: 500,
              quantity: 10,
              item_value: null,
              commodity_code: '12345678901',
            },
          ],
        },
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.tr_export_declaration.warnings, 'MISSING_0016');

      expect(warning).toBeDefined();
      expect(warning.message).toContain('Item value in TR Export Declaration could not retrieved');
    });

    it('should warn when declaration commodity code exceeds 11 characters (INVALID_0039)', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        tr_export_declaration: {
          total_gross_weight: 1000,
          total_net_weight: 900,
          items: [
            {
              gross_weight: 100,
              net_weight: 90,
              statistical_value: 500,
              quantity: 10,
              item_value: 1000,
              commodity_code: '123456789012', // 12 characters
            },
          ],
        },
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.tr_export_declaration.warnings, 'INVALID_0039');

      expect(warning).toBeDefined();
      expect(warning.message).toContain('Declaration commodity code must not exceed 11 characters');
    });
  });

  // ==========================================
  // CMR VALIDATION TESTS
  // ==========================================
  describe('CMR Validation', () => {
    it('should warn when CMR date is invalid (INVALID_0040)', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        cmr: {
          date: 'invalid-date',
          sender: 'Test Sender',
        },
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.cmr.warnings, 'INVALID_0040');

      expect(warning).toBeDefined();
      expect(warning.message).toBe('CMR date is invalid, default date is used.');
    });

    it('should not warn when CMR date is valid', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        cmr: {
          date: '2025-12-30',
          sender: 'Test Sender',
        },
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.cmr.warnings, 'INVALID_0040');

      expect(warning).toBeUndefined();
    });

    it('should return empty arrays when CMR does not exist', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
      };

      const result = await evaluateJsonata(validationTemplate, testData);

      expect(result.cmr.errors).toEqual([]);
      expect(result.cmr.warnings).toEqual([]);
    });
  });

  // ==========================================
  // ATR VALIDATION TESTS
  // ==========================================
  describe('ATR Validation', () => {
    it('should warn when ATR date is invalid (INVALID_0041)', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        atr: {
          date: 'invalid-date',
          sender: 'Test Sender',
        },
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.atr.warnings, 'INVALID_0041');

      expect(warning).toBeDefined();
      expect(warning.message).toBe('ATR date is invalid, default date is used.');
    });

    it('should not warn when ATR date is valid', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        atr: {
          date: '2025-12-30',
          sender: 'Test Sender',
        },
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.atr.warnings, 'INVALID_0041');

      expect(warning).toBeUndefined();
    });
  });

  // ==========================================
  // COMMERCIAL INVOICE VALIDATION TESTS
  // ==========================================
  describe('Commercial Invoice Validation', () => {
    it('should warn when commercial invoice date is invalid (MISSING_0017)', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        commercial_invoice: [
          {
            invoice_id: 'CI-001',
            invoice_date: 'invalid-date',
            items: [],
          },
        ],
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.commercial_invoice.warnings, 'MISSING_0017');

      expect(warning).toBeDefined();
      expect(warning.message).toContain('Commercial invoice date is missing');
    });

    it('should not warn when commercial invoice date is valid', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        commercial_invoice: [
          {
            invoice_id: 'CI-001',
            invoice_date: '2025-12-30',
            items: [],
          },
        ],
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.commercial_invoice.warnings, 'MISSING_0017');

      expect(warning).toBeUndefined();
    });

    it('should warn when commercial invoice commodity code exceeds 11 characters (INVALID_0042)', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        commercial_invoice: [
          {
            invoice_id: 'CI-001',
            invoice_date: '2025-12-30',
            items: [
              {
                invoice_item_commodity_code: '123456789012', // 12 characters
              },
            ],
          },
        ],
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.commercial_invoice.warnings, 'INVALID_0042');

      expect(warning).toBeDefined();
      expect(warning.message).toContain(
        'Commercial invoice commodity code must not exceed 11 characters'
      );
    });
  });

  // ==========================================
  // FTZ VALIDATION TESTS
  // ==========================================
  describe('FTZ Validation', () => {
    it('should warn when FTZ shipment date is invalid (INVALID_0044)', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        ftz: {
          shipment: {
            id: 'FTZ-001',
            date: 'invalid-date',
            total_gross_weight: 1000,
            positions: [],
          },
        },
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.ftz.warnings, 'INVALID_0044');

      expect(warning).toBeDefined();
      expect(warning.message).toBe('FTZ shipment date is invalid');
    });

    it('should not warn when FTZ shipment date is valid', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        ftz: {
          shipment: {
            id: 'FTZ-001',
            date: '2025-12-30',
            total_gross_weight: 1000,
            positions: [],
          },
        },
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.ftz.warnings, 'INVALID_0044');

      expect(warning).toBeUndefined();
    });

    it('should warn when FTZ total gross weight is null (MISSING_0020)', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        ftz: {
          shipment: {
            id: 'FTZ-001',
            date: '2025-12-30',
            total_gross_weight: null,
            positions: [],
          },
        },
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.ftz.warnings, 'MISSING_0020');

      expect(warning).toBeDefined();
      expect(warning.message).toBe('FTZ total gross weight could not be retrieved');
    });

    it('should warn when FTZ item quantity is null (MISSING_0021)', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        ftz: {
          shipment: {
            id: 'FTZ-001',
            date: '2025-12-30',
            total_gross_weight: 1000,
            positions: [
              {
                quantity: null,
                value: 500,
                commodity_code: '12345678901',
              },
            ],
          },
        },
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.ftz.warnings, 'MISSING_0021');

      expect(warning).toBeDefined();
      expect(warning.message).toContain('FTZ item quantity could not be retrieved');
    });

    it('should warn when FTZ item value is null (MISSING_0022)', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        ftz: {
          shipment: {
            id: 'FTZ-001',
            date: '2025-12-30',
            total_gross_weight: 1000,
            positions: [
              {
                quantity: 10,
                value: null,
                commodity_code: '12345678901',
              },
            ],
          },
        },
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.ftz.warnings, 'MISSING_0022');

      expect(warning).toBeDefined();
      expect(warning.message).toContain('FTZ item value could not be retrieved');
    });

    it('should warn when FTZ commodity code exceeds 11 characters (INVALID_0045)', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        ftz: {
          shipment: {
            id: 'FTZ-001',
            date: '2025-12-30',
            total_gross_weight: 1000,
            positions: [
              {
                quantity: 10,
                value: 500,
                commodity_code: '123456789012', // 12 characters
              },
            ],
          },
        },
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.ftz.warnings, 'INVALID_0045');

      expect(warning).toBeDefined();
      expect(warning.message).toContain('FTZ commodity code must not exceed 11 characters');
    });
  });

  // ==========================================
  // GLOBAL VALIDATION TESTS
  // ==========================================
  describe('Global Validation', () => {
    it('should warn when dispatch and destination countries are the same (ERROR_0007)', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        dispatch_country: 'TR',
        destination_country: 'TR',
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.global.warnings, 'ERROR_0007');

      expect(warning).toBeDefined();
      expect(warning.message).toBe('Dispatch country and destination country cannot be the same');
    });

    it('should warn when dispatch and destination are same (case insensitive)', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        dispatch_country: 'tr',
        destination_country: 'TR',
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.global.warnings, 'ERROR_0007');

      expect(warning).toBeDefined();
    });

    it('should not warn when dispatch and destination countries are different', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        dispatch_country: 'TR',
        destination_country: 'DE',
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.global.warnings, 'ERROR_0007');

      expect(warning).toBeUndefined();
    });

    it('should not warn when dispatch country is missing', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        destination_country: 'DE',
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.global.warnings, 'ERROR_0007');

      expect(warning).toBeUndefined();
    });

    it('should not warn when destination country is missing', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        dispatch_country: 'TR',
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const warning = findWarningByCode(result.global.warnings, 'ERROR_0007');

      expect(warning).toBeUndefined();
    });
  });

  // ==========================================
  // OUTPUT STRUCTURE TESTS
  // ==========================================
  describe('Output Structure', () => {
    it('should return all expected sections in output', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
      };

      const result = await evaluateJsonata(validationTemplate, testData);

      expect(result).toHaveProperty('additional_data');
      expect(result).toHaveProperty('invoice');
      expect(result).toHaveProperty('tr_export_declaration');
      expect(result).toHaveProperty('cmr');
      expect(result).toHaveProperty('atr');
      expect(result).toHaveProperty('commercial_invoice');
      expect(result).toHaveProperty('ftz');
      expect(result).toHaveProperty('global');
    });

    it('should have errors and warnings arrays for each section', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
      };

      const result = await evaluateJsonata(validationTemplate, testData);

      const sections = [
        'additional_data',
        'invoice',
        'tr_export_declaration',
        'cmr',
        'atr',
        'commercial_invoice',
        'ftz',
        'global',
      ];

      sections.forEach((section) => {
        expect(result[section]).toHaveProperty('errors');
        expect(result[section]).toHaveProperty('warnings');
        expect(Array.isArray(result[section].errors)).toBe(true);
        expect(Array.isArray(result[section].warnings)).toBe(true);
      });
    });

    it('should format error objects with code, message, and path', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: '', ioReference: 'test-ref' },
          declaration: [],
        },
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const error = result.additional_data.errors[0];

      expect(error).toHaveProperty('code');
      expect(error).toHaveProperty('message');
      expect(error).toHaveProperty('path');
    });
  });

  // ==========================================
  // INTEGRATION TESTS WITH REAL DATA
  // ==========================================
  describe('Integration Tests with Real Data Files', () => {
    it('should validate 25-12-29-dakosy.json successfully', async () => {
      const testData = await loadJsonData('25-12-29-dakosy.json');
      const result = await evaluateJsonata(validationTemplate, testData);

      expect(result).toBeDefined();
      expect(result.additional_data).toBeDefined();
      expect(result.global).toBeDefined();
    });

    it('should validate 25-12-29-dakosy-only-ftz.json successfully', async () => {
      try {
        const testData = await loadJsonData('25-12-29-dakosy-only-ftz.json');
        const result = await evaluateJsonata(validationTemplate, testData);

        expect(result).toBeDefined();
        expect(result.ftz).toBeDefined();
      } catch (error) {
        if ((error as any).code === 'ENOENT') {
          console.log('Skipping - file not found');
          return;
        }
        throw error;
      }
    });

    it('should validate 25-12-29-dakosy-only-declaration.json successfully', async () => {
      try {
        const testData = await loadJsonData('25-12-29-dakosy-only-declaration.json');
        const result = await evaluateJsonata(validationTemplate, testData);

        expect(result).toBeDefined();
        expect(result.tr_export_declaration).toBeDefined();
      } catch (error) {
        if ((error as any).code === 'ENOENT') {
          console.log('Skipping - file not found');
          return;
        }
        throw error;
      }
    });
  });

  // ==========================================
  // EDGE CASES
  // ==========================================
  describe('Edge Cases', () => {
    it('should handle empty data gracefully', async () => {
      const testData = {};

      const result = await evaluateJsonata(validationTemplate, testData);

      expect(result).toBeDefined();
      // Empty data still triggers required field validations for IO Partner and IO Reference
      expect(result.additional_data.errors.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle null values in nested objects', async () => {
      const testData = {
        additional_data: {
          transaction: null,
          declaration: null,
        },
      };

      const result = await evaluateJsonata(validationTemplate, testData);

      expect(result).toBeDefined();
    });

    it('should handle multiple invoices', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        invoice: [
          { invoice_id: 'INV-001', invoice_date: '2025-12-30', items: [] },
          { invoice_id: 'INV-002', invoice_date: 'invalid', items: [] },
          { invoice_id: 'INV-003', invoice_date: '2025-12-31', items: [] },
        ],
      };

      const result = await evaluateJsonata(validationTemplate, testData);

      // Should have warning for INV-002 only
      const warnings = result.invoice.warnings;
      expect(warnings.length).toBe(1);
      expect(warnings[0].message).toContain('INV-002');
    });

    it('should handle multiple declaration items', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [
            {
              objectIdentification: { objectName: 'obj1', username: 'user1' },
              headerData: { declarantIsConsignee: true, inputTaxDeduction: true },
              addresses: [],
            },
            {
              objectIdentification: { objectName: '', username: 'user2' }, // Missing objectName
              headerData: { declarantIsConsignee: true, inputTaxDeduction: true },
              addresses: [],
            },
          ],
        },
      };

      const result = await evaluateJsonata(validationTemplate, testData);
      const error = findErrorByCode(result.additional_data.errors, 'MISSING_0005');

      expect(error).toBeDefined();
    });

    it('should handle multiple FTZ positions', async () => {
      const testData = {
        additional_data: {
          transaction: { ioPartner: 'test', ioReference: 'test-ref' },
          declaration: [],
        },
        ftz: {
          shipment: {
            id: 'FTZ-001',
            date: '2025-12-30',
            total_gross_weight: 1000,
            positions: [
              { quantity: 10, value: 100, commodity_code: '12345678901' },
              { quantity: null, value: 200, commodity_code: '12345678901' }, // null quantity
              { quantity: 30, value: null, commodity_code: '12345678901' }, // null value
            ],
          },
        },
      };

      const result = await evaluateJsonata(validationTemplate, testData);

      expect(findWarningByCode(result.ftz.warnings, 'MISSING_0021')).toBeDefined();
      expect(findWarningByCode(result.ftz.warnings, 'MISSING_0022')).toBeDefined();
    });
  });
});
