import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);    // agar /register hit hoga tab registerUser method call ho jayega
export default router;
