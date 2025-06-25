import jwt, { SignOptions, Secret } from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET!; 
console.log(SECRET)

export interface JwtPayLoad {
  id: string;
  email:string;
  iat:number;
  exp:number;
}

export function signJwtToken(
  payload: string | object | Buffer,
  expiresIn: any  = '1d'
): string {
  
  return jwt.sign(payload, SECRET, { expiresIn });
}

export function verifyJwtToken(token:string){
    try {
        return jwt.verify(token,SECRET)
    } catch (error) {
        return null;
    }
}

export function decodeJwtToken(token:string){
  return jwt.decode(token) as JwtPayLoad
}