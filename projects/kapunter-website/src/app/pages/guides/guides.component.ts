import { Component, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

import { BrandAwareComponent } from '../../shared/brand-aware';
import { SiteConfigService } from '../../shared/site-config.service';
import { CtaBandComponent } from '../../shared/cta-band/cta-band.component';
import { GUIDE_MODULES, GuideModule } from '../../shared/content';

type GuideLang = 'en' | 'hi' | 'kn';

@Component({
  selector: 'kw-guides',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, CtaBandComponent],
  templateUrl: './guides.component.html',
  styleUrls: ['./guides.component.css']
})
export class GuidesComponent extends BrandAwareComponent implements OnDestroy {
  @ViewChild('videoEl') videoEl?: ElementRef<HTMLVideoElement>;

  readonly modules = GUIDE_MODULES;
  readonly languages: { code: GuideLang; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'kn', label: 'ಕನ್ನಡ' }
  ];

  active: GuideModule = GUIDE_MODULES[0];
  lang: GuideLang = 'en';
  sceneIndex = 0;
  playing = false;
  videoAvailable = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly sceneMs = 4200;

  constructor(siteConfig: SiteConfigService) {
    super(siteConfig);
  }

  get scene() {
    return this.active.scenes[this.sceneIndex];
  }

  get progress(): number {
    if (!this.active.scenes.length) {
      return 0;
    }
    return ((this.sceneIndex + 1) / this.active.scenes.length) * 100;
  }

  get currentVideoSrc(): string | undefined {
    return this.active.videoSrcByLang?.[this.lang]
      || this.active.videoSrcByLang?.en
      || this.active.videoSrc;
  }

  selectModule(mod: GuideModule): void {
    this.stop();
    this.active = mod;
    this.sceneIndex = 0;
    this.videoAvailable = false;
    this.playing = false;
    this.reloadVideo();
  }

  setLang(code: GuideLang): void {
    if (this.lang === code) {
      return;
    }
    this.lang = code;
    this.playing = false;
    this.videoAvailable = false;
    this.reloadVideo();
  }

  onVideoReady(): void {
    this.videoAvailable = true;
    this.stopWalkthrough();
  }

  onVideoError(): void {
    this.videoAvailable = false;
  }

  togglePlay(): void {
    if (this.videoAvailable) {
      const el = this.videoEl?.nativeElement;
      if (!el) {
        return;
      }
      if (el.paused) {
        void el.play();
        this.playing = true;
      } else {
        el.pause();
        this.playing = false;
      }
      return;
    }

    if (this.playing) {
      this.pauseWalkthrough();
    } else {
      this.startWalkthrough();
    }
  }

  nextScene(): void {
    if (this.sceneIndex < this.active.scenes.length - 1) {
      this.sceneIndex += 1;
    } else {
      this.sceneIndex = 0;
      this.pauseWalkthrough();
    }
  }

  prevScene(): void {
    if (this.sceneIndex > 0) {
      this.sceneIndex -= 1;
    }
  }

  goToScene(index: number): void {
    this.sceneIndex = index;
  }

  onVideoPlay(): void {
    this.playing = true;
  }

  onVideoPause(): void {
    this.playing = false;
  }

  onVideoEnded(): void {
    this.playing = false;
  }

  override ngOnDestroy(): void {
    this.stop();
    super.ngOnDestroy();
  }

  private reloadVideo(): void {
    setTimeout(() => {
      const el = this.videoEl?.nativeElement;
      if (el && this.currentVideoSrc) {
        el.load();
      }
    });
  }

  private startWalkthrough(): void {
    this.playing = true;
    this.stopWalkthrough();
    this.timer = setInterval(() => this.nextScene(), this.sceneMs);
  }

  private pauseWalkthrough(): void {
    this.playing = false;
    this.stopWalkthrough();
  }

  private stopWalkthrough(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private stop(): void {
    this.pauseWalkthrough();
    const el = this.videoEl?.nativeElement;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
  }
}
