import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [
        context.getHandler(),
        context.getClass(),
      ],
    );

    // Si la ruta no requiere roles → permitir
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    const userRole = user.role;

    const hasRole = requiredRoles.includes(userRole);

    if (!hasRole) {
      console.log('ROL DEL USUARIO:', userRole);
      throw new ForbiddenException('No tienes permisos suficientes');
    }

    return true;
  }
}