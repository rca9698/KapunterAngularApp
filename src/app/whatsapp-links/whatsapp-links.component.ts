import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

interface WhatsappLink {
  phoneNumber: string;
  label: string;
}

@Component({
  selector: 'app-whatsapp-links',
  templateUrl: './whatsapp-links.component.html',
  styleUrls: ['./whatsapp-links.component.css']
})
export class WhatsappLinksComponent {
  readonly links: WhatsappLink[] = this.getConfiguredLinks();
  copied = false;

  get defaultMessage(): string {
    return String(environment.whatsapp?.defaultMessage || '').trim();
  }

  buildWhatsappUrl(phoneNumber: string): string {
    const digits = String(phoneNumber || '').replace(/\D/g, '');
    const baseUrl = `https://wa.me/${digits}`;
    return this.defaultMessage
      ? `${baseUrl}?text=${encodeURIComponent(this.defaultMessage)}`
      : baseUrl;
  }

  displayNumber(phoneNumber: string): string {
    const digits = String(phoneNumber || '').replace(/\D/g, '');
    if (digits.length > 10) {
      const countryCode = digits.slice(0, -10);
      const localNumber = digits.slice(-10);
      return `+${countryCode} ${localNumber.slice(0, 5)} ${localNumber.slice(5)}`;
    }
    return digits ? `+${digits}` : '';
  }

  trackByPhone(_index: number, link: WhatsappLink): string {
    return link.phoneNumber;
  }

  async sharePage(): Promise<void> {
    const shareData = {
      title: 'Contact Kapunter',
      text: 'Choose a Kapunter WhatsApp contact.',
      url: window.location.href
    };

    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    this.copied = true;
    window.setTimeout(() => this.copied = false, 2000);
  }

  private getConfiguredLinks(): WhatsappLink[] {
    const config = environment.whatsapp;
    if (!config) {
      return [];
    }

    const configuredNumbers = Array.isArray(config.numbers)
      ? config.numbers
          .filter((item) => item?.active !== false && !!String(item?.phoneNumber || '').trim())
          .map((item) => ({
            phoneNumber: String(item.phoneNumber).trim(),
            label: String(item.label || item.phoneNumber).trim()
          }))
      : [];

    if (configuredNumbers.length > 0) {
      return configuredNumbers;
    }

    const fallbackNumber = String(config.phoneNumber || '').trim();
    return fallbackNumber
      ? [{ phoneNumber: fallbackNumber, label: 'Kapunter Support' }]
      : [];
  }
}
