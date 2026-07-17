import { Component, HostListener, OnDestroy } from '@angular/core';
import { environment } from 'src/environments/environment';

export interface WhatsappNumberOption {
  phoneNumber: string;
  label: string;
  active: boolean;
}

@Component({
  selector: 'app-whatsapp-float',
  templateUrl: './whatsapp-float.component.html',
  styleUrls: ['./whatsapp-float.component.css']
})
export class WhatsappFloatComponent implements OnDestroy {
  menuOpen = false;

  get isVisible(): boolean {
    return !!environment.whatsapp?.enabled && this.activeNumbers.length > 0;
  }

  get activeNumbers(): WhatsappNumberOption[] {
    const config = environment.whatsapp;
    if (!config) {
      return [];
    }

    const fromList = Array.isArray(config.numbers)
      ? config.numbers
          .filter((n) => n && n.active !== false && !!String(n.phoneNumber || '').trim())
          .map((n) => ({
            phoneNumber: String(n.phoneNumber).trim(),
            label: String(n.label || n.phoneNumber).trim(),
            active: true
          }))
      : [];

    if (fromList.length > 0) {
      return fromList;
    }

    const legacy = String(config.phoneNumber || '').trim();
    return legacy
      ? [{ phoneNumber: legacy, label: 'Support', active: true }]
      : [];
  }

  get defaultMessage(): string {
    return String(environment.whatsapp?.defaultMessage || '').trim();
  }

  trackByPhone(_index: number, item: WhatsappNumberOption): string {
    return item.phoneNumber;
  }

  ngOnDestroy(): void {
    this.menuOpen = false;
    this.syncBodyScroll();
  }

  toggleMenu(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.activeNumbers.length === 1) {
      this.openChat(this.activeNumbers[0]);
      return;
    }

    this.menuOpen = !this.menuOpen;
    this.syncBodyScroll();
  }

  closeMenu(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.menuOpen = false;
    this.syncBodyScroll();
  }

  selectNumber(event: Event, number: WhatsappNumberOption): void {
    event.preventDefault();
    event.stopPropagation();
    this.menuOpen = false;
    this.syncBodyScroll();
    this.openChat(number);
  }

  buildWhatsappUrl(phoneNumber: string): string {
    const digits = String(phoneNumber || '').replace(/\D/g, '');
    if (!digits) {
      return '';
    }

    const baseUrl = `https://wa.me/${digits}`;
    const message = this.defaultMessage;
    return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
  }

  displayNumber(phoneNumber: string): string {
    const digits = String(phoneNumber || '').replace(/\D/g, '');
    if (!digits) {
      return '';
    }
    if (digits.length > 10) {
      const local = digits.slice(-10);
      const country = digits.slice(0, -10);
      return `+${country} ${local.slice(0, 5)} ${local.slice(5)}`;
    }
    return `+${digits}`;
  }

  private openChat(number: WhatsappNumberOption): void {
    const url = this.buildWhatsappUrl(number.phoneNumber);
    if (!url) {
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (!this.menuOpen) {
      return;
    }
    this.menuOpen = false;
    this.syncBodyScroll();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.menuOpen) {
      return;
    }
    this.menuOpen = false;
    this.syncBodyScroll();
  }

  private syncBodyScroll(): void {
    if (typeof document === 'undefined') {
      return;
    }
    document.body.style.overflow = this.menuOpen ? 'hidden' : '';
  }
}
