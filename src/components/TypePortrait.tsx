export const typeArtwork:Record<string,string>={ENTJ:'commander-v2',INTJ:'strategist-v2',ENFJ:'types/enfj-v1',INFP:'types/infp-v1',ESFJ:'types/esfj-v1',ISFP:'types/isfp-v1',INTP:'types/intp-v1',ENTP:'types/entp-v1',INFJ:'types/infj-v1',ENFP:'types/enfp-v1',ISTJ:'types/istj-v1',ISFJ:'types/isfj-v1',ESTJ:'types/estj-v1',ISTP:'types/istp-v1',ESTP:'types/estp-v1',ESFP:'types/esfp-v1'};

export function TypePortrait({type,large=false,eager=false}:{type:string;large?:boolean;eager?:boolean}){
 const artwork=typeArtwork[type];
 if(!artwork)return null;
 return <img className="type-art" src={`./operatives/${artwork}${large?'':'-small'}.webp`} width={large?640:280} height={large?960:420} alt="" loading={eager?'eager':'lazy'} decoding="async"/>;
}
