import { Channel } from "./Channel";
import { findSubs, inspectRegistry } from './Mandela';
import { Subscription } from "./Subscription";
import { MandelaData } from "./types";

function extractChannel(dataObj: MandelaData) {
  const meta = dataObj.m
  if (!meta) return null;

  const { ch:label, id } = meta;
  return Channel.find(label, id)
}

function informSubs(subs: Subscription[], dataObj: MandelaData) {
  //
  subs.forEach((sub) => sub.publish(dataObj))
}

export default function inform(data: string) {
  console.log("[inform] the data:", data)

  const dataObj = JSON.parse(data)
  const channel = extractChannel(dataObj);
  if (!channel) {
    console.error("[inform] error: channel not found")
    return;
  }

  const subs = findSubs(channel.key())
  if (!subs || subs.length === 0) {
    console.error("[inform] error: didn't find any connected subs")
    inspectRegistry() // TODO: remove after debugging
    return;
  }

  informSubs(subs, dataObj);
}
