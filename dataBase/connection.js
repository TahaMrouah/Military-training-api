import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
async function connect() {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log(` DataBase Connected`);
    })
    .catch((err) => console.log(`${err} did not connect`));
}
export default connect;
