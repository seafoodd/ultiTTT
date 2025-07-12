import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DisposableEmailService {
  private disposableDomains: Set<string>;

  constructor() {
    const filePath = path.join(process.cwd(), 'data', 'disposable-domains.txt');
    const content = fs.readFileSync(filePath, 'utf-8');
    this.disposableDomains = new Set(
      content
        .split('\n')
        .map((d) => d.trim().toLowerCase())
        .filter(Boolean),
    );
  }

  isDisposable(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase() ?? '';
    return this.disposableDomains.has(domain);
  }
}
