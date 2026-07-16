import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KapunterLoaderComponent } from './kapunter-loader.component';
import { GlobalLoaderComponent } from './global-loader.component';
import { BrandModule } from '../brand/brand.module';

@NgModule({
  declarations: [KapunterLoaderComponent, GlobalLoaderComponent],
  imports: [CommonModule, BrandModule],
  exports: [KapunterLoaderComponent, GlobalLoaderComponent],
})
export class LoaderModule {}
