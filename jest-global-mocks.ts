jest.mock('./projects/lib/src/lib/initializers', () => ({
  ...jest.requireActual('./projects/lib/src/lib/initializers'),
  provideBootstrap: jest.fn().mockReturnValue({
    provide: 'PROVIDER',
    useValue: {},
  }),
}));
