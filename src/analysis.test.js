import random from 'random'



describe(`generage poisson data point`, () => {
  it(`generates value`, () => {
    const getVal = random.poisson(35)
    console.log(`poisson: `, Array(10).fill(0).map(getVal))
  });
})
