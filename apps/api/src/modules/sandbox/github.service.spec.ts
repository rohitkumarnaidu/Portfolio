import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GithubService } from './github.service';

const mockOctokit = {
  repos: {
    getContent: jest.fn(),
    createOrUpdateFileContents: jest.fn(),
  },
};

jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => mockOctokit),
}));

const mockConfig = {
  get: jest.fn().mockImplementation((key: string) => {
    if (key === 'app.GITHUB_PERSONAL_ACCESS_TOKEN') return 'mock-token';
    if (key === 'app.GITHUB_OWNER') return 'test-owner';
    if (key === 'app.GITHUB_REPO') return 'test-repo';
    return 'test';
  }),
};

describe('GithubService', () => {
  let service: GithubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GithubService, { provide: ConfigService, useValue: mockConfig }],
    }).compile();

    service = module.get<GithubService>(GithubService);
    jest.clearAllMocks();
  });

  describe('getFile', () => {
    it('should return file content and sha', async () => {
      mockOctokit.repos.getContent.mockResolvedValue({
        data: {
          content: Buffer.from('file content').toString('base64'),
          sha: 'abc123',
          path: 'src/index.ts',
          type: 'file',
        },
      });

      const result = await service.getFile('src/index.ts');

      expect(result.content).toBe('file content');
      expect(result.sha).toBe('abc123');
      expect(result.path).toBe('src/index.ts');
      expect(mockOctokit.repos.getContent).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'src/index.ts', owner: 'test-owner', repo: 'test-repo' }),
      );
    });

    it('should throw if path is a directory', async () => {
      mockOctokit.repos.getContent.mockResolvedValue({
        data: [{ name: 'file1.ts', path: 'src/file1.ts', type: 'file' }],
      });

      await expect(service.getFile('src')).rejects.toThrow('Path is a directory');
    });

    it('should propagate GitHub errors', async () => {
      mockOctokit.repos.getContent.mockRejectedValue(new Error('Not found'));

      await expect(service.getFile('nonexistent')).rejects.toThrow('Not found');
    });
  });

  describe('listFiles', () => {
    it('should return list of files in a directory', async () => {
      mockOctokit.repos.getContent.mockResolvedValue({
        data: [
          { name: 'index.ts', path: 'src/index.ts', type: 'file', sha: 's1' },
          { name: 'utils', path: 'src/utils', type: 'dir', sha: 's2' },
        ],
      });

      const result = await service.listFiles('src');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('index.ts');
      expect(result[1].type).toBe('dir');
    });

    it('should wrap single file response in array', async () => {
      mockOctokit.repos.getContent.mockResolvedValue({
        data: { name: 'file.ts', path: 'file.ts', type: 'file', sha: 's1' },
      });

      const result = await service.listFiles('file.ts');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
    });

    it('should propagate errors', async () => {
      mockOctokit.repos.getContent.mockRejectedValue(new Error('API error'));

      await expect(service.listFiles('src')).rejects.toThrow('API error');
    });
  });

  describe('commitChange', () => {
    it('should create a new file', async () => {
      const mockCommit = { sha: 'commit-sha', url: 'https://api.github.com' };

      mockOctokit.repos.getContent.mockRejectedValue(new Error('Not found'));
      mockOctokit.repos.createOrUpdateFileContents.mockResolvedValue({
        data: { commit: mockCommit },
      });

      const result = await service.commitChange('new-file.ts', 'content', 'Add new file');

      expect(result).toEqual(mockCommit);
      expect(mockOctokit.repos.createOrUpdateFileContents).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'new-file.ts',
          message: 'Add new file',
          sha: undefined,
        }),
      );
    });

    it('should update existing file with sha', async () => {
      const mockCommit = { sha: 'commit-sha' };

      mockOctokit.repos.getContent.mockResolvedValue({
        data: {
          content: Buffer.from('old content').toString('base64'),
          sha: 'abc123',
          path: 'file.ts',
        },
      });
      mockOctokit.repos.createOrUpdateFileContents.mockResolvedValue({
        data: { commit: mockCommit },
      });

      await service.commitChange('file.ts', 'new content', 'Update file');

      expect(mockOctokit.repos.createOrUpdateFileContents).toHaveBeenCalledWith(
        expect.objectContaining({ sha: 'abc123' }),
      );
    });

    it('should propagate errors', async () => {
      mockOctokit.repos.getContent.mockRejectedValue(new Error('Not found'));
      mockOctokit.repos.createOrUpdateFileContents.mockRejectedValue(new Error('Push rejected'));

      await expect(service.commitChange('file.ts', 'content', 'msg')).rejects.toThrow(
        'Push rejected',
      );
    });
  });
});
