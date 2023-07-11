import { SimulationRun } from "./SimulationRun.js"
import { SingleRunSimulation } from "./SingleRunSimulation.js"
import { DescriptionAndOptions } from "./DescriptionAndOptions.js"
import { simulationParametersConfig } from "./simulationParametersConfig.js"
import { ParameterConfigurationValuesControls } from "./ParameterConfigurationValuesControls.js"
import { useParameterConfigurationValues } from "./useParameterConfigurationValues.js"
import { mapValues } from "./mapValues.js"
import "./App.css"

// The shape of these objects is as follows
//
// simulationParamtersConfig:
//   An object of the form
//   {
//      [parameterName]: {
//        // function to be combined with values to get the samplying function. defaultArgs will be passed in here to get sampled values.
//        fn: (parameterConfigurationValues) => value
//        // The object that will be passed into `fn` when other values are not set. Also used for props to the component
//        defaultArgs: {...}
//        // component to render configuration. Takes props of the same shape as `paramterConfigurationValues` of `fn`.
//        component: ReactComponentToUse
//        // Additional other props to pass into component
//        componentArgs: {...}
//        // Text description of what the component does
//        description: str
//      }
//   }
// Parameters:
//   An object of the form
//   {
//       [parameterName]: () => value
//   }
//   Invoke each function to get a sample value for that parameter. This is typically a curried form of the `fn`
//
// ParametersConfigurationValues:
//   An object of the form
//   {
//      [parameterName]: {...}
//   }
//
// Where `parameterName` is all the keys from the `simulationParaetersConfig`
// object and each value is an object of values to be used in defining a
// sampling function. Eg. for a normally-distributed parameter: `{mean,
// stddev}`. These object will also be passed as props into the corresponding
// parameter's react comoponent.
//
// ParametersConfigurationValuesSearchParams:
//   {
//      [parameterName]: str
//   }
// Where this is equivalent to ParameterConfigurationValues but with all properties `JSON.stringify`

export const App = () => {
  const [parameterConfigurationValues] = useParameterConfigurationValues()
  const parameters = mapValues(parameterConfigurationValues, (x, name) => simulationParametersConfig[name].fn(x))

  return (
    <article className="App">
      <DescriptionAndOptions />
      <section className="parameter-configuration">
        <ParameterConfigurationValuesControls />
      </section>
      <section className="simulation-results">
        <SimulationRun parameters={parameters} />
        <SingleRunSimulation parameters={parameters} />
      </section>
    </article>
  )
}
