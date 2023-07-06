const changeNumber =
  (onChange, propertyName = `value`, additionalProps = {}) =>
  (e) => {
    const val = parseFloat(e.target.value)
    const min = parseFloat(e.target.min)
    const max = parseFloat(e.target.max)
    if (!isNaN(val) && val >= min && val <= max) onChange({ [propertyName]: val, ...additionalProps })
  }

export const BinomialParameter = ({ name, value, onChange, description, min = 0.05, max = 0.95, step = 0.05 }) => {
  const inputArguments = { value, min, max, step, onChange: changeNumber(onChange) }
  return (
    <section className="simulation-parameter-config">
      <header className="simulation-parameter-name">{name}</header>
      <label>
        <div className="label">{description}</div>
        <input type="range" {...inputArguments} />
        <input type="number" {...inputArguments} /> (0 - next to no chance, 1 - almost certain)
      </label>
    </section>
  )
}

export const PoissonParameter = ({ name, value, onChange, description, max, min = 1, step = 1 }) => {
  const inputArguments = { value, min, max, step, onChange: changeNumber(onChange) }
  return (
    <section className="simulation-parameter-config">
      <header className="simulation-parameter-name">{name}</header>
      <label>
        <div className="label">{description}</div>
        <input type="range" {...inputArguments} />
        <input type="number" {...inputArguments} /> (λ parameter in a Poisson distribution - value used will be about this amount)
      </label>
    </section>
  )
}

export const ConstantParameter = ({ name, value, onChange, description, max, min = 1, step = 1 }) => {
  const inputArguments = { value, min, max, step, onChange: changeNumber(onChange) }
  return (
    <section className="simulation-parameter-config">
      <header className="simulation-parameter-name">{name}</header>
      <label>
        <div className="label">{description}</div>
        <input type="range" {...inputArguments} />
        <input type="number" {...inputArguments} />
      </label>
    </section>
  )
}

export const NormalParameter = ({ name, onChange, mean, stddev, description }) => {
  const meanInputArguments = { value: mean, min: 0.05, max: 0.95, step: 0.05, onChange: changeNumber(onChange, `mean`, { stddev }) }
  const stddevInputArguments = { value: stddev, min: 0, max: 1, step: 0.05, onChange: changeNumber(onChange, `stddev`, { mean }) }
  return (
    <section className="simulation-parameter-config">
      <header className="simulation-parameter-name">{name}</header>
      <p>{description}</p>
      <label>
        <div className="label">{name} - Mean</div>
        <input type="range" {...meanInputArguments} />
        <input type="number" {...meanInputArguments} />
      </label>
      <label>
        <div className="label">{name} - Standard Deviation</div>
        <input type="range" {...stddevInputArguments} />
        <input type="number" {...stddevInputArguments} /> (60% of the time value will be within 1 devation of the mean, 95% within 2)
      </label>
    </section>
  )
}
