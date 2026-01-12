import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';
import { HomePageRoutingModule } from './home-routing.module';
import { FullCalendarModule } from '@fullcalendar/angular'; // <--- Import

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    FullCalendarModule // <--- Ajout
  ],
  declarations: [HomePage]
  
})

export class HomePageModule {}