export interface QuoteNotificationData {
    postId: string;
    quoteId: string;
    providerName?: string;
    customerName?: string;
    price?: number;
    postTitle: string;
    reason?: string;
}



export interface QuoteNotificationData {
    postId: string;
    quoteId: string;
    providerName?: string;
    customerName?: string;
    price?: number;
    postTitle: string;
    reason?: string;
    revisionNumber?: number;
    notes?: string;
}

export interface OrderNotificationData {
    orderId: string;
    orderTitle: string;
    orderNumber?: string;
    amount?: number;
    isProvider?: boolean;
    reason?: string;
}

export interface ReviewNotificationData {
    reviewId: string;
    rating: number;
    customerName: string;
    comment?: string;
}

export interface MessageNotificationData {
    senderId: string;
    senderName: string;
    messagePreview: string;
    chatId: string;
    conversationId?: string;
}

export interface PostNotificationData {
    postId: string;
    postTitle: string;
    action?: 'created' | 'updated' | 'closed' | 'deleted';
}

export interface SystemNotificationData {
    title: string;
    message: string;
    severity?: 'info' | 'warning' | 'error';
    actionUrl?: string;
}