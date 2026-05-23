

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import cookieParser from "cookie-parser";
import express from "express";

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/utility/sendResponse.ts
var sendResponse = (res, { message, data, error }, status = 200) => {
  res.status(status).json({
    success: error ? false : true,
    message,
    data: error ? void 0 : data
  });
};

// src/modules/auth/auth.service.ts
import "dns";
import bcrypt from "bcryptjs";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import { env } from "process";
import dotenv from "dotenv";
dotenv.config({ quiet: true });
var config = {
  port: env.PORT,
  database_url: env.DATABASE_URL,
  access_secret: env.JWT_ACCESS_SECRET,
  refresh_secret: env.JWT_REFRESH_SECRET,
  node_env: env.NODE_ENV
};

// src/db/schema.ts
var createSchema = async () => {
  await pool.query(
    `
   CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'contributor' CHECK (role IN ('contributor', 'maintainer')) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
    `
  );
  await pool.query(
    `
   CREATE TABLE IF NOT EXISTS issues (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL, 
    type VARCHAR(50) CHECK (type IN ('bug', 'feature_request')) NOT NULL,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')) NOT NULL,
    reporter_id INT NOT NULL, 
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
    `
  );
};

// src/db/index.ts
var pool = new Pool({
  connectionString: config.database_url
});
var initDB = async () => {
  await createSchema();
  console.log("databse connected successfully");
};

// src/modules/auth/auth.service.ts
var HashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};
var ComparePassword = async (password, hashPassword) => {
  return await bcrypt.compare(password, hashPassword);
};
var createUser = async (user) => {
  const { name, role: role2, email, password } = user;
  const hashpassword = await HashPassword(password);
  const result = await pool.query(
    `
  INSERT INTO users(name, email, password, role) 
  VALUES($1, $2, $3, COALESCE($4, 'contributor')) 
  RETURNING *
  `,
    [name, email, hashpassword, role2]
  );
  delete result.rows[0].password;
  return result.rows[0];
};
var checkUser = async (email, rawpassword) => {
  const result = await pool.query(
    `
        SELECT * FROM users  WHERE email=$1
        `,
    [email]
  );
  if (!result.rows.length) return null;
  const { password, ...user } = result.rows[0];
  const isValid = await ComparePassword(rawpassword, password);
  if (!isValid) return null;
  return isValid ? user : null;
};

// src/utility/tokens.ts
import jwt from "jsonwebtoken";
var verifyToken = (token, type) => {
  const sectreteToken = type === "accessToken" ? config.access_secret : config.refresh_secret;
  const decoded = jwt.verify(token, sectreteToken);
  return decoded;
};
var tokens = (payload) => {
  console.log("palode", payload);
  const accessToken = jwt.sign(payload, config.access_secret, { expiresIn: "7d" });
  const refreshToken = jwt.sign(payload, config.refresh_secret, { expiresIn: "15d" });
  return { accessToken, refreshToken };
};

// src/modules/auth/auth.controller.ts
var signup = async (req, res) => {
  const user = await createUser(req.body);
  if (!user) return sendResponse(res, { message: "Failed to create user", error: true }, 400);
  sendResponse(res, { message: "User registered successfully", data: user }, 200);
};
var login = async (req, res) => {
  const { email, password } = req.body;
  const user = await checkUser(email, password);
  if (!user) return sendResponse(res, { message: "Failed to create user", error: true }, 400);
  const payload = {
    id: user.id,
    name: user.name,
    role: user.role
  };
  const { refreshToken, accessToken: token } = tokens(payload);
  res.cookie("refreshToken", refreshToken, {
    secure: false,
    httpOnly: true,
    sameSite: "lax"
  });
  res.cookie("accessToken", token, {
    secure: false,
    httpOnly: true,
    sameSite: "lax"
  });
  const result = {
    token,
    user
  };
  sendResponse(res, { message: "Login successful", data: result }, 200);
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", signup);
router.post("/login", login);
var authRouter = router;

// src/modules/issues/issues.route.ts
import { Router as Router2 } from "express";

// src/utility/userData.ts
var getuserById = async (userId) => {
  const result = await pool.query(
    `
        SELECT id,name,role FROM users WHERE id=$1
        `,
    [userId]
  );
  return result.rows[0];
};

// src/middleware/authmiddleware.ts
var auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return sendResponse(res, { message: "Access token is missing", error: true }, 401);
    }
    const paylode = verifyToken(token, "accessToken");
    if (!paylode) {
      return sendResponse(res, { message: "Invalid access token", error: true }, 401);
    }
    const userId = paylode.id;
    const user = await getuserById(userId);
    if (!user) {
      return sendResponse(res, { message: "User not found", error: true }, 404);
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
var authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendResponse(res, { message: "Unauthorized", error: true }, 401);
    }
    if (!roles.includes(req.user.role)) {
      return sendResponse(
        res,
        { message: "Forbidden - you don't have permission", error: true },
        403
      );
    }
    return next();
  };
};

// src/modules/issues/issues.service.ts
var issuesCreateInDb = async (issues, userId) => {
  const { title, description, type } = issues;
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
var getsingleIssueFromDB = async (issueId) => {
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
        `,
    [issueId]
  );
  const data = result.rows[0];
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
  };
};
var updateIssuessInDB = async (issueId, data, user) => {
  const { title, description, type } = data;
  const issueRes = await pool.query(
    `SELECT * FROM issues WHERE id = $1`,
    [issueId]
  );
  const existingIssue = issueRes.rows[0];
  if (!existingIssue) return null;
  if (user.role === "contributor") {
    if (existingIssue.reporter_id !== user.id || existingIssue.status !== "open") {
      throw new Error("Forbidden");
    }
  }
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
  return result.rows[0];
};
var deleteIssuesFromDB = async (issueId) => {
  const result = await pool.query(
    `
    DELETE FROM issues
WHERE id =$1
  RETURNING *;
    `,
    [issueId]
  );
  return result.rows[0];
};
var getIssuesWithParam = async (query) => {
  const { sort, type, status } = query;
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
  const values = [];
  let i = 1;
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
  if (sort === "oldest") {
    sql += ` ORDER BY i.created_at ASC`;
  } else {
    sql += ` ORDER BY i.created_at DESC`;
  }
  const result = await pool.query(sql, values);
  const rows = result.rows;
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
        role: row.reporter_role
      },
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  });
  return finalData;
};

// src/modules/issues/Issues.controller.ts
var createIssues = async (req, res) => {
  const userId = req.user.id;
  const result = await issuesCreateInDb(req.body, userId);
  if (!result) return sendResponse(res, { message: "Failed to create issues", error: true }, 400);
  sendResponse(res, { message: "Issue created successfully", data: result }, 200);
};
var getIssues = async (req, res) => {
  const result = await getIssuesWithParam(req.query);
  if (!result) return sendResponse(res, { message: "Failed to create issues", error: true }, 400);
  sendResponse(res, { message: "Issues retrieved successfully", data: result }, 200);
};
var getSingelIssue = async (req, res) => {
  const issueId = req.params.id;
  const result = await getsingleIssueFromDB(issueId);
  if (!result) return sendResponse(res, { message: "Issue not found", error: true }, 400);
  sendResponse(res, { data: result }, 200);
};
var updateIssues = async (req, res) => {
  try {
    const issueId = req.params.id;
    const data = req.body;
    const result = await updateIssuessInDB(issueId, data, req.user);
    if (!result) return sendResponse(res, { message: "Issue not found", error: true }, 400);
    sendResponse(res, { "message": "Issue updated successfully", data: result }, 200);
  } catch (error) {
    return sendResponse(res, { message: error.message, error: true }, 403);
  }
};
var deleteIssues = async (req, res) => {
  const issueId = req.params.id;
  const result = await deleteIssuesFromDB(issueId);
  if (!result) {
    sendResponse(res, { message: "Issue not found", error: true }, 400);
  }
  sendResponse(res, { message: "Issue deleted successfully" }, 200);
};

// src/modules/issues/issues.route.ts
var router2 = Router2();
router2.post("/", auth, authorizeRoles("contributor", "maintainer"), createIssues);
router2.get("/:id", getSingelIssue);
router2.get("/", getIssues);
router2.put("/:id", auth, authorizeRoles("maintainer", "contributor"), updateIssues);
router2.delete("/:id", auth, authorizeRoles("maintainer"), deleteIssues);
var issuesRouter = router2;

// src/app.ts
var app = express();
app.use(express.json());
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send("Hello world");
});
app.use("/api/auth", authRouter);
app.use("/api/issues", issuesRouter);
var app_default = app;

// src/index.ts
var main = async () => {
  initDB();
  app_default.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });
};
main();
//# sourceMappingURL=index.js.map