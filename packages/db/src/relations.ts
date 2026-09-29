import { defineRelations } from "drizzle-orm";

import { schema } from "./index.js";

export const relations = defineRelations(schema, (r) => ({}));
