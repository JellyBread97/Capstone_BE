import express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import mongoose from "mongoose";
import {
  badRequestHandler,
  forbiddenHandler,
  genericErrorHandler,
  unauthorizedHandler,
  notFoundHandler,
} from "./errorHandlers.js";
import usersRouter from "./api/users/index.js";
import recipesRouter from "./api/recipes/index.js";

const server = express();
const port = 3001;

server.use(cors("http://localhost:3000/"));
server.use(express.json());
server.use("/users", usersRouter);
server.use("/recipes", recipesRouter);

server.use(badRequestHandler);
server.use(forbiddenHandler);
server.use(genericErrorHandler);
server.use(unauthorizedHandler);
server.use(notFoundHandler);

mongoose.connect(
  "mongodb+srv://test:ar4LR2yg0ZRq0tW2@cluster0.ltge7tv.mongodb.net/liquidlibrary?retryWrites=true&w=majority"
);

mongoose.connection.on("connected", () => {
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`server is running on port: ${port}`);
  });
});
