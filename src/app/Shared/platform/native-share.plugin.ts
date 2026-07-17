import { registerPlugin } from '@capacitor/core';

export interface NativeShareOptions {
  title?: string;
  text?: string;
  url?: string;
  dialogTitle?: string;
}

export interface NativeSharePlugin {
  share(options: NativeShareOptions): Promise<void>;
}

export const NativeShare = registerPlugin<NativeSharePlugin>('NativeShare', {
  web: () => ({
    async share() {
      /* web uses navigator.share / chooser sheet */
    },
  }),
});
