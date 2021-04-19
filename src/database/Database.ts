import Knex from 'knex'
import { Disposable } from '@jsfsi-core/typescript-cross-platform'
import { Logger } from '../Logger'

export interface DataBaseConfig extends Knex.Config {
  schema: string
}

export class Database implements Disposable {
  private static _database: Knex
  private static _instancesInUsage = 0
  private static _destroyingDatabase = false
  private _schemaName: string

  constructor(param: DataBaseConfig) {
    Database._instancesInUsage++
    if (!Database._database || Database._destroyingDatabase) {
      Database._database = Knex(param)
    }

    this._schemaName = param.schema
  }

  private pagedQuery(page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize

    return Database._database
      .withSchema(this._schemaName)
      .limit(pageSize)
      .offset(offset)
  }

  public async transaction(executer: (transaction: Knex.QueryBuilder) => void) {
    return await Database._database.transaction(async transaction => {
      await executer(transaction.withSchema(this._schemaName))
    })
  }

  public query(page?: number, pageSize?: number) {
    return page === undefined && pageSize === undefined
      ? Database._database.withSchema(this._schemaName)
      : this.pagedQuery(page, pageSize)
  }

  public async count(tableName: string) {
    return parseInt(
      (
        await this.query()
          .count({ count: '*' })
          .from(tableName)
      )[0].count,
      0,
    )
  }

  public get rawInstance() {
    return Database._database
  }

  public async dispose() {
    Database._instancesInUsage--

    if (!Database._instancesInUsage) {
      Logger.debug('Disposing database')
      Database._destroyingDatabase = true
      await Database._database.destroy()
      // Double check because of asynchronous operation
      if (!Database._instancesInUsage) {
        Logger.debug('Database without usage')
        Database._database = null
      }
    }

    Database._destroyingDatabase = false
  }
}
