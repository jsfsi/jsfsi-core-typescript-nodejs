import { Guid } from '../../src/Guid'

import uuid = require('uuid')

describe('Guid', () => {
    it('generates guid', () => {
        const guid = Guid.New()

        expect(uuid.validate(guid.toString())).toBe(true)
    })
})
