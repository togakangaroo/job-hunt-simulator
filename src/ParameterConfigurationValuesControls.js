import { createElement } from "react"
import { simulationParametersConfig } from "./simulationParametersConfig.js"
import { useParameterConfigurationValues } from "./useParameterConfigurationValues.js"

export const ParameterConfigurationValuesControls = () => {
  const [parameterConfigurationValues, setParameterConfigurationValues] = useParameterConfigurationValues()

  return (
    <ul>
      {Object.entries(parameterConfigurationValues).map(([name, args]) => {
        const { component, description, componentArgs } = simulationParametersConfig[name]
        return (
          <li key={name}>
            {createElement(component, {
              name,
              description,
              onChange: (x) => setParameterConfigurationValues({ [name]: x }),
              ...(componentArgs || {}),
              ...args,
            })}
          </li>
        )
      })}
    </ul>
  )
}
