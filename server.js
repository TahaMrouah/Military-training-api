import express from "express";
import cors from "cors";
import multer from "multer";
import morgan from "morgan";
import dotenv from "dotenv";
import connect from "./dataBase/connection.js";
import router from "./routes/user.routes.js";
import bodyParser from "body-parser";
const app = express();
/**middlewares */
app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(morgan("tiny"));
app.disable("x-powered-by");
dotenv.config();
app.use(bodyParser.json({ limit: "50mb" }));
/**HTTP GET Request */

app.get("/", (req, res) => {
  res.status(201).json("Home get request");
});
/**API routes */
app.use("/api", router);

/**stat server */
connect().then(() => {
  try {
    app.listen(process.env.PORT, () => {
      console.log("Server Connected to Port " + process.env.PORT);
    });
  } catch (e) {
    console.log("Cannot Connect to the server");
  }
});
