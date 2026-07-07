import type { Response } from "express";
import { envVars } from "../config";
interface AuthTokensInfo {
  accessToken?: string;
  refreshToken?: string;
};
const isProduction= envVars.NODE_ENV === "production"
export const setAuthTokensInCookies = (
  res: Response,
  tokenInfo: AuthTokensInfo,
) => {
  if (tokenInfo.accessToken) {
    res.cookie("accessToken", tokenInfo.accessToken, {
      httpOnly: true,
       secure: isProduction,        
      sameSite: "strict", 
      maxAge:1000*60*60*24*1        
    });
  }

  if (tokenInfo.refreshToken) {
    res.cookie("refreshToken", tokenInfo.refreshToken, {
      httpOnly: true,
      secure: isProduction,        
      sameSite: "strict",  
      maxAge:1000*60*60*24*7       
    });
  }
};