import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { MediaService } from '../../modules/media/media.service';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import type { CreateMediaDto } from '../../modules/media/dto';
import type { Request } from 'express';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: join(process.cwd(), 'uploads'),
  filename: (
    _req: unknown,
    file: { originalname: string },
    cb: (err: Error | null, name: string) => void,
  ) => {
    const ext = extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

@ApiTags('Admin - Media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/media')
export class AdminMediaController {
  constructor(private readonly media: MediaService) {}

  @Get()
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'List all media assets' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'mimeType', required: false })
  async findAll(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('mimeType') mimeType?: string,
  ) {
    return this.media.findAll({
      page: page ? +page : undefined,
      perPage: perPage ? +perPage : undefined,
      mimeType,
    });
  }

  @Get(':id')
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get media asset by ID' })
  async findById(@Param('id') id: string) {
    return { data: await this.media.findById(id) };
  }

  @Post('upload')
  @Roles('admin', 'editor')
  @Audit({ action: 'upload', resource: 'media' })
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request & { user?: { id: string } },
  ) {
    const dto: CreateMediaDto = {
      fileName: file.originalname,
      filePath: file.path,
      mimeType: file.mimetype,
      fileSizeBytes: file.size,
    };
    const userId = req.user?.id;
    return { data: await this.media.create({ ...dto, uploadedBy: userId }) };
  }

  @Delete(':id')
  @Roles('admin')
  @Audit({ action: 'delete', resource: 'media' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete media asset' })
  async delete(@Param('id') id: string) {
    await this.media.delete(id);
  }
}
