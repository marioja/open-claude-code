/**
 * Windows child-process window policy.
 *
 * On Windows a child spawned without a console to inherit gets a brand new
 * console window, which flashes on screen and steals focus. Node's
 * `windowsHide: true` suppresses that window.
 *
 * `windowsHide` is not free though: it maps to CREATE_NO_WINDOW, which makes
 * Windows allocate a fresh (invisible) conhost per child. When this process
 * already owns a console (launched from a terminal) the child can simply
 * inherit it: no window and no extra conhost. So only hide when needed:
 *   - no console to inherit (GUI/Explorer launch, piped parent), or
 *   - `detached` children, which never inherit the parent's console.
 *
 * No-op on non-Windows platforms.
 */

/** True when this process has a console that children can inherit. */
export function hasInheritableConsole(streams = [process.stdin, process.stdout, process.stderr]) {
    return streams.some((s) => Boolean(s && s.isTTY));
}

/**
 * Spawn options that keep Windows child processes from opening a visible,
 * focus-stealing console window.
 *
 * @param {object} [opts]
 * @param {boolean} [opts.detached] child is detached (always needs hiding)
 * @param {string} [opts.platform] override for tests
 * @param {boolean} [opts.consoleAvailable] override for tests
 * @returns {{windowsHide: true} | {}}
 */
export function windowsSpawnOptions({
    detached = false,
    platform = process.platform,
    consoleAvailable = hasInheritableConsole(),
} = {}) {
    if (platform !== 'win32') return {};
    if (detached || !consoleAvailable) return { windowsHide: true };
    return {};
}
