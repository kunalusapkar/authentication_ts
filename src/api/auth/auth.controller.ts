import {RequestHandler,Request,Response, NextFunction} from "express";
import * as userService from './auth.service'
import { ICreateUser, IEmailConfirmation, IForgotPassword, IResetPassword, IUserLogin } from "./auth.model";
import {authQueries} from "./auth.queries"
import jwt from "jsonwebtoken";
import * as promisify from "ts-promisify";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { AppError } from "../../utils/app.error";
import { Email } from "../../utils/email"
import crypto from "crypto";



const catchAsyncError = (fn: (arg0: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, arg1: Response<any, Record<string, any>>, arg2: NextFunction) => Promise<any>) => {
  return (req:Request, res:Response, next:NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

const signToken = (id:number) =>{
  return jwt.sign({
    id
  },
  process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  }
  )
}

// send token
const createSendToken = (user:any[], statusCode:number, res:Response) => {
  const token = signToken(user[0].id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + 90 * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  // if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  res.status(statusCode).json({
    status: "success",
    data: {
      token,
      user
    }
  });
};





export const getUsers:RequestHandler = catchAsyncError(async(req:Request,res:Response)=>{
      const user = await userService.getUser()
        res.status(200).json({
            user
        })
    
})



export const createUser:RequestHandler = catchAsyncError(async(req:ICreateUser,res:Response,next:NextFunction)=>{
        if(req.body.password !== req.body.confirm_password){
          return next(new AppError("Password doesnot match",401))
        }
        
        const checkEmailPresent = await userService.emailCheck(req.body.email)
        if(checkEmailPresent.length > 0){
          return next(new AppError("Email already present",409))
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
          // const hashEmailActCode = crypto.createHash('sha256').update(req.body.email).digest('hex');
          req.body.activation_code = passwordResetToken
          const result = await userService.createUser(req.body)
          const userData = await userService.getSingleUser(result)
          const token = signToken(userData[0].id)
          const confirmMailLink = `${req.protocol}://${req.get('host')}/api/users/email_confirmation/${resetToken}`
          // const welcomeMessage = `Welcome ${userData[0].full_name}.Please confirm your email ${confirmMailLink}`
         try{
          // await sendEmail({
          //   email:userData[0].email,
          //   subject:"Welcome to API",
          //   message:welcomeMessage
          // })
          // await new Email(userData,url).sendWelcome()
          await new Email(userData,confirmMailLink).userConfirmation()
          res.status(200).json({
            user:{
            full_name:userData[0].full_name,
            user_email: userData[0].email,
            user_token:token
            },
          })
          }catch(error){
            return next(new AppError("Something went wrong in email",500))
          }
        
  
})


export const login:RequestHandler = catchAsyncError(async(req:IUserLogin,res:Response,next:any)=>{
    const {email,password} = req.body
    if (!email || !password) {
      return next(new AppError('Please provide an email and password', 400));
  }
    const userEmailCheck = await userService.emailCheck(email)
    if((userEmailCheck.length) <= 0){
      return next(new AppError('Wrong email or password', 401));
    }
    // fetch password
    const userPassword = await userService.getUserPassword(email,password)
   

    if(!userPassword){
      return next(new AppError('Wrong email or password', 401));
    }
    if(userEmailCheck.length > 0){
      createSendToken(userEmailCheck, 200, res);
    }
    

  
})

export const protectRoutes:RequestHandler = async(req:Request,res:Response,next:NextFunction)=>{
  
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if(!token){
      return next(new AppError('You are not logged in ! Please login to access', 401));
    }
      // verify the token
  const decoded:any = await promisify.generic(jwt.verify)(token, process.env.JWT_SECRET);
    const currentuser = await userService.getSingleUser(decoded[1].id)
    if(currentuser.length  == 0){
      return next(new AppError('User doesnot exists', 401));
    }
    next()
}

export const post:RequestHandler = async(req:Request,res:Response)=>{
  try{
    res.status(200).json({
      message:"Login working"
    })
  }catch(error){
    console.error('[teams.controller][addTeam][Error] ', typeof error === 'object' ? JSON.stringify(error) : error);
      res.status(500).json({
      message: 'There was an error when adding new team'
    });
  }
}

export const confirmUser:RequestHandler = catchAsyncError(async(req:IEmailConfirmation,res:Response,next:NextFunction)=>{
  const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.activation_code)
        .digest('hex');
  const getEmailId = await userService.getEmailByActCod(hashedToken)
  if(getEmailId.length <= 0){
    return next(new AppError("Something went wrong in email",510))
  }
  const confrimUser = await userService.confirmUser(getEmailId[0].id)
  res.redirect("http://localhost:3000")
  // res.status(200).json({confrimUser});
})

export const forgotPassword:RequestHandler = catchAsyncError(async(req:IForgotPassword,res:Response,next:NextFunction)=>{
  const userEmailBody = req.body.email
  if(!userEmailBody){
    return next(new AppError('Please provide an email', 400));
  }
  
  const userEmail = await userService.emailCheck(req.body.email)
  if(userEmail.length <= 0){
    return next(new AppError('No email id present', 401));
  }
  const resetToken = crypto.randomBytes(32).toString('hex');
  const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const insertPassResetToken = await userService.passwordToken(userEmail[0].id,passwordResetToken)
  const passwordResetLink = `${req.protocol}://${req.get('host')}/api/users/reset_password/${resetToken}`
  await new Email(userEmail,passwordResetLink).sendResetPasswordLink()

  // await new Email(userData,confirmMailLink).userConfirmation()
  res.status(200).json({
    status:"success",
    message:"Please check your email"
  })
}) 

export const resetPassword:RequestHandler = catchAsyncError(async(req:IResetPassword,res:Response,next:NextFunction)=>{
  const {password,confirm_password} = req.body
  if(password !== confirm_password){
    return next(new AppError("Password doesnot match",401))
  }
  const hashedToken = crypto
  .createHash('sha256')
  .update(req.params.password_token)
  .digest('hex');
  const getPasswordToken = await userService.getIdByPwt(hashedToken)
  if(getPasswordToken.length <= 0){
    return next(new AppError('Wrong email', 401));
  }
  req.body.id = getPasswordToken[0].id
  const updatePassword = await userService.updatePasswordService(req.body)
  if(updatePassword.affectedRows == 1){
    const dbPwdTokenDel = await userService.dbPwdTokenDelService(req.body.id)
  }
  // if(updatePassword)
  res.status(200).json({
    "status":"success",
    "message":"Password updated successfully"
  })
})


export const userData:RequestHandler = catchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
  let token
  // const decoded:any = await promisify.generic(jwt.verify)(req.headers.token, process.env.JWT_SECRET);
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
}
if(!token){
  return next(new AppError('You are not logged in ! Please login to access', 401));
}
  // verify the token
const decoded:any = await promisify.generic(jwt.verify)(token, process.env.JWT_SECRET);
const currentUser = await userService.getSingleUser(decoded[1].id)
  // const currentUser = await userService.getSingleUser(decoded[1].id)
  if (!currentUser) {
    return next(new AppError('User doesnot exists', 401));
  }
  res.status(200).json({
    currentUser
  })

})