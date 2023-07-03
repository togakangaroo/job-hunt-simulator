import random from "random"
import { compose, mean, jobHuntSimulation, singleJobApplication, runSimulationChains } from "./analysis.js"
import logo from "./logo.svg"
import "./App.css"

const jobApplicationParameters = {
  apply_jobIsReal: random.binomial(1, 0.7),
  apply_numberOfApplicants: random.poisson(20),
  apply_numberOfApplicantsToMoveOn: random.poisson(5),
  apply_resumeQuality: random.normal(0.7, 0.15),
  screening_phoneScreenPassed: random.binomial(1, 0.5),
  interview1_passed: random.binomial(1, 0.5),
  interview2_passed: random.binomial(1, 0.3),
  interview3_passed: random.binomial(1, 0.7),
  offer_offerReceivedVersusOthers: random.binomial(1, 0.5),
  offer_isGood: random.binomial(1, 0.8),
  general_position_disappears: random.binomial(1, 0.05), // will be tested multiple times
  general_periodsForCompanyToMoveIntoNextStage: compose(random.poisson(1), (x) => x + 1),
}
const jobHuntStrategyParameters = {
  numberOfApplicationsPerPeriod: random.poisson(25),
  takingAPeriodBreak: random.binomial(1, 0.125),
}

const BinomialParameter = ({ name, value, onChange }) => (
  <label>
    <div classname="label">{name}</div>
    <input type="range" value={value} onChange={(e) => onChange(e.target.value)} min={0.05} max={0.95} step={0.05} />
    <input readOnly value={value} />
  </label>
)

const PoissonParameter = ({ name, value, onChange, max, min = 1 }) => (
  <label>
    <div classname="label">{name}</div>
    <input type="range" value={value} onChange={(e) => onChange(e.target.value)} min={min} max={max} step={1} />
    <input readOnly value={value} />
  </label>
)

const NormalParameter = ({ name, onChangeMean, onChangeStdDev, mean, stddev }) => (
  <section>
    <label>
      <div classname="label">{name} - Mean</div>
      <input type="range" value={mean} onChange={(e) => onChangeMean(e.target.value)} min={0.05} max={0.95} step={0.05} />
      <input readOnly value={mean} />
    </label>
    <label>
      <div classname="label">{name} - Standard Deviation</div>
      <input type="range" value={stddev} onChange={(e) => onChangeMean(e.target.value)} min={0} max={1} step={0.05} />
      <input readOnly value={stddev} />
    </label>
  </section>
)

export const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          Learn React
        </a>
      </header>
    </div>
  )
}
