import {  Router, type Request, type Response } from "express";
import { auth, authorizeRoles } from "../../middleware/authmiddleware";
import { createIssues, getSingelIssue } from "./Issues.controller";



const router = Router()
router.post("/", auth, authorizeRoles("contributor", "maintainer"), createIssues)
router.get("/:id", getSingelIssue)

export const issuesRouter = router