import random from "random"

const unsuccessfulOutcome = Symbol(`Job application outcome - unsuccessful`)
const successfulOutcome = Symbol(`Job application outcome - successful`)

const singleJobApplicationResult = (result, reason = "") => ({
  result,
  reason,
})

const singleJobApplication = function* ({ apply_jobIsReal, apply_numberOfApplicantsToMoveOn, apply_numberOfApplicants, apply_resumeQuality }) {
  {
    // stage 1 - resume screening
    if (!apply_jobIsReal()) return singleJobApplicationResult(unsuccessfulOutcome, `The listing was either not real or the company dropped the ball with reviewing applicants`)
    // select the number of people who applied and the number that are going to progress
    const barForResumeSelection = 1 - (1.0 * apply_numberOfApplicantsToMoveOn()) / apply_numberOfApplicants()
    // consider if the applicant's resume is selected in that number
    const quality = apply_resumeQuality()
    if (quality < barForResumeSelection) return singleJobApplicationResult(unsuccessfulOutcome, `Resume was not selected for stage 2`)
    yield `Progressed past stage 1`
  }

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
      apply_numberOfApplicants: random.poisson(20),
      apply_numberOfApplicantsToMoveOn: random.poisson(5),
      apply_resumeQuality: random.normal(0.7, 0.1),
    }

    const process = singleJobApplication(jobApplicationParameters)
    let val = null
    while (!(val = process.next()).done) console.log(val.value)
    console.log(`and the result is: `, val.value)
  })
})
