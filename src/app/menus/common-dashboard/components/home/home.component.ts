import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  filterForm!: FormGroup;

  items = [
    {
      sku: 'CD-001',
      name: 'Coca Cola 250ml',
      category: 'Cold Drinks',
      stock: 120,
      price: 50,
      status: 'In Stock'
    },
    {
      sku: 'CD-002',
      name: 'Coca Cola 500ml',
      category: 'Cold Drinks',
      stock: 25,
      price: 80,
      status: 'Low Stock'
    },
    {
      sku: 'CD-003',
      name: 'Pepsi 500ml',
      category: 'Cold Drinks',
      stock: 75,
      price: 80,
      status: 'In Stock'
    },
    {
      sku: 'CD-004',
      name: 'Sprite 500ml',
      category: 'Cold Drinks',
      stock: 8,
      price: 80,
      status: 'Low Stock'
    }
  ];

  filteredItems = [...this.items];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      search: ['']
    });

    this.filterForm.get('search')?.valueChanges.subscribe(value => {
      const search = (value || '').toLowerCase().trim();

      this.filteredItems = this.items.filter(item =>
        item.name.toLowerCase().includes(search) ||
        item.sku.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search)
      );
    });
  }
}
