import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FavoritesService } from '../../core/services/favorites.service';
import { BookCardComponent } from '../shared/book-card/book-card.component';
import gsap from 'gsap';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss'],
  imports: [CommonModule, BookCardComponent, MatIconModule, MatButtonModule, RouterModule]
})
export class FavoritesComponent implements OnInit {

  constructor(
    public favoritesService: FavoritesService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.animateCards();
  }

  onBookClick(workKey: string): void {
    // Extract work ID from key
    console.log('FavoritesComponent - Original workKey:', workKey);
    const workId = workKey.replace('/works/', '');
    console.log('FavoritesComponent - Cleaned workId:', workId);
    console.log('FavoritesComponent - Navigating to:', ['/book', workId]);
    this.router.navigate(['/book', workId]);
  }

  private animateCards(): void {
    gsap.fromTo(
      '.book-card',
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'all'
      }
    );
  }
}