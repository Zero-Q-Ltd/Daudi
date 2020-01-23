import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule
} from '@angular/material';
import { TextMaskModule } from 'angular2-text-mask';
import { CommonPipe } from './pipes/common.pipe';
import { SlimScrollDirective } from './slim-scroll.directive';

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
        TextMaskModule
    ],
    exports:
        [
            SlimScrollDirective,
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
            TextMaskModule]
    ,
    providers: [],
    declarations: [CommonPipe, SlimScrollDirective]
})
export class SharedModule {
}
