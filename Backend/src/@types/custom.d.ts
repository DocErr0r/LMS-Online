import { Request } from "express";
import { IUser } from "../Models/UserModal";

declare global{
    namespace Express{
        interface Request{
            user:IUser;
        }
    }
}