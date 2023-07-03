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

// Simulate an entire job hunt
export const jobHuntSimulation = function* (
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
      // TODO - this bit is overly complex, it can be pushed down into the single job simulation itself
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

// Simulate a set of simulation chains and report an all their results
export const runSimulationChains = function* (simulationCount, runSimulation) {
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
