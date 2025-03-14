export const parseValidationErrors = (error: any) => {
    if (error.name === "ValidationError") {
        return Object.values(error.errors).map((err: any) => err.message);
    }
    return ["An unknown error occurred."];
};


class ErrorWithStatus extends Error {
    status: number;
    isCustom: boolean;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
        this.isCustom = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class UserNotFoundError extends ErrorWithStatus {
    constructor() {
        super("User not found.", 404);
    }

    static create() {
        return new UserNotFoundError();
    }
}


export class NotAuthenticatedError extends ErrorWithStatus {
    constructor(message: string, status: number) {
        super(message, status);
    }
}


export class InvalidDataError extends ErrorWithStatus {
    constructor (message: string) {
        super(message, 400);
    }
}


export class EntityNotFoundError extends ErrorWithStatus {
    constructor(message: string) {
        super(message, 404);
    }
}