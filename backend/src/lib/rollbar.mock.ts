jest.mock('./rollbar', () => {
  return jest.createMockFromModule('./rollbar')
})
