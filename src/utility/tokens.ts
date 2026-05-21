import { config } from "../config"
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Ruser } from "../types/types";


export const verifyToken = (token: string, type: "accessToken" | "refreshToken") => {
    const sectreteToken = type === "accessToken" ? config.access_secret : config.refresh_secret
    const decoded = jwt.verify(token, sectreteToken) as JwtPayload;
    return decoded

}


export const tokens = (payload:Ruser) => {
    console.log("palode",payload)
    const accessToken = jwt.sign(payload ,config.access_secret, {expiresIn: "7d",})
    const refreshToken = jwt.sign(payload, config.refresh_secret, { expiresIn: "15d", })
    return { accessToken,refreshToken}
}