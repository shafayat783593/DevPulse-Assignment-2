

import { promises } from "node:dns";
import type { Ruser } from "../../types/types";
import bcrypt from "bcryptjs";
import { pool } from "../../db";

export const HashPassword = async (password: string): Promise<string> => {

    const hash = await bcrypt.hash(password, 12);

    return hash

}

export const createUser = async (user: Ruser & { password: string }) => {
    const { name, role, email, password } = user
    const hashpassword = await HashPassword(password)

    const result = await pool.query(
        `
  INSERT INTO users(name, email, password, role) 
  VALUES($1, $2, $3, COALESCE($4, 'contributor')) 
  RETURNING *
  `,
        [name, email, hashpassword, role]
    );


    delete result.rows[0].password

    return result.rows[0];

}