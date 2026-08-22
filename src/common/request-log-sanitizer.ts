const REDACTED = '[REDACTED]';

const SENSITIVE_KEYS = new Set([
  'authorization',
  'proxyauthorization',
  'cookie',
  'setcookie',
  'xapikey',
  'xauthtoken',
  'xcsrftoken',
  'apikey',
  'password',
  'currentpassword',
  'newpassword',
  'confirmpassword',
  'passwordconfirmation',
  'token',
  'csrftoken',
  'accesstoken',
  'refreshtoken',
  'jwt',
  'secret',
  'clientsecret',
  'privatekey',
  'credential',
  'credentials',
  'sessionid',
]);

const normalizeKey = (key: string): string => key.toLowerCase().replace(/[^a-z0-9]/g, '');
const isSensitiveKey = (key: string): boolean => SENSITIVE_KEYS.has(normalizeKey(key));

const redactSensitiveValues = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(redactSensitiveValues);
  if (value === null || typeof value !== 'object') return value;

  return Object.fromEntries(Object.entries(value).map(([key, nestedValue]) => [key, isSensitiveKey(key) ? REDACTED : redactSensitiveValues(nestedValue)]));
};

const redactSensitiveUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url, 'http://request.local');
    for (const key of [...parsedUrl.searchParams.keys()]) {
      if (isSensitiveKey(key)) parsedUrl.searchParams.set(key, REDACTED);
    }
    return `${parsedUrl.pathname}${parsedUrl.search}`;
  } catch {
    return '[UNPARSEABLE URL]';
  }
};

export const sanitizeRequestLogData = <T extends { url: string; headers: unknown; body: unknown }>(requestLogData: T): T => {
  return {
    ...requestLogData,
    url: redactSensitiveUrl(requestLogData.url),
    headers: redactSensitiveValues(requestLogData.headers),
    body: redactSensitiveValues(requestLogData.body),
  };
};
