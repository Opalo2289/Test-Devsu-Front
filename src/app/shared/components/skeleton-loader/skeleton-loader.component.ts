import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-loader.component.html',
  styleUrl: './skeleton-loader.component.scss'
})
export class SkeletonLoaderComponent {
  @Input() rows = 5;
  @Input() columns = 5;
  
  get rowsArray(): number[] {
    return Array(this.rows).fill(0);
  }
  
  get columnsArray(): number[] {
    return Array(this.columns).fill(0);
  }
}
