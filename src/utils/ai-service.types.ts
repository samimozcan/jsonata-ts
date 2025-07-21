
export type AiServiceResponse =
  | ({
      document_count: number;
      processing_time_seconds: number;
      status: string;
    } & {
      document_type: 't1';
      data: AiT1Declarant;
    })
  | {
      document_type: 'main_invoice';
      data: AiInvoice;
    }
  | {
      document_type: 'tr_antetli';
      data: AiTrDeclaration;
    }
  | {
      document_type: 'atr';
      data: AiAtr;
    }
  | {
      document_type: 'cmr';
      data: AiCmr;
    };

export type AiTrDeclaration = {
  buyer?: string | null;
  date?: string | null;
  delivery_place?: string | null;
  delivery_term?: string | null;
  destination_country?: string | null;
  dispatch_country?: string | null;
  id?: string | null;
  invoice_no?: string | null;
  items?:
    | {
        commodity_code?: string | null;
        commodity_description?: string | null;
        gross_weight?: number | null;
        id?: string | null;
        index?: string | null;
        item_value?: number | null;
        net_weight?: number | null;
        origin?: string | null;
        package_quantity?: number | null;
        quantity?: number | null;
        regime?: string | null;
        statistical_value?: number | null;
        unit_of_measure?: string | null;
      }[]
    | null;
  mode_of_transport?: string | null;
  sender?: string | null;
  tax_id?: string | null;
  total_line_item?: number | null;
  total_package?: number | null;
  total_value?: string | null;
  total_value_curr?: string | null;
  total_weight?: number | null;
};

export type AiInvoice = {
  invoice_currency?: string | null;
  invoice_customer_address?: string | null;
  invoice_customer_country?: string | null;
  invoice_customer_name?: string | null;
  invoice_date?: string | null;
  invoice_delivery_term?: string | null;
  invoice_id?: string | null;
  invoice_payment_term?: string | null;
  invoice_po_number?: string | null;
  invoice_shipment_country_of_origin?: string | null;
  invoice_supplier_address?: string | null;
  invoice_supplier_country?: string | null;
  invoice_supplier_name?: string | null;
  invoice_total_amount?: number | null;
  invoice_total_package_quantity?: number | null;
  invoice_total_quantity?: number | null;
  items?:
    | {
        invoice_item_commodity_code?: string | null;
        invoice_item_country_of_origin?: string | null;
        invoice_item_description?: string | null;
        invoice_item_no?: number | null;
        invoice_item_package_quantity?: number | null;
        invoice_item_product_id?: string | null;
        invoice_item_quantity?: number | null;
        invoice_item_total_amount?: number | null;
        invoice_item_unit_price?: number | null;
        invoice_item_unit_type?: string | null;
      }[]
    | null;
};

export type AiT1Declarant = {
  date?: string | null;
  destination_country?: string | null;
  destination_customs_authority?: string | null;
  dispatch_country?: string | null;
  dispatch_place?: string | null;
  items?:
    | {
        export_id?: string | null;
        invoice_no?: string | null;
        item_index?: string | null;
        sender?: string | null;
        total_package?: number | null;
        total_weight?: number | null;
      }[]
    | null;
  loading_place?: string | null;
  mode_of_transport?: string | null;
  transit_id?: string | null;
  truck_id_border?: string | null;
  truck_id_transit?: string | null;
  type_of_transport?: string | null;
};

export type AiAtr = {
  date?: string | null;
  export_mrn?: string | null;
  id?: string | null;
  receiver?: string | null;
  sender?: string | null;
  total_package?: number | null;
  total_weight?: number | null;
};

export type AiCmr = {
  date?: string | null;
  delivery_place?: string | null;
  loading_place?: string | null;
  plate_no?: string | null;
  receiver?: string | null;
  sender?: string | null;
  total_package?: number | null;
  total_weight?: number | null;
};

export type MergedJSONType = {
  atr?: AiAtr | null;
  cmr?: AiCmr | null;
  invoice?: AiInvoice | null;
  tr_export_declaration?: AiTrDeclaration | null;
  transit_declaration?: AiT1Declarant | null;
};
