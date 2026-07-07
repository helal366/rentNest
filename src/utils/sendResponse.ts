import { Response } from "express";

interface IMeta {
  page?: number;
  limit?: number;
  total?: number;
}
interface IResponseData<T> {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: T;
  meta?:IMeta;
  error?: string;
}
export const sendResponse = <T>(res: Response, data: IResponseData<T>) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    statusCode: data.statusCode,
    data: data.data,
    meta: data.meta,
    error: data.error,
  });
};