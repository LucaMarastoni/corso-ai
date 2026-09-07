/** Short feedback may auto-advance; explanations keep a reading CTA. */
export function quizFlowDelay(
  explanation: string,
  reducedMotion: boolean,
  revealed: boolean,
) {
  if (
    reducedMotion ||
    revealed ||
    explanation.trim().split(/\s+/).length > 10 ||
    explanation.length > 90
  )
    return null;
  return 1200;
}
export type StepClock = {
  schedule: (callback: () => void, delay: number) => unknown;
  clear: (handle: unknown) => void;
};
/** A cancellable, one-shot transition; stale timers never navigate. */
export function createStepFlow(clock: StepClock) {
  let handle: unknown,
    generation = 0;
  let pending: { key: string; run: () => void; generation: number } | null =
    null;
  function cancel() {
    generation++;
    if (pending) clock.clear(handle);
    pending = null;
  }
  function finish(key: string) {
    if (!pending || pending.key !== key) return false;
    const run = pending.run;
    cancel();
    run();
    return true;
  }
  return {
    cancel,
    finish,
    isPending: (key: string) => pending?.key === key,
    schedule(key: string, delay: number, run: () => void) {
      cancel();
      const token = generation;
      pending = { key, run, generation: token };
      handle = clock.schedule(() => {
        if (pending?.generation === token && generation === token) finish(key);
      }, delay);
    },
  };
}
