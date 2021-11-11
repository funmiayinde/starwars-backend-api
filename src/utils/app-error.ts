/**
 * The App Error class
 * */
 class AppError extends Error {
    private readonly _code: number;
    private readonly _messages: any;

    /**
     * @param {String} message The error message
     * @param {String} code The status code of the error
     * @param messages
     * */
    constructor(message: string, code: number, messages?: any) {
        super(message);
        this._code = code;
        if (messages) {
            this._messages = messages;
        }
    }

    /**
     * @return {Number}
     * */
    get code() {
        return this._code;
    }

    /**
     * @return {String}
     * */
    get message() {
        return this._messages;
    }

    /**
     * @return {Object} The instance of AppError
     * */
    format() {
        const obj: any = { code: this._code, message: this.message };
        if (this._messages) {
            obj.messages = this._messages.errors || this._messages;
        }
        return obj;
    }
}

export default AppError;
