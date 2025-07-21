export interface TypePricingTier {
  price: string;
  subtitle: string;
  features: string[];
  billingNote?: string;
}

export interface TypePricingData {
  annual: {
    free: TypePricingTier;
    personal: TypePricingTier;
    pro: TypePricingTier;
  };
  lifetime: {
    free: TypePricingTier;
    personal: TypePricingTier;
    pro: TypePricingTier;
  };
}

export type TypeFaqItem = {
  value: string;
  question: string;
  answer: string;
};

export type TypeSpreadsheetRow = (
  | string
  | number
  | boolean
  | null
  | undefined
)[];
export type TypeSpreadsheetData = TypeSpreadsheetRow[];
