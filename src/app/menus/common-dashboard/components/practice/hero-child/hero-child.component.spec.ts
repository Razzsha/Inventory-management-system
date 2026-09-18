/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { HeroChildComponent } from './hero-child.component';

describe('HeroChildComponent', () => {
  let component: HeroChildComponent;
  let fixture: ComponentFixture<HeroChildComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeroChildComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeroChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
