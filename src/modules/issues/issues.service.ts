import { pool } from "../../db";
import type { IssuesWithUserData, Rissues, Ruser } from "../../types/types";


export const issuesCreateInDb = async (issues: Rissues, userId: number) => {
  const { title, description, type } = issues;
// create issues
  const result = await pool.query(
    `
    INSERT INTO issues (title, description, type, reporter_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [title, description, type, userId]
  );
  return result.rows[0];
};


export const getsingleIssueFromDB = async (issueId: string) => {

  // Join with user data 
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



export const updateIssuessInDB = async (issueId: string, data: Partial<Rissues>, user:Ruser) => {
  const { title, description, type } = data
  // first get issue
 const issueRes = await pool.query(
    `SELECT * FROM issues WHERE id = $1`,
    [issueId]
  );

  const existingIssue = issueRes.rows[0];

  if (!existingIssue) return null;
  
// role  check
  if (user.role === "contributor") {
    if (existingIssue.reporter_id !== user.id ||
      existingIssue.status !== "open") {
            throw new Error("Forbidden")
      }
  }

  // update issues
 const result = await pool.query(
    `
    UPDATE issues
    SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      type = COALESCE($3, type),
      updated_at = NOW()
    WHERE id = $4
    RETURNING *;
    `,
    [title ?? null, description ?? null, type ?? null, issueId]
  );
  return result.rows[0]
}


export const deleteIssuesFromDB = async (issueId:string) => {
  const result =await pool.query(
    `
    DELETE FROM issues
WHERE id =$1
  RETURNING *;
    `
    , [issueId])
  
  return result.rows[0]
}

export const getIssuesWithParam = async (query: any) => {
  const { sort, type, status } = query;

// join issues and user data 
  let sql = `
    SELECT 
      i.*, 
      u.id AS reporter_id, 
      u.name AS reporter_name, 
      u.role AS reporter_role
    FROM issues i
    LEFT JOIN users u ON i.reporter_id = u.id
    WHERE 1=1
  `;
  
  const values: any[] = [];
  let i = 1;

  // ২. fittering
  if (type) {
    sql += ` AND i.type = $${i}`;
    values.push(type);
    i++;
  }

  if (status) {
    sql += ` AND i.status = $${i}`;
    values.push(status);
    i++;
  }

  // sorting 
  if (sort === "oldest") {
    sql += ` ORDER BY i.created_at ASC`;
  } else {
    sql += ` ORDER BY i.created_at DESC`;
  }

  // get data from database
  const result = await pool.query(sql, values);
  const rows = result.rows;
// map for formating
  const finalData = rows.map((row) => {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type,
      status: row.status,
      reporter: {
        id: row.reporter_id,
        name: row.reporter_name,
        role: row.reporter_role,
      },
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  });

  return finalData;
};