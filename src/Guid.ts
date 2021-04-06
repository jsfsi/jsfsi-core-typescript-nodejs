import uuid = require('uuid')

export class Guid {
    private _uuid: string

    public constructor(value: string) {
        uuid.parse(value)
        this._uuid = value
    }

    public toString() {
        return this._uuid
    }

    public equals(other: Guid) {
        return this._uuid === other.toString()
    }

    public static New() {
        return new Guid(uuid.v4())
    }

    public static Empty() {
        return new Guid(uuid.NIL)
    }

    public static IsValid(value: string) {
        return uuid.validate(value)
    }
}
