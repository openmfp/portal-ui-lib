export interface GlobalSearchConfigService {
  getGlobalSearchConfig(): any;
}

export class NoopGlobalSearchConfigService
  implements GlobalSearchConfigService
{
  getGlobalSearchConfig() {
    return undefined;
  }
}
