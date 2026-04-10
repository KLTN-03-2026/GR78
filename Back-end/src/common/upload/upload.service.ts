import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';


const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
const BUCKET_NAME = 'images' as const;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_FILES_PER_UPLOAD = 10;

type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];


export interface UploadResult {
    publicUrl: string;
    fileName: string;
    size: number;
    mimeType: string;
}

export interface UploadMultipleResult {
    succeeded: UploadResult[];
    failed: Array<{ index: number; originalName: string; reason: string }>;
}


@Injectable()
export class UploadService {
    private readonly supabase: SupabaseClient;
    private readonly logger = new Logger(UploadService.name);

    constructor(private readonly configService: ConfigService) {
        const supabaseUrl = this.configService.getOrThrow<string>('SUPABASE_URL');
        const supabaseKey = this.configService.getOrThrow<string>('SUPABASE_KEY');
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }


    async uploadSingle(
        file: Express.Multer.File,
        folder: string,
    ): Promise<UploadResult> {
        this.validateFile(file);

        const fileName = this.buildFileName(folder, file.originalname);

        const { error } = await this.supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (error) {
            this.logger.error(`Upload failed for [${fileName}]: ${error.message}`);
            throw new InternalServerErrorException(`Upload failed: ${error.message}`);
        }

        const { data: { publicUrl } } = this.supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);

        this.logger.log(`Uploaded: ${fileName} (${file.size} bytes)`);

        return {
            publicUrl,
            fileName,
            size: file.size,
            mimeType: file.mimetype,
        };
    }

    //**Upload nhiều file — partial success được cho phép.
    async uploadMultiple(
        files: Express.Multer.File[],
        folder: string,
    ): Promise<UploadMultipleResult> {
        if (!files?.length) {
            throw new BadRequestException('No files provided');
        }

        if (files.length > MAX_FILES_PER_UPLOAD) {
            throw new BadRequestException(
                `Too many files. Maximum allowed: ${MAX_FILES_PER_UPLOAD}`,
            );
        }

        const settlements = await Promise.allSettled(
            files.map((file) => this.uploadSingle(file, folder)),
        );

        const succeeded: UploadResult[] = [];
        const failed: UploadMultipleResult['failed'] = [];

        settlements.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                succeeded.push(result.value);
            } else {
                const reason = result.reason?.message ?? 'Unknown error';
                failed.push({ index, originalName: files[index].originalname, reason });
                this.logger.warn(
                    `Upload failed for file[${index}] "${files[index].originalname}": ${reason}`,
                );
            }
        });

        this.logger.log(
            `uploadMultiple — ${succeeded.length} succeeded, ${failed.length} failed`,
        );

        return { succeeded, failed };
    }

    //Convenience wrapper - throw
    async uploadMultipleOrFail(
        files: Express.Multer.File[],
        folder: string,
    ): Promise<UploadResult[]> {
        const { succeeded, failed } = await this.uploadMultiple(files, folder);

        if (failed.length > 0) {
            const details = failed
                .map((f) => `"${f.originalName}": ${f.reason}`)
                .join('; ');
            throw new InternalServerErrorException(`Some uploads failed — ${details}`);
        }

        return succeeded;
    }

    async deleteFile(fileName: string): Promise<void> {
        const { error } = await this.supabase.storage
            .from(BUCKET_NAME)
            .remove([fileName]);

        if (error) {
            this.logger.error(`Delete failed for [${fileName}]: ${error.message}`);
            throw new InternalServerErrorException(`Delete failed: ${error.message}`);
        }

        this.logger.log(`Deleted file: ${fileName}`);
    }

    async deleteFiles(fileNames: string[]): Promise<void> {
        if (!fileNames?.length) return;

        const { error } = await this.supabase.storage
            .from(BUCKET_NAME)
            .remove(fileNames);

        if (error) {
            this.logger.error(`Bulk delete failed: ${error.message}`);
            throw new InternalServerErrorException(`Bulk delete failed: ${error.message}`);
        }

        this.logger.log(`Deleted ${fileNames.length} files`);
    }

    //Private Helpers

    private validateFile(file: Express.Multer.File): void {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        if (!ALLOWED_MIME_TYPES.includes(file.mimetype as AllowedMimeType)) {
            throw new BadRequestException(
                `Invalid file type "${file.mimetype}". Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
            );
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException(
                `File "${file.originalname}" exceeds max size of ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`,
            );
        }
    }

    private buildFileName(folder: string, originalName: string): string {
        const ext = originalName.split('.').pop()?.toLowerCase() ?? 'bin';
        //sanitize folder để tránh path traversal
        const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '');
        return `${safeFolder}/${uuidv4()}.${ext}`;
    }
}