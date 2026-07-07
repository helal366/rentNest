import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const createToken=(jwtPayload:JwtPayload, jwtSecret:string, jwtExpiresIn:SignOptions)=>{
    const accessOrRefreshToekn=jwt.sign(jwtPayload, jwtSecret, {
        expiresIn: jwtExpiresIn 
    } as SignOptions)
    
    return accessOrRefreshToekn
}

const verifyToken=(token:string, jwtSecret:string)=>{
    try {
        const decoded=jwt.verify(token, jwtSecret)      
        return { 
            success: true,
            data:decoded 
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Token verification failed"
        };
    }
}
export const jwtTokens = {
    createToken,
    verifyToken
}