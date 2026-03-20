import { app } from "./app.js";
import { connectDB } from "../src/config/db.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 4000, () => {
      console.log(`⚙️ Server is running at PORT: ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection failed!! ", error.message);
  });
