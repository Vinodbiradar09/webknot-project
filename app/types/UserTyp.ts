export interface UserSignupTyp {
    name : string,
    email : string,
    usn : string,
    branch : string,
    password : string,
}

export interface OTPCodeForAdmin {
    admin_id : string,
    verifyCode : string,
}

export interface OTPCodeForStudent {
    usn : string,
    verifyCode : string,
}