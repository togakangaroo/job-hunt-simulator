
export const BinomialParameter = ({ name, value, onChange, description }) => (
  <section>
    <header>
      <p>{name}</p>
    </header>
    <label>
      <div className="label">{description}</div>
      <input type="range" value={value} onChange={(e) => onChange({ value: parseFloat(e.target.value) })} min={0.05} max={0.95} step={0.05} />
      <input readOnly value={value} /> (Likelihood of success)
    </label>
  </section>
)

export const PoissonParameter = ({ name, value, onChange, description, max, min = 1, step = 1 }) => (
  <section>
    <header>
      <p>{name}</p>
    </header>
    <label>
      <div className="label">{description}</div>
      <input type="range" value={value} onChange={(e) => onChange({ value: parseFloat(e.target.value) })} min={min} max={max} step={step} />
      <input readOnly value={value} /> (λ parameter in a Poisson distribution)
    </label>
  </section>
)

export const ConstantParameter = ({ name, value, onChange, description, max, min = 1, step = 1 }) => (
  <section>
    <header>
      <p>{name}</p>
    </header>
    <label>
      <div className="label">{description}</div>
      <input type="range" value={value} onChange={(e) => onChange({ value: parseFloat(e.target.value) })} min={min} max={max} step={step} />
      <input readOnly value={value} />
    </label>
  </section>
)

export const NormalParameter = ({ name, onChange, mean, stddev, description }) => (
  <section>
    <header>{name}</header>
    <p>{description}</p>
    <label>
      <div className="label">{name} - Mean</div>
      <input type="range" value={mean} onChange={(e) => onChange({ mean: parseFloat(e.target.value), stddev })} min={0.05} max={0.95} step={0.05} />
      <input readOnly value={mean} />
    </label>
    <label>
      <div className="label">{name} - Standard Deviation</div>
      <input type="range" value={stddev} onChange={(e) => onChange({ mean, stddev: parseFloat(e.target.value) })} min={0} max={1} step={0.05} />
      <input readOnly value={stddev} />
    </label>
  </section>
)
