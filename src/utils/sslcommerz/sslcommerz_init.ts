import { envVars } from "../../config/index.js";
import { v4 as uuidv4 } from 'uuid';
import { findData } from "./findData.js";
import SSLCommerzPayment from "sslcommerz-lts";

export const sslCommerzInit=async(rentalRequestId: string)=>{
  const {rentalRequest, property, tenant, category}=  await findData(rentalRequestId)
  const currentURL= envVars.NODE_ENV==="development"? envVars.APP_LOCAL_URL:envVars.VERCEL_URL;
  const store_id = envVars.SSL_COMMERZ_Store_ID;
  const store_passwd = envVars.SSL_COMMERZ_Store_Password;
  const isLive = envVars.NODE_ENV === "production"; 
  const transactionId = `TXN-${uuidv4().substring(0, 8).toUpperCase()}`;
  const initiate = {
    store_id,
    store_passwd,
    total_amount: property.rentPrice,
    currency: "BDT",
    tran_id:transactionId, // use unique tran_id for each api call
    success_url: `${currentURL}/api/payments/success?tranId=${transactionId}`, // Added tracking query parameters
    fail_url: `${currentURL}/api/payments/fail?tranId=${transactionId}`,
    cancel_url: `${currentURL}/api/payments/cancel?tranId=${transactionId}`,
    ipn_url: `${currentURL}/ipn-success-payment`,
     shipping_method: "NO",
    product_name: `${category.name} Rental`,
    product_category: `${category.name}`,
    product_profile: "general",
    cus_name: `${tenant.name}`,
    cus_email: `${tenant.email}`,
    cus_add1: "Dhaka",
     cus_city: "Dhaka",
    cus_state: "Dhaka",
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    cus_phone: tenant.contactNo || "01700000000",

    // CRITICAL: Pass your relations through SSLCommerz variables
    value_a: rentalRequestId,
    value_b: rentalRequest.tenantId,
    value_c: rentalRequest.landlordId
  };
  const sslcz = new SSLCommerzPayment(store_id, store_passwd, isLive);
  const apiResponse = await sslcz.init(initiate);
  return {apiResponse, transactionId}
}