import { ExternalLink } from 'lucide-react';
import { personalityTestUrl } from '../core/typeGroups';
export function DiagnosisLink({className=''}:{className?:string}){return <a className={'diagnosis-link '+className} href={personalityTestUrl} target="_blank" rel="noopener noreferrer" aria-label="性格診断（16Personalities・外部サイト・別タブ）"><span>性格診断</span><ExternalLink size={15} aria-hidden="true"/></a>;}
