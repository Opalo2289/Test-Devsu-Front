import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SkeletonLoaderComponent } from './skeleton-loader.component';

describe('SkeletonLoaderComponent', () => {
  let component: SkeletonLoaderComponent;
  let fixture: ComponentFixture<SkeletonLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonLoaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render default 5 rows', () => {
    const rows = fixture.debugElement.queryAll(By.css('.skeleton-row:not(.skeleton-row--header)'));
    expect(rows.length).toBe(5);
  });

  it('should render custom number of rows', () => {
    component.rows = 10;
    fixture.detectChanges();
    
    const rows = fixture.debugElement.queryAll(By.css('.skeleton-row:not(.skeleton-row--header)'));
    expect(rows.length).toBe(10);
  });

  it('should render default 5 columns in each row', () => {
    const firstRow = fixture.debugElement.query(By.css('.skeleton-row--header'));
    const cells = firstRow.queryAll(By.css('.skeleton-cell'));
    expect(cells.length).toBe(5);
  });

  it('should render custom number of columns', () => {
    component.columns = 3;
    fixture.detectChanges();
    
    const firstRow = fixture.debugElement.query(By.css('.skeleton-row--header'));
    const cells = firstRow.queryAll(By.css('.skeleton-cell'));
    expect(cells.length).toBe(3);
  });

  it('should have avatar placeholder in first column', () => {
    const dataRows = fixture.debugElement.queryAll(By.css('.skeleton-row:not(.skeleton-row--header)'));
    const firstRow = dataRows[0];
    const avatarBox = firstRow.query(By.css('.skeleton-box--avatar'));
    expect(avatarBox).not.toBeNull();
  });

  it('should return correct arrays from getters', () => {
    component.rows = 3;
    component.columns = 4;
    
    expect(component.rowsArray.length).toBe(3);
    expect(component.columnsArray.length).toBe(4);
  });
});
