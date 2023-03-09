export class Channel {
  label: string; // sometimes aliased as ch
  id: string;

  constructor(label: string, id: string) {
    this.label = label;
    this.id = id;
  }

  key() {
    return this.label + "-" + this.id;
  }
}
