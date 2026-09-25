import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewEncapsulation,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { Button } from '@fundamental-ngx/ui5-webcomponents/button';
import { Icon } from '@fundamental-ngx/ui5-webcomponents/icon';
import { I18nService, LuigiCoreService } from '@openmfp/portal-ui-lib';
import '@ui5/webcomponents-icons/dist/disconnected.js';

@Component({
  selector: 'wc-no-vpn',
  standalone: true,
  templateUrl: './no-vpn-handling.component.html',
  styleUrl: './no-vpn-handling.component.scss',
  imports: [Button, Icon],
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoVPNHandlingComponent implements OnInit {
  private luigiCoreService = inject(LuigiCoreService);
  private i18nService = inject(I18nService);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private document = inject(DOCUMENT);

  public context = input.required<any>();

  protected texts = computed(() => this.readTranslations());
  protected hasIllustration = signal(false);

  ngOnInit(): void {
    this.luigiCoreService.ux().hideAppLoadingIndicator();
    this.hasIllustration.set(this.isIllustrationProvided());
  }

  retry(): void {
    this.document.defaultView?.location.reload();
  }

  private isIllustrationProvided(): boolean {
    const scene = getComputedStyle(this.host.nativeElement)
      .getPropertyValue('--mfp-no-vpn-illustration-scene')
      .trim();
    return scene !== '' && scene !== 'none';
  }

  private readTranslations() {
    this.i18nService.translationTable = this.context().translationTable;
    return {
      title: this.i18nService.getTranslation('VPN_NEEDED_PAGE_TITLE'),
      description: this.i18nService.getTranslation('VPN_NEEDED_PAGE_DESCRIPTION'),
      retryButton: this.i18nService.getTranslation('VPN_NEEDED_PAGE_RETRY_BUTTON'),
    };
  }
}
