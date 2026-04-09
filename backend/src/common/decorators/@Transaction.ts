import {
    createParamDecorator,
    ExecutionContext,
    SetMetadata
} from '@nestjs/common';

export const TRANSACTION_KEY = 'transaction';

export const Transactional = () => SetMetadata(TRANSACTION_KEY, true);

export const TransactionManager = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.transactionManager;
    },
);




