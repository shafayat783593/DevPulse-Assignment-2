import {  Router, type Request, type Response } from "express";
import { auth, authorizeRoles } from "../../middleware/authmiddleware";
import { createIssues } from "./Issues.controller";



const router = Router()
router.post("/",auth, authorizeRoles("contributor", "maintainer"), createIssues)

export const issuesRouter = router