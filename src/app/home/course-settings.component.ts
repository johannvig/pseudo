import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-course-settings',
  templateUrl: 'course-settings.component.html',
  styleUrls: ['course-settings.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule]
})
export class CourseSettingsComponent implements OnInit {
  @Input() courses: Array<{ name: string; colorFill: string; colorBorder?: string; textColor?: string; checked: boolean; isCustomColor?: boolean }> = [];
  @Input() onColorChange?: (courseName: string, newColor: string) => void;
  @Input() onDaltonismToggle?: (enabled: boolean) => void;
  @Input() onResetColors?: () => void;
  @Input() daltonismMode: boolean = false;
  @Input() courseColorKeys?: Map<string, string> = new Map();
  @Input() customCourseColors?: Map<string, string> = new Map();
  @Input() colors: any = {};
  @Input() colorsDaltonism: any = {};
  @Input() getContrastTextColor?: (hex: string) => string;

  // local copy so changes are not applied until Save
  localCourses: Array<{ name: string; colorFill: string; colorBorder?: string; textColor?: string; checked: boolean; isCustomColor?: boolean }> = [];
  
  // Daltonisme mode
  daltonismEnabled: boolean = false;

  constructor(private modalCtrl: ModalController) {
    console.log('[CourseSettings] Constructor called, courses input:', this.courses);
  }

  ngOnInit() {
    console.log('[CourseSettings] ngOnInit called, courses:', this.courses);
    // shallow clone
    this.localCourses = this.courses.map(c => ({ ...c }));
    // Initialize daltonismEnabled with the passed value
    this.daltonismEnabled = this.daltonismMode;
    console.log('[CourseSettings] localCourses after map:', this.localCourses);
    console.log('[CourseSettings] daltonismEnabled initialized to:', this.daltonismEnabled);
  }

  // Called when user changes a color
  updateColor(course: any, newColor: string) {
    course.colorFill = newColor;
    course.isCustomColor = true; // Marquer comme personnalisée
    // Call the callback to update calendar in real-time
    if (this.onColorChange) {
      this.onColorChange(course.name, newColor);
    }
  }

  // Called when daltonism toggle changes
  toggleDaltonism() {
    if (this.onDaltonismToggle) {
      this.onDaltonismToggle(this.daltonismEnabled);
    }
    
    // Mettre à jour les couleurs affichées dans la popup
    this.updateColorsForMode();
  }

  // Met à jour les couleurs des cours affichées selon le mode daltonisme
  private updateColorsForMode() {
    if (!this.courseColorKeys || !this.colors || !this.colorsDaltonism || !this.getContrastTextColor) {
      return;
    }

    const getContrastTextColor = this.getContrastTextColor;
    
    this.localCourses.forEach(course => {
      // Récupérer la clé de couleur originale
      const colorKey = this.courseColorKeys!.get(course.name) || 'blue';
      
      // Si daltonisme OFF: utiliser couleur perso si elle existe, sinon palette normale
      if (!this.daltonismEnabled) {
        const hasCustomColor = this.customCourseColors?.has(course.name);
        if (hasCustomColor) {
          const customColor = this.customCourseColors!.get(course.name)!;
          course.colorFill = customColor;
          course.colorBorder = customColor;
          course.textColor = getContrastTextColor(customColor);
          return;
        }
        // Sinon palette normale
        const colorObj = (this.colors as any)[colorKey];
        if (colorObj) {
          course.colorFill = colorObj.bg;
          course.colorBorder = colorObj.border;
          course.textColor = colorObj.text;
        }
      } else {
        // Si daltonisme ON: toujours afficher palette daltonisme (même pour perso)
        const colorObj = (this.colorsDaltonism as any)[colorKey];
        if (colorObj) {
          course.colorFill = colorObj.bg;
          course.colorBorder = colorObj.border;
          course.textColor = colorObj.text;
        }
      }
    });
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  // Réinitialise toutes les couleurs à la palette de base
  resetColors() {
    if (!this.courseColorKeys || !this.colors || !this.getContrastTextColor) {
      return;
    }

    const getContrastTextColor = this.getContrastTextColor;

    this.localCourses.forEach(course => {
      const colorKey = this.courseColorKeys!.get(course.name) || 'blue';
      const colorObj = (this.colors as any)[colorKey];
      
      if (colorObj) {
        course.colorFill = colorObj.bg;
        course.colorBorder = colorObj.border;
        course.textColor = colorObj.text;
        course.isCustomColor = false; // Marquer comme non-personnalisée
      }
    });

    // Désactiver le mode daltonisme
    if (this.daltonismEnabled) {
      this.daltonismEnabled = false;
      // Appeler la callback daltonisme pour mettre à jour le parent
      if (this.onDaltonismToggle) {
        this.onDaltonismToggle(false);
      }
    }

    // Appeler la callback au parent pour mettre à jour aussi le calendrier
    if (this.onResetColors) {
      this.onResetColors();
    }
  }

  save() {
    this.modalCtrl.dismiss({ courses: this.localCourses, daltonismMode: this.daltonismEnabled }, 'save');
  }
}
