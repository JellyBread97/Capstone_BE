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
import ingredientsRouter from "./api/ingredients/index.js";

const server = express();
const port = process.env.PORT || 3001;

const whitelist = [process.env.FE_URL, process.env.FE_URL_PROD];

const corsOpts = {
  origin: (origin, corsNext) => {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      corsNext(null, true);
    } else {
      corsNext(createHttpError(400, "Current Origin is not in whitelist"));
    }
  },
};

server.use(cors(corsOpts));
server.use(express.json());

server.use("/users", usersRouter);
server.use("/recipes", recipesRouter);
server.use("/ingredients", ingredientsRouter);

server.use(badRequestHandler);
server.use(forbiddenHandler);
server.use(genericErrorHandler);
server.use(unauthorizedHandler);
server.use(notFoundHandler);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`server is running on port: ${port}`);
  });
});
