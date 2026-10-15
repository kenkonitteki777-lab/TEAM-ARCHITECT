import type { Command } from './mission';
export const ruleLabels={reportWhen:'報告',consult:'相談',immediate:'即時報告',discretion:'任せる範囲'} as const;
export type RuleKey=keyof typeof ruleLabels;
export const ruleKeys=Object.keys(ruleLabels) as RuleKey[];
// Collapse only exact, nonempty agreements. Custom instructions remain with their command.
export function sharedRules(commands:Command[]):RuleKey[]{
 return commands.length>1?ruleKeys.filter(key=>commands[0][key].trim()&&commands.every(c=>c[key]===commands[0][key])):[];
}
