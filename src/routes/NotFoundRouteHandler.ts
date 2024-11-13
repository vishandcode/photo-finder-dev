import { Request, Response, NextFunction } from 'express';


export const NotFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  res.status(404).json({
    error: "Not Found",
    message: "The requested resource was not found on this server.",
  });
};
