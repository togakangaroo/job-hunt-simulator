import React, { useState, useEffect } from "react"
import { mean, runSingleJobHuntSimulation, singleJobApplication, runSimulationChains } from "./analysis.js"
import { period } from "./constants.js"

const HorizontalBar = ({ width }) => <div className="graph-horizontal-bar" style={{ width: `${width}%` }} />

const simulationGroupSize = 100
const deferRunning = (fn) => {
  const handle = setTimeout(fn, 0)
  return () => clearTimeout(handle)
}

// Break down simulation and run it in groups, passing back accumulated results as they are ready. This is helpful for when the number of iterations to run is high or the computer is slow. Plus you get a cool effect of the results "honing in" on a value.
const runSimulationInGroups = (parameters, numberOfSimulationsToRun, setSimulationResultsAndCount) => () => {
  // TODO - Rewrite this as an async iterator to get rid of the need for any react-isms at all
  const _runSingleJobHuntSimulation = () => runSingleJobHuntSimulation(parameters, () => singleJobApplication(parameters))
  const simulationsIterator = runSimulationChains(numberOfSimulationsToRun, _runSingleJobHuntSimulation)[Symbol.iterator]()
  let cancelNextRun = null
  let simulationGroupResults = []
  let [prevResults, prevResultsCount] = [null, 0]

  const runNextSimulationGroup = () => {
    let stopProcessing = false
    for (let i = 0; i < simulationGroupSize; i += 1) {
      const { done, value: simulation } = simulationsIterator.next()
      stopProcessing = done
      if (!done) simulationGroupResults.push(simulation)
    }

    const nextResultsCount = prevResultsCount + simulationGroupResults.length
    const addProportion = (valueInResults, valueInGroup) =>
      (prevResultsCount * (valueInResults || 0) + simulationGroupResults.length * (valueInGroup || 0)) / nextResultsCount

    const meanPeriodsToEnd = addProportion(prevResults?.meanPeriodsToEnd, mean(simulationGroupResults.map((x) => x.periods)))
    const meanTotalApplications = addProportion(prevResults?.meanTotalApplications, mean(simulationGroupResults.map((x) => x.totalApplications)))
    const meanTotalOffers = addProportion(prevResults?.meanTotalOffers, mean(simulationGroupResults.map((x) => x.allOffers.size)))

    const allRejectionReasons = new Set([
      ...(simulationGroupResults.map((x) => x.unsuccesfulCountsByReason.keys()).flatMap((x) => Array.from(x)) || []),
      ...Object.keys(prevResults?.meanRejectionsByReason || {}),
    ])
    const meanRejectionsByReason = Object.fromEntries(
      Array.from(allRejectionReasons.values())
        .sort()
        .map((reason) => [
          reason,
          addProportion(
            prevResults?.meanRejectionsByReason[reason],
            mean(simulationGroupResults.map((x) => x.unsuccesfulCountsByReason.get(reason) || 0))
          ),
        ])
    )

    simulationGroupResults = []
    prevResults = { meanPeriodsToEnd, meanTotalApplications, meanTotalOffers, meanRejectionsByReason }
    prevResultsCount = nextResultsCount
    setSimulationResultsAndCount([prevResults, prevResultsCount])
    if (!stopProcessing) cancelNextRun = deferRunning(runNextSimulationGroup)
  }
  cancelNextRun = deferRunning(runNextSimulationGroup)

  return () => cancelNextRun?.()
}

export const SimulationRun = ({ parameters: originalParameters }) => {
  const { general_numberOfSimulationsToRun, ...parameters } = originalParameters
  const [[simulationResults, simulationsInResultsCount], setSimulationResultsAndCount] = useState([null, 0])

  // eslint-disable-next-line
  useEffect(runSimulationInGroups(parameters, general_numberOfSimulationsToRun(), setSimulationResultsAndCount), [
    originalParameters,
    general_numberOfSimulationsToRun(),
  ])

  const pcnt = (val) =>
    !simulationResults || !simulationResults.meanTotalApplications ? null : (100.0 * val) / simulationResults.meanTotalApplications

  return (
    <article className="simulation-run">
      <header>
        Simulation Results ({simulationsInResultsCount} / {general_numberOfSimulationsToRun()} run)
      </header>
      {!simulationResults ? null : (
        <dl className="simulation-results">
          <dd>Mean {period}s in job hunt</dd>
          <dt>{simulationResults.meanPeriodsToEnd.toFixed(2)}</dt>
          <dd>Mean total applications</dd>
          <dt>{simulationResults.meanTotalApplications.toFixed(2)}</dt>
          <dd>Mean total offers</dd>
          <dt>{simulationResults.meanTotalOffers.toFixed(2)}</dt>
          <dd>Mean Rejections by Reason</dd>
          <dt>
            <dl className="simulation-rejections-by-reason">
              {Object.entries(simulationResults.meanRejectionsByReason).map(([reason, count]) => (
                <React.Fragment key={reason}>
                  <dd>
                    <div>{reason}</div>
                    <HorizontalBar width={pcnt(count)} />
                  </dd>
                  <dt>{count.toFixed(2)}</dt>
                </React.Fragment>
              ))}
            </dl>
          </dt>
        </dl>
      )}
    </article>
  )
}
