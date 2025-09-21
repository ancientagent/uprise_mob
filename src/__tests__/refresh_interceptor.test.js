import applyAppTokenRefreshInterceptor from '../services/request/refresh_token';

describe('token refresh interceptor', () => {
  test('401 triggers refresh then retries original request with new token', async () => {
    const calls = { refresh: 0, request: 0 };

    // Minimal axios-like client stub
    const axiosClient = {
      interceptors: {
        response: {
          use: (success, error) => {
            axiosClient._error = error;
          },
        },
      },
      request: jest.fn(async req => {
        calls.request += 1;
        // echo headers for inspection
        return { ok: true, headers: req.headers || {} };
      }),
    };

    const customOptions = {
      // Simulate refresh endpoint providing a new access token
      handleTokenRefresh: async () => {
        calls.refresh += 1;
        return { accessToken: 'NEW_ACCESS', refreshToken: 'NEW_REFRESH' };
      },
      setTokenData: jest.fn(),
      attachTokenToRequest: (req, token) => {
        req.headers = { ...(req.headers || {}), Authorization: `Bearer ${token}` };
      },
      shouldIntercept: err => err?.response?.status === 401,
    };

    applyAppTokenRefreshInterceptor(axiosClient, customOptions);

    const originalRequest = { url: '/api/x', headers: {} };
    const error = { config: originalRequest, response: { status: 401 } };

    const res = await axiosClient._error(error);

    expect(calls.refresh).toBe(1);
    expect(calls.request).toBe(1);
    expect(res).toBeDefined();
    // Confirm the retried request carried the refreshed token
    expect(axiosClient.request).toHaveBeenCalledWith(
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer NEW_ACCESS' }) })
    );
  });
});

