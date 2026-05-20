import { pool } from "./index"



export const createSchema = async () => {
    await pool.query(
        `
      id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(100) DEFAULT 'contributor' CHECK (role IN ('contributor', 'maintainer')) NOT NULL,
   created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    `
    )
}