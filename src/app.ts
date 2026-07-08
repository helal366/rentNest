import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import { envVars } from "./config";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./utils/globalErrorHandler";
import { authRouter } from "./modules/auth/auth_routes";
import { landlordRouter } from "./modules/landlord/landlord_routes";
import { propertyRouter } from "./modules/property/property_routes";
import { rentalRouter } from "./modules/rentalRequest/rental_routes";
import { categoryRouter } from "./modules/category/category_routes";
import { adminRouter } from "./modules/admin/admin_routes";
import { reviewRouter } from "./modules/review/review_routes";

const app:Application = express();
app.use(cors({
    origin: envVars.APP_URL,
    credentials: true,
}))
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())
app.get("/", (req:Request,res:Response)=>{
    res.send("This is a web site to rent a nice nest for you and your family.")
});

app.use("/api/auth", authRouter);
app.use("/api/landlord/", landlordRouter);
app.use("/api/properties", propertyRouter);
app.use("/api/rentals", rentalRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/admin", adminRouter);
app.use("/api/reviews", reviewRouter);
app.use(notFound);
app.use(globalErrorHandler);
export default app;