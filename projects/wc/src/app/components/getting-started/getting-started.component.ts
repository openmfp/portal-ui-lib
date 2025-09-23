import { Component, inject } from '@angular/core';
import { LuigiCoreService } from '@openmfp/portal-ui-lib';


@Component({
  selector: 'wc-getting-started',
  imports: [],
  templateUrl: './getting-started.component.html',
  styleUrl: './getting-started.component.scss',
})
export class GettingStartedComponent {
  private luigiCoreService = inject(LuigiCoreService);
  public links: { title: string; link: string }[] = (
    this.luigiCoreService.config.settings?.links ?? []
  ).concat([
    { title: 'OpemMFP', link: 'https://openmfp.org/' },
    { title: 'OpenMFP GitHub', link: 'https://github.com/openmfp' },
  ]);
  public header = this.luigiCoreService.config.settings?.header?.title;
  public logo = this.luigiCoreService.config.settings?.header?.logo;

  ngOnInit() {}
}
