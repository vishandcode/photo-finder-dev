import express from "express";
import { ConnectWithMongoDB } from "./essentials/ConnectWithMongoDB";
import Logger from "./middlewares/Logger";
import RouterManager from "./routes/RouteManager";
import cors from "cors";

const app = express();
const port = process.env.PORT || 4000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow specific HTTP methods
  })
);

app.use(express.json());
app.use(Logger());
app.use(RouterManager);

app.listen(port, async () => {
  await ConnectWithMongoDB();
});
