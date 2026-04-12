import {
    CallHandler,
    ExecutionContext,
    Inject,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { DataSource, QueryRunner } from 'typeorm';
import { TRANSACTION_KEY } from '../decorators/@Transaction';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
    constructor(
        @Inject(DataSource)
        private readonly dataSource: DataSource,
        private readonly reflector: Reflector,
    ) { }

    async intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Promise<Observable<unknown>> {
        const isTransactional = this.reflector.get<boolean>(
            TRANSACTION_KEY,
            context.getHandler(),
        );

        if (!isTransactional) {
            return next.handle();
        }

        const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        const request = context.switchToHttp().getRequest();
        request.transactionManager = queryRunner.manager;

        return next.handle().pipe(
            tap(async () => {
                await queryRunner.commitTransaction();
                await queryRunner.release();
            }),
            catchError(async (error) => {
                await queryRunner.rollbackTransaction();
                await queryRunner.release();
                return throwError(() => error);
            }),
        );
    }
}