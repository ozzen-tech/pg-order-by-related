import pg from "pg";
import { vi } from "vitest";

// This test suite can be flaky. Increase it’s timeout.
vi.setConfig({ testTimeout: 20_000 });

const ensureEnvUrl = () => {
  const envUrl = process.env.TEST_DATABASE_URL;

  if (typeof envUrl !== "string")
    throw new Error("process.env.TEST_DATABASE_URL is not set");

  return envUrl;
};

const getUrlAndFn = <T>(
  urlOrFn: string | WithPgClientCallback<T>,
  maybeFn?: WithPgClientCallback<T>
): readonly [string, WithPgClientCallback<T>] => {
  if (maybeFn) {
    if (typeof urlOrFn !== "string")
      throw new Error("String expected when function is provided");

    return [urlOrFn, maybeFn];
  }

  if (typeof urlOrFn !== "function")
    throw new Error("Function is expected when only one argument");

  return [ensureEnvUrl(), urlOrFn];
};

type WithPgClientCallback<T> = (client: pg.PoolClient) => T | Promise<T>;

export function withPgClient<T>(fn: WithPgClientCallback<T>): Promise<T>;
export function withPgClient<T>(
  url: string,
  fn: WithPgClientCallback<T>
): Promise<T>;
export async function withPgClient<T>(
  urlOrFn: string | WithPgClientCallback<T>,
  maybeFn?: WithPgClientCallback<T>
): Promise<T> {
  const [url, fn] = getUrlAndFn(urlOrFn, maybeFn);

  const pgPool = new pg.Pool({ connectionString: url });
  let client: pg.PoolClient | null = null;
  try {
    client = await pgPool.connect();
    await client.query("begin");
    await client.query("set local timezone to '+04:00'");
    const result = await fn(client);
    await client.query("rollback");
    return result;
  } finally {
    try {
      client?.release();
    } catch (e) {
      console.error("Error releasing pgClient", e); // eslint-disable-line no-console
    }
    await pgPool.end();
  }
}
