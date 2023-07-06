import { useState, useEffect } from "react"
import { sum, runSingleJobHuntSimulation, singleJobApplication } from "./analysis.js"
import { period } from "./constants.js"

export const SingleRunSimulation = ({ parameters }) => {
  const [periods, setPeriods] = useState(null)
  const runSingleSimulation = () => setPeriods(Array.from(runSingleJobHuntSimulation(parameters, () => singleJobApplication(parameters))))
  useEffect(runSingleSimulation, [parameters])
  const offerCount = sum(periods?.map((p) => p.offers.size) || [])
  if (!periods) return null
  return (
    <article className="single-run-simulation">
      <header>Sample single job hunt simulation.</header>
      <p>
        This job hunt took {periods.length} {`${period}s`}. Ultimately receiving {offerCount} offers.
      </p>
      <div className="actions">
        <button onClick={runSingleSimulation}>Generate New Sample</button>
      </div>
      <ul>
        {periods.map(({ unsuccessful, newApplicationCount, stageCounts }, period) => (
          <li key={period}>
            <header>Week {period}:</header>
            <dl>
              <dd>Applied</dd>
              <dt>{newApplicationCount} jobs</dt>
              <dd>Rejected</dd>
              <dt>{unsuccessful.size}</dt>
              <dd>In flight status:</dd>
              <dt>
                <pre>{JSON.stringify(Object.fromEntries(stageCounts.entries()))}</pre>
              </dt>
            </dl>
          </li>
        ))}
      </ul>
    </article>
  )
}
