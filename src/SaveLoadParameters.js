import { saveAs } from "file-saver"
import { useParameterConfigurationValues } from "./useParameterConfigurationValues.js"

export const SaveLoadParameters = () => {
  const [parameterConfigurationValues, setParameterConfigurationValues, resetParameterConfigurationValues] = useParameterConfigurationValues()

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(parameterConfigurationValues, null, 2)], { type: "application/json;charset=utf-8" })
    saveAs(blob, "parameters.json")
  }

  const handleUpload = ({
    target: {
      files: [file],
    },
  }) => {
    if (file) {
      const reader = new FileReader()
      reader.onload = ({ target: { result } }) => setParameterConfigurationValues(JSON.parse(result))
      reader.readAsText(file)
    }
  }

  return (
    <section className="save-load-parameters">
      <header>Save or parameters from a file</header>
      <button onClick={resetParameterConfigurationValues}>Reset Parameters</button>
      <button onClick={handleDownload}>Download Parameters</button>
      Bookmark the url or load a previously saved file: <input type="file" accept=".json" onChange={handleUpload} />
    </section>
  )
}
