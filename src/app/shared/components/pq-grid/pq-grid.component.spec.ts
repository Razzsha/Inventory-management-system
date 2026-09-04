/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PqGridComponent } from './pq-grid.component';

describe('PqGridComponent', () => {
  let component: PqGridComponent;
  let fixture: ComponentFixture<PqGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PqGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PqGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
