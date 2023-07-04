import React, { useState, createElement } from "react"
import { SimulationRun } from "./SimulationRun.js"
import { SingleRunSimulation } from "./SingleRunSimulation.js"
import { simulationParametersConfig } from "./simulationParametersConfig.js"
import { period } from "./constants.js"
import "./App.css"

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
      <p className="simulation-description">
        Here is a basic simulation of a job hunt. Given the parameters you set on the left, it is run many times. On the right you see the results of
        running simulations and a {period}ly log of a sample simulation. Note that the purpose is not so much for accurate estimates, so much as to
        give you a feel for how best to invest your time.
        <a href="https://github.com/togakangaroo/job-hunt-simulator">Repository here.</a> Pull requests to redo my likely-bad data science are very
        welcome.
      </p>
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
