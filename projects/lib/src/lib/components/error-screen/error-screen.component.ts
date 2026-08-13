import { I18nService, LuigiCoreService } from '../../services';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  templateUrl: './error-screen.component.html',
  styleUrls: ['./error-screen.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorScreenComponent implements OnInit {
  title = signal<string>('');
  subtitle = signal<string>('');
  buttonText = signal<string>('');
  icon = signal<string>('');
  code = signal<string>('');
  expandedByDefault = signal<boolean>(false);
  errorDetailsLabel = signal<string>('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private luigiCoreService: LuigiCoreService,
    private i18nService: I18nService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.luigiCoreService.ux().hideAppLoadingIndicator();
    const data = this.route.snapshot.data;
    this.icon.set(data['icon'] ?? '');
    this.expandedByDefault.set(data['expandedByDefault'] ?? false);
    this.code.set(this.route.snapshot.queryParams['code'] ?? '');
    const [title, subtitle, buttonText, errorDetailsLabel] = await Promise.all([
      this.i18nService.getTranslationAsync(data['titleKey']),
      this.i18nService.getTranslationAsync(data['subtitleKey']),
      this.i18nService.getTranslationAsync('ERROR_GO_HOME_BUTTON'),
      this.i18nService.getTranslationAsync('ERROR_DETAILS_LABEL'),
    ]);
    this.title.set(title);
    this.subtitle.set(subtitle);
    this.buttonText.set(buttonText);
    this.errorDetailsLabel.set(errorDetailsLabel);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
