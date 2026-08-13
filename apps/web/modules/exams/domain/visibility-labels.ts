export interface VisibilityMember {
  profileId: string;
  displayName: string;
  isAdmin: boolean;
}

export interface BuildVisibilityLabelInput {
  membersWithAccess: VisibilityMember[];
  familyLabel: string;
  familyPlusTemplate: string;
}

export function buildVisibilityLabel(input: BuildVisibilityLabelInput): string {
  const extraMembers = input.membersWithAccess.filter((member) => !member.isAdmin);

  if (extraMembers.length === 0) {
    return input.familyLabel;
  }

  if (extraMembers.length === 1) {
    return input.familyPlusTemplate.replace("{nome}", extraMembers[0]!.displayName);
  }

  const names = extraMembers.map((member) => member.displayName).join(", ");
  return input.familyPlusTemplate.replace("{nome}", names);
}

export function summarizeVisibilityNames(
  membersWithAccess: VisibilityMember[],
): string[] {
  return membersWithAccess
    .filter((member) => !member.isAdmin)
    .map((member) => member.displayName);
}
