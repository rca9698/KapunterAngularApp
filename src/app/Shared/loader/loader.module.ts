import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KapunterLoaderComponent } from './kapunter-loader.component';
import { GlobalLoaderComponent } from './global-loader.component';

@NgModule({
  declarations: [KapunterLoaderComponent, GlobalLoaderComponent],
  imports: [CommonModule],
  exports: [KapunterLoaderComponent, GlobalLoaderComponent],
})
export class LoaderModule {}
