// Dedicated credentials only. Shared OpenAI/MOCOMO keys are never consulted.
export function freeProviderReady(env){return env('INTERVIEW_GROQ_FREE_CONFIRMED')==='true'&&Boolean(env('INTERVIEW_GROQ_API_KEY'))}
export function freeProviderRequest(env,messages,schema){
 if(!freeProviderReady(env))throw new Error('FREE_PROVIDER_NOT_CONFIGURED');
 return {url:'https://api.groq.com/openai/v1/chat/completions',options:{method:'POST',headers:{Authorization:'Bearer '+env('INTERVIEW_GROQ_API_KEY'),'Content-Type':'application/json'},body:JSON.stringify({model:'openai/gpt-oss-120b',max_completion_tokens:2200,messages,response_format:{type:'json_schema',json_schema:{name:'interview_coaching',strict:true,schema}}}),signal:AbortSignal.timeout(35000)}};
}
