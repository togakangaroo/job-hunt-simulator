const changeNumber = (onChange) => (e) => onChange({ value: parseFloat(e.target.value) })
export const BinomialParameter = ({ name, value, onChange, description, min = 0.05, max = 0.95, step = 0.05 }) => {
  const inputArguments = { value, min, max, step, onChange: changeNumber(onChange) }
  return (
    <section>
      <header>
        <p>{name}</p>
      </header>
      <label>
        <div className="label">{description}</div>
        <input type="range" {...inputArguments} />
        <input type="number" {...inputArguments} /> (Likelihood of happening)
      </label>
    </section>
  )
}

export const PoissonParameter = ({ name, value, onChange, description, max, min = 1, step = 1 }) => {
  const inputArguments = { value, min, max, step, onChange: changeNumber(onChange) }
  return (
    <section>
      <header>
        <p>{name}</p>
      </header>
      <label>
        <div className="label">{description}</div>
        <input type="range" {...inputArguments} />
        <input type="number" {...inputArguments} /> (λ parameter in a Poisson distribution)
      </label>
    </section>
  )
}

export const ConstantParameter = ({ name, value, onChange, description, max, min = 1, step = 1 }) => {
  const inputArguments = { value, min, max, step, onChange: changeNumber(onChange) }
  return (
    <section>
      <header>
        <p>{name}</p>
      </header>
      <label>
        <div className="label">{description}</div>
        <input type="range" {...inputArguments} />
        <input type="number" {...inputArguments} />
      </label>
    </section>
  )
}

export const NormalParameter = ({ name, onChange, mean, stddev, description }) => {
  const meanInputArguments = { value: mean, min: 0.05, max: 0.95, step: 0.05, onChange: changeNumber(onChange) }
  const stddevInputArguments = { value: stddev, min: 0, max: 1, step: 0.05, onChange: changeNumber(onChange) }
  return (
    <section>
      <header>{name}</header>
      <p>{description}</p>
      <label>
        <div className="label">{name} - Mean</div>
        <input type="range" {...meanInputArguments} />
        <input type="number" {...meanInputArguments} />
      </label>
      <label>
        <div className="label">{name} - Standard Deviation</div>
        <input type="range" {...stddevInputArguments} />
        <input type="number" {...stddevInputArguments} />
      </label>
    </section>
  )
}
