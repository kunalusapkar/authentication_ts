import { AppError } from "./app.error";
import { Response,Request,NextFunction } from "express";

const handleSyntaxErrDB = (err: any[]) =>{
  return new AppError("Syntax error in sql",400)
}

const sendErrDev = (err:any, res:Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    err: err,
    stack: err.stack
  });
  };

  const sendErrProd = (err:any, res:Response) => {
    // opeartional trusted error message send to client
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
      // Unknown error no details send to be client
    } else {
      // lofg the error
      console.error("ERR ", err);
      res.status(500).json({
        status: "error",
        message: "Something went wrong"
      });
    }
  };

export = (err:any,req:Request,res:Response,next:NextFunction)=>{
  if (process.env.NODE_ENV === "DEVELOPMENT") {
    if(err.code == 'ER_PARSE_ERROR')err = handleSyntaxErrDB(err)
    sendErrDev(err, res);
  } else if (process.env.NODE_ENV === "PRODUCTION") {
    // destructuring
    // let error = {
    //   ...err
    // };
    sendErrProd(err, res);
  }

}

