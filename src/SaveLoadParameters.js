import { saveAs } from "file-saver"

export const SaveLoadParameters = ({ parameters, setParameters }) => {
  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(parameters, null, 2)], { type: "application/json;charset=utf-8" })
    saveAs(blob, "parameters.json")
  }

  const handleUpload = ({target: {files: [file]}}) => {
    if (file) {
      const reader = new FileReader()
      reader.onload = ({target: {result}}) => setParameters(JSON.parse(result))
      reader.readAsText(file)
    }
  }

  return (
    <section className="save-load-parameters">
      <header>Save or parameters from a file</header>
      <button onClick={handleDownload}>Download Parameters</button>
      <input type="file" accept=".json" onChange={handleUpload} />
    </section>
  )
}
