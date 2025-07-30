class ErrorHandler extends Error {
    statusCode: Number;
    constructor(err: any, statusCode: Number) {
        if (err instanceof Error) {
            super(err.message);
            this.stack = err.stack;
            this.name = err.name;
        } else {
            super(err);
        }
        this.statusCode = statusCode;

        Error.captureStackTrace(this, this.constructor);
    }
}

export default ErrorHandler;
