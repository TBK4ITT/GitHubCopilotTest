import React from 'react'
import { simulate } from '../api/user'

export default function DevTools() {
  if (!import.meta.env.DEV) return null

  const [failNext, setFailNext] = React.useState(simulate.failNext)
  const [failRate, setFailRate] = React.useState(simulate.failRate)
  const [rateLimit, setRateLimit] = React.useState(simulate.rateLimitPerId)

  const apply = () => {
    simulate.failNext = failNext
    simulate.failRate = Number(failRate)
    simulate.rateLimitPerId = Number(rateLimit)
    simulate.requestCounts = {}
  }

  const reset = () => {
    simulate.reset()
    setFailNext(false)
    setFailRate(0)
    setRateLimit(0)
  }

  return (
    <div style={{ padding: 12 }}>
      <h3>Dev Tools (dev only)</h3>
      <div>
        <label>
          <input data-testid="dev-failNext" type="checkbox" checked={failNext} onChange={(e) => setFailNext(e.target.checked)} />
          Fail next request
        </label>
      </div>
      <div>
        <label>
          Fail rate (0-1): <input data-testid="dev-failRate" type="number" min="0" max="1" step="0.1" value={failRate} onChange={(e) => setFailRate(Number(e.target.value))} />
        </label>
      </div>
      <div>
        <label>
          Rate limit per id: <input data-testid="dev-rateLimit" type="number" min="0" value={rateLimit} onChange={(e) => setRateLimit(Number(e.target.value))} />
        </label>
      </div>
      <div style={{ marginTop: 8 }}>
        <button data-testid="dev-apply" onClick={apply}>Apply</button>
        <button data-testid="dev-reset" onClick={reset} style={{ marginLeft: 8 }}>Reset</button>
      </div>
    </div>
  )
}