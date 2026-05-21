import type { Request, Response } from "express";
import { sendResponse } from "../../utility/sendResponse";
import { checkUser, createUser } from "./auth.service";
import { tokens } from "../../utility/tokens";


export const signup = async (req: Request, res: Response) => {
  const user = await createUser(req.body)
  if (!user) return sendResponse(res, { message: "Failed to create user", error: true }, 400);

  sendResponse(res, { message: "User registered successfully", data: user }, 200);


}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body
console.log(email,password)
 const user = await checkUser(email, password)
  
  if (!user) return sendResponse(res, { message: "Failed to create user", error: true }, 400);


  const payload = {
    id: user.id,
    name: user.name,
    role: user.role,
  };

  const { refreshToken, accessToken: token } = tokens(payload);

  res.cookie("refreshToken", refreshToken, {
    secure: false,
    httpOnly: true,
    sameSite: "lax",
  })
  res.cookie("accessToken", token, {
    secure: false,
    httpOnly: true,
    sameSite: "lax",
  })
  const result = {
    token,
    user
  }
  sendResponse(res, { message: "Login successful", data: result }, 200);
}