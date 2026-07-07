import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class HasRoleGuard implements CanActivate {

  constructor(private authservice: AuthService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean | UrlTree {
    const requiredRole = route.data['role'] as string;

    if (this.authservice.isLoggedIn && this.authservice.hasRole(requiredRole)) {
      return true;
    }

    return this.router.createUrlTree(['/']);
  }

}
