import { execute } from "../../utils/mysql.connector";
import {authQueries} from "./auth.queries"
import {Auth} from './auth.model'
import bcrypt from 'bcryptjs'

export const getUser = async()=>{
    return execute<Auth[]>(authQueries.getUsers,[])
}

export const createUser = async(user:Auth)=>{
    var decryptPass =  await bcrypt.hash(user.password,12)
    const result = await execute<{insertId: number}>(authQueries.createUser,[
        user.full_name,
        decryptPass,
        user.email,
        0,
        user.activation_code
    ]);
    return result.insertId;
   
}

export const getSingleUser = async (id:Auth['id'])=>{
    return execute<Auth[]>(authQueries.getSingleUser,[id])
}

export const login = async()=>{

}

export const getUserPassword = async(email:Auth['email'],password:any)=>{
    const userPassword:any = await execute<Auth>(authQueries.getUserPassword,[email,password])
    const checkPassword =  await bcrypt.compare(password,userPassword[0].password)
    return checkPassword
}

export const emailCheck = async(email:Auth['email'])=>{
    const userEmailCheck = await execute<Auth[]> (authQueries.getUserEmail,email)
    return userEmailCheck
}

export const getEmailByActCod = async(activation_code:Auth['activation_code'])=>{
    const getEmail = await execute<Auth[]>(authQueries.getEmailByActCod,activation_code)
    return getEmail
}

export const confirmUser = async(id:Auth['id']) =>{
    const confirmUser = await execute<Auth[]>(authQueries.confirmUserQuery,[
        id
    ])
    return confirmUser
}


export const passwordToken = async(id:Auth['id'],password_token:Auth['password_token'])=>{

    const result = await execute<Auth[]>(authQueries.passwordResetToken,[
        password_token,
        id
    ]);
    return result;
}

export const getPassToken = async(password_token:Auth['password_token'])=>{
    const result = await execute<Auth[]>(authQueries.getIdByPwdToken,password_token)
    return result
}

export const getIdByPwt = async(password_token:Auth['password_token'])=>{
    const result = await execute<Auth[]>(authQueries.getPwtByID,password_token)
    return result
}

export const updatePasswordService = async(user:Auth)=>{
    var decryptPass =  await bcrypt.hash(user.password,12)
    const result = await execute<{affectedRows:number}>(authQueries.updatePassword,[
        decryptPass,
        user.id
    ]);
    return result;
}

export const dbPwdTokenDelService = async(id:Auth['id']) =>{
    const result = await execute<{affectedRows:number}>(authQueries.deletePasswordToken,[
        id
    ])
    return result
}
