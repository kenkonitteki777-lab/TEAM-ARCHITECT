export const typeArtwork:Record<string,string>={"INTJ":"types/intj-e6","INTP":"types/intp-e6","ENTJ":"types/entj-e6","ENTP":"types/entp-e6","INFJ":"types/infj-e6","INFP":"types/infp-e6","ENFJ":"types/enfj-e6","ENFP":"types/enfp-e6","ISTJ":"types/istj-e6","ISFJ":"types/isfj-e6","ESTJ":"types/estj-e6","ESFJ":"types/esfj-e6","ISTP":"types/istp-e6","ISFP":"types/isfp-e6","ESTP":"types/estp-e6","ESFP":"types/esfp-e6"};

export function TypePortrait({type,large=false,eager=false}:{type:string;large?:boolean;eager?:boolean}){
 const artwork=typeArtwork[type];
 if(!artwork)return null;
 return <img className="type-art" src={`./operatives/${artwork}${large?'':'-small'}.webp`} width={large?640:280} height={large?960:420} alt="" loading={eager?'eager':'lazy'} decoding="async"/>;
}
