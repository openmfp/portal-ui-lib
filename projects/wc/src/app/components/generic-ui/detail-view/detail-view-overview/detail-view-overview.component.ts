import { NodeContext, ResourceDefinition } from '../../models/resource';
import { ResourceService } from '../../services/resource.service';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  ElementRef,
  Input,
  ViewChild,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { LuigiClient } from '@luigi-project/client/luigi-element';

@Component({
  selector: 'detail-view-overview',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: true,
  imports: [],
  templateUrl: './detail-view-overview.component.html',
  styleUrl: './detail-view-overview.component.css',
})
export class DetailViewOverviewComponent {
  private resourceService = inject(ResourceService);
  @ViewChild('dynamicPage', { static: true }) dynamicPage!: ElementRef;

  heading: string;
  resourceDefinition: ResourceDefinition;

  @Input()
  LuigiClient: LuigiClient;

  @Input()
  set context(context: NodeContext) {
    this.resourceDefinition = context.resourceDefinition;
    this.heading = `${context.resourceDefinition.plural.charAt(0).toUpperCase()}${context.resourceDefinition.plural.slice(1)}`;
  }
}
