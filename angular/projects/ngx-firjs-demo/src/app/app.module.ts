import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatListModule } from '@angular/material/list';

import { AppComponent } from './app.component';
import { NgxFirjsModule } from '../../../ngx-firjs/src/public-api';
import { RouterModule, Routes } from '@angular/router';
import { FullExampleComponent } from './pages/full-example/full-example.component';
import { CustomViewExampleComponent } from './pages/custom-view-example/custom-view-example.component';
import { DesignerComponent } from './components/designer/designer.component';

const routes: Routes = [
  { path: 'default', component: FullExampleComponent },
  { path: 'custom', component: CustomViewExampleComponent },
  { path: '', redirectTo: '/default', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    AppComponent,
    FullExampleComponent,
    CustomViewExampleComponent,
    DesignerComponent
  ],
  imports: [
    RouterModule.forRoot(routes),
    BrowserModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    BrowserAnimationsModule,
    MatListModule,
    NgxFirjsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
