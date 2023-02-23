export class Channel {
  label; // sometimes aliased as ch
  id;

  constructor(label, id) {
    this.label = label;
    this.id = id;
  }

  key() {
    return this.label + "-" + this.id;
  }
}
