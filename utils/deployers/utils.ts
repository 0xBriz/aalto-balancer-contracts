export function _require(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}
