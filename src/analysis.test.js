import random from "random"

const compose =
  (...fns) =>
  (x) =>
    fns.reduce((prev, fn) => fn(prev), x)

const sum = (vals) => {
  let result = 0
  for (const v of vals) result += v
  return result
}

const mean = (vals) => {
  let sum = 0
  let count = 0
  for (const v of vals) {
    sum += v
    count += 1
  }
  return sum / count
}

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
  offer_isGood,
}) {
  {
    yield atStage(1, `Resume filtering`)
    if (!apply_jobIsReal())
      return singleJobApplicationResult(
        unsuccessfulOutcome,
        `1: The listing was either not real or the company dropped the ball with reviewing applicants`
      )
    // select the number of people who applied and the number that are going to progress
    const barForResumeSelection = 1 - (1.0 * apply_numberOfApplicantsToMoveOn()) / apply_numberOfApplicants()
    // cdonsider if the applicant's resume is selected in that number
    const quality = apply_resumeQuality()
    if (quality < barForResumeSelection) return singleJobApplicationResult(unsuccessfulOutcome, `1: Resume was not selected for stage 2`)
  }
  {
    yield atStage(2, `Phone screen`)
    if (general_position_disappears())
      return singleJobApplicationResult(unsuccessfulOutcome, `2: The job has disappeared, been frozen, or the hiring pipeline broke.`)
    if (screening_failPhoneScreen()) return singleJobApplicationResult(unsuccessfulOutcome, `2: Failed the job screen`)
  }
  {
    yield atStage(3, `Iterview 1`)
    if (general_position_disappears())
      return singleJobApplicationResult(unsuccessfulOutcome, `3: The job has disappeared, been frozen, or the hiring pipeline broke.`)
    if (!interview1_passed()) return singleJobApplicationResult(unsuccessfulOutcome, `3: Eliminated in first interview round`)
  }
  {
    yield atStage(4, `Iterview 2`)
    if (general_position_disappears())
      return singleJobApplicationResult(unsuccessfulOutcome, `4: The job has disappeared, been frozen, or the hiring pipeline broke.`)
    if (!interview2_passed()) return singleJobApplicationResult(unsuccessfulOutcome, `4: Eliminated in second interview round`)
  }
  {
    yield atStage(5, `Iterview 3`)
    if (general_position_disappears())
      return singleJobApplicationResult(unsuccessfulOutcome, `5: The job has disappeared, been frozen, or the hiring pipeline broke.`)
    if (!interview3_passed()) return singleJobApplicationResult(unsuccessfulOutcome, `5: Eliminated in third interview round`)
  }
  {
    yield atStage(6, `Offer`)
    if (general_position_disappears())
      return singleJobApplicationResult(unsuccessfulOutcome, `6: The job has disappeared, been frozen, or the hiring pipeline broke.`)
    if (!offer_offerReceivedVersusOthers()) return singleJobApplicationResult(unsuccessfulOutcome, `6: The offer went to a better fitting candidate`)
    if (!offer_isGood()) return singleJobApplicationResult(unsuccessfulOutcome, `6: Received an offer, but a bad one`)
  }

  return singleJobApplicationResult(successfulOutcome, `Its a good offer. Congratulations.`)
}

const jobHuntSimulation = function* (
  { numberOfApplicationsPerPeriod, takingAPeriodBreak, periodsForCompanyToMoveIntoNextStage },
  startJobApplication
) {
  const applicationStage = (applicationIterator) => ({
    periodsUntilNextStage: periodsForCompanyToMoveIntoNextStage(),
    next: () => applicationIterator.next(),
  })
  const currentApplicationStages = new Set()
  while (true) {
    const unsuccessful = new Set()
    const offers = new Set()
    const stageCounts = new Map()
    for (const application of currentApplicationStages) {
      application.periodsUntilNextStage -= 1
      if (0 < application.periodsUntilNextStage) continue
      application.periodsUntilNextStage = periodsForCompanyToMoveIntoNextStage()
      const { done, value } = application.next()
      if (done) {
        currentApplicationStages.delete(application)
        if (value.result === successfulOutcome) offers.add(application)
        else unsuccessful.add(value)
      } else stageCounts.set(value.stage, (stageCounts.get(value.stage) || 0) + 1)
    }
    if (!takingAPeriodBreak()) {
      const newApplicationCount = numberOfApplicationsPerPeriod()
      stageCounts.set(0, newApplicationCount)
      for (let i = 0; i < newApplicationCount; i += 1) currentApplicationStages.add(applicationStage(startJobApplication()))
    }

    yield { unsuccessful, offers, stageCounts }
  }
}

describe(`run simulation`, () => {
  const jobApplicationParameters = {
    apply_jobIsReal: random.binomial(1, 0.7),
    apply_numberOfApplicants: random.poisson(20),
    apply_numberOfApplicantsToMoveOn: random.poisson(5),
    apply_resumeQuality: random.normal(0.7, 0.1),
    screening_failPhoneScreen: random.binomial(1, 0.5),
    interview1_passed: random.binomial(1, 0.6),
    interview2_passed: random.binomial(1, 0.3),
    interview3_passed: random.binomial(1, 0.7),
    offer_offerReceivedVersusOthers: random.binomial(1, 0.5),
    offer_isGood: random.binomial(1, 0.8),
    general_position_disappears: random.binomial(1, 0.05), // will be tested multiple times
  }
  const jobHuntStrategyParameters = {
    numberOfApplicationsPerPeriod: random.poisson(25),
    takingAPeriodBreak: random.binomial(1, 0.125),
    periodsForCompanyToMoveIntoNextStage: compose(random.poisson(1), (x) => x + 1),
  }

  const runSimulation = () => jobHuntSimulation(jobHuntStrategyParameters, () => singleJobApplication(jobApplicationParameters))

  it(`running single job application simulation yields next steps until done`, () => {
    const process = singleJobApplication(jobApplicationParameters)
    let val = null
    while (!(val = process.next()).done) console.log("> ", val.value)
    console.log(`RESULT`, val.value)
  })

  it(`running through a set of simulations`, () => {
    let i = 0
    for (const { stageCounts, offers, unsuccessful } of runSimulation()) {
      console.log(`WEEK`, i, `REJECTED`, unsuccessful.size, `STAGES`, stageCounts, `OFFERS`, offers.size)
      if (offers.size) return
      i += 1
    }
  })

  const runSimulationChains = function* (simulationCount) {
    for (let i = 0; i < simulationCount; i += 1) {
      const unsuccesfulCountsByReason = new Map()
      let periodsToOffer = 0
      for (const { stageCounts, offers, unsuccessful } of runSimulation()) {
        for (const { reason } of unsuccessful) unsuccesfulCountsByReason.set(reason, (unsuccesfulCountsByReason.get(reason) || 0) + 1)
        if (offers.size) {
          const totalApplications = offers.size + sum(unsuccesfulCountsByReason.values()) + sum(stageCounts.values())
          yield { periodsToOffer, unsuccesfulCountsByReason, stageCounts, totalApplications }
          break
        }
        periodsToOffer += 1
      }
    }
  }

  it(`running through several simulation chains and averaging`, () => {
    const simulationCount = 100
    const simulationResults = Array.from(runSimulationChains(simulationCount))
    const meanPeriodsToOffer = mean(simulationResults.map((x) => x.periodsToOffer))
    const meanTotalApplications = mean(simulationResults.map((x) => x.totalApplications))
    const allRejectionReasons = new Set(simulationResults.map((x) => x.unsuccesfulCountsByReason.keys()).flatMap((x) => Array.from(x)))
    const meanRejectionsByReason = new Map(
      Array.from(allRejectionReasons.values()).map((reason) => [
        reason,
        mean(simulationResults.map((x) => x.unsuccesfulCountsByReason.get(reason) || 0)),
      ])
    )
    console.log(`Mean rejection counts`, meanRejectionsByReason)
    console.log(`Mean total applications`, meanTotalApplications)
    console.log(`Mean periods to offer`, meanPeriodsToOffer)
  })
})
