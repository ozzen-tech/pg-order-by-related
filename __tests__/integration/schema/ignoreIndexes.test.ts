import * as core from "./core.js";
import PgOrderByRelatedPlugin from "../../../src/index.js";
import { test } from "vitest";

test(
  "prints a schema with `ignoreIndexes: false`",
  core.test(["p"], {
    appendPlugins: [PgOrderByRelatedPlugin],
    disableDefaultMutations: true,
    legacyRelations: "omit",
    ignoreIndexes: false,
  })
);
