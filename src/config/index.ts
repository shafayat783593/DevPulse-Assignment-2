import { env } from "process";

import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const config = {
    port: env.PORT as string,
  database_url: env.DATABASE_URL as string,
  secret: env.JWT_SECRET as string,
  refresh_secret: env.JWT_REFRESH_SECRET as string,
  node_env: env.NODE_ENV as string,
};
