import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '@/shared/types/express';

@Injectable()
export class RequireUserGuard extends JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const can = await super.canActivate(context);
    if (!can) return false;

    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (req.user.role !== 'user') {
      throw new ForbiddenException('Access denied. Registered users only.');
    }
    return true;
  }
}
