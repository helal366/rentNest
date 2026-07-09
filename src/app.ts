import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import { envVars } from "./config/index.js";
import { notFound } from "./middlewares/notFound.js";
import { globalErrorHandler } from "./utils/globalErrorHandler.js";
import { authRouter } from "./modules/auth/auth_routes.js";
import { landlordRouter } from "./modules/landlord/landlord_routes.js";
import { propertyRouter } from "./modules/property/property_routes.js";
import { rentalRouter } from "./modules/rentalRequest/rental_routes.js";
import { categoryRouter } from "./modules/category/category_routes.js";
import { adminRouter } from "./modules/admin/admin_routes.js";
import { reviewRouter } from "./modules/review/review_routes.js";
import { paymentRouter } from "./modules/payment/payment_routes.js";

const app: Application = express();
app.use(
  cors({
    origin: envVars.APP_LOCAL_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const html = `<html>
      <head>
        <title>rentNest</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-200">
        <div class="my-10 p-10 max-w-xl mx-auto text-center bg-gray-100 shadow-2xl shadow-[#98CD0090] rounded">
          <h1 class="text-3xl font-bold text-teal-600 mb-4">rentNest</h1>
          <p class="text-lg text-gray-800 mb-2">🍽️ Welcome to rentNest!</p>
          <p class="text-lg text-gray-800 mb-2">🍲 Find your sweet home!</p>
          <p class="text-lg text-gray-700 mb-2">🍽️ Explore for your dignity. Search Office, Shop or others.!</p>
        </div>
      </body>
    </html>`
app.get("/", (req: Request, res: Response) => {
  res.send(html);
});

app.use("/api/auth", authRouter);
app.use("/api/landlord/", landlordRouter);
app.use("/api/properties", propertyRouter);
app.use("/api/rentals", rentalRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/admin", adminRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/payments", paymentRouter);
app.use(notFound);
app.use(globalErrorHandler);
export default app;
