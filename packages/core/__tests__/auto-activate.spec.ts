import { describe, expect, it } from 'vitest'

import { autoActivate, OrchModel } from '../src'

@autoActivate()
class CountModel extends OrchModel<{ count: number }> {}

describe(`autoActivate`, () => {
  it('should automatic activate model', () => {
    const model = new CountModel({ count: 1 })

    expect(model.status).toBe('active')
  })

  it('should pass the prototype check', () => {
    const model = new CountModel({ count: 1 })

    expect(model instanceof OrchModel).toBe(true)
  })

  it("should not change class's name", () => {
    expect(CountModel.name).toBe('CountModel')
  })

  describe('deferActivation', () => {
    it('should be able to defer activation', () => {
      const model1 = autoActivate.deferActivation(() => new CountModel({ count: 1 }))
      const model2 = new CountModel({ count: 1 })

      expect(model1.status).toBe('initialized')
      expect(model2.status).toBe('active')
    })
  })
})
