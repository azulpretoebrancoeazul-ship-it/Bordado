import express from "express";
// @ts-expect-error The Vercel build generates dist/index.js; declarations are not checked into source.
import { createApp } from "./dist/index.js";

// Vercel detects Express handlers from a direct entrypoint import.
void express;

const { app } = await createApp();

export default app;
