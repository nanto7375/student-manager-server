export interface ExceptionDefinition {
  readonly status: number;
  readonly resultCode: number;
  readonly resultMessage: string;
  optionalInfo?: Record<string, any>;
}

const defineException = (status: number, resultCode: number, resultMessage: string, optionalInfo?: Record<string, any>): ExceptionDefinition => ({
  status,
  resultCode,
  resultMessage,
  optionalInfo,
});

const definedException = {
  badRequest: defineException(400, 104000, 'bad request'),
  tooMany: defineException(400, 104001, 'too many requests'),
  productUpdated: defineException(400, 104002, 'product updated'),
  productDeleted: defineException(400, 104003, 'product deleted'),
  alreadyUsedAccount: defineException(400, 104004, 'already used account'),
  oldVersion: defineException(400, 104005, 'old version'),
  unauthorized: defineException(401, 104010, 'unauthorized'),
  forbidden: defineException(403, 104030, 'forbidden'),
  bannedIp: defineException(403, 104031, 'banned ip'),
  notFound: defineException(404, 104040, 'not found'),
  serverError: defineException(500, 105000, 'server error'),
  externalServerError: defineException(500, 105001, 'external server error'),
};

export default definedException;
