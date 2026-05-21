import cookieParser from "cookie-parser";


import express, { type Application, type Request, type Response } from "express"
import { authRouter } from "./modules/auth/auth.route";
 
const app: Application = express();
app.use(express.json());
app.use(cookieParser());
app.get("/", (req: Request, res: Response) => {
  res.send("Hello world");
});

app.use("/api/auth", authRouter)


export default app