export const preciseSetInterval = (func, time) => {
  let lastTime = Date.now(),
    lastDelay = time,
    outp = {};

  function tick() {
    func();

    let now = Date.now(),
      dTime = now - lastTime;

    lastTime = now;
    lastDelay = time + lastDelay - dTime;
    outp.id = setTimeout(tick, lastDelay);
  }
  outp.id = setTimeout(tick, time);

  return outp;
};

export const clearPreciseInterval = (interval) => {
  if (interval && interval.id) {
    clearTimeout(interval.id);
  }
};