import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { map, Observable } from 'rxjs';
import {
    NotificationListResponseDto,
    NotificationResponseDto,
} from '../dtos/notification.dto';


@Injectable()
export class NotificationTransformInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => {
                
                if (
                    data &&
                    typeof data === 'object' &&
                    'notifications' in data &&
                    'total' in data
                ) {
                    return plainToInstance(NotificationListResponseDto, data, {
                        excludeExtraneousValues: true,
                        enableImplicitConversion: true,
                    });
                }

               
                if (Array.isArray(data)) {
                    return data.map((item) =>
                        plainToInstance(NotificationResponseDto, item, {
                            excludeExtraneousValues: true,
                            enableImplicitConversion: true,
                        }),
                    );
                }

               
                if (data && typeof data === 'object' && 'type' in data) {
                    return plainToInstance(NotificationResponseDto, data, {
                        excludeExtraneousValues: true,
                        enableImplicitConversion: true,
                    });
                }

                
                return data;
            }),
        );
    }
}