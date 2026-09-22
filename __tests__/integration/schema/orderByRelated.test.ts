import * as core from "./core.js";
import PgOrderByRelatedPlugin from "../../../src/index.js";
import { test } from "vitest";

test(
  "prints a schema with the order-by-related plugin",
  core.test(["p"], {
    appendPlugins: [PgOrderByRelatedPlugin],
    disableDefaultMutations: true,
    legacyRelations: "omit",
  })
);
