import express from "express";
import { createApp } from "../dist/index.js";

// Vercel detects Express handlers from a direct entrypoint import.
void express;

const { app } = await createApp();

export default app;
