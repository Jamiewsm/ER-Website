import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {inferDeployTrackFromPaths} from '../scripts/infer_deploy_track.mjs';

const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const receiptId = '20000000-0000-4000-8000-000000000001';
function app(options = {}) {
  const clock = {now: Date.parse(options.open ? '2026-09-01T12:00:00Z' : '2026-10-14T12:00:00Z')};
  class Clock extends Date { static now() { return clock.now; } }
  const nodes = new Map(), saved = new Map(), requests = [], routes = [];
  const storage = {getItem: k => saved.get(k) || null, setItem: (k,v) => {saved.set(k,v);}};
  const context = {
    Date: Clock, state: {latestTestResult:null}, publicTestimonials:{stories:[]},
    window:{SUPABASE_CONFIG:{url:'https://never-requested.invalid'},state:{user:null}},
    sessionStorage:storage, URLSearchParams,
    document:{getElementById(id) { if(!nodes.has(id))nodes.set(id,{className:'',textContent:'',value:'',disabled:false,dataset:{}});return nodes.get(id); }},
    FormData:class {constructor(form){this.values=form.values;}get(name){return this.values[name] || '';}},
    fetch:async (url,init) => {
      requests.push({url,payload:JSON.parse(init.body)});
      if(options.networkError)throw Error('offline');
      return {ok:true,json:async()=> {
        if(options.badJson)throw Error('invalid JSON');
        return options.result || {ok:true,id:receiptId};
      }};
    },
    renderSection(...args){routes.push(args);}, alert(){}, setInterval,clearInterval,
    buildApplySubmitSource:(...parts)=>parts.filter(Boolean).join(':')
  };
  vm.createContext(context);
  for(const path of ['js/program-catalog.js','js/sections/support.js','js/sections/apply.js','js/sections/home.js','js/api.js'])vm.runInContext(read(path),context,{filename:path});
  return {context,clock,nodes,saved,requests,routes,submit:async(values,focus) => context.handleApplySubmit(
    {preventDefault(){},target:{values:{name:'Synthetic',contact:'synthetic@example.test',category:'유형(Typing) 상담 ($100)',turnstile_token:'mock-only',...values}}},
    'paid', focus ? {focus} : undefined)};
}
function assertLabels(html) {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size,'IDs must be unique in each rendered form');
  const tags = [...html.matchAll(/<(input|select|textarea)\b[^>]*\bname="([^"]+)"[^>]*>/g)];
  for(const match of tags) {
    const tag=match[0],name=match[2];
    if(tag.includes('type="hidden"'))continue;
    if(tag.includes('type="checkbox"')) {
      assert.match(html,new RegExp('<label\\b[^>]*>(?:(?!</label>)[\\s\\S])*<input\\b[^>]*name="'+name+'"'));
    } else {
      const id=tag.match(/\bid="([^"]+)"/)?.[1];
      assert.ok(id,'missing ID for '+name);
      assert.ok(html.includes('for="'+id+'"'),'missing label for '+name);
    }
  }
  return tags.length;
}

test('generic categories always use the dedicated basic-course path, before and after closing', () => {
  for(const open of [false,true]){
    const a=app({open});
    assert.equal(a.context.window.ERProgramCatalog.isBasicCourseRecruitmentOpen(),open);
    assert.ok(a.context.window.ERProgramCatalog.getPaidCategoryOptions().every(v=>!v.includes('기본과정')));
    const html=a.context.renderApply({track:'paid'});
    assert.doesNotMatch(html,/<option[^>]*>[^<]*기본과정/);
    assert.match(html,/기본과정·다음 기수 안내/);
    assert.match(html,/focus=enneagram_basic_october/);
    assert.match(html,/테스트 결과지 해석상담|Enneagram for Parenting/);
  }
});
test('catalog fallback also excludes basic course from the generic form', () => {
  const a=app();delete a.context.window.ERProgramCatalog;
  assert.doesNotMatch(a.context.renderApply({track:'paid'}),/<option[^>]*>[^<]*기본과정/);
});
test('closed home and landing agree on recruitment without inventing a new cohort', () => {
  const a=app(), html=a.context.renderHome();
  const card=html.match(/<article[^>]*>(?:(?!<\/article>)[\s\S])*에니어그램 기본과정 8주(?:(?!<\/article>)[\s\S])*<\/article>/)?.[0];
  assert.ok(card);assert.match(card,/모집 마감/);assert.doesNotMatch(card,/모집 중/);
  assert.match(a.context.renderApply({focus:'enneagram_basic_october'}),/모집이 마감/);
  const landing=read('basic-course.html');
  assert.doesNotMatch(landing,/모집 중|지금 신청하기/);
  assert.match(landing,/다음 기수 일정과 수강료는 모집 확정 후 별도로 안내/);
  assert.match(landing,/₩450,000/);assert.match(landing,/\$330/);
});
test('past open fixtures keep the dedicated basic form and original required fields', () => {
  const a=app({open:true}),html=a.context.renderApply({track:'paid',focus:'enneagram_basic_october'});
  assert.match(html,/name="phone" required/);
  assert.match(html,/type="email" name="contact" required/);
  assert.match(html,/name="payment_region" required/);
  assert.match(html,/name="covenant_agree" required/);
  assertLabels(html);
});
for(const payload of [{track:'paid'}, {track:'paid',focus:'parenting_workshop'}, {track:'support'}, {track:'ministry'}, {track:'org'}]){
  test('all visible controls are labeled: '+JSON.stringify(payload),()=>{
    const a=app(),html=a.context.renderApply(payload);
    const count=assertLabels(html);
    if(html.includes('id="apply-form"'))assert.ok(count>=5);
    else assert.doesNotMatch(html,/<(?:input|select|textarea)\b/);
  });
}
test('generic stale basic choice cannot send a request even while recruitment was open', async () => {
  const a=app({open:true});
  await a.submit({category:'성경적 에니어그램 기본과정 8주 ($330 / ₩450,000)'});
  assert.equal(a.requests.length,0);assert.equal(a.routes.length,0);
  assert.match(a.nodes.get('apply-submit-status').textContent,/전용 안내/);
});
test('stale focused basic form cannot submit after closing', async () => {
  const a=app();
  await a.submit({phone:'000',category:'성경적 에니어그램 기본과정'},'enneagram_basic_october');
  assert.equal(a.requests.length,0);
  assert.equal(a.routes[0][0],'apply');assert.equal(a.routes[0][1].focus,'enneagram_basic_october');
});
test('focused basic form during an open fixture rejects missing phone then preserves the original contract', async () => {
  const a=app({open:true});
  await a.submit({category:'성경적 에니어그램 기본과정'},'enneagram_basic_october');
  assert.equal(a.requests.length,0);assert.match(a.nodes.get('apply-submit-status').textContent,/전화번호/);
  await a.submit({phone:'000',category:'성경적 에니어그램 기본과정',payment_region:'KR',payment_preference:'kr_bank',covenant_agree:'on'},'enneagram_basic_october');
  assert.equal(a.requests[0].payload.program_key,'enneagram_basic_july');
  assert.equal(a.requests[0].payload.cohort_key,'enneagram_basic_2026_10');
  assert.equal(a.requests[0].payload.phone,'000');
  assert.equal(a.requests[0].payload.covenant_agreed,true);
  assert.equal(a.routes[0][1].applicationReceipt.id,receiptId);
});
for(const warning of ['receipt_email_failed','email_delivery_uncertain','email_sent_record_failed','unknown_future_warning']){
  test('saved application warning is visible without claiming the mail was sent: '+warning, async()=>{
    const a=app({open:true,result:{ok:true,id:receiptId,warning}});
    await a.submit({phone:'000',category:'성경적 에니어그램 기본과정'},'enneagram_basic_october');
    const route=a.routes[0],html=a.context.renderThankYou(route[1]);
    assert.equal(route[0],'thankyou');assert.equal(route[2].replaceHash,true);
    assert.match(html,new RegExp(receiptId));assert.match(html,/재신청하지 말고/);
    assert.doesNotMatch(html,/담긴 메일을 확인해 주세요/);
  });
}
for(const [category,focus] of [
  ['유형(Typing) 상담 ($100)',undefined],['회복 코칭 8회 ($480)',undefined],
  ['Enneagram for Parenting 4주 ($120)','parenting_workshop'],
  ['목회자 사역지원 신청',undefined],['교회 공동체 워크숍 문의',undefined],['후원 문의',undefined]
]){
  test('other program/inquiry payload and receipt survive: '+category,async()=>{
    const a=app();await a.submit({category,message:'Synthetic inquiry'},focus);
    assert.equal(a.requests.length,1);assert.equal(a.requests[0].payload.category,category);
    assert.equal(a.requests[0].payload.message,'Synthetic inquiry');
    const html=a.context.renderThankYou(a.routes[0][1]);assert.match(html,new RegExp(receiptId));
    assert.doesNotMatch(html,/재신청하지 말고/);
  });
}
test('receipt survives confirmation reload, stores no personal fields, and expires', async()=>{
  const a=app({result:{ok:true,id:receiptId,warning:'receipt_email_failed'}});
  await a.submit({name:'Private synthetic',contact:'private@example.test'},'parenting_workshop');
  const raw=a.saved.get('er_application_receipt');
  assert.doesNotMatch(raw,/Private synthetic|private@example/);
  assert.match(a.context.renderThankYou({focus:'parenting_workshop'}),new RegExp(receiptId));
  assert.doesNotMatch(a.context.renderThankYou({focus:'result_consult'}),new RegExp(receiptId));
  a.clock.now+=31*60*1000;
  assert.doesNotMatch(a.context.renderThankYou({focus:'parenting_workshop'}),new RegExp(receiptId));
});
test('blocked session storage does not turn successful receipt into a failed request',async()=>{
  const a=app();a.context.sessionStorage.setItem=()=>{throw Error('blocked');};
  await a.submit({});assert.equal(a.routes[0][1].applicationReceipt.id,receiptId);
  assert.match(a.context.renderThankYou(a.routes[0][1]),new RegExp(receiptId));
});
test('invalid or unreadable success JSON advises verification instead of a new application',async()=>{
  for(const options of [{badJson:true},{result:{ok:true}},{result:{ok:true,id:'<script>bad</script>'}},{result:{ok:false,id:receiptId}}]){
    const a=app(options);await a.submit({});
    assert.equal(a.routes.length,0);assert.match(a.nodes.get('apply-submit-status').textContent,/재신청하지 말고/);
  }
});
test('receipt cannot inject markup or enter the route URL',()=>{
  const a=app();assert.doesNotMatch(a.context.renderThankYou({applicationReceipt:{id:'<img src=x>',warning:'<script>'}}),/<img src=x>|<script>/);
  const c={URLSearchParams};vm.createContext(c);vm.runInContext(read('js/app-core.js'),c);
  const hash=c.buildSectionHash('thankyou',{focus:'parenting_workshop',applicationReceipt:{id:receiptId,warning:'receipt_email_failed'}});
  assert.equal(hash,'#thankyou?focus=parenting_workshop');assert.ok(!hash.includes(receiptId));
});
test('application files independently trigger site deploy and the application CI gate',()=>{
  for(const path of ['js/api.js','js/sections/apply.js','js/program-catalog.js']){
    assert.equal(inferDeployTrackFromPaths([path]).track,'site');
    assert.ok(read('.github/workflows/site-seo-checks.yml').includes("- '"+path+"'"));
  }
  assert.match(read('.github/workflows/site-seo-checks.yml'),/tests\/application-flow\.test\.mjs/);
  assert.match(read('.github/workflows/site-seo-checks.yml'),/tests\/apply-workshop-render\.test\.mjs/);
});

