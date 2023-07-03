import random from "random"
import { compose, mean, jobHuntSimulation, singleJobApplication, runSimulationChains } from "./analysis.js"

//////////////////////////////
// NOTE: These are not real tests so much as a basic simulation runner. There are no assertions here.
// Consider just running it with something like this to get live results while you work
//     watchexec -r -e js -- 'while true; do npm test; sleep 10; done'
/////////////////////////////

describe(`run simulation`, () => {
  const jobApplicationParameters = {
    apply_jobIsReal: random.binomial(1, 0.7),
    apply_numberOfApplicants: random.poisson(20),
    apply_numberOfApplicantsToMoveOn: random.poisson(5),
    apply_resumeQuality: random.normal(0.7, 0.15),
    screening_phoneScreenPassed: random.binomial(1, 0.5),
    interview1_passed: random.binomial(1, 0.5),
    interview2_passed: random.binomial(1, 0.3),
    interview3_passed: random.binomial(1, 0.7),
    offer_offerReceivedVersusOthers: random.binomial(1, 0.5),
    offer_isGood: random.binomial(1, 0.8),
    general_position_disappears: random.binomial(1, 0.05), // will be tested multiple times
    general_periodsForCompanyToMoveIntoNextStage: compose(random.poisson(1), (x) => x + 1),
  }
  const jobHuntStrategyParameters = {
    numberOfApplicationsPerPeriod: random.poisson(25),
    takingAPeriodBreak: random.binomial(1, 0.125),
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

  it(`running through several simulation chains and averaging`, () => {
    const simulationCount = 1000
    const simulationResults = Array.from(runSimulationChains(simulationCount, runSimulation))
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
