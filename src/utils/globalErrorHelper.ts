// export class AppError extends Error {
//   statusCode: number;

//   constructor(statusCode: number, message: string,  stack = "") {
//     super(message);
//     this.statusCode = statusCode;
//     if(stack){
//         this.stack = stack;
//     }else{
//         Error.captureStackTrace(this, this.constructor)
//     }
//     Object.setPrototypeOf(this, new.target.prototype);
//   }
// }

export class AppError extends Error {
  public statusCode: number;
  public status: "fail" | "error";
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}