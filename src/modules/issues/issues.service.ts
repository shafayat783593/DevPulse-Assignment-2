import { pool } from "../../db";
import type { Rissues } from "../../types/types";


export const issuesCreateInDb = async (issues: Rissues, userId: number) => {
  const { title, description, type } = issues;

  const result = await pool.query(
    `
    INSERT INTO issues (title, description, type, reporter_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [title, description, type, userId]
  );
console.log(result.rows[0])
  return result.rows[0];
};