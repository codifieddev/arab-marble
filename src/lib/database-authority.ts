const DATABASE_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,62}$/;

export class DatabaseConfigurationError extends Error {
  readonly code = "DATABASE_CONFIGURATION_UNAVAILABLE";

  constructor() {
    super("Server database configuration is unavailable");
    this.name = "DatabaseConfigurationError";
  }
}

export function getConfiguredDatabaseName(): string {
  const databaseName = (
    process.env.TENANT_DB_NAME || process.env.DB_NAME
  )?.trim();

  if (!databaseName || !DATABASE_NAME_PATTERN.test(databaseName)) {
    throw new DatabaseConfigurationError();
  }

  return databaseName;
}
