export type GateState = { trusted: boolean; mana: number };

// Economy (from The Architect)
export const COST = {
  POST: 1,                // create a post
  CREATE_CHANNEL: 50,     // new channel
  MAINTAIN_CHANNEL: 50,   // monthly upkeep
  CREATE_GROUP: 5         // new group
};

export const canPay = (s: GateState, amt: number) => s.trusted && s.mana >= amt;

export const canPost       = (s: GateState) => canPay(s, COST.POST);
export const canCreateChan = (s: GateState) => canPay(s, COST.CREATE_CHANNEL);
export const canMaintain   = (s: GateState) => canPay(s, COST.MAINTAIN_CHANNEL);
export const canCreateGrp  = (s: GateState) => canPay(s, COST.CREATE_GROUP);
