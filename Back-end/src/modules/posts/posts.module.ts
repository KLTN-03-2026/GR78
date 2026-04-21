import { ModerationModule } from '@/modules/moderation/moderation.module';
import { UsersModule } from '@/modules/users/users.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedPostsController } from './controllers/saved-posts.controller';
import { PostCustomer } from './entities/post.entity';
import { SavedPost } from './entities/saved-post.entity';
import { PostService } from './post.service';
import { PostController } from './posts.controller';
import { PostRepository } from './repositories/post.repository';
import { SavedPostRepository } from './repositories/saved-post.repository';
import { PostBusinessService } from './services/post-business.service';
import { PostMapperService } from './services/post-mapper.service';
import { PostValidationService } from './services/post-validation.service';
import { SavedPostService } from './services/saved-post.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([PostCustomer, SavedPost]),
        UsersModule,
        ModerationModule
    ],
    controllers: [PostController, SavedPostsController],
    providers: [
        PostService,
        PostValidationService,
        PostBusinessService,
        PostMapperService,
        PostRepository,
        SavedPostService,
        SavedPostRepository,
    ],
    exports: [
        PostService,
        PostRepository,
        PostValidationService,
        PostBusinessService,
        PostMapperService,
        SavedPostService,
        SavedPostRepository,
    ],
})
export class PostsModule { }