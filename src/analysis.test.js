import random from "random"

const unsuccessfulOutcome = Symbol(`Job application outcome - unsuccessful`)
const successfulOutcome = Symbol(`Job application outcome - successful`)

const singleJobApplicationResult = (result, reason = "") => ({
  result,
  reason,
})

const singleJobApplication = function* ({ apply_jobIsReal }) {
  // stage 1 - resume screening
  if (!apply_jobIsReal())
    return singleJobApplicationResult(
      unsuccessfulOutcome,
      `The listing was either not real or the company dropped the ball with reviewing applicants`
    )

  return singleJobApplicationResult(successfulOutcome, `Its a good offer`)
}

describe(`run simulation`, () => {
  // it(`generates poison values`, () => {
  //   const getVal = random.poisson(35)
  //   console.log(`poisson: `, Array(10).fill(0).map(getVal))
  // })

  // it(`generates binomial values`, () => {
  //   const getVal = random.binomial(10, 0.1)
  //   console.log(`binomial: `, Array(10).fill(0).map(getVal))
  // })

  it(`running single job application simulation yields next steps until done`, () => {
    const jobApplicationParameters = {
      apply_jobIsReal: random.binomial(1, 0.8),
    }
    const process = singleJobApplication(jobApplicationParameters)
    let val = null
    while (!(val = process.next()).done) console.log(val.value)
    console.log(`and the result is: `, val.value)
  })
})
