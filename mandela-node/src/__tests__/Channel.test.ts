import { describe, expect, test, beforeEach } from '@jest/globals';
import { Channel } from '../Channel'
import { setupChannelRegistry } from '../Mandela';

const MyChannel = {
  label: "my"
}

beforeEach(() => {
  setupChannelRegistry([MyChannel])
})

describe('Channel constructor', () => {
  test('sets the label and id', () => {
    const ch = new Channel("my", "123")
    console.log(ch)
    expect(ch.label).toBe("my")
    expect(ch.id).toBe("123")
  });

  test("sets the channelConfig correctly", () => {
    const ch = new Channel("my", 555)
    console.log(ch.channelConfig)
    expect(ch.channelConfig).not.toBe(undefined)
    expect(ch.channelConfig?.label).toBe("my")
  })
});



