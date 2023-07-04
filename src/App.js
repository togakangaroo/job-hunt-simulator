import React, { useState, createElement } from "react"
import { SimulationRun } from "./SimulationRun.js"
import { SingleRunSimulation } from "./SingleRunSimulation.js"
import { simulationParametersConfig } from "./simulationParametersConfig.js"
import { period } from "./constants.js"
import { SaveLoadParameters } from "./SaveLoadParameters.js"
import "./App.css"

const DescriptionAndOptions = ({ parameters, setParameters }) => {
  const [showMore, setShowMore] = useState(false)
  return (
    <section className="simulation-info">
      <input id="show-more-simulation-info" type="checkbox" onChange={(e) => setShowMore(e.target.checked)} />
      <div className="simulation-description-contents">
        <p>
          Here is a basic simulation of a job hunt. Given the parameters you set on the left, it is run many times. On the right you see the results
          of running simulations and a {period}ly log of a sample simulation. Note that the purpose is not so much for accurate estimates, so much as
          to give you a feel for how best to invest your time.
        </p>
        <p>
          For example, this might say that given your parameters you should expect the job search to last 40 weeks. I am not confident of that as an
          absolute value. However, if you are trying to decide the impact of taking every tenth or every third week off, or whether you should spend
          time tweaking your resume versus spending time on interview prep, this is intended to give you an intuitive understanding of relative
          impact.
        </p>
        <p>
          <a href="https://github.com/togakangaroo/job-hunt-simulator">Repository here.</a> Pull requests to redo my likely-bad data science are very
          welcome.
        </p>
        <SaveLoadParameters parameters={parameters} setParameters={setParameters} />
      </div>
      <label htmlFor="show-more-simulation-info">{showMore ? `∧ Show Less ∧` : `∨ Show More ∨`}</label>
    </section>
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
      <DescriptionAndOptions parameters={simulationParameters} setParameters={setSimulationParmeters} />
      <section className="parameter-configuration">
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
      </section>
      <section className="simulation-results">
        <SimulationRun parameters={simulationRunParameters} />
        <SingleRunSimulation parameters={simulationRunParameters} />
      </section>
    </article>
  )
}
