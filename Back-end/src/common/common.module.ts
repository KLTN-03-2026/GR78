import { Global, Module } from '@nestjs/common';
import { JwtService } from './services/jwt.service';
import { UploadService } from './upload/upload.service';


@Global()
@Module({
    providers: [JwtService, UploadService],
    exports: [JwtService, UploadService],
})
export class CommonModule { }
