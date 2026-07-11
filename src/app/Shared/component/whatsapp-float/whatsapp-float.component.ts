import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-whatsapp-float',
  templateUrl: './whatsapp-float.component.html',
  styleUrls: ['./whatsapp-float.component.css']
})
export class WhatsappFloatComponent {
  get whatsappUrl(): string {
    return this.buildWhatsappUrl();
  }

  private buildWhatsappUrl(): string {
    const config = environment.whatsapp;

    if (!config?.enabled || !config.phoneNumber) {
      return '';
    }

    const baseUrl = `https://wa.me/${config.phoneNumber}`;
    const message = config.defaultMessage?.trim();

    if (!message) {
      return baseUrl;
    }

    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }
}
