import { pool } from "../../db";
import type { IssuesWithUserData, Rissues, Ruser } from "../../types/types";


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


export const getsingleIssueFromDB = async (issueId: string) => {
  console.log(issueId)
  const result = await pool.query(
    `
SELECT 
  issues.id,
  issues.title,
  issues.description,
  issues.type,
  issues.status,
  issues.created_at,
  issues.updated_at,
  users.id AS reporter_id,
  users.name AS reporter_name,
  users.role AS reporter_role
FROM issues
JOIN users ON issues.reporter_id = users.id
WHERE issues.id = $1;
        `
    , [issueId])

  const data = result.rows[0] as IssuesWithUserData
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    type: data.type,
    status: data.status,
    reporter: {
      id: data.reporter_id,
      name: data.reporter_name,
      role: data.reporter_role
    },
    created_at: data.created_at,
    updated_at: data.updated_at
  }
}