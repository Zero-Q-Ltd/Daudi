import { LayoutModule } from '@angular/cdk/layout';
import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TextMaskModule } from 'angular2-text-mask';
import { PipeModuleModule } from 'app/pipe-module/pipe-module.module';
import { Ng5SliderModule } from 'ng5-slider';
import { NgxEchartsModule } from 'ngx-echarts';
import { CommonPipe } from './pipes/common.pipe';
import { SlimScrollDirective } from './slim-scroll.directive';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTreeModule } from '@angular/material/tree';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatListModule,
    MatSidenavModule,
    MatTabsModule,
    MatDialogModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    TextMaskModule,
    PipeModuleModule,
    FlexLayoutModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    CdkTableModule,
    MatTreeModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatProgressBarModule,
    PipeModuleModule,
    LayoutModule,
    Ng5SliderModule,
    MatChipsModule,
    MatInputModule,
    MatSelectModule,
    NgxEchartsModule,
  ],
  exports:
    [
      CommonModule,
      MatButtonModule,
      MatMenuModule,
      MatToolbarModule,
      MatIconModule,
      MatCardModule,
      MatSnackBarModule,
      MatInputModule,
      MatSelectModule,
      MatTooltipModule,
      MatListModule,
      MatSidenavModule,
      MatTabsModule,
      MatDialogModule,
      MatAutocompleteModule,
      FormsModule,
      ReactiveFormsModule,
      TextMaskModule,
      PipeModuleModule,
      FlexLayoutModule,
      FormsModule,
      MatDatepickerModule,
      MatNativeDateModule,
      ReactiveFormsModule,
      MatSlideToggleModule,
      MatTableModule,
      MatSortModule,
      MatPaginatorModule,
      CdkTableModule,
      MatTreeModule,
      MatCheckboxModule,
      MatProgressSpinnerModule,
      MatExpansionModule,
      MatProgressBarModule,
      PipeModuleModule,
      LayoutModule,
      Ng5SliderModule,
      MatChipsModule,
      MatInputModule,
      MatSelectModule,
      NgxEchartsModule,
    ]
  ,
  providers: [],
  declarations: [CommonPipe, SlimScrollDirective]
})
export class SharedModule {
}
