import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SingleClickDirective } from './single-click.directive';

@NgModule({
  declarations: [SingleClickDirective],
  imports: [CommonModule],
  exports: [SingleClickDirective],
})
export class SingleClickModule {}
