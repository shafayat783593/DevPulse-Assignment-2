import type { Request, Response } from "express";
import { issuesCreateInDb } from "./issues.service";
import { sendResponse } from "../../utility/sendResponse";


export const createIssues = async (req: Request, res: Response) => {
    const userId = req.user.id
    const result = await issuesCreateInDb(req.body, userId)

    if (!result) return sendResponse(res, { message: "Failed to create issues", error: true }, 400);

    sendResponse(res, { message: "Issue created successfully", data: result }, 200);
}


// const result = await issuesCreateInDb(req.body)
