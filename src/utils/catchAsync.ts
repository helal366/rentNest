import type { NextFunction, Request, Response } from "express";
import { AppError } from "./globalErrorHelper.js";
import { envVars } from "../config/index.js";
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