import { TestBed } from '@angular/core/testing';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  let i18nService: I18nService;
  const translationTable = {
    de: {
      SOME_TEST_KEY: 'some test key',
      SOME_TEST_KEY2: 'some {test} key 2',
      SOME_TEST_KEY3: ['first line', 'second line'],
      SOME_TEST_KEY4: ['first line {test}', 'second line'],
    },
  };

  beforeEach(() => {
    i18nService = TestBed.inject(I18nService);
  });

  it('should be created', () => {
    expect(i18nService).toBeTruthy();
  });

  it('findTranslation', () => {
    const result = i18nService.findTranslation(
      'SOME_TEST_KEY',
      translationTable,
      'de',
      undefined
    );
    expect(result).toEqual('some test key');
  });

  it('find translation when array', () => {
    const result = i18nService.findTranslation(
      'SOME_TEST_KEY3',
      translationTable,
      'de'
    );
    expect(result).toEqual('first line<br>second line');
  });

  it('no translation when no locale is set', () => {
    const result = i18nService.findTranslation(
      'SOME_TEST_KEY_',
      translationTable,
      '',
      undefined
    );
    expect(result).toEqual(undefined);
  });

  it('no translation when the key is not set', () => {
    const result = i18nService.findTranslation(
      'SOME_TEST_KEY_',
      translationTable,
      'de',
      undefined
    );
    expect(result).toEqual(undefined);
  });

  it('find translation with interpolations', () => {
    const result = i18nService.findTranslation(
      'SOME_TEST_KEY2',
      translationTable,
      'de',
      { test: 'test' }
    );
    expect(result).toEqual('some test key 2');
  });

  it('find translation with interpolations in array', () => {
    const result = i18nService.findTranslation(
      'SOME_TEST_KEY4',
      translationTable,
      'de',
      { test: 'test1' }
    );
    expect(result).toEqual('first line test1<br>second line');
  });

  it('getTranslation no key', () => {
    const result = i18nService.getTranslation('');
    expect(result).toEqual('');
  });

  it('findInterpolation', () => {
    const translationKey = 'some {test} key 2';
    const interpolations = { test: 'tets' };
    const result = i18nService.findInterpolations(
      translationKey,
      interpolations
    );
    expect(result).toEqual('some tets key 2');
  });

  it('no interpolation found', () => {
    const translationKey = 'some {test} key 2';
    const interpolations = { asdf: 'tets' };
    const result = i18nService.findInterpolations(
      translationKey,
      interpolations
    );
    expect(result).toEqual('some {test} key 2');
  });

  it('addTranlsationFile', () => {
    const locale = 'en';
    const data = {
      test: 'test',
      tets: 'tets',
    };
    i18nService.addTranslationFile(locale, data);
    expect(i18nService.translationTable).toEqual({ en: data });
  });

  it('addTranlsationFile', () => {
    const data = {
      test: 'test',
      tets: 'tets',
    };
    i18nService.addTranslationFile('', data);
    expect(i18nService.translationTable).toEqual({});
  });

  it('getTranslation', () => {
    i18nService.translationTable = translationTable;
    const spyFindTranslation = jest
      .spyOn(i18nService, 'findTranslation')
      .mockReturnValue('some test key');
    const result = i18nService.getTranslation('SOME_TEST_KEY', undefined, 'de');

    expect(spyFindTranslation).toHaveBeenCalled();
    expect(result).toEqual('some test key');
  });

  it('getTranslationAsync', async () => {
    i18nService.translationTable = translationTable;
    jest.spyOn(i18nService, 'findTranslation').mockReturnValue('some test key');

    const result = await i18nService.getTranslationAsync(
      'SOME_TEST_KEY',
      undefined,
      'de'
    );

    expect(result).toEqual('some test key');
  });

  it('getTranslationAsync with fallback language', async () => {
    const fallbackTranslationTable = {
      en: {
        SOME_TEST_KEY: 'some test key',
        SOME_TEST_KEY2: 'some {test} key 2',
        SOME_TEST_KEY3: 'some test key 3',
      },
    };
    i18nService.fallbackLanguage = 'en';
    i18nService.translationTable = fallbackTranslationTable;
    i18nService.fetchTranslationFile = jest
      .fn()
      .mockResolvedValue('some test key 3');
    jest
      .spyOn(i18nService, 'findTranslation')
      .mockReturnValue('some test key 3');
    const result = await i18nService.getTranslationAsync(
      'SOME_TEST_KEY3',
      undefined,
      'de'
    );

    expect(result).toEqual('some test key 3');
  });
});
