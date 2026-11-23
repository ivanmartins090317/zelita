"use client";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Note } from "@/components/ui/note";
import { Select } from "@/components/ui/select";
import { signupContent } from "@/content/signup";
import { formatPhoneBR } from "@/lib/format";
import {
  BRAZIL_STATE_CODES,
  type SignupAddressParts,
} from "@/modules/care-recipients/presentation/signup-address";
import {
  SignupStepShell,
  SignupStepTitle,
} from "@/modules/care-recipients/presentation/signup-step-shell";

interface SignupContactStepProps {
  careDisplayName: string;
  careWhatsapp: string;
  address: SignupAddressParts;
  fieldErrors: Record<string, string | undefined>;
  onCareWhatsappChange: (value: string) => void;
  onAddressChange: (patch: Partial<SignupAddressParts>) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function SignupContactStep({
  careDisplayName,
  careWhatsapp,
  address,
  fieldErrors,
  onCareWhatsappChange,
  onAddressChange,
  onBack,
  onContinue,
}: SignupContactStepProps) {
  const copy = signupContent.contact;
  const title = careDisplayName.trim()
    ? copy.titleWithName.replace("{name}", careDisplayName.trim())
    : copy.title;

  const addressErrors = [
    fieldErrors["address.street"],
    fieldErrors["address.number"],
    fieldErrors["address.district"],
    fieldErrors["address.city"],
    fieldErrors["address.state"],
  ].filter(Boolean) as string[];

  return (
    <SignupStepShell onBack={onBack} onContinue={onContinue}>
      <SignupStepTitle title={title} subtitle={copy.subtitle} />
      <div className="space-y-4">
        <Field label={copy.whatsappLabel} htmlFor="care-whatsapp">
          <Input
            id="care-whatsapp"
            value={careWhatsapp}
            onChange={(event) =>
              onCareWhatsappChange(formatPhoneBR(event.target.value))
            }
            inputMode="tel"
            className="text-[17px]"
          />
          <p className="mt-1 text-compact text-muted">{copy.whatsappHint}</p>
        </Field>
        {fieldErrors.careWhatsapp ? (
          <Note tone="warning" icon="⚠️">
            {fieldErrors.careWhatsapp}
          </Note>
        ) : null}

        <fieldset>
          <legend className="mb-1.5 block text-control font-bold text-brand-800">
            {copy.addressLabel}
          </legend>
          <p className="mb-3 text-compact text-muted">{copy.addressHint}</p>
          <div className="space-y-3">
            <Field
              label={copy.addressStreetLabel}
              htmlFor="address-street"
              className="mb-0"
              error={fieldErrors["address.street"]}
            >
              <Input
                id="address-street"
                value={address.street}
                onChange={(event) =>
                  onAddressChange({ street: event.target.value })
                }
                autoComplete="address-line1"
                className="text-[17px]"
              />
            </Field>
            <div className="grid grid-cols-[1fr_2fr] gap-3">
              <Field
                label={copy.addressNumberLabel}
                htmlFor="address-number"
                className="mb-0"
                error={fieldErrors["address.number"]}
              >
                <Input
                  id="address-number"
                  value={address.number}
                  onChange={(event) =>
                    onAddressChange({ number: event.target.value })
                  }
                  inputMode="numeric"
                  className="text-[17px]"
                />
              </Field>
              <Field
                label={copy.addressComplementLabel}
                htmlFor="address-complement"
                className="mb-0"
                hint={copy.addressComplementHint}
                error={fieldErrors["address.complement"]}
              >
                <Input
                  id="address-complement"
                  value={address.complement}
                  onChange={(event) =>
                    onAddressChange({ complement: event.target.value })
                  }
                  autoComplete="address-line2"
                  className="text-[17px]"
                />
              </Field>
            </div>
            <Field
              label={copy.addressDistrictLabel}
              htmlFor="address-district"
              className="mb-0"
              error={fieldErrors["address.district"]}
            >
              <Input
                id="address-district"
                value={address.district}
                onChange={(event) =>
                  onAddressChange({ district: event.target.value })
                }
                className="text-[17px]"
              />
            </Field>
            <div className="grid grid-cols-[2fr_1fr] gap-3">
              <Field
                label={copy.addressCityLabel}
                htmlFor="address-city"
                className="mb-0"
                error={fieldErrors["address.city"]}
              >
                <Input
                  id="address-city"
                  value={address.city}
                  onChange={(event) =>
                    onAddressChange({ city: event.target.value })
                  }
                  autoComplete="address-level2"
                  className="text-[17px]"
                />
              </Field>
              <Field
                label={copy.addressStateLabel}
                htmlFor="address-state"
                className="mb-0"
                error={fieldErrors["address.state"]}
              >
                <Select
                  id="address-state"
                  value={address.state}
                  onChange={(event) =>
                    onAddressChange({ state: event.target.value })
                  }
                  autoComplete="address-level1"
                  className="text-[17px]"
                >
                  <option value="" disabled>
                    {copy.addressStatePlaceholder}
                  </option>
                  {BRAZIL_STATE_CODES.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>
        </fieldset>
        {addressErrors.length > 0 ? (
          <Note tone="warning" icon="⚠️">
            {addressErrors[0]}
          </Note>
        ) : null}
      </div>
    </SignupStepShell>
  );
}
