import express from "express";
import { createApp } from "../server/_core/index";

// Vercel detects Express handlers from a direct entrypoint import.
void express;

const { app } = await createApp();

export default app;
