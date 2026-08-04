export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID ?? "",
  twilioApiKeySid: process.env.TWILIO_API_KEY_SID ?? "",
  twilioApiKeySecret: process.env.TWILIO_API_KEY_SECRET ?? "",
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN ?? "",
  twilioMessagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID ?? "",
  twilioFromNumber: process.env.TWILIO_FROM_NUMBER ?? "",
};

/**
 * Read SMS credentials at the time a provider request is made. This keeps the
 * values server-only while allowing deployment secret updates and isolated tests
 * to be observed without exposing them through the static frontend bundle.
 */
export function getTwilioEnv() {
  return {
    accountSid: process.env.TWILIO_ACCOUNT_SID ?? "",
    apiKeySid: process.env.TWILIO_API_KEY_SID ?? "",
    apiKeySecret: process.env.TWILIO_API_KEY_SECRET ?? "",
    authToken: process.env.TWILIO_AUTH_TOKEN ?? "",
    messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID ?? "",
    fromNumber: process.env.TWILIO_FROM_NUMBER ?? "",
  };
}
