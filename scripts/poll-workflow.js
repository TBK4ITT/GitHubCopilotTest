const https = require('https')
const sha = 'edc457a19d3a97368aa70bb2d898ae92909e396c'
const owner = 'TBK4ITT'
const repo = 'GitHubCopilotTest'
const maxPolls = 40
let polls = 0

function fetchRuns() {
  return new Promise((res, rej) => {
    https.get(`https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=100`, { headers: { 'User-Agent': 'node' } }, (r) => {
      let data = ''
      r.on('data', (c) => data += c)
      r.on('end', () => {
        try {
          res(JSON.parse(data))
        } catch (e) { rej(e) }
      })
    }).on('error', rej)
  })
}

async function run() {
  while (polls++ < maxPolls) {
    try {
      const body = await fetchRuns()
      const runs = (body.workflow_runs || []).filter(r => r.head_sha === sha && (r.name === 'E2E Tests' || r.name === 'CI'))
      if (runs.length === 0) {
        console.log('[poll]', polls, 'no runs found yet')
      } else {
        for (const r of runs) {
          console.log('[run]', r.id, r.name, 'status=' + r.status, 'conclusion=' + r.conclusion, r.html_url)
        }
        const incomplete = runs.filter(r => r.status !== 'completed')
        if (incomplete.length === 0) {
          console.log('All matching runs completed')
          // exit with success; include run summary in stdout
          process.exit(0)
        }
      }
    } catch (e) {
      console.error('[error]', e && e.message ? e.message : e)
    }
    await new Promise(r => setTimeout(r, 15000))
  }
  console.error('Timed out waiting for runs to complete')
  process.exit(2)
}

run()
