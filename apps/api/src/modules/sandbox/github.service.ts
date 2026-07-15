import { Injectable, Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/rest';

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(private configService: ConfigService) {
    const token = this.configService.get<string>('app.GITHUB_PERSONAL_ACCESS_TOKEN');
    this.octokit = new Octokit({ auth: token });
    this.owner = this.configService.get<string>('app.GITHUB_OWNER') || 'placeholder-owner';
    this.repo = this.configService.get<string>('app.GITHUB_REPO') || 'placeholder-repo';
  }

  async getFile(path: string, ref?: string) {
    try {
      const response = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
        ref,
      });

      if (Array.isArray(response.data)) {
        throw new Error('Path is a directory, not a file');
      }

      const content = Buffer.from(
        (response.data as { content: string }).content,
        'base64',
      ).toString('utf-8');
      return {
        content,
        sha: (response.data as { sha: string }).sha,
        path: (response.data as { path: string }).path,
      };
    } catch (error) {
      this.logger.error(`Failed to get file from GitHub: ${path}`, error);
      throw error;
    }
  }

  async listFiles(path: string = '', ref?: string) {
    try {
      const response = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
        ref,
      });

      if (!Array.isArray(response.data)) {
        return [response.data]; // It's a single file
      }

      return response.data.map((item) => ({
        name: item.name,
        path: item.path,
        type: item.type, // 'file' or 'dir'
        sha: item.sha,
      }));
    } catch (error) {
      this.logger.error(`Failed to list files from GitHub: ${path}`, error);
      throw error;
    }
  }

  async commitChange(path: string, content: string, message: string, branch: string = 'main') {
    try {
      // 1. Get current file to get its SHA (needed for update)
      let sha: string | undefined;
      try {
        const fileInfo = await this.getFile(path, branch);
        sha = fileInfo.sha;
      } catch (e) {
        // File might not exist (creating new file)
        this.logger.log(`File ${path} does not exist. Creating new file.`);
      }

      // 2. Commit the change
      const response = await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path,
        message,
        content: Buffer.from(content).toString('base64'),
        sha,
        branch,
      });

      return response.data.commit;
    } catch (error) {
      this.logger.error(`Failed to commit change to GitHub: ${path}`, error);
      throw error;
    }
  }
}
