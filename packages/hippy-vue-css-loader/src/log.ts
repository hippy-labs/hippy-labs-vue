export function info(msg: string, ..._args: any[]): void;
export function info(msg: string): void {
  if (!enableLog) return;
  const args = Array.from(arguments).slice(1);
  console.info.apply(
    console,
    ["[HippyCssLoader info]: 🟢 " + msg].concat(args) as [string, ...any[]],
  );
}

//
export function warn(msg: string, ..._args: any[]): void;
export function warn(msg: string): void {
  if (!enableLog) return;
  const args = Array.from(arguments).slice(1);
  console.warn.apply(
    console,
    ["[HippyCssLoader warn]: 🟡 " + msg].concat(args) as [string, ...any[]],
  );
}

//
export function error(msg: string, ..._args: any[]): void;
export function error(msg: string): void {
  if (!enableLog) return;
  const args = Array.from(arguments).slice(1);
  console.error.apply(
    console,
    ["[HippyCssLoader error]: 🔴 " + msg].concat(args) as [string, ...any[]],
  );
}

//--------------------------------------------------
let enableLog = true;

export function setLoggerDebug(enabled: boolean) {
  enableLog = enabled;
}
