// import { NextFunction, Request, RequestHandler, Response } from "express";
// import { AppError } from "./globalErrorHelper";
// import { envVars } from "../config";

// export const catchAsync = (fn: RequestHandler) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       await fn(req, res, next);
//     } catch (error: Error | AppError) {
//         if(envVars.NODE_ENV==="development"){
//             console.error( "Catch Async error: ", error)
//         }
//       next(error);
//     }
//   };
// };

import type { NextFunction, Request, Response } from "express";
import { AppError } from "./globalErrorHelper";
import { envVars } from "../config";
type AsyncHandler = (req:Request, res:Response, next:NextFunction) => Promise<void>

export const catchAsync = (fn:AsyncHandler)=>{
    return (req:Request, res:Response, next:NextFunction)=>{
        Promise.resolve(fn(req, res, next)).catch((error:Error | AppError)=>{
            if(envVars.NODE_ENV==="development"){
                console.log( "Catch Async error: ", error)
            }
            next(error)
        })
    }
}