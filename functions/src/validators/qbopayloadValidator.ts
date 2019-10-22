import { Companyconfig } from "../models/Qbo/Company";
import { createHmac } from "crypto";

/**
 * Validates the payload with the intuit-signature hash
 */
export function isValidPayload(
  signature: string,
  payload: string | Buffer | DataView,
  config: Companyconfig
) {
  const hash = createHmac("sha256", config.webhooksverifier)
    .update(payload)
    .digest("base64");
  if (signature === hash) {
    // console.log('valid call')
    return true;
  }
  return false;
}
