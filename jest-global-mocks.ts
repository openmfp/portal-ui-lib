jest.mock('./src/lib/initializers', () => ({
  ...jest.requireActual('./src/lib/initializers'),
  provideBootstrap: jest.fn().mockReturnValue({
    provide: 'PROVIDER',
    useValue: {},
  }),
}));
