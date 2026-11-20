export const PHONE_DOMAIN = "ourcml.com";

/**
 * Email or phone, from one box. A phone number without "+" is taken as Indian (+91).
 * There is no SMS: a phone number signs in as a hidden email address, <digits>@ourcml.com (see phoneEmail).
 */
export function readId(raw: string): { email: string } | { phone: string } | null {
  const v = raw.trim();
  if (v.includes("@")) {
    // A phone account's hidden address cannot be typed in: it would claim someone's number by email.
    if (v.toLowerCase().endsWith(`@${PHONE_DOMAIN}`)) return null;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? { email: v } : null;
  }
  const digits = v.replace(/[\s().-]/g, "");
  // India without "+": 10 digits, or 0 + 10 digits, or 91 + 10 digits.
  const local = /^0?(\d{10})$/.exec(digits)?.[1] ?? /^91(\d{10})$/.exec(digits)?.[1];
  const phone = local ? `+91${local}` : digits.replace(/^00/, "+");
  return /^\+\d{10,15}$/.test(phone) ? { phone } : null;
}

/** The login email behind a phone number: +919876543210 -> 919876543210@ourcml.com. Never mailed. */
export const phoneEmail = (phone: string) => `${phone.replace(/\D/g, "")}@${PHONE_DOMAIN}`;

