import { signupContent } from "@/content/signup";

/**
 * Endereço de casa digitado em campos separados no cadastro. O banco guarda
 * uma linha só (`address_text`); `formatSignupAddress` monta essa linha.
 */
export interface SignupAddressParts {
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
}

export type SignupAddressField = keyof SignupAddressParts;

export const initialSignupAddress: SignupAddressParts = {
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
};

export const BRAZIL_STATE_CODES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE",
  "TO",
] as const;

export function formatSignupAddress(parts: SignupAddressParts): string {
  const street = parts.street.trim();
  const number = parts.number.trim();
  const complement = parts.complement.trim();
  const district = parts.district.trim();
  const city = parts.city.trim();
  const state = parts.state.trim().toUpperCase();

  const firstLine = [street, number].filter(Boolean).join(", ");
  const cityLine = [city, state].filter(Boolean).join(" - ");

  return [firstLine, complement, district, cityLine]
    .filter(Boolean)
    .join(" - ");
}

export function validateSignupAddress(
  parts: SignupAddressParts,
): Partial<Record<SignupAddressField, string>> {
  const copy = signupContent.validation;
  const errors: Partial<Record<SignupAddressField, string>> = {};

  if (parts.street.trim().length < 3) errors.street = copy.addressStreetRequired;
  if (!parts.number.trim()) errors.number = copy.addressNumberRequired;
  if (parts.district.trim().length < 2) {
    errors.district = copy.addressDistrictRequired;
  }
  if (parts.city.trim().length < 2) errors.city = copy.addressCityRequired;
  if (
    !BRAZIL_STATE_CODES.includes(
      parts.state.trim().toUpperCase() as (typeof BRAZIL_STATE_CODES)[number],
    )
  ) {
    errors.state = copy.addressStateRequired;
  }

  return errors;
}
