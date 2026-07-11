import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const VERSION_RE = /application\/vnd\.portfolio\.v(\d+)\+json/;

@Injectable()
export class ApiVersionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ApiVersionMiddleware.name);

  use(req: Request, _res: Response, next: NextFunction) {
    const accept = req.headers.accept || '';
    const match = accept.match(VERSION_RE);
    const version = match ? parseInt(match[1], 10) : 1;
    (req as any).apiVersion = version;
    next();
  }
}
