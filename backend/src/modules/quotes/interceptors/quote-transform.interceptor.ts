import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { map, Observable } from 'rxjs';
import { QuoteResponseDto } from '../dtos/quote.dto';


@Injectable()
export class QuoteTransformInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => {
                if (Array.isArray(data)) {
                    return data.map((item) =>
                        plainToInstance(QuoteResponseDto, item, {
                            excludeExtraneousValues: true,
                            enableImplicitConversion: true,
                        }),
                    );
                }

                
                if (data && typeof data === 'object') {
                    return plainToInstance(QuoteResponseDto, data, {
                        excludeExtraneousValues: true,
                        enableImplicitConversion: true,
                    });
                }

                
                return data;
            }),
        );
    }
}