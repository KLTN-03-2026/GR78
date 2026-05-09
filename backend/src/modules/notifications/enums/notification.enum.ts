export enum NotificationType {
    NEW_QUOTE_RECEIVED = 'new_quote_received', 
    QUOTE_ACCEPTED = 'quote_accepted', 
    QUOTE_REJECTED = 'quote_rejected', 

   
    POST_CLOSED = 'post_closed', 
    POST_UPDATED = 'post_updated', 

    
    DIRECT_REQUEST_RECEIVED = 'direct_request_received', 
    DIRECT_REQUEST_ACCEPTED = 'direct_request_accepted', 
    DIRECT_REQUEST_REJECTED = 'direct_request_rejected', 

   
    ORDER_CREATED = 'order_created', 
    ORDER_IN_PROGRESS = 'order_in_progress', 
    ORDER_COMPLETED = 'order_completed', 
    ORDER_CANCELLED = 'order_cancelled', 

    
    PAYMENT_RECEIVED = 'payment_received', 
    PAYMENT_FAILED = 'payment_failed', 
    REFUND_PROCESSED = 'refund_processed', 

   
    NEW_REVIEW_RECEIVED = 'new_review_received', 
    REVIEW_REPLY_RECEIVED = 'review_reply_received', 

    
    NEW_MESSAGE = 'new_message', 

  
    ACCOUNT_VERIFIED = 'account_verified', 
    ACCOUNT_SUSPENDED = 'account_suspended', 
    ACCOUNT_WARNING = 'account_warning', 
    SYSTEM_ANNOUNCEMENT = 'system_announcement', 



    QUOTE_ACCEPTED_FOR_CHAT = 'quote_accepted_for_chat',
    QUOTE_REVISED = 'quote_revised',
    QUOTE_CANCELLED = 'quote_cancelled',
    ORDER_REQUESTED = 'order_requested',
    ORDER_AWAITING_CONFIRMATION = 'order_awaiting_confirmation',

    // Subscription & fee lifecycle
    SUBSCRIPTION_TRIAL_STARTED = 'subscription_trial_started',
    SUBSCRIPTION_TRIAL_ENDING = 'subscription_trial_ending',
    SUBSCRIPTION_TRIAL_EXPIRED = 'subscription_trial_expired',
    SUBSCRIPTION_ACTIVATED = 'subscription_activated',
    SUBSCRIPTION_RENEWAL_REMINDER = 'subscription_renewal_reminder',
    SUBSCRIPTION_EXPIRED = 'subscription_expired',
    SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
    SUBSCRIPTION_PAYMENT_PENDING = 'subscription_payment_pending',
    SUBSCRIPTION_PAYMENT_SUCCESS = 'subscription_payment_success',
}


