import express from "express";

import * as user from "../controllers/user-controller";
import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/signUp", user.signUp);
router.post("/login", user.loginUser);
router.post("/generateRoom", auth, user.generateURL);

export default router;
