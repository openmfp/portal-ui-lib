import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

document.body.classList.add('ui5-content-density-compact');

@Component({
  selector: 'app-portal',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PortalComponent {}
