import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-portal',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PortalComponent {}
