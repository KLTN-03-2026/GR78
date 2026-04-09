import { AppModule } from '@/core/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { GlobalExceptionFilter } from './common/exceptions/index';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useWebSocketAdapter(new IoAdapter(app));
    app.use(cookieParser());
    const httpAdapterHost = app.get(HttpAdapterHost);
    app.useGlobalFilters(new GlobalExceptionFilter(httpAdapterHost));

    const configService = app.get(ConfigService);

    app.enableCors({
        origin: [
            'https://postmaxillary-variably-justa.ngrok-free.dev',
            'http://localhost:3001',
            'http://localhost:3000',
        ],
        credentials: true,
    });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    const config = new DocumentBuilder()
        .setTitle('Service Matching API')
        .setDescription('API for service-matching platform')
        .setVersion('1.0')
        .addBearerAuth()
        .addServer('/api/v1')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    const apiPrefix = configService.get<string>('API_PREFIX', 'api');
    app.setGlobalPrefix(apiPrefix);
    await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
