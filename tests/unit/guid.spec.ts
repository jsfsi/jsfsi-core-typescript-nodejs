import * as uuid from 'uuid'
import { Guid } from '../../src/Guid'

describe('Guid', () => {
  it('generates guid', () => {
    const guid = Guid.New()

    expect(uuid.validate(guid.toString())).toBe(true)
  })
})
