import express from "express";
import { app, httpServer } from "./websocket/ws";
import { envVariables } from "./utils/env";
import cors from "cors";

import apiRoutes from "./routes/index";
import { errorHandler } from "./middleware/error";

const PORT = envVariables.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

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
