import express from "express";
import { app, httpServer } from "./websocket/ws";
import { envVariables } from "./utils/env";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRoutes from "./routes/index";
import { errorHandler } from "./middleware/error";
import session from "express-session";

const PORT = envVariables.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: envVariables.COOKIE_SECRET || "COOKIE_SECRET",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
    },
  })
);
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.get("/health", (req, res) => {
  return res.json({
    upTime: process.uptime(),
  });
});

app.use("/api/v1", apiRoutes);

app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`server started working on ${PORT}`);
});
