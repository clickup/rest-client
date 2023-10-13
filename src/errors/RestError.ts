export default class RestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name; // https://javascript.info/custom-errors#further-inheritance
  }
}
