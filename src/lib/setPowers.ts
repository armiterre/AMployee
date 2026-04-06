/**
 * AMployee demo roles — passwords for Try sandbox on the Begin screen.
 * Org: AMployee (Demo) · org_demo
 */
export const DEMO_ORG_ID = "org_demo";

export interface SetPower {
  id: string;
  label: string;
  tagline: string;
  memberId: string;
  password: string;
  roleLabel: string;
}

export const SET_POWERS: SetPower[] = [
  {
    id: "hq",
    label: "Admin HQ",
    tagline: "Full company control",
    memberId: "m1",
    password: "amp-hq",
    roleLabel: "Owner",
  },
  {
    id: "ops",
    label: "Operations Command",
    tagline: "Shifts, team time, floor view",
    memberId: "m2",
    password: "set-ops",
    roleLabel: "Manager",
  },
  {
    id: "people",
    label: "People Desk",
    tagline: "Payroll run & HR tools",
    memberId: "m3",
    password: "amp-people",
    roleLabel: "HR",
  },
  {
    id: "crew1",
    label: "Crew — Floor Lead",
    tagline: "Clock in, breaks, pay view",
    memberId: "m4",
    password: "set-crew",
    roleLabel: "Employee (Alex)",
  },
  {
    id: "crew2",
    label: "Crew — Sales",
    tagline: "Same tools, second profile",
    memberId: "m5",
    password: "amp-crew2",
    roleLabel: "Employee (Riley)",
  },
];

export function getPowerByMemberId(memberId: string): SetPower | undefined {
  return SET_POWERS.find((p) => p.memberId === memberId);
}
