import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-hero-child',
  templateUrl: './hero-child.component.html',
  styleUrls: ['./hero-child.component.css'],
})
export class HeroChildComponent {
  @Input() heroName: string = '';

  @Output() heroSelected = new EventEmitter<string>();

  selectedHero() {
    this.heroSelected.emit(this.heroName);
  }
}
