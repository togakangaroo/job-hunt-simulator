import React, { useState, useEffect } from "react"
import { mean, runSingleJobHuntSimulation, singleJobApplication, runSimulationChains } from "./analysis.js"
import { period, simulationCount } from "./constants.js"

export const SimulationRun = ({ parameters }) => {
  const [simulationResults, setSimulationResults] = useState(null)
  useEffect(() => {
    const handle = setTimeout(() => {
      const results = Array.from(
        runSimulationChains(simulationCount, () => runSingleJobHuntSimulation(parameters, () => singleJobApplication(parameters)))
      )
      const meanPeriodsToEnd = mean(results.map((x) => x.periods))
      const meanTotalApplications = mean(results.map((x) => x.totalApplications))
      const allRejectionReasons = new Set(results.map((x) => x.unsuccesfulCountsByReason.keys()).flatMap((x) => Array.from(x)))
      const meanTotalOffers = mean(results.map((x) => x.allOffers.size))
      const meanRejectionsByReason = Array.from(allRejectionReasons.values()).map((reason) => [
        reason,
        mean(results.map((x) => x.unsuccesfulCountsByReason.get(reason) || 0)),
      ])
      setSimulationResults({ meanPeriodsToEnd, meanTotalOffers, meanTotalApplications, meanRejectionsByReason })
    }, 500) //debounce by 500ms
    return () => clearTimeout(handle)
  }, [parameters])
  return (
    <article className="simulation-run">
      <header>Simulation Results</header>
      {!simulationResults ? null : (
        <dl className="simulation-results">
          <dd>Mean {period}s in job hunt</dd>
          <dt>{simulationResults.meanPeriodsToEnd}</dt>
          <dd>Mean total applications</dd>
          <dt>{simulationResults.meanTotalApplications}</dt>
          <dd>Mean total offers</dd>
          <dt>{simulationResults.meanTotalOffers}</dt>
          <dd>Mean Rejections by Reason</dd>
          <dt>
            <dl className="simulation-rejections-by-reason">
              {simulationResults.meanRejectionsByReason.map(([reason, count]) => (
                <React.Fragment key={reason}>
                  <dd>{reason}</dd>
                  <dt>{count}</dt>
                </React.Fragment>
              ))}
            </dl>
          </dt>
        </dl>
      )}
    </article>
  )
}
