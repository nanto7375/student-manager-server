import { createHash } from 'crypto';
import { Request } from 'express';

export const getFingerprint = (req: Request) => {
  const components = [
    req.ip,
    req.headers['user-agent'] || '', //
    req.headers['sec-ch-ua'] || '',
    req.headers['sec-ch-ua-mobile'] || '',
    req.headers['sec-ch-ua-platform'] || '',
  ];
  return createHash('sha256').update(components.join(':')).digest('hex');
};

export const now = () => new Date();

export const isNullish = (value: unknown) => value === undefined || value === null;
