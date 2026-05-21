import {  Router, type Request, type Response } from "express";
import { auth } from "../../middleware/authmiddleware";



const router = Router()


export const issuesRouter = router