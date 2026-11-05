// CPython-compatible MT19937 integer seeding and random selection.
export class PythonRandom {
 constructor(seed=null){this.seed(seed);}
 seed(seed){let n=BigInt(seed??Math.floor(Math.random()*2**52));if(n<0)n=-n;const key=[];do{key.push(Number(n&0xffffffffn));n>>=32n;}while(n);this.mt=new Array(624);this.mt[0]=19650218;for(let i=1;i<624;i++)this.mt[i]=(Math.imul(1812433253,this.mt[i-1]^(this.mt[i-1]>>>30))+i)>>>0;let i=1,j=0;for(let k=Math.max(624,key.length);k;k--){this.mt[i]=((this.mt[i]^Math.imul(this.mt[i-1]^(this.mt[i-1]>>>30),1664525))+key[j]+j)>>>0;i++;j++;if(i>=624){this.mt[0]=this.mt[623];i=1;}if(j>=key.length)j=0;}for(let k=623;k;k--){this.mt[i]=((this.mt[i]^Math.imul(this.mt[i-1]^(this.mt[i-1]>>>30),1566083941))-i)>>>0;i++;if(i>=624){this.mt[0]=this.mt[623];i=1;}}this.mt[0]=0x80000000;this.index=624;}
 uint32(){if(this.index>=624){for(let i=0;i<624;i++){const y=(this.mt[i]&0x80000000)|(this.mt[(i+1)%624]&0x7fffffff);this.mt[i]=(this.mt[(i+397)%624]^(y>>>1)^((y&1)?0x9908b0df:0))>>>0;}this.index=0;}let y=this.mt[this.index++];y^=y>>>11;y^=(y<<7)&0x9d2c5680;y^=(y<<15)&0xefc60000;y^=y>>>18;return y>>>0;}
 random(){return ((this.uint32()>>>5)*67108864+(this.uint32()>>>6))/9007199254740992;}
 getrandbits(k){if(!k)return 0;if(k<=32)return this.uint32()>>>(32-k);let v=0n,shift=0n;while(k>0){const b=Math.min(k,32);v|=BigInt(b===32?this.uint32():this.uint32()>>>(32-b))<<shift;shift+=32n;k-=32;}return Number(v);}
 below(n){const k=Math.floor(Math.log2(n))+1;let v;do{v=this.getrandbits(k);}while(v>=n);return v;}
 randint(a,b){return a+this.below(b-a+1);}
 uniform(a,b){return a+(b-a)*this.random();}
 choice(a){return a[this.below(a.length)];}
 shuffle(a){for(let i=a.length-1;i>0;i--){const j=this.below(i+1);[a[i],a[j]]=[a[j],a[i]];}return null;}
 sample(pop,k){const n=pop.length,result=[];let size=21;if(k>5)size+=4**Math.ceil(Math.log(k*3)/Math.log(4));if(n<=size){const pool=pop.slice();for(let i=0;i<k;i++){const j=this.below(n-i);result.push(pool[j]);pool[j]=pool[n-i-1];}}else{const seen=new Set();for(let i=0;i<k;i++){let j=this.below(n);while(seen.has(j))j=this.below(n);seen.add(j);result.push(pop[j]);}}return result;}
 choices(pop,weights=null,k=1){if(!weights)return Array.from({length:k},()=>pop[Math.floor(this.random()*pop.length)]);let total=0;const sums=weights.map(w=>total+=w);return Array.from({length:k},()=>{const x=this.random()*total;let lo=0,hi=pop.length-1;while(lo<hi){const m=(lo+hi)>>>1;if(x<sums[m])hi=m;else lo=m+1;}return pop[lo];});}
 getstate(){return [3,[...this.mt,this.index],null];}
 setstate(s){this.mt=s[1].slice(0,624);this.index=s[1][624];}
}
