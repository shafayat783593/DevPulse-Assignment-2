import type { Request, Response } from "express";
import { sendResponse } from "../../utility/sendResponse";
import { createUser } from "./auth.service";


export const signup = async (req: Request, res: Response) => {
    const user = await createUser(req.body)
    if (!user) return sendResponse(res, { message: "Failed to create user", error: true }, 400);

      sendResponse(res, { message: "User registered successfully", data: user }, 200);

    
}

