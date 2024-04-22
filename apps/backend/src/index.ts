import express from "express";
import { app, httpServer } from "./websocket/ws";
import { envVariables } from "./utils/env";

const PORT = envVariables.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  return res.json({
    upTime: process.uptime(),
  });
});

httpServer.listen(PORT, () => {
  console.log(`server started working on ${PORT}`);
});
