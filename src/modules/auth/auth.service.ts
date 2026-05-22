

import { promises } from "node:dns";
import type { Ruser, User } from "../../types/types";
import bcrypt from "bcryptjs";
import { pool } from "../../db";

export const HashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 12);
}

export const ComparePassword = async (password: string, hashPassword: string) => {
    return await bcrypt.compare(password, hashPassword);

}

export const createUser = async (user: Ruser & { password: string,email:string }) => {
    const { name, role, email, password } = user
    // password hash 
    const hashpassword = await HashPassword(password)
// create user 
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


export const checkUser = async (email: string, rawpassword: string) => {
    // find user with email
    const result = await pool.query(
        `
        SELECT * FROM users  WHERE email=$1
        `
    ,[email])
    if (!result.rows.length) return null

    const { password, ...user } = result.rows[0] as User
    // compare password 
    const isValid = await ComparePassword(rawpassword, password)
    if (!isValid) return null
    return isValid ? user : null
}