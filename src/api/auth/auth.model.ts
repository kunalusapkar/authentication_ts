import { Request } from "express";

export interface Auth{
    activation_code: string;
    id: number;
    full_name: string;
    password: string;
    confirm_password: string;
    email:string;
    password_token:string;
}

export interface ICreateUser extends Request<any,any,Auth>{}
export interface IGetUserReq extends Request<{ id: Auth['id'] }> { }
export interface IUserLogin extends Request<any,any,Auth>{}
export interface IForgotPassword extends Request<any,any,Auth>{}
export interface IEmailConfirmation extends Request<{activation_code:Auth['activation_code']}>{}
export interface IResetPassword extends Request<{password_token:Auth['password_token']},any,Auth>{}