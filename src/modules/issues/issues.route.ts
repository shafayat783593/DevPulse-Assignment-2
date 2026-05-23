import {  Router, type Request, type Response } from "express";
import { auth, authorizeRoles } from "../../middleware/authmiddleware";
import { createIssues, deleteIssues, getIssues, getSingelIssue, updateIssues } from "./Issues.controller";



const router = Router()
router.post("/", auth, authorizeRoles("contributor", "maintainer"), createIssues)
router.get("/:id", getSingelIssue)
router.get("/", getIssues);
router.put("/:id", auth, authorizeRoles("maintainer", "contributor"), updateIssues)
router.delete("/:id",auth,authorizeRoles("maintainer"),deleteIssues)

export const issuesRouter = router