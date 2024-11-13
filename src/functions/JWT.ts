import jwt from "jsonwebtoken";

export async function VerifyToken(token: string) {
  try {
    var decoded = await jwt.verify(token, process.env.JWT_SECRET as string);

    return decoded;
  } catch (error: any) {
    return error.message;
  }
}

export async function CreateToken(payload: object, expiry: string) {
  try {
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: expiry,
    });
    return token;
  } catch (error) {
    return error;
  }
}
