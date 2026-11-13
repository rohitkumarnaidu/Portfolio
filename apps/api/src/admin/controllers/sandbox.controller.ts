import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GithubService } from '../../modules/sandbox/github.service';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';

@ApiTags('Admin - Sandbox')
@Controller('admin/sandbox')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles('admin', 'editor')
export class AdminSandboxController {
  constructor(private readonly githubService: GithubService) {}

  @Get('files')
  @ApiOperation({ summary: 'List files in repository path' })
  async listFiles(@Query('path') path?: string, @Query('ref') ref?: string) {
    return { data: await this.githubService.listFiles(path, ref) };
  }

  @Get('file')
  @ApiOperation({ summary: 'Read file content' })
  async getFile(@Query('path') path: string, @Query('ref') ref?: string) {
    return { data: await this.githubService.getFile(path, ref) };
  }

  @Post('commit')
  @ApiOperation({ summary: 'Commit changes to GitHub' })
  async commitChange(
    @Body() body: { path: string; content: string; message: string; branch?: string },
  ) {
    const { path, content, message, branch } = body;
    return { data: await this.githubService.commitChange(path, content, message, branch) };
  }
}
