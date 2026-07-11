import axios from "axios";
import { AppError } from "../globalErrorHelper.js";
import { StatusCodes } from "http-status-codes";
import { envVars } from "../../config/index.js";

export const validateSslPayment = async (valId: string): Promise<any> => {
  // Use environment variables for your store credentials
  const storeId = envVars.SSL_COMMERZ_STORE_ID;
  const storePassword = envVars.SSL_COMMERZ_STORE_PASSWORD;

  // Toggle between Sandbox and Live URL based on environment
  // const isSandbox = process.env.NODE_ENV !== "production";

  const baseUrl = envVars.VALIDATION_IPN_URL;

  const validationUrl = `${baseUrl}?val_id=${valId}&store_id=${storeId}&store_passwd=${storePassword}&format=json`;

  try {
    const response = await axios.get(validationUrl);
    // console.log("ipn response data: ",response.data )
    return response.data;
  } catch (error) {
    throw new AppError(
      "SSLCommerz validation server unreachable",
      StatusCodes.BAD_GATEWAY,
    );
  }
};
