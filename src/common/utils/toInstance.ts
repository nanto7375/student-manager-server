import { plainToInstance, ClassConstructor } from 'class-transformer';

type ToInstance = {
  <T, V>(cls: ClassConstructor<T>, plain: V[]): T[];
  <T, V>(cls: ClassConstructor<T>, plain: V): T;
};
export const toInstance: ToInstance = <T, V>(cls: ClassConstructor<T>, plain: V | V[]) => {
  return plainToInstance(cls, plain, {
    excludeExtraneousValues: true,
  });
};
