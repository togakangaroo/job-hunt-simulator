// Take an object and a function to run on the value of each property. Create a new object with the same properties but but the function run on each value
export const mapValues = (obj, mapValueFn) =>
  !obj ? obj : Object.fromEntries(Object.entries(obj).map(([prop, val]) => [prop, mapValueFn(val, prop)]))
