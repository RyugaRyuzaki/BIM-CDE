import {migrate} from "drizzle-orm/postgres-js/migrator";
import {db, connection} from "./index";
import env from "../config/env";
(async () => {
  await migrate(db, {migrationsFolder: "./drizzle"});

  await connection.end();
})();
