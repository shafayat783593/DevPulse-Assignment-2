import { Pool } from "pg";
import { config } from "../config";
import { createSchema } from "./schema";

export const pool = new Pool({
  connectionString: config.database_url,
});
export const initDB = async () => {
    await createSchema();
    console.log("databse connected successfully")

}