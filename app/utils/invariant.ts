export default function invariant(val: unknown, message: string): asserts val {
  if (val === null) {
    throw new Error(message);
  }
}
