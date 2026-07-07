import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastrService {

  toasts: any[] = [];

  constructor() { }
  
  success(message: string | undefined) {
    console.log(message);
    this.toasts.push({ type: 'success', message });
    setTimeout(() => {
      this.toasts.pop();
  }, 3000);
  }

  warning(message: string | undefined) {
    console.log(message);
    this.toasts.push({ type: 'warning', message });
    setTimeout(() => {
      this.toasts.pop();
  }, 3000);
  }


  error(message: string | undefined) {
    console.log(message);
    this.toasts.push({ type: 'error', message });
    setTimeout(() => {
      this.toasts.pop();
  }, 3000);
  }

  remove(toast: any) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }
}
