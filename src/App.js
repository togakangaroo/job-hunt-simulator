import React, { useState, createElement } from "react"
import random from "random"
import { compose, sum, mean, runSingleJobHuntSimulation, singleJobApplication, runSimulationChains } from "./analysis.js"
import "./App.css"

const BinomialParameter = ({ name, value, onChange, description }) => (
  <section>
    <header>
      <p>{description}</p>
    </header>
    <label>
      <div className="label">{name}</div>
      <input type="range" value={value} onChange={(e) => onChange({ value: parseFloat(e.target.value) })} min={0.05} max={0.95} step={0.05} />
      <input readOnly value={value} /> (Likelihood of success)
    </label>
  </section>
)

const PoissonParameter = ({ name, value, onChange, description, max, min = 1, step = 1 }) => (
  <section>
    <header>
      <p>{description}</p>
    </header>
    <label>
      <div className="label">{name}</div>
      <input type="range" value={value} onChange={(e) => onChange({ value: parseFloat(e.target.value) })} min={min} max={max} step={step} />
      <input readOnly value={value} /> (λ parameter in a Poisson distribution)
    </label>
  </section>
)

const ConstantParameter = ({ name, value, onChange, description, max, min = 1, step = 1 }) => (
  <section>
    <header>
      <p>{description}</p>
    </header>
    <label>
      <div className="label">{name}</div>
      <input type="range" value={value} onChange={(e) => onChange({ value: parseFloat(e.target.value) })} min={min} max={max} step={step} />
      <input readOnly value={value} />
    </label>
  </section>
)

const NormalParameter = ({ name, onChange, mean, stddev, description }) => (
  <section>
    <header>
      {name}
      <p>{description}</p>
    </header>
    <label>
      <div className="label">{name} - Mean</div>
      <input type="range" value={mean} onChange={(e) => onChange({ mean: parseFloat(e.target.value), stddev })} min={0.05} max={0.95} step={0.05} />
      <input readOnly value={mean} />
    </label>
    <label>
      <div className="label">{name} - Standard Deviation</div>
      <input type="range" value={stddev} onChange={(e) => onChange({ mean, stddev: parseFloat(e.target.value) })} min={0} max={1} step={0.05} />
      <input readOnly value={stddev} />
    </label>
  </section>
)

const poissonParameter = {
  fn: (x) => random.poisson(x.value),
  component: PoissonParameter,
}
const binomialParameter = {
  fn: (x) => random.binomial(1, x.value),
  component: BinomialParameter,
}

const period = `week`

const simulationParametersConfig = {
  numberOfApplicationsPerPeriod: {
    ...poissonParameter,
    defaultArgs: { value: 25 },
    componentArgs: { min: 1, max: 100 },
    description: `How many applicants per ${period} are you comitting to make?`,
  },
  desiredOfferCount: {
    fn: (x) => () => x.value,
    component: ConstantParameter,
    defaultArgs: { value: 1 },
    componentArgs: { min: 1, max: 10, step: 1 },
    description: `How many offers are you holding out for?`,
  },
  takingAPeriodBreak: {
    ...binomialParameter,
    defaultArgs: { value: 0.125 },
    description: `Sometimes you just need to take a break. How likely in a given ${period} are you to take a break and skip applying?`,
  },
  apply_jobIsReal: {
    ...binomialParameter,
    defaultArgs: { value: 0.7 },
    description: `Sometimes the job posting is not real. Maybe they're gathering resumes rather than actively hiring, or it's an old posting, or its slated for a specific internal person and had to be posted publicly, or often there just isn't anyone manning the hiring apparatus on the company side. This is the probability the job posting is real and active.`,
  },
  apply_numberOfApplicants: {
    ...poissonParameter,
    defaultArgs: { value: 20 },
    componentArgs: { min: 1, max: 200 },
    description: `How many applicants per ${period} are applying to this position on the average?`,
  },
  apply_numberOfApplicantsToMoveOn: {
    ...poissonParameter,
    defaultArgs: { value: 5 },
    componentArgs: { min: 1, max: 25 },
    description: `How many applicants per ${period} from the total amount of applicants will be passed onto the next phase on average?`,
  },
  apply_resumeQuality: {
    defaultArgs: { mean: 0.7, stddev: 0.15 },
    fn: (x) => random.normal(x.mean, x.stddev),
    component: NormalParameter,
    description: `How good is your resume compared to others as far as a fit for this role is concerned? Imagine the fit of all resumes on a bell curve 0-1 with peak at .5. The mean represents where your resume falls, the standard deviation is how sure you are of this.`,
  },
  screening_phoneScreenPassed: {
    ...binomialParameter,
    defaultArgs: { value: 0.5 },
    description: `Likelihood that you pass the phone screen.`,
  },
  interview1_passed: {
    ...binomialParameter,
    defaultArgs: { value: 0.5 },
    description: `Likelihood that you pass the first interview.`,
  },
  interview2_passed: {
    ...binomialParameter,
    defaultArgs: { value: 0.3 },
    description: `Likelihood that you pass the second interview.`,
  },
  interview3_passed: {
    ...binomialParameter,
    defaultArgs: { value: 0.7 },
    description: `Likelihood that you pass the third interview.`,
  },
  offer_offerReceivedVersusOthers: {
    ...binomialParameter,
    defaultArgs: { value: 0.5 },
    description: `Likelihood that of all the people who passed the interviews you receive an offer. Given that you passed all the interviews, how likely are you to get an offer versus hearing they went with a more suitable candidate?`,
  },
  offer_isGood: {
    ...binomialParameter,
    defaultArgs: { value: 0.8 },
    description: `Given that you receive an offer, how likeley is it that it will be good enough to accept (or that you can negotiate it to that).`,
  },
  general_periodsForCompanyToMoveIntoNextStage: {
    fn: (x) => compose(random.poisson(x.value), (n) => n + 1),
    component: PoissonParameter,
    defaultArgs: { value: 1 },
    componentArgs: { min: 0.5, max: 2, step: 0.1 },
    description: `Companies handle resumes at different paces. This is an estimate of how many ${period}s a company will take to move you to the next stage.`,
  },
  general_positionDisappears: {
    ...binomialParameter,
    defaultArgs: { value: 0.05 },
    componentArgs: { min: 0.01, max: 0.3, step: 0.01 },
    description: `Sometimes positions get frozen, re-orged, or the ball gets dropped. What are the chances at each stage that this will happen with each position? Note that this will be applied at each stage after the first.`,
  },
}

const SingleRunSimulation = ({ parameters }) => {
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
            <p>Applied to: {newApplicationCount}</p>
            <p>Rejected from: {unsuccessful.size}</p>
            <p>
              In flight status:
              <pre>{JSON.stringify(Object.fromEntries(stageCounts.entries()))}</pre>
            </p>
          </li>
        ))}
      </ul>
    </article>
  )
}

const SimulationRun = ({ parameters }) => {
  const simulationCount = 1000
  const simulationResults = Array.from(
    runSimulationChains(simulationCount, () => runSingleJobHuntSimulation(parameters, () => singleJobApplication(parameters)))
  )
  const meanPeriodsToEnd = mean(simulationResults.map((x) => x.periods))
  const meanTotalApplications = mean(simulationResults.map((x) => x.totalApplications))
  const allRejectionReasons = new Set(simulationResults.map((x) => x.unsuccesfulCountsByReason.keys()).flatMap((x) => Array.from(x)))
  const meanTotalOffers = mean(simulationResults.map((x) => x.allOffers.size))
  const meanRejectionsByReason = Array.from(allRejectionReasons.values()).map((reason) => [
    reason,
    mean(simulationResults.map((x) => x.unsuccesfulCountsByReason.get(reason) || 0)),
  ])
  return (
    <article className="simulation-run">
      <header>Simulation Results</header>
      <dl>
        <dd>Mean {period}s in job hunt</dd>
        <dt>{meanPeriodsToEnd}</dt>
        <dd>Mean total applications</dd>
        <dt>{meanTotalApplications}</dt>
        <dd>Mean total offers</dd>
        <dt>{meanTotalOffers}</dt>
        <dd>Mean Rejections by Reason</dd>
        <dt>
          <dl>
            {meanRejectionsByReason.map(([reason, count]) => (
              <React.Fragment key={reason}>
                <dd>{reason}</dd>
                <dt>{count}</dt>
              </React.Fragment>
            ))}
          </dl>
        </dt>
      </dl>
    </article>
  )
}

export const App = () => {
  const [simulationParameters, _setSimulationParmeters] = useState(
    Object.fromEntries(Object.entries(simulationParametersConfig).map(([name, { defaultArgs }]) => [name, defaultArgs]))
  )
  // TODO - check if this can be done with useReducer or something similar
  const setSimulationParmeters = (fragment) => _setSimulationParmeters({ ...simulationParameters, ...fragment })
  const simulationRunParameters = Object.fromEntries(
    Object.entries(simulationParameters).map(([name, value]) => [name, simulationParametersConfig[name].fn(value)])
  )
  return (
    <article className="App">
      <ul>
        {Object.entries(simulationParameters).map(([name, args]) => {
          const { component, description, componentArgs } = simulationParametersConfig[name]
          return (
            <li key={name}>
              {createElement(component, {
                name,
                description,
                onChange: (x) => setSimulationParmeters({ [name]: x }),
                ...(componentArgs || {}),
                ...args,
              })}
            </li>
          )
        })}
      </ul>
      <section className="results">
        <SimulationRun parameters={simulationRunParameters} />
        <SingleRunSimulation parameters={simulationRunParameters} />
      </section>
    </article>
  )
}
