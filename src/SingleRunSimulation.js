import { sum, runSingleJobHuntSimulation, singleJobApplication, runSimulationChains } from "./analysis.js"
import { period } from "./constants.js"

export const SingleRunSimulation = ({ parameters }) => {
  const periods = Array.from(runSingleJobHuntSimulation(parameters, () => singleJobApplication(parameters)))
  const offerCount = sum(periods.map((p) => p.offers.size))
  return (
    <article className="single-run-simulation">
      <header>Sample single job hunt simulation.</header>
      <p>
        The job hunt took {periods.length} {`${period}s`}. Ultimately receiving {offerCount} offers.
      </p>
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
