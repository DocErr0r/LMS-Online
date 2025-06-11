import { NextFunction, Request, Response } from "express";

export const asyncHandler = (fun:any)=>(req:Request,res:Response,next:NextFunction)=>{
    Promise.resolve(fun(req,res,next)).catch(next);
}