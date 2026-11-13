/**
 * Challenge 2: Debounced User Search - Utility functions
 *
 * Plain JS debounce implementation without external libraries.
 *
 * Why debounce needs a closure:
 * Debounce needs a closure so that the returned function retains access to the
 * persistent `timerId` variable across multiple invocations without polluting the
 * global scope, allowing it to clear the previous timer before setting a new one.
 *
 * @param {Function} fn - The callback function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {Function} A new debounced function with a .cancel() method.
 */
export function debounce(fn, delay = 400) {
  let timerId = null;

  const debounced = function (...args) {
    if (timerId !== null) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      fn.apply(this, args);
      timerId = null;
    }, delay);
  };

  /**
   * Clears any currently scheduled invocation.
   */
  debounced.cancel = function () {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  return debounced;
}

export default debounce;

