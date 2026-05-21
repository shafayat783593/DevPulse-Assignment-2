import { pool } from "../db"
import type { Ruser } from "../types/types"



export const getuserById =async (userId:string) => {
    const result = await pool.query(
        `
        SELECT id,name,role FROM users WHERE id=$1
        `
        , [userId])
    return result.rows[0] as Ruser & { userId: string }
    // return result.rows[0]
}