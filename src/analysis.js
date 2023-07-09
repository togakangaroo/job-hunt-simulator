export const compose =
  (...fns) =>
  (x) =>
    fns.reduce((prev, fn) => fn(prev), x)

export const sum = (vals) => {
  let result = 0
  for (const v of vals) result += v
  return result
}

export const mean = (vals) => {
  let sum = 0
  let count = 0
  for (const v of vals) {
    sum += v
    count += 1
  }
  return sum / count
}

export const zip = function* (...iterables) {
  if (!iterables.length) return
  const iterators = iterables.map((x) => x[Symbol.iterator]())
  while (true) {
    const nextVals = iterators.map((it) => it.next())
    if (nextVals.some((x) => x.done)) return
    yield nextVals.map((x) => x.value)
  }
}

const unsuccessfulOutcome = Symbol(`Job application outcome - unsuccessful`)
const successfulOutcome = Symbol(`Job application outcome - successful`)

const singleJobApplicationResult = (result, reason = "") => ({ result, reason })

const atStage = (stage, description) => ({ stage, description })

// Simulate a single job application as a generator. Yields when each new stage is entered, returns either a success or not when results determined
export const singleJobApplication = function* ({
  apply_jobIsReal,
  apply_numberOfApplicantsToMoveOn,
  apply_numberOfApplicants,
  apply_resumeQuality,
  screening_phoneScreenPassed,
  interview1_passed,
  interview2_passed,
  interview3_passed,
  offer_offerReceivedVersusOthers,
  offer_isGood,
  general_positionDisappears,
  general_periodsForCompanyToMoveIntoNextStage,
}) {
  const periodsPerStage = general_periodsForCompanyToMoveIntoNextStage()
  {
    const stage = atStage(1, `Resume filtering`)
    for (let i = 0; i < periodsPerStage; i += 1) yield stage
    if (!apply_jobIsReal())
      return singleJobApplicationResult(
        unsuccessfulOutcome,
        `1: The listing was either not real or the company dropped the ball with reviewing applicants`
      )
    // select the number of people who applied and the number that are going to progress
    const barForResumeSelection = 1 - (1.0 * apply_numberOfApplicantsToMoveOn()) / apply_numberOfApplicants()
    // consider if the applicant's resume is selected in that number
    const quality = apply_resumeQuality()
    if (quality < barForResumeSelection) return singleJobApplicationResult(unsuccessfulOutcome, `1: Resume was not selected for stage 2`)
  }
  {
    const stage = atStage(2, `Phone screen`)
    for (let i = 0; i < periodsPerStage; i += 1) yield stage
    if (general_positionDisappears())
      return singleJobApplicationResult(unsuccessfulOutcome, `2: The job has disappeared, been frozen, or the hiring pipeline broke.`)
    if (!screening_phoneScreenPassed()) return singleJobApplicationResult(unsuccessfulOutcome, `2: Failed the job screen`)
  }
  {
    const stage = atStage(3, `Iterview 1`)
    for (let i = 0; i < periodsPerStage; i += 1) yield stage
    if (general_positionDisappears())
      return singleJobApplicationResult(unsuccessfulOutcome, `3: The job has disappeared, been frozen, or the hiring pipeline broke.`)
    if (!interview1_passed()) return singleJobApplicationResult(unsuccessfulOutcome, `3: Eliminated in first interview round`)
  }
  {
    const stage = atStage(4, `Iterview 2`)
    for (let i = 0; i < periodsPerStage; i += 1) yield stage
    if (general_positionDisappears())
      return singleJobApplicationResult(unsuccessfulOutcome, `4: The job has disappeared, been frozen, or the hiring pipeline broke.`)
    if (!interview2_passed()) return singleJobApplicationResult(unsuccessfulOutcome, `4: Eliminated in second interview round`)
  }
  {
    const stage = atStage(5, `Iterview 3`)
    for (let i = 0; i < periodsPerStage; i += 1) yield stage
    if (general_positionDisappears())
      return singleJobApplicationResult(unsuccessfulOutcome, `5: The job has disappeared, been frozen, or the hiring pipeline broke.`)
    if (!interview3_passed()) return singleJobApplicationResult(unsuccessfulOutcome, `5: Eliminated in third interview round`)
  }
  {
    const stage = atStage(6, `Offer`)
    for (let i = 0; i < periodsPerStage; i += 1) yield stage
    if (general_positionDisappears())
      return singleJobApplicationResult(unsuccessfulOutcome, `6: The job has disappeared, been frozen, or the hiring pipeline broke.`)
    if (!offer_offerReceivedVersusOthers()) return singleJobApplicationResult(unsuccessfulOutcome, `6: The offer went to a better fitting candidate`)
    if (!offer_isGood()) return singleJobApplicationResult(unsuccessfulOutcome, `6: Received an offer, but a bad one`)
  }

  return singleJobApplicationResult(successfulOutcome, `Its a good offer. Congratulations.`)
}

// Simulate an entire job hunt. Yield back each period. This generator will run forever. It is up to invokers to stop it.
// See also runSingleJobHuntSimulation
export const jobHuntSimulation = function* ({ numberOfApplicationsPerPeriod, takingAPeriodBreak }, startJobApplication) {
  const currentApplicationStages = new Set()
  while (true) {
    const unsuccessful = new Set()
    const offers = new Set()
    const stageCounts = new Map()
    for (const application of currentApplicationStages) {
      const { done, value } = application.next()
      if (done) {
        currentApplicationStages.delete(application)
        if (value.result === successfulOutcome) offers.add(application)
        else unsuccessful.add(value)
      } else stageCounts.set(value.stage, (stageCounts.get(value.stage) || 0) + 1)
    }
    let newApplicationCount = 0
    if (!takingAPeriodBreak()) {
      newApplicationCount = numberOfApplicationsPerPeriod()
      stageCounts.set(0, newApplicationCount)
      for (let i = 0; i < newApplicationCount; i += 1) currentApplicationStages.add(startJobApplication())
    }

    yield { unsuccessful, offers, stageCounts, newApplicationCount }
  }
}

export const maxPeriods = 52 * 4

// Similar to jobHuntSimulation but stop the generator once the requisite number of offers is reached
export const runSingleJobHuntSimulation = function* (jobHuntParameters, startJobApplication) {
  let offerCount = 0
  const desiredOfferCount = jobHuntParameters.desiredOfferCount()

  for (const [_, period] of zip(Array(maxPeriods).fill(0), jobHuntSimulation(jobHuntParameters, startJobApplication))) {
    yield period
    offerCount += period.offers.size
    if (desiredOfferCount <= offerCount) break
  }
  return { offerCount }
}

// Simulate a set of simulation chains and report an all their results. Yields on the result of each chain.
export const runSimulationChains = function* (simulationCount, runSimulation) {
  for (let i = 0; i < simulationCount; i += 1) {
    const unsuccesfulCountsByReason = new Map()
    let periods = 0
    let totalApplications = 0
    let stageCountsAtEnd = {}
    let allOffers = new Set()
    for (const { stageCounts, offers, unsuccessful, newApplicationCount } of runSimulation()) {
      for (const { reason } of unsuccessful) unsuccesfulCountsByReason.set(reason, (unsuccesfulCountsByReason.get(reason) || 0) + 1)
      totalApplications += newApplicationCount
      periods += 1
      stageCountsAtEnd = stageCounts
      for (const o of offers) allOffers.add(o)
    }
    yield { periods, unsuccesfulCountsByReason, stageCountsAtEnd, allOffers, totalApplications }
  }
}
