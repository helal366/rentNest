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
import { html } from "./utils/html.js";

const app: Application = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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
