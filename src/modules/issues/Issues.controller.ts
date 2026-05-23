import type { Request, Response } from "express";
import { deleteIssuesFromDB, getIssuesWithParam, getsingleIssueFromDB, issuesCreateInDb, updateIssuessInDB } from "./issues.service";
import { sendResponse } from "../../utility/sendResponse";


export const createIssues = async (req: Request, res: Response) => {
    const userId = req.user.id
    const result = await issuesCreateInDb(req.body, userId)

    if (!result) return sendResponse(res, { message: "Failed to create issues", error: true }, 400);

    sendResponse(res, { message: "Issue created successfully", data: result }, 200);
}


export const getIssues = async (req: Request, res: Response) => {
    const result = await getIssuesWithParam(req.query)
    if (!result) return sendResponse(res, { message: "Failed to create issues", error: true }, 400);  
        

    sendResponse(res, { message: "Issues retrieved successfully", data: result }, 200);
}

export const getSingelIssue = async (req: Request, res: Response) => {
    const issueId = req.params.id as string;
    const result = await getsingleIssueFromDB(issueId)
    if (!result) return sendResponse(res, { message: "Issue not found", error: true }, 400);
    sendResponse(res, {"message":"Issue retrived successfully", data: result }, 200);

}

export const updateIssues = async (req: Request, res: Response) => {
    try {
        const issueId = req.params.id as string;
    const data = req.body
    const result = await updateIssuessInDB(issueId, data, req.user)
    if (!result) return sendResponse(res, { message: "Issue not found", error: true }, 400);
    sendResponse(res, { "message": "Issue updated successfully", data: result }, 200);
    } catch (error:any) {
        return sendResponse(res,{message:error.message,error:true},403)
    }
}


export const deleteIssues = async (req: Request, res: Response) => {
    const issueId = req.params.id as string
    const result = await deleteIssuesFromDB(issueId)
    if (!result) {
        sendResponse(res,{message:"Issue not found",error:true},400)
    }
    sendResponse(res,{message:"Issue deleted successfully"},200)
}