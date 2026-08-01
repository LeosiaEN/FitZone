import { describe, it, expect, beforeEach } from 'vitest';
import { userApi } from '../api/axios';

describe('Frontend Axios Configuration & Interceptor', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should attach Authorization Bearer header when token exists in localStorage', async () => {
    const fakeToken = 'mock_jwt_token_xyz';
    localStorage.setItem('token', fakeToken);

    // Call the request interceptor manually or test instance config
    const mockConfig = { headers: {} };
    // Get the request interceptor handler registered on userApi
    const interceptor = userApi.interceptors.request.handlers[0].fulfilled;
    const resultConfig = interceptor(mockConfig);

    expect(resultConfig.headers.Authorization).toBe(`Bearer ${fakeToken}`);
  });

  it('should not attach Authorization header when token is missing', async () => {
    const mockConfig = { headers: {} };
    const interceptor = userApi.interceptors.request.handlers[0].fulfilled;
    const resultConfig = interceptor(mockConfig);

    expect(resultConfig.headers.Authorization).toBeUndefined();
  });
});
