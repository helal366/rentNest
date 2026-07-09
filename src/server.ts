import app from "./app";
import { envVars } from "./config";
import { prisma } from "./lib/prisma";

async function connectDB() {
  try {
    await prisma.$connect();
    console.log("Connected to the database successfully.");
  } catch (error) {
    console.error("Error starting server:", error);
  }
}
connectDB();

if (envVars.NODE_ENV !== "production") {
    const PORT = envVars.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on("error", (err) => {
    console.error("Server failed to start:", err);
  });
}


export default app;

// if (process.env.NODE_ENV !== "production") {
//   try {
//     app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//     });
//   } catch (error) {
//     console.error("Error starting server:", error);
//     prisma.$disconnect();
//     process.exit(1);
//   }
// }