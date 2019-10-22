export function calculateMA(data, dayCount) {
  let result = [];
  for (let i = 0, len = data.length; i < len; i++) {
    if (i < dayCount) {
      result.push("-");
      continue;
    }
    let sum = 0;
    for (let j = 0; j < dayCount; j++) {
      sum += data[i - j][0];
    }
    result.push(sum / dayCount);
  }
  // console.log(result)
  return result;
}
