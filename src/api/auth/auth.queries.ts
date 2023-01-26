export const authQueries = {
    getUsers:`SELECT * from users`,
    createUser:`INSERT INTO users
    (full_name, password,email,email_confirmation,activation_code)VALUES(?,?,?,?,?);`,
    getSingleUser:`SELECT * from users where id=?`,
    getUserPassword:`SELECT password from users where email=?`,
    getUserEmail:`SELECT id,email,full_name from users where email=?`,
    getEmailByActCod:`SELECT id from users where activation_code=?`,
    confirmUserQuery:`UPDATE users SET email_confirmation = 1 where id=?`,
    passwordResetToken:`UPDATE users SET password_token = ? where id=?`,
    getIdByPwdToken:`SELECT id from users where password_token=?`,
    getPwtByID:`SELECT id,email from users where password_token=?`,
    updatePassword:`UPDATE users SET password = ? where id=?`,
    deletePasswordToken:`UPDATE users SET password_token = null where id=?`
}
