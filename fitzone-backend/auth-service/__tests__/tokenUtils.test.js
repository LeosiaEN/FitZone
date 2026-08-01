const jwt = require('jsonwebtoken');
const { generateToken } = require('../utils/tokenUtils');

describe('tokenUtils Unit Tests', () => {
  const secret = 'test_secret_key';

  beforeAll(() => {
    process.env.JWT_SECRET = secret;
  });

  it('should generate a valid JWT token with user id payload', () => {
    const userId = 123;
    const token = generateToken(userId, false);

    expect(token).toBeDefined();
    const decoded = jwt.verify(token, secret);
    expect(decoded.userId).toBe(userId);
  });

  it('should set longer expiration if rememberMe is true', () => {
    const userId = 456;
    const tokenShort = generateToken(userId, false);
    const tokenLong = generateToken(userId, true);

    const decodedShort = jwt.decode(tokenShort);
    const decodedLong = jwt.decode(tokenLong);

    expect(decodedLong.exp - decodedLong.iat).toBeGreaterThan(decodedShort.exp - decodedShort.iat);
  });
});
