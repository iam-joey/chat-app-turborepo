import express, { Request, Response } from "express";
import http from "http";
import { WebSocket, WebSocketServer } from "ws";
import { WebSocketManager } from "../wsManagerr/wsmanager";

const app = express();

const httpServer = http.createServer(app);
const wss = new WebSocketServer({ server: httpServer });
const manager = WebSocketManager.getInstance();

wss.on("connection", async (ws: WebSocket, req: Request) => {
  try {
    const urlString = req.url;
    const urlObject = new URL(urlString, `http://${req.headers.host}`);
    const jwtToken = urlObject.searchParams.get("token");
    // if (!jwtToken) {
    //   throw new Error("You can't join the room")
    // }
    //note we will get userId from the token
    manager.manageUser(ws);
  } catch (error: any) {
    console.error("WebSocket connection error:", error.message);
    ws.send(JSON.stringify({ name: error.name, error: error.message }));
    ws.close();
  }
});

export { app, httpServer, wss };
