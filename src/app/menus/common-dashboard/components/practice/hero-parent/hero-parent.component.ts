import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-hero-parent',
  templateUrl: './hero-parent.component.html',
  styleUrls: ['./hero-parent.component.css']
})
export class HeroParentComponent  {

  heroName: string = 'razz';

  selectedHero: string = '';

  changeHero() {
    this.heroName = 'sha';
  }

  onHeroSelected(hero: string) {
    this.selectedHero = hero;
  }

}
