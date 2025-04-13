import { createHash } from 'crypto';
import { Request } from 'express';

export const now = () => new Date();

export const isNullish = (value: unknown) => value === undefined || value === null;
