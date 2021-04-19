/* eslint-disable @typescript-eslint/no-explicit-any */
export interface MappingProperty {
  [resultField: string]: string
}

export class DatabaseMapper<T> {
  private _databaseObject: any

  private constructor(databaseObject: any) {
    this._databaseObject = databaseObject
  }

  public static map<T>(databaseObject: any) {
    return new DatabaseMapper<T>(databaseObject)
  }

  public properties(properties: Array<string | MappingProperty>): T {
    const mappedInstance = {} as T

    properties.forEach(property => {
      if (typeof property === 'string') {
        ;(mappedInstance as any)[property] = this._databaseObject[
          property.toString().toLowerCase()
        ]
      }

      if (typeof property === 'object') {
        const key = Object.keys(property as MappingProperty)[0] as string
        ;(mappedInstance as any)[key] = this._databaseObject[property[key]]
      }
    })

    return mappedInstance
  }
}
