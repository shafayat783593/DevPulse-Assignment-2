import type { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utility/sendResponse";
import { verifyToken } from "../utility/tokens";
import { getuserById } from "../utility/userData";



export const auth = async(req:Request, res: Response, next: NextFunction) => {
 try {
       const token = req.headers.authorization
    if (!token) {
        return sendResponse(res, { message: "Access token is missing", error: true }, 401);

    }
    const paylode = verifyToken(token, "accessToken")
    
    console.log("paylode", paylode)
    if (!paylode) {
        return sendResponse(res, { message: "Invalid access token", error: true }, 401);

     }

     const userId  = paylode.id
     const user = await getuserById(userId)

 if (!user) {
      return sendResponse(res, { message: "User not found", error: true }, 404);
     }
     
     req.user = user

    next()

 } catch (error) {
     next(error);
 }
}