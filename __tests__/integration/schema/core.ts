import { withPgClient } from "../../helpers.js";
import {
  createPostGraphileSchema,
  PostGraphileCoreOptions,
} from "postgraphile-core";
import { buildASTSchema, GraphQLSchema, parse } from "graphql";
import { lexicographicSortSchema, printSchema } from "graphql/utilities";
import { PoolClient, Submittable } from "pg";
import { expect } from "vitest";

const printSchemaOrdered = (originalSchema: GraphQLSchema) => {
  // Clone schema so we don't damage anything
  const schema = buildASTSchema(parse(printSchema(originalSchema)));

  return printSchema(lexicographicSortSchema(schema));
};

export const test =
  (
    schemas: string | string[],
    options?: PostGraphileCoreOptions,
    setup?: (client: PoolClient) => Promise<unknown> | Submittable
  ) =>
  () =>
    withPgClient(async (client) => {
      if (setup) {
        if (typeof setup === "function") {
          await setup(client);
        } else {
          client.query(setup);
        }
      }
      const schema = await createPostGraphileSchema(client, schemas, options);
      expect(printSchemaOrdered(schema)).toMatchSnapshot();
    });
