export class DomainException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DomainException';
    }
}

export class ValidationException extends DomainException {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationException';
    }
}

export class AuthorizationException extends DomainException {
    constructor(message: string) {
        super(message);
        this.name = 'AuthorizationException';
    }
}

export class NotFoundException extends DomainException {
    constructor(resource: string, id: string) {
        super(`${resource} with id ${id} not found`);
        this.name = 'NotFoundException';
    }
}
