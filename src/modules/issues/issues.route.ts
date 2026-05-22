import {  Router, type Request, type Response } from "express";
import { auth, authorizeRoles } from "../../middleware/authmiddleware";
import { createIssues, getSingelIssue, updateIssues } from "./Issues.controller";



const router = Router()
router.post("/", auth, authorizeRoles("contributor", "maintainer"), createIssues)
router.get("/:id", getSingelIssue)
router.put("/:id",auth,authorizeRoles("maintainer","contributor"), updateIssues)

export const issuesRouter = router