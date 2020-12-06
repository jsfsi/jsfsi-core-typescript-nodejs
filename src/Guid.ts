import uuid from 'uuid'

export class Guid {
    private _uuid: string

    private constructor(value: string) {
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
        return new Guid('00000000-0000-0000-0000-000000000000')
    }
}
