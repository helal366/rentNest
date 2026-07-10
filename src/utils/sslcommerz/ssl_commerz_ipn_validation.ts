import axios from "axios";
import { AppError } from "../globalErrorHelper.js";
import { StatusCodes } from "http-status-codes";

export const validateSslPayment = async (valId: string): Promise<any> => {
  // Use environment variables for your store credentials
  const storeId = process.env.STORE_ID;
  const storePassword = process.env.STORE_PASSWORD;
  
  // Toggle between Sandbox and Live URL based on environment
  const isSandbox = process.env.NODE_ENV !== "production";
  const baseUrl = isSandbox 
    ? "https://sslcommerz.com" 
    : "https://sslcommerz.com";

  const validationUrl = `${baseUrl}/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${storeId}&store_pass=${storePassword}&format=json`;

  try {
    const response = await axios.get(validationUrl);
    return response.data;
  } catch (error) {
    throw new AppError("SSLCommerz validation server unreachable", StatusCodes.BAD_GATEWAY);
  }
};
