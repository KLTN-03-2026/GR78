export interface ValidationErrorObject {
    [field: string]: string | string[] | ValidationErrorObject;
}