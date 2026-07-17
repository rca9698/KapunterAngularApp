import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoinsRoutingModule } from './coins-routing.module';
import { CoinsSharedModule } from './coins-shared.module';

/**
 * Lazy-loaded coin request pages under /adminaction/coins/*
 * Do NOT import this module eagerly into AdminModule (that blocks lazy routes).
 * For modals from User List, import CoinsSharedModule instead.
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CoinsSharedModule,
    CoinsRoutingModule
  ]
})
export class CoinsModule { }
