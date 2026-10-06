export type Level='strong'|'standard'|'growth'|'unknown';
export type Member={id:string;name:string;mbti:string;jp:string;role:string;slot:string;specialty:string;family:string;receive:string;strong:number[];growth:number[]};
export const abilityNames=['戦略的思考','論理的思考','数値分析力','問題解決力','想像・発想力','意思決定力','リーダーシップ','コミュニケーション力','対人理解力','巻き込み力','育成力','実行力','計画・段取り力','進捗管理力','変化対応力','顧客視点','改善・仕組み化力','プレッシャー耐性'];
export const people:Member[]=[
{id:'maesaki',name:'前﨑店長',mbti:'ENTJ',jp:'指揮官',role:'COMMANDER',slot:'LEADER',specialty:'意思決定・資源配分',family:'analyst',receive:'目的・権限・期限を明確に',strong:[1,2,3,4,5,6,7,11,12,13,17,18],growth:[8,9,10]},
{id:'matsuo',name:'松尾',mbti:'INTJ',jp:'建築家',role:'STRATEGIST',slot:'STRATEGIST',specialty:'戦略・分析・構造化',family:'analyst',receive:'目的・背景・裁量を明確に',strong:[1,2,3,4,5,6,7,10,12,13,14,15,16,17,18],growth:[8,9,11]},
{id:'yasaka',name:'八阪',mbti:'ENFJ',jp:'主人公',role:'ENGAGER',slot:'ENGAGER',specialty:'組織浸透・対人調整',family:'diplomat',receive:'目的と人への意味を共有',strong:[8,9,10,12,16],growth:[1,2,3,4,5,6,7,11,13,14,15,17,18]},
{id:'miyamoto',name:'宮本',mbti:'ENFJ',jp:'主人公',role:'FIELD LEAD',slot:'FIELD',specialty:'接客品質・現場実行',family:'diplomat',receive:'目的と現場への意味を共有',strong:[6,7,8,9,12,16],growth:[1,2,3,4,5,11,13,14,15,17,18]},
{id:'hattori',name:'服部',mbti:'INFP',jp:'仲介者',role:'CREATIVE',slot:'CREATIVE',specialty:'販促・表現・VMD',family:'diplomat',receive:'目的を伝え表現方法には裁量を',strong:[4,5,12,13,14,15,17,18],growth:[1,2,3,6,7,8,9,10,11]},
{id:'tatsuno',name:'達野',mbti:'ESFJ',jp:'領事官',role:'OPERATOR',slot:'OPERATOR',specialty:'安定運用・調整',family:'sentinel',receive:'具体的手順と期待状態を共有',strong:[7,8,9,12,13,14,15,16,17],growth:[1,2,3,4,5,6,18]},
{id:'asano',name:'浅野',mbti:'ISFP',jp:'冒険家',role:'SCOUT',slot:'SCOUT',specialty:'顧客接点・現場感覚',family:'explorer',receive:'抽象論より具体的な一歩で依頼',strong:[8,16],growth:[1,2,3,4,5,6,7,9,10,11,12,13,14,15,17,18]}
];
export const typeBook=[
{mbti:'INTJ',jp:'建築家',family:'analyst',catch:'未来を構造化する戦略設計者',work:'複雑な情報を整理し、中長期の勝ち筋と仕組みに変える。',strong:'戦略設計・分析・改善・標準化',watch:'説明を省きすぎると周囲が置いていかれやすい',request:'目的・前提・判断基準・裁量を明確に'},
{mbti:'INTP',jp:'論理学者',family:'analyst',catch:'原理を掘り下げる探究者',work:'仕組みの矛盾を見つけ、独自の論理で解法を組み立てる。',strong:'仮説・分析・設計・問題発見',watch:'検討が深くなり実行開始が遅れることがある',request:'問いと制約を示し、考える余白を渡す'},
{mbti:'ENTJ',jp:'指揮官',family:'analyst',catch:'目標へ組織を動かす決断者',work:'目的から優先順位と資源配分を決め、実行を前へ進める。',strong:'意思決定・戦略・統率・交渉',watch:'速度を優先し現場の納得を飛ばしやすい',request:'目的・権限・期限・判断事項を明確に'},
{mbti:'ENTP',jp:'討論者',family:'analyst',catch:'可能性を広げる変革者',work:'既存前提を疑い、新しい選択肢や突破口を生み出す。',strong:'発想・企画・交渉・変革',watch:'新規性を追い運用の詰めが甘くなりやすい',request:'目的を示し、方法には自由度を残す'},
{mbti:'INFJ',jp:'提唱者',family:'diplomat',catch:'意味と未来をつなぐ洞察者',work:'人の背景を読み、長期的な意味を持つ方向へ導く。',strong:'洞察・育成・理念・対人理解',watch:'理想と現実の差を抱え込みやすい',request:'目的と人への意味を丁寧に共有'},
{mbti:'INFP',jp:'仲介者',family:'diplomat',catch:'価値を表現へ変える創作者',work:'大切な意味や世界観を、自分らしい表現へ変換する。',strong:'創造・文章・表現・価値観設計',watch:'強い統制や細かな介入で力を失いやすい',request:'伝える核を決め、表現には裁量を渡す'},
{mbti:'ENFJ',jp:'主人公',family:'diplomat',catch:'人を巻き込み成長を促す推進者',work:'相手の状態を読み、納得と行動変化をつくる。',strong:'対話・巻き込み・育成・組織浸透',watch:'周囲を優先し自分の負荷を抱えやすい',request:'目的と人への影響、期待行動を共有'},
{mbti:'ENFP',jp:'運動家',family:'diplomat',catch:'熱量で可能性を広げる触媒',work:'人とアイデアを結び、新しい動きを生み出す。',strong:'発想・巻き込み・企画・関係構築',watch:'単調な維持運用では集中が落ちやすい',request:'意味と自由度を示し、節目だけ固定する'},
{mbti:'ISTJ',jp:'管理者',family:'sentinel',catch:'基準を守り確実に完遂する実務家',work:'事実と手順を重視し、安定した品質で仕事を完遂する。',strong:'管理・精度・ルール・継続運用',watch:'急な方針変更には理由説明が必要',request:'基準・期限・手順・完成状態を具体化'},
{mbti:'ISFJ',jp:'擁護者',family:'sentinel',catch:'細部まで支える安定化役',work:'相手の必要を察知し、丁寧な実務でチームを支える。',strong:'支援・品質・気配り・継続',watch:'頼まれ事を抱え込みやすい',request:'優先順位と守備範囲を明確にする'},
{mbti:'ESTJ',jp:'幹部',family:'sentinel',catch:'基準と実行を統率する管理者',work:'役割・手順・期限を明確にし、組織を確実に動かす。',strong:'実行管理・判断・統率・標準化',watch:'柔軟な探索段階では結論を急ぎやすい',request:'目標・権限・期限・ルールを明示'},
{mbti:'ESFJ',jp:'領事官',family:'sentinel',catch:'人と運用を安定させる調整者',work:'周囲の状況を見ながら、具体的な実務を安定運用する。',strong:'調整・進捗・対人・ルーティン',watch:'曖昧な変更や突然の方針転換で迷いやすい',request:'具体的手順・期限・期待状態を共有'},
{mbti:'ISTP',jp:'巨匠',family:'explorer',catch:'現場で解く冷静な問題解決者',work:'状況を観察し、必要な操作を素早く試して問題を解く。',strong:'トラブル対応・技術・改善・即応',watch:'長い説明や過剰な管理を嫌いやすい',request:'問題とゴールを簡潔に示し方法は任せる'},
{mbti:'ISFP',jp:'冒険家',family:'explorer',catch:'現場感覚に優れた体験設計者',work:'目の前の人や状況を感じ取り、自然な行動へつなげる。',strong:'接客・顧客理解・感覚・現場対応',watch:'抽象的な長期計画だけでは動きにくい',request:'具体的な一歩と観察してほしい点を伝える'},
{mbti:'ESTP',jp:'起業家',family:'explorer',catch:'瞬時に機会をつかむ実行者',work:'変化する状況を読み、その場で決断し結果へつなげる。',strong:'即応・交渉・実行・危機対応',watch:'長期の細かな管理を窮屈に感じやすい',request:'成果と制約を明確にし即行動できる形に'},
{mbti:'ESFP',jp:'エンターテイナー',family:'explorer',catch:'場を動かす体験の演出者',work:'人の反応を素早く読み、場の空気と体験価値を高める。',strong:'接客・盛り上げ・対人・現場適応',watch:'細かな分析や長期の単独作業で消耗しやすい',request:'相手の反応が見える具体的な役割で依頼'}
] as const;
export const functionStack:Record<string,string>={ISTJ:'Si→Te→Fi→Ne',ISFJ:'Si→Fe→Ti→Ne',INFJ:'Ni→Fe→Ti→Se',INTJ:'Ni→Te→Fi→Se',ISTP:'Ti→Se→Ni→Fe',ISFP:'Fi→Se→Ni→Te',INFP:'Fi→Ne→Si→Te',INTP:'Ti→Ne→Si→Fe',ESTP:'Se→Ti→Fe→Ni',ESFP:'Se→Fi→Te→Ni',ENFP:'Ne→Fi→Te→Si',ENTP:'Ne→Ti→Fe→Si',ESTJ:'Te→Si→Ne→Fi',ESFJ:'Fe→Si→Ne→Ti',ENFJ:'Fe→Ni→Se→Ti',ENTJ:'Te→Ni→Se→Fi'};
