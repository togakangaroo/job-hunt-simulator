import random from "random"

const unsuccessfulOutcome = Symbol(`Job application outcome - unsuccessful`)
const successfulOutcome = Symbol(`Job application outcome - successful`)

const singleJobApplicationResult = (result, reason = "") => ({ result, reason })

const atStage = (stage, description) => ({ stage, description })

const singleJobApplication = function* ({
  apply_jobIsReal,
  apply_numberOfApplicantsToMoveOn,
  apply_numberOfApplicants,
  apply_resumeQuality,
  general_position_disappears,
  screening_failPhoneScreen,
  interview1_passed,
  interview2_passed,
  interview3_passed,
  offer_offerReceivedVersusOthers,
}) {
  {
    yield atStage(1, `Resume filtering`)
    if (!apply_jobIsReal())
      return singleJobApplicationResult(
        unsuccessfulOutcome,
        `The listing was either not real or the company dropped the ball with reviewing applicants`
      )
    // select the number of people who applied and the number that are going to progress
    const barForResumeSelection = 1 - (1.0 * apply_numberOfApplicantsToMoveOn()) / apply_numberOfApplicants()
    // consider if the applicant's resume is selected in that number
    const quality = apply_resumeQuality()
    if (quality < barForResumeSelection) return singleJobApplicationResult(unsuccessfulOutcome, `Resume was not selected for stage 2`)
  }
  {
    yield atStage(2, `Phone screen`)
    if (general_position_disappears())
      return singleJobApplicationResult(unsuccessfulOutcome, `The job has disappeared, been frozen, or the hiring pipeline broke.`)
    if (screening_failPhoneScreen()) return singleJobApplicationResult(unsuccessfulOutcome, `Failed the job screen`)
  }
  {
    yield atStage(3, `Iterview 1`)
    if (general_position_disappears())
      return singleJobApplicationResult(unsuccessfulOutcome, `The job has disappeared, been frozen, or the hiring pipeline broke.`)
    if (!interview1_passed()) return singleJobApplicationResult(unsuccessfulOutcome, `Eliminated in first interview round`)
  }
  {
    yield atStage(4, `Iterview 2`)
    if (general_position_disappears())
      return singleJobApplicationResult(unsuccessfulOutcome, `The job has disappeared, been frozen, or the hiring pipeline broke.`)
    if (!interview2_passed()) return singleJobApplicationResult(unsuccessfulOutcome, `Eliminated in second interview round`)
  }
  {
    yield atStage(5, `Iterview 3`)
    if (general_position_disappears())
      return singleJobApplicationResult(unsuccessfulOutcome, `The job has disappeared, been frozen, or the hiring pipeline broke.`)
    if (!interview3_passed()) return singleJobApplicationResult(unsuccessfulOutcome, `Eliminated in third interview round`)
  }
  {
    yield atStage(6, `Offer`)
    if (general_position_disappears())
      return singleJobApplicationResult(unsuccessfulOutcome, `The job has disappeared, been frozen, or the hiring pipeline broke.`)
    if (!offer_offerReceivedVersusOthers()) return singleJobApplicationResult(unsuccessfulOutcome, `The offer went to a better fitting candidate`)
  }

  return singleJobApplicationResult(successfulOutcome, `Its a good offer. Congratulations.`)
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
      general_position_disappears: random.binomial(1, 0.05), // will be tested multiple times
      screening_failPhoneScreen: random.binomial(1, 0.5),
      interview1_passed: random.binomial(1, 0.6),
      interview2_passed: random.binomial(1, 0.3),
      interview3_passed: random.binomial(1, 0.7),
      offer_offerReceivedVersusOthers: random.binomial(1, 0.5),
    }

    const process = singleJobApplication(jobApplicationParameters)
    let val = null
    while (!(val = process.next()).done) console.log("> ", val.value)
    console.log(`RESULT`, val.value)
  })
})
