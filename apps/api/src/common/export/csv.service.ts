import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CsvService {
  private readonly logger = new Logger(CsvService.name);

  toCsv<T extends Record<string, unknown>>(data: T[], columns?: string[]): string {
    if (data.length === 0) return '';
    const headers = columns ?? Object.keys(data[0]);
    const rows = data.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          if (val === null || val === undefined) return '';
          const str = String(val);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(','),
    );
    return [headers.join(','), ...rows].join('\n');
  }
}
