import { useSearchParams } from "react-router-dom"
import { mapValues } from "./mapValues.js"
import { simulationParametersConfig } from "./simulationParametersConfig.js"

const defaultParameterConfigurationValues = mapValues(simulationParametersConfig, (x) => x.defaultArgs || {})

export const useParameterConfigurationValues = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const explicitlySetParameterConfigurationValues = mapValues(Object.fromEntries(searchParams), (_, name) => {
    const str = searchParams.get(name)
    if (str === null) return defaultParameterConfigurationValues[name]
    try {
      return JSON.parse(str)
    } catch {
      return defaultParameterConfigurationValues[name]
    }
  })

  const paramterConfigurationValues = {
    ...defaultParameterConfigurationValues,
    ...explicitlySetParameterConfigurationValues,
  }
  // Note that this will only set parameter configuration values which have been modified from their initial values.
  const setParamterConfigurationValues = (pcv) =>
    setSearchParams({
      ...Object.fromEntries(searchParams),
      ...mapValues(pcv || {}, (x) => JSON.stringify(x)),
    })

  const resetParameterConfigurationValues = () => setSearchParams({})

  return [paramterConfigurationValues, setParamterConfigurationValues, resetParameterConfigurationValues]
}
