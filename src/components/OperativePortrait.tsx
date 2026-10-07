import { useId, type CSSProperties } from 'react';
import { Crosshair, Gem, Layers3, Network, Radar, ShieldCheck, Zap } from 'lucide-react';

const identities = {
 maesaki: { color: '#e8b46b', icon: ShieldCheck, cut: 'command', number: '01' },
 matsuo: { color: '#7db9d2', icon: Layers3, cut: 'strategy', number: '02' },
 yasaka: { color: '#b9a4dd', icon: Network, cut: 'engage', number: '03' },
 miyamoto: { color: '#79b8ae', icon: Zap, cut: 'field', number: '04' },
 hattori: { color: '#d29aa9', icon: Gem, cut: 'creative', number: '05' },
 tatsuno: { color: '#a2baa0', icon: Crosshair, cut: 'operate', number: '06' },
 asano: { color: '#c4ac7c', icon: Radar, cut: 'scout', number: '07' },
} as const;

export function RoleEmblem({ memberId }: { memberId: string }) {
 const identity = identities[memberId as keyof typeof identities] || identities.matsuo;
 const Icon = identity.icon;
 return <span className="role-emblem" style={{ '--operative-color': identity.color } as CSSProperties}><Icon size={17} aria-hidden="true"/></span>;
}

/** Original role illustrations, not portraits or personality/ability judgements. */
export function OperativePortrait({ memberId, className = '' }: { memberId: string; className?: string }) {
 const identity = identities[memberId as keyof typeof identities] || identities.matsuo;
 const id = useId().replace(/:/g, '');
 const longCoat = identity.cut === 'creative' || identity.cut === 'engage';
 const field = identity.cut === 'field' || identity.cut === 'scout';
 return <div className={`operative-portrait ${className}`} style={{ '--operative-color': identity.color } as CSSProperties} aria-hidden="true">
  <svg viewBox="0 0 240 290" fill="none" focusable="false">
   <defs>
    <linearGradient id={`${id}-coat`} x1="55" y1="125" x2="183" y2="290" gradientUnits="userSpaceOnUse"><stop stopColor="#394752"/><stop offset=".48" stopColor="#192631"/><stop offset="1" stopColor="#0a111a"/></linearGradient>
    <linearGradient id={`${id}-face`} x1="88" y1="50" x2="146" y2="124" gradientUnits="userSpaceOnUse"><stop stopColor="#60717b"/><stop offset=".5" stopColor="#273641"/><stop offset="1" stopColor="#101b25"/></linearGradient>
    <radialGradient id={`${id}-halo`}><stop stopColor={identity.color} stopOpacity=".14"/><stop offset="1" stopColor={identity.color} stopOpacity="0"/></radialGradient>
   </defs>
   <circle cx="120" cy="123" r="111" fill={`url(#${id}-halo)`}/>
   <circle cx="120" cy="115" r="79" stroke={identity.color} strokeOpacity=".16"/>
   <path d="M41 115h19m120 0h19M120 17v19m0 158v19" stroke={identity.color} strokeOpacity=".4"/>
   <path d="M24 230V183l30-30 34-16 17-15h31l16 15 35 16 29 30v47l16 60H8l16-60Z" fill={`url(#${id}-coat)`} stroke="#4c626d" strokeOpacity=".7"/>
   <path d="m103 115-2 27 19 20 20-21-5-26" fill="#25333d"/>
   <path d="m92 64 1 38 10 19 17 10 19-12 9-25-4-35-23-16-29 21Z" fill={`url(#${id}-face)`}/>
   <path d={longCoat ? 'm89 98-4-31 7-24 29-10 22 12 12 32-9 35-9-15 1-40-17-6-19 12-3 32-9 3Z' : field ? 'm86 69 7-23 27-10 28 14 5 22-19-13-31 3-17 7Z' : 'm89 77-3-18 13-19 28-6 21 13 3 30-13-16-22-7-17 13-10 10Z'} fill="#0b141e" stroke="#52616b" strokeOpacity=".65"/>
   <path d="m101 80 15 2m12-2 12-4m-21 11-3 14 8 2m-14 11 18-1" stroke="#6c7d83" strokeOpacity=".45" strokeWidth="1.5"/>
   {identity.cut === 'strategy' && <path d="m94 79 22 2 2 12-18-1-6-13Zm30 2 22-5-4 14-16 3-2-12Zm-6 2h6" stroke={identity.color} strokeOpacity=".7" strokeWidth="2"/>}
   {identity.cut === 'command' ? <>
    <path d="m86 139 18 9 15 66-35-29 11-15-16-5 7-26Zm68 0-15 9-20 66 37-29-10-15 17-5-9-26Z" fill="#3d4d58" stroke="#77868b" strokeOpacity=".5"/>
    <path d="m105 139 15 23 17-23-17 5-15-5Z" fill="#9dadae"/><path d="m117 160 7 1 7 47-12 13-5-14 3-47Z" fill="#111d27"/>
    <path d="m54 157 25-12 4 9-27 12m126-9-23-12-4 9 27 12" stroke={identity.color} strokeWidth="3"/>
    <path d="M153 193h21m-21 5h14" stroke={identity.color} strokeWidth="2"/><circle cx="132" cy="226" r="2" fill={identity.color}/><circle cx="132" cy="246" r="2" fill={identity.color}/>
   </> : field ? <>
    <path d="m92 135 27 28 25-28 12 26-36 18-35-19 7-25Z" fill="#3c515a" stroke="#74898e" strokeOpacity=".5"/>
    <path d="M120 180v110m-65-104h37v39H55v-39Zm94 0h36v39h-36v-39Z" stroke="#526c75"/><path d="M58 189h31m63 0h30" stroke={identity.color} strokeOpacity=".7" strokeWidth="2"/>
    {identity.cut === 'scout' && <path d="m162 139-36 151h-13l36-155 13 4Z" fill="#172731" stroke="#61727a"/>}
   </> : longCoat ? <>
    <path d="m89 139 30 37 29-39 11 37-25 17 11 18-26 57-23-57 10-18-26-17 9-35Z" fill="#3e4e59" stroke="#667984" strokeOpacity=".6"/>
    <path d="m106 145 13 32 16-32-16 8-13-8Z" fill={identity.color} fillOpacity=".4"/><path d="M55 204h33m63 0h32" stroke={identity.color} strokeOpacity=".65"/>
   </> : <>
    <path d="m91 137 29 36 25-36 13 22-38 30-40-29 11-23Z" fill="#40515a" stroke="#75858a" strokeOpacity=".5"/>
    <path d="M120 190v100m-58-91h30v25H62m85-25h31v25h-31" stroke="#60747e" strokeOpacity=".65"/><path d="M146 193h20" stroke={identity.color} strokeWidth="2"/>
   </>}
   <path d="m46 178-6 76m156-76 7 77m-125-14 3 49m80-49-3 49" stroke="#657983" strokeOpacity=".35"/>
   <path d="m28 204-10 70m196-70 11 70" stroke={identity.color} strokeOpacity=".5"/>
  </svg>
  <span className="portrait-index">{identity.number}</span>
 </div>;
}
