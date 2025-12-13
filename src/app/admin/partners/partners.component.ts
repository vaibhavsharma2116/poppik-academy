
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partners.component.html',
  styleUrls: ['./partners.component.css']
})
export class PartnersComponent implements OnInit {
  partners: any[] = [];
  showModal = false;
  editMode = false;
  currentPartner: any = {
    id: null,
    name: '',
    logo: '',
    website: '',
    description: '',
    sort_order: 0,
    status: 'Active'
  };

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadPartners();
  }

  loadPartners() {
    this.adminService.getPartners().subscribe({
      next: (response) => {
        if (response.success) {
          this.partners = response.data;
        }
      },
      error: (error) => console.error('Error loading partners:', error)
    });
  }

  openAddModal() {
    this.editMode = false;
    this.currentPartner = {
      id: null,
      name: '',
      logo: '',
      website: '',
      description: '',
      sort_order: 0,
      status: 'Active'
    };
    this.showModal = true;
  }

  openEditModal(partner: any) {
    this.editMode = true;
    this.currentPartner = { ...partner };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  savePartner() {
    if (this.editMode) {
      this.adminService.updatePartner(this.currentPartner.id, this.currentPartner).subscribe({
        next: () => {
          this.loadPartners();
          this.closeModal();
        },
        error: (error) => console.error('Error updating partner:', error)
      });
    } else {
      this.adminService.addPartner(this.currentPartner).subscribe({
        next: () => {
          this.loadPartners();
          this.closeModal();
        },
        error: (error) => console.error('Error adding partner:', error)
      });
    }
  }

  deletePartner(id: number) {
    if (confirm('Are you sure you want to delete this partner?')) {
      this.adminService.deletePartner(id).subscribe({
        next: () => this.loadPartners(),
        error: (error) => console.error('Error deleting partner:', error)
      });
    }
  }

  onLogoFileChange(event: any) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.currentPartner.logo = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}
