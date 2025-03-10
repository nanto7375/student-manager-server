import { ConfigService as ConfigServiceOriginal } from '@nestjs/config/dist/config.service';
import { EnvironmentVariables } from '@service/config.service';

declare global {
  export namespace NodeJS {
    interface ProcessEnv extends EnvironmentVariables {}
  }
}

module '@nestjs/config' {
  export class ConfigService<K extends EnvironmentVariables = EnvironmentVariables, WasValidated extends boolean = false> extends ConfigServiceOriginal<K, WasValidated> {
    /**
     * Get a configuration value (either custom configuration or process environment variable)
     * based on property path (you can use dot notation to traverse nested object, e.g. "database.host").
     * @param propertyPath
     */
    get<P extends keyof K>(propertyPath: P): K[P];
    /**
     * Get a configuration value (either custom configuration or process environment variable)
     * based on property path (you can use dot notation to traverse nested object, e.g. "database.host").
     * @param propertyPath
     */
    getOrThrow<P extends keyof K>(propertyPath: P): K[P];
  }

  export * from '@nestjs/config';
}
