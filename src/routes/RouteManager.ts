import { Router } from "express";
import PhotoRouter from "./PhotoRouter";

const RouterManager = Router();

RouterManager.use("/photos", PhotoRouter);

export default RouterManager;
``