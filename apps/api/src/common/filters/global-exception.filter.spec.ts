import type { ArgumentsHost } from '@nestjs/common';
import { BadRequestException, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let status: jest.Mock;
  let json: jest.Mock;
  let request: { method: string; url: string };

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    request = { method: 'GET', url: '/api/test' };
  });

  function host(): ArgumentsHost {
    return {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => request,
      }),
    } as unknown as ArgumentsHost;
  }

  it('reports the status and message of an HttpException', () => {
    filter.catch(new NotFoundException('Missing'), host());

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    const body = json.mock.calls[0][0];
    expect(body.error.message).toBe('Missing');
    expect(body.error.status_code).toBe(404);
    expect(body.error.code).toBe('Not Found');
    expect(body.error.path).toBe('/api/test');
    expect(body.error.correlation_id).toEqual(expect.any(String));
  });

  it('uses the error code from the response object', () => {
    filter.catch(new BadRequestException({ message: 'Bad', error: 'CUSTOM_CODE' }), host());

    expect(json.mock.calls[0][0].error.code).toBe('CUSTOM_CODE');
  });

  it('treats an array message as validation details', () => {
    const details = [{ field: 'email', message: 'must be an email', code: 'invalid_string' }];
    filter.catch(new BadRequestException({ message: details, error: 'Bad Request' }), host());

    const body = json.mock.calls[0][0];
    expect(body.error.message).toBe('Validation failed');
    expect(body.error.details).toEqual(details);
  });

  it('reports unknown errors as internal server errors', () => {
    filter.catch(new Error('boom'), host());

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    const body = json.mock.calls[0][0];
    expect(body.error.message).toBe('boom');
    expect(body.error.code).toBe('INTERNAL_ERROR');
  });

  it('reports a non-error value with a generic message', () => {
    filter.catch('something odd', host());

    const body = json.mock.calls[0][0];
    expect(body.error.message).toBe('An unexpected error occurred');
    expect(body.error.status_code).toBe(500);
  });

  it('always includes a timestamp', () => {
    filter.catch(new Error('boom'), host());

    expect(json.mock.calls[0][0].error.timestamp).toEqual(expect.any(String));
  });

  it('keeps the details undefined when there are none', () => {
    filter.catch(new NotFoundException('Missing'), host());

    expect(json.mock.calls[0][0].error.details).toBeUndefined();
  });

  it('uses the string response of an HttpException', () => {
    filter.catch(new HttpException('plain text', HttpStatus.BAD_GATEWAY), host());

    expect(json.mock.calls[0][0].error.message).toBe('plain text');
    expect(json.mock.calls[0][0].error.status_code).toBe(502);
  });
});
