import { useSearchParams } from "react-router-dom"
import { mapValues } from "./mapValues.js"
import { simulationParametersConfig } from "./simulationParametersConfig.js"

const defaultParameterConfigurationValues = mapValues(simulationParametersConfig, (x) => x.defaultArgs || {})

export const useParameterConfigurationValues = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const paramterConfigurationValues = {
    ...defaultParameterConfigurationValues,
    ...mapValues(simulationParametersConfig, (_, name) => {
      const str = searchParams.get(name)
      if (str === null) return defaultParameterConfigurationValues[name]

      try {
        return JSON.parse(str)
      } catch {
        return defaultParameterConfigurationValues[name]
      }
    }),
  }
  // Note that this will only set parameter configuration values which have been modified from their initial values.
  const setParamterConfigurationValues = (pcv) =>
    setSearchParams((prevSearchParams) => ({
      ...prevSearchParams,
      ...mapValues(pcv || {}, (x) => JSON.stringify(x)),
    }))

  return [paramterConfigurationValues, setParamterConfigurationValues]
}
