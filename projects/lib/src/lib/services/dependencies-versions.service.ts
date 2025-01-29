import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DependenciesVersionsService {
  private httpClient = inject(HttpClient);

  read(): Promise<Record<string, string>> {
    return firstValueFrom(
      this.httpClient.get<Record<string, string>>(
        '/assets/dependencies-versions.json'
      )
    );
  }

  transformVersionsConfig(
    versionsConfig: Record<string, string>
  ): Record<string, any> {
    return Object.entries(versionsConfig).reduce(
      (acc, [key, value]) => {
        const label = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (char) => char.toUpperCase());

        acc[key] = {
          type: 'string',
          label,
          value,
          isEditable: false,
        };

        return acc;
      },
      {} as Record<string, any>
    );
  }
}
