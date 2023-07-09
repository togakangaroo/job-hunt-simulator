import React, { useState, createElement } from "react"
import { SimulationRun } from "./SimulationRun.js"
import { SingleRunSimulation } from "./SingleRunSimulation.js"
import { simulationParametersConfig } from "./simulationParametersConfig.js"
import { DescriptionAndOptions } from "./DescriptionAndOptions.js"
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
