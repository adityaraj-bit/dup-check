// DupCheck Evaluator v4.1 — Brute force table reader
// No class detection — reads ALL tables, picks the right one by content

var _url = window.location.href.toLowerCase();
var _isWALLE = _url.indexOf('walle')>=0 || _url.indexOf('walmart')>=0 ||
  !!document.querySelector('[class*="review-group"],[class*="group-module"],[class*="walle"]') ||
  document.title.toLowerCase().indexOf('walle')>=0;

if(!_isWALLE){
  // not walle
} else if(window.__DupCheck_LOADED){
  if(window.__prajnaShow) window.__prajnaShow();
} else {
  window.__DupCheck_LOADED = true;
  init();
}

function init(){

var host = document.createElement('div');
host.id = 'prajna-host';
host.setAttribute('style',
  'position:fixed!important;top:60px!important;right:0!important;'+
  'width:0!important;height:calc(100vh - 60px)!important;z-index:2147483647!important;'+
  'pointer-events:none!important;margin:0!important;padding:0!important;border:none!important;'+
  'overflow:visible!important;');
document.documentElement.appendChild(host);
var shadow = host.attachShadow({mode:'open'});

var css = document.createElement('style');
css.textContent = `
*{box-sizing:border-box;margin:0;padding:0;font-family:'Segoe UI',system-ui,sans-serif;}
#wrap{
  width:var(--panel-w,360px);height:calc(100vh - 60px);background:#f0f2ff;
  border-left:1px solid #c8caff;
  box-shadow:-4px 0 20px rgba(0,0,0,.15);
  display:flex;flex-direction:column;overflow:hidden;
  transform:translateX(100%);
  transition:transform .3s cubic-bezier(.4,0,.2,1), width .25s ease;
  pointer-events:none;
}
#wrap.open{transform:translateX(0);pointer-events:auto;}
/* horizontal scroll for multi-GTIN tables */
.multi-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;}
.multi-scroll::-webkit-scrollbar{height:4px;}
.multi-scroll::-webkit-scrollbar-thumb{background:#c5c8ff;border-radius:2px;}
/* M shortcut hint in header */
.m-hint{font-size:8px;background:rgba(255,255,255,.15);border-radius:4px;padding:1px 5px;color:rgba(255,255,255,.7);letter-spacing:.3px;margin-left:4px;}
#hdr{
  background:linear-gradient(135deg,#3d3df5,#5b3de8);
  padding:12px 14px 10px;flex-shrink:0;
}
.hdr-row{display:flex;align-items:center;gap:10px;margin-bottom:8px;}
.logo-box{width:36px;height:36px;background:#ffcc00;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
.hdr-title{font-weight:800;font-size:15px;color:#fff;}
.hdr-sub{font-size:9px;color:rgba(255,255,255,.65);}
.hdr-btns{display:flex;gap:6px;}
.hdr-btn{background:rgba(255,255,255,.15);border:none;color:#fff;width:26px;height:26px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;}
.hdr-btn:hover{background:rgba(255,255,255,.28);}
.analyze-btn{width:100%;padding:9px;background:rgba(255,255,255,.18);border:1.5px solid rgba(255,255,255,.35);color:#fff;font-weight:700;font-size:12px;letter-spacing:.4px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;}
.analyze-btn:hover{background:rgba(255,255,255,.28);}
#body{flex:1;overflow-y:auto;padding:10px;}
#body::-webkit-scrollbar{width:3px;}
#body::-webkit-scrollbar-thumb{background:#c5c8ff;border-radius:2px;}
.scan-card{background:#fff;border-radius:12px;padding:32px 20px;text-align:center;box-shadow:0 2px 10px rgba(0,0,0,.07);}
.scan-bars{display:flex;gap:5px;align-items:flex-end;height:32px;justify-content:center;margin-bottom:12px;}
.scan-bar{width:6px;border-radius:3px;background:#3d3df5;animation:scanbar 1s ease-in-out infinite;}
.scan-bar:nth-child(1){height:30%;animation-delay:0s;}
.scan-bar:nth-child(2){height:65%;animation-delay:.15s;}
.scan-bar:nth-child(3){height:100%;animation-delay:.3s;}
.scan-bar:nth-child(4){height:65%;animation-delay:.45s;}
.scan-bar:nth-child(5){height:30%;animation-delay:.6s;}
@keyframes scanbar{0%,100%{opacity:.25;transform:scaleY(.5)}50%{opacity:1;transform:scaleY(1)}}
.scan-txt{font-size:13px;font-weight:700;color:#333;}
.scan-sub{font-size:10px;color:#999;margin-top:4px;}
.nogtin-card{background:#fff;border-radius:12px;padding:32px 20px;text-align:center;box-shadow:0 2px 10px rgba(0,0,0,.07);}
.nogtin-icon{font-size:40px;margin-bottom:10px;}
.nogtin-title{font-size:13px;font-weight:700;color:#444;margin-bottom:6px;}
.nogtin-sub{font-size:11px;color:#888;line-height:1.6;}
/* pill uses external inline styles — no shadow DOM CSS needed */
/* WARNING BANNER */
.warn-banner{
  background:#fff8e1;border:1.5px solid #f0c040;border-radius:10px;
  padding:10px 12px;margin-bottom:10px;
  animation:slideUp .4s .05s ease both;
  display:flex;align-items:flex-start;gap:8px;
}
.warn-icon{font-size:16px;flex-shrink:0;margin-top:1px;}
.warn-body{flex:1;}
.warn-title{font-size:11px;font-weight:700;color:#92400e;margin-bottom:3px;}
.warn-list{font-size:10px;color:#78350f;line-height:1.7;}
.verdict-card{border-radius:12px;padding:16px;margin-bottom:10px;text-align:center;animation:slideUp .4s cubic-bezier(.4,0,.2,1) both;}
@keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.verdict-card.dup{background:#e8faf0;border:2px solid #2ecc71;}
.verdict-card.nd{background:#fdecea;border:2px solid #e74c3c;}
.verdict-card.nsbd{background:#fef9e7;border:2px solid #f39c12;}
.v-icon{font-size:20px;margin-bottom:4px;}
.v-txt{font-size:22px;font-weight:900;letter-spacing:-.5px;animation:popIn .4s .1s cubic-bezier(.34,1.56,.64,1) both;}
@keyframes popIn{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}
.verdict-card.dup .v-txt{color:#1a7f4b;}
.verdict-card.nd .v-txt{color:#c0392b;}
.verdict-card.nsbd .v-txt{color:#d68910;}
.v-reason{font-size:11px;color:#555;margin-top:6px;line-height:1.5;animation:fadeUp .3s .2s ease both;}
@keyframes fadeUp{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
.status-line{font-size:11px;font-weight:600;text-align:center;margin-bottom:8px;color:#2ecc71;animation:fadeUp .3s .05s ease both;}
.cat-row{display:flex;gap:8px;margin-bottom:10px;animation:fadeUp .3s .2s ease both;}
.cat-box{background:#fff;border-radius:8px;padding:8px 10px;flex:1;box-shadow:0 1px 4px rgba(0,0,0,.07);font-size:10px;}
.cat-lbl{font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px;}
.cat-val{font-weight:700;color:#3d3df5;font-size:12px;}
.img-section{background:#fff;border-radius:10px;margin-bottom:10px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,.07);animation:slideUp .4s .1s ease both;}
.img-sec-hdr{padding:7px 12px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#666;border-bottom:1px solid #f0f0f0;background:#fafafa;}
.img-row{display:flex;gap:1px;background:#f0f0f0;}
.img-cell{flex:1;background:#fff;padding:8px;text-align:center;}
.img-cell img{width:72px;height:72px;object-fit:contain;border-radius:4px;}
.img-lbl{font-size:9px;color:#888;margin-bottom:4px;font-weight:600;}
.img-badge{font-size:8px;font-weight:700;margin-top:4px;padding:2px 8px;border-radius:10px;display:inline-block;}
.img-badge.diff{background:#fdecea;color:#c0392b;}
.img-badge.same{background:#e8faf0;color:#1a7f4b;}
.sop-box{background:#eef0ff;border:1px solid #c5c8ff;border-radius:10px;padding:12px;margin-bottom:10px;animation:slideUp .4s .15s ease both;}
.sop-lbl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#3d3df5;margin-bottom:6px;}
.sop-txt{font-size:11px;color:#333;line-height:1.6;font-weight:500;}
.match-all{background:#e8faf0;border:1px solid #a9dfbf;border-radius:10px;padding:12px;margin-bottom:10px;animation:slideUp .4s .2s ease both;}
.match-all-hdr{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#1a7f4b;margin-bottom:8px;}
.match-row{display:flex;padding:4px 0;border-bottom:1px solid rgba(0,0,0,.05);}
.match-row:last-child{border-bottom:none;}
.match-field{font-size:11px;font-weight:600;color:#444;flex:0 0 130px;}
.match-val{font-size:11px;font-weight:700;color:#1a7f4b;word-break:break-word;}
.diff-table{background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,.07);margin-bottom:10px;animation:slideUp .4s .25s ease both;}
.diff-hdr{display:flex;background:#fdecea;border-bottom:1px solid #f5b7b7;padding:7px 12px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:#c0392b;align-items:center;justify-content:space-between;}
.diff-badge{background:#c0392b;color:#fff;font-size:8px;padding:2px 7px;border-radius:10px;font-weight:700;}
.diff-col-hdr{display:flex;background:#fafafa;border-bottom:1px solid #f0f0f0;}
.diff-col-hdr div{flex:1;padding:4px 10px;font-size:8px;font-weight:700;text-transform:uppercase;color:#aaa;border-right:1px solid #f0f0f0;}
.diff-col-hdr div:last-child{border-right:none;}
.drow{border-bottom:1px solid #f8f8f8;background:#fff;}
.drow:last-child{border-bottom:none;}
.dlbl{padding:4px 10px 2px;font-size:9px;font-weight:700;color:#777;text-transform:uppercase;background:#fafafa;border-bottom:1px solid #f5f5f5;}
.dvals{display:flex;}
.dval{flex:1;padding:5px 10px 6px;font-size:11px;font-weight:600;line-height:1.4;word-break:break-word;border-right:1px solid #f5f5f5;min-height:28px;}
.dval:last-child{border-right:none;}
.dval.red{background:#fff5f5;color:#c0392b;}
.dval.grn{background:#f0fff4;color:#1a7f4b;}
.dval.muted{color:#ccc;font-style:italic;font-weight:400;}
.err{background:#fff;border-radius:10px;padding:16px;color:#c0392b;font-size:11px;line-height:1.7;box-shadow:0 1px 6px rgba(0,0,0,.07);}
.dbg{background:#fff;border-radius:10px;padding:12px;margin-top:8px;font-size:9px;color:#888;line-height:1.8;word-break:break-all;box-shadow:0 1px 4px rgba(0,0,0,.05);}
#foot{padding:6px 12px;border-top:1px solid #dddeff;background:#eef0ff;flex-shrink:0;display:flex;justify-content:space-between;align-items:center;}
.finfo{font-size:9px;color:#aaa;}
.rerun{background:#3d3df5;border:none;color:#fff;padding:3px 10px;border-radius:5px;cursor:pointer;font-size:10px;font-weight:700;}
.rerun:hover{background:#2d2dcc;}
`;

var wrap = document.createElement('div');
wrap.id = 'wrap';
wrap.innerHTML =
  '<div id="hdr">'+
    '<div class="hdr-row">'+
      '<div class="logo-box">⚡</div>'+
      '<div style="flex:1"><div class="hdr-title">DupCheck</div><div class="hdr-sub">Duplicate Detection Evaluator</div></div>'+
      '<div class="hdr-btns">'+
        '<button class="hdr-btn" id="mbtn" title="Toggle panel (M)">M</button>'+
        '<button class="hdr-btn" id="minbtn" title="Minimize">—</button>'+
        '<button class="hdr-btn" id="closebtn" title="Close">✕</button>'+
      '</div>'+
    '</div>'+
    '<button class="analyze-btn" id="analyzebtn">🔍  Analyze This Page</button>'+
  '</div>'+
  '<div id="body"><div class="scan-card">'+
    '<div class="scan-bars"><div class="scan-bar"></div><div class="scan-bar"></div><div class="scan-bar"></div><div class="scan-bar"></div><div class="scan-bar"></div></div>'+
    '<div class="scan-txt">Waiting for WALLE…</div>'+
    '<div class="scan-sub">Auto-analyzes when table loads</div>'+
  '</div></div>'+
  '<div id="foot"><div class="finfo">Walmart Dups SOP · Jan 2026</div><button class="rerun" id="rerun">↻ Re-run</button></div>';

shadow.appendChild(css);
shadow.appendChild(wrap);
// ── PILL (minimized state) — all styles inline, lives outside Shadow DOM ──
var pill = document.createElement('div');
pill.id = 'dupcheck-pill';

// All styles inline with !important so WALLE CSS cannot override
var PILL_BASE = [
  'position:fixed','bottom:20px','right:20px',
  'z-index:2147483647',
  'display:none',
  'align-items:center','gap:8px',
  'background:linear-gradient(135deg,#3d3df5,#5b3de8)',
  'border-radius:28px','padding:8px 14px 8px 10px',
  'box-shadow:0 4px 20px rgba(61,61,245,.5)',
  'cursor:pointer',
  'font-family:Segoe UI,system-ui,sans-serif',
  'font-size:12px','font-weight:700','color:#fff',
  'border:none','outline:none',
  'user-select:none','-webkit-user-select:none',
  'pointer-events:auto'
].join('!important;')+'!important';

pill.setAttribute('style', PILL_BASE);

pill.innerHTML =
  '<span style="background:#ffcc00;width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;">⚡</span>'+
  '<span style="color:#fff;font-weight:700;font-size:12px;">DupCheck Evaluator</span>'+
  '<span id="dupcheck-badge" style="background:rgba(255,255,255,.25);border-radius:10px;padding:2px 8px;font-size:10px;font-weight:700;color:#fff;margin-left:2px;">—</span>';

document.documentElement.appendChild(pill);

// Hover effect via JS since we can't use CSS for external element
pill.addEventListener('mouseover', function(){ pill.style.setProperty('transform','scale(1.05)','important'); });
pill.addEventListener('mouseout',  function(){ pill.style.setProperty('transform','scale(1)','important'); });

var _minimized   = false;
var _diffCount   = 0;
var _panelWidth  = 360; // auto-adjusted based on GTIN count
var _analyzed    = false; // declared here so keyboard shortcut can use it

function openPanel(){
  _minimized = false;
  wrap.classList.add('open');
  var w = _panelWidth || 360;
  wrap.style.setProperty('--panel-w', w+'px');
  host.style.setProperty('width', w+'px','important');
  host.style.setProperty('pointer-events','auto','important');
  pill.style.setProperty('display','none','important');
}

function minimizePanel(){
  _minimized = true;
  wrap.classList.remove('open');
  // Wait for slide-out animation then collapse width to 0
  setTimeout(function(){
    host.style.setProperty('width','0','important');
    host.style.setProperty('pointer-events','none','important');
  }, 320); // matches transition duration
  // Show pill with flex
  pill.setAttribute('style', PILL_BASE.replace('display:none','display:flex'));
  // Update badge
  var badge = document.getElementById('dupcheck-badge');
  if(badge) badge.textContent = _diffCount > 0 ? _diffCount+' diff'+ (_diffCount>1?'s':'') : '✓ done';
}

pill.addEventListener('click', openPanel);
shadow.getElementById('closebtn').onclick  = minimizePanel;
shadow.getElementById('minbtn').onclick    = minimizePanel;
shadow.getElementById('mbtn').onclick      = function(){ _minimized ? openPanel() : minimizePanel(); };
shadow.getElementById('rerun').onclick     = function(){ runAnalysis(true); };
shadow.getElementById('analyzebtn').onclick= function(){ runAnalysis(true); };
window.__prajnaShow = function(){ openPanel(); runAnalysis(false); };

// ── Keyboard shortcuts ───────────────────────────────────────────
// M = minimize / maximize panel
// N = analyze this page
document.addEventListener('keydown', function(e){
  var tag = (document.activeElement||{}).tagName||'';
  if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT') return;
  if(e.ctrlKey||e.altKey||e.metaKey) return;

  // M — toggle panel
  if(e.key==='m'||e.key==='M'){
    e.preventDefault();
    if(_minimized){ openPanel(); } else { minimizePanel(); }
  }

  // N — analyze page (opens panel if minimized, re-runs analysis)
  if(e.key==='n'||e.key==='N'){
    e.preventDefault();
    _analyzed = false; // allow re-analysis
    openPanel();
    runAnalysis(true);
  }
}, true);

// ═══ HELPERS ═══════════════════════════════════════════════════
function norm(s){ return (s||'').toLowerCase().replace(/[^\w\s]/g,' ').replace(/\s+/g,' ').trim(); }
function toks(s){ return norm(s).split(' ').filter(Boolean); }
function sim(a,b){
  var ta=new Set(toks(a)),tb=new Set(toks(b));
  if(!ta.size&&!tb.size) return 1; if(!ta.size||!tb.size) return 0;
  var c=0; ta.forEach(function(t){ if(tb.has(t)) c++; });
  return c/Math.max(ta.size,tb.size);
}
function trunc(s,n){ s=s||''; return s.length>n?s.slice(0,n)+'…':s; }
function esc(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ═══ SKIP / KEY LISTS ══════════════════════════════════════════
var SKIP_LABELS = [
  'action','reason codes','grouping','brand','product id','item id','item number',
  'upc','walmart item','seller','supplier','vendor','created','updated','sku',
  'cluster','main image url','product secondary image url','image url',
  'defects','content audit report','image validation','item tracker','copy creation',
  'file status','report an issue','provide feedback','request access','show null data',
  'viewing','select cluster','select grouping','hs-v',
  'variant group id','variant attribute names','product net content parent',
  'product net content','flotation tire','electric vehicle tire','is run flat',
  'abstract product id','manufacturer part number','is prop 65','is resizable',
  'personal relationship','inscription','small parts warning code'
  // NOTE: 'has written warranty' REMOVED — warranty IS relevant per agent feedback
  // NOTE: 'product type' NOT skipped — needed for Rings vs Engagement Rings diffs
];
var KEY_FIELDS = [
  'color','colour','size','flavor','flavour','scent','material',
  'count per pack','count','pack','capacity','volume','wattage',
  'configuration','pattern','style','format','edition','model','platform',
  'clothing size','shoe size','ring size','weight','finish','thread count',
  'resolution','width','length','height','type','power',
  'compatible','compatibility','tire size','tire type','construction type',
  'sidewall style','vehicle type','season','load index','speed rating',
  'wheel diameter','multipack quantity','total count',
  // Jewelry
  'diamond cut','diamond color','carats','carat','gemstone','metal type',
  'metal purity','karat','ring style','number of diamonds','number of gemstones',
  'gemstone type','jewelry setting','shape',
  // Electronics
  'processor speed','processor brand','processor core','ram memory','hard drive',
  'wireless technology','operating system','gpu','graphics','storage',
  // Clothing
  'clothing neck style','clothing fit','clothing top style','pant leg','pant rise',
  'pant style','clothing occasion','sleeve length','clothing style',
  'clothing size group','upper body strap','fabric content',
  // General
  'warranty','has written warranty','assembled product','processor type',
  'input output','data storage'
];
function shouldSkip(k){
  var kl=(k||'').toLowerCase().trim();
  if(kl.length<3) return true;
  if(/^\d+$/.test(kl)) return true;
  if(kl.indexOf('http')>=0) return true;
  return SKIP_LABELS.some(function(s){ return kl===s||kl.indexOf(s)>=0; });
}
function isKey(k){
  var kl=k.toLowerCase();
  return KEY_FIELDS.some(function(v){ return kl.indexOf(v)>=0; });
}
function cleanVal(s){
  if(!s) return '';
  s=s.replace(/[\r\n\t]+/g,' ').replace(/\s{2,}/g,' ').trim();
  // Normalize × to x for dimension comparisons
  s=s.replace(/×/g,'x');
  if(s.indexOf('|')>=0){
    var p=s.split('|').map(function(x){return x.trim();}).filter(Boolean);
    s=p.filter(function(x,i){return p.indexOf(x)===i;}).join(', ');
  }
  if(s.length>400) return '';
  return s;
}
// Size alias normalization — maps extended XL labels to canonical form
// Fixes: "5XL" === "XXXXXL", "4XL" === "XXXXL", etc.
function normSize(s){
  if(!s) return '';
  var t=(s||'').toUpperCase().replace(/[^A-Z0-9\-]/g,'').trim();
  var aliases=[
    [/^(XXXXXL|5XLARGE|5XL|5X)$/,'5XL'],
    [/^(XXXXL|4XLARGE|4XL|4X)$/,'4XL'],
    [/^(XXXL|3XLARGE|3XL|3X)$/,'3XL'],
    [/^(XXL|2XLARGE|2XL|2X)$/,'2XL'],
    [/^(XXS|2XSMALL|2XS)$/,'2XS'],
    [/^(XL|XLARGE|EXTRA-?LARGE)$/,'XL'],
    [/^(XS|XSMALL|EXTRA-?SMALL)$/,'XS'],
  ];
  for(var i=0;i<aliases.length;i++) if(aliases[i][0].test(t)) return aliases[i][1];
  return t;
}

function meaningful(v1,v2,fieldKey){
  var c1=cleanVal(v1),c2=cleanVal(v2);
  if(!c1&&!c2) return false;
  // FIX(2025-06-a): size-alias normalization before comparison
  // "XXXXXL" vs "5XL" are the same — should NOT be flagged as different
  if(fieldKey && fieldKey.toLowerCase().indexOf('size')>=0){
    if(normSize(c1)===normSize(c2)) return false;
  }
  if(norm(c1)===norm(c2)) return false;
  if(!c1||!c2) return true;
  // FIX(2025-06-b): numeric-token rule — any differing 3+ digit number is always significant
  // Catches product ID differences (Workstation 1100682 vs 1100216)
  // AND year-range differences in title (2008-2011 vs 2012-2022 → tokens 2008,2011 vs 2012,2022)
  var nums1=norm(c1).split(' ').filter(function(t){return /^\d{3,}$/.test(t);}).sort();
  var nums2=norm(c2).split(' ').filter(function(t){return /^\d{3,}$/.test(t);}).sort();
  if(nums1.join(',')!==nums2.join(',')) return true;
  // IMPROVEMENT 4: cross-unit equivalence — "3 ft" and "36 in" are the same
  var equiv=measurementsEquivalent(c1,c2);
  if(equiv===true) return false;
  var s=sim(c1,c2);
  // For critical jewelry/spec fields — use strict 0.5 threshold
  // "Round Cut" vs "Round Brilliant Cut" should be flagged (sim ~0.6)
  if(fieldKey){
    var kl=fieldKey.toLowerCase();
    var isSpec=kl.indexOf('cut')>=0||kl.indexOf('speed')>=0||kl.indexOf('purity')>=0||
               kl.indexOf('carat')>=0||kl.indexOf('storage')>=0||kl.indexOf('ram')>=0||
               kl.indexOf('processor')>=0||kl.indexOf('warranty')>=0||kl.indexOf('size')>=0||
               kl.indexOf('neck')>=0||kl.indexOf('leg')>=0||kl.indexOf('fit')>=0;
    if(isSpec) return s<0.85; // more lenient threshold catches near-matches like Round vs Round Brilliant
  }
  return s<0.7;
}

// IMPROVEMENT 2: Boilerplate stripping — removes common Walmart seller boilerplate before
// computing similarity, so spec differences buried in templated text are surfaced
var BOILERPLATE_PATTERNS=[
  // Bracket-labeled sections (e.g. "[WHY FROM US] ...text until next bracket or 800 chars")
  // Stops at next [ to avoid eating spec lines that come after boilerplate sections
  /\[[A-Z][^\]]{3,60}\](?:(?!\[)[\s\S]){0,800}/g,
  /\[?\s*(?:why choose us|why from us|satisfaction guaranteed|your satisfaction is our promise)[^\[\n]{0,600}/gi,
  /\[?\s*(?:perfect gift|ideal for gift|the ideal gift)[^\[\n]{0,400}/gi,
  /\[?\s*direct from manufacturer[^\[\n]{0,300}/gi,
  /we stand behind every piece[^\[\n]{0,300}/gi,
  /if you(?:'re| are) not (?:completely |fully )?satisfied[^\[\n]{0,200}/gi,
  /fast shipping[^\[\n]{0,100}/gi,
];
function stripBoilerplate(text){
  if(!text) return '';
  var t=text;
  BOILERPLATE_PATTERNS.forEach(function(p){ t=t.replace(p,' '); });
  return t.replace(/\s+/g,' ').trim();
}

// Smart description diff — checks both raw AND boilerplate-stripped versions
function meaningfulDesc(v1,v2){
  var c1=cleanVal(v1),c2=cleanVal(v2);
  if(!c1&&!c2) return false;
  if(norm(c1)===norm(c2)) return false;
  if(!c1||!c2) return true;
  var s=sim(c1,c2);
  if(s<0.95) return true;
  // Even if raw similarity is high, check stripped versions
  // Descriptions sharing 95%+ boilerplate can still have meaningful spec differences
  var s1=stripBoilerplate(c1), s2=stripBoilerplate(c2);
  if(!s1&&!s2) return false;
  if(norm(s1)===norm(s2)) return false;
  return sim(s1,s2)<0.88;
}

// Extract key numbers/specs from a string for smart comparison
function extractSpecs(s){
  var specs={};
  // Numbers with units
  var re=/(\d+(?:\.\d+)?)\s*(v|w|kg|g|lb|oz|cm|mm|m|ft|in|inch|ml|l|pack|pcs|count|thread|tc)/gi;
  var m;
  while((m=re.exec(s))!==null) specs[m[2].toLowerCase()]=(specs[m[2].toLowerCase()]||[]). concat(parseFloat(m[1]));
  return specs;
}

// ═══ CORE EXTRACTOR — handles 2 to N GTINs ═══════════════════════
// WALLE React DOM: key-row divs, stick-attributes label, group-gtin-column-cell values
function makeProduct(idx){
  return {gtin:'GTIN#'+(idx+1),name:'',description:'',img1:'',img2:'',
          imgs_main:[],imgs_sec:[],attrs:{}};
}

function clickReadMore(){
  var allLinks = document.querySelectorAll('a,button,span,[class*="read-more"],[class*="readmore"]');
  var clicked = 0;
  for(var i=0;i<allLinks.length;i++){
    var el=allLinks[i];
    var txt=(el.innerText||el.textContent||'').trim().toLowerCase();
    if(txt==='read more'||txt==='show more'){
      try{ el.click(); clicked++; }catch(e){}
    }
  }
  return clicked;
}

// IMPROVEMENT 1: Async read-more — waits for React DOM to settle after clicking
// Fixes intermittent blank/truncated descriptions caused by React batched state updates
function waitForReadMore(cb){
  var clicked = clickReadMore();
  if(!clicked) return cb();
  var timer;
  var obs = new MutationObserver(function(){
    clearTimeout(timer);
    // Wait 150ms of DOM silence before proceeding
    timer = setTimeout(function(){ obs.disconnect(); cb(); }, 150);
  });
  obs.observe(document.body,{childList:true,subtree:true,characterData:true});
  // Hard timeout: never wait more than 2.5s regardless
  setTimeout(function(){ obs.disconnect(); cb(); }, 2500);
}

// Parse bullet-point description text into structured key-value pairs
// e.g. "STONE COLOR: D/VVS1" → {key:'STONE COLOR', val:'D/VVS1'}
function parseDescBullets(text){
  if(!text) return {};
  // FIX(2025-06): pre-split inline field patterns so single-line descriptions parse correctly
  // Handles "STONE COLOR: D/VVS1 METAL: 14K" and "Season:Spring Gender: Men Material:Polyester"
  // Step 1 — ALL-CAPS keys: "STONE COLOR: " "METAL: " "SHIPPING: "
  text = text.replace(/(\s+)([A-Z]{2,}(?:[\s\/][A-Z]+){0,5}\s*:(?=\s*\S))/g, '\n$2');
  // Step 2 — Title-Case single/double word keys: "Season:" "Material:" "What you get:"
  text = text.replace(/(\s)([A-Z][a-zA-Z]{1,24}(?:\s[a-zA-Z]+){0,2}\s*:)(?=\s*[^\s])/g, '\n$2');
  var pairs = {};
  var lines = text.split('\n');
  for(var li=0;li<lines.length;li++){
    var line = lines[li].trim();
    if(!line) continue;
    // IMPROVEMENT 3: skip size-chart lines (3+ measurements + body-part keywords)
    var measureCount=(line.match(/\d+(?:\.\d+)?\s*(?:cm|mm|in|inch|inches|\'\')\b/gi)||[]).length;
    var hasSizeKw=/\b(bust|waist|hip|sleeve|inseam|chest|thigh|shoulder|pants length)\b/i.test(line);
    if(measureCount>=3&&hasSizeKw) continue;
    // Strip leading bullet chars (•, -, *, unicode bullets)
    line = line.replace(/^[\u2022\u2023\u25E6\uff65\-\*]\s*/,'');
    var k=null, v=null;

    // Pattern 1: 【KEY】:value or 【KEY】：value  (Japanese/Chinese brackets — very common in Walmart listings)
    var m1 = line.match(/^[\u3010\[](.+?)[\u3011\]]\s*[\uff1a:]\s*(.+)$/);
    if(m1){ k=m1[1].trim(); v=m1[2].trim(); }

    // Pattern 2: KEY: value or KEY：value (any case, 2-60 char key)
    if(!k){
      var m2 = line.match(/^([A-Za-z][A-Za-z0-9\s\(\)\/\-\_\.]{1,58})\s*[\uff1a:]\s*(.+)$/);
      if(m2){ k=m2[1].trim(); v=m2[2].trim(); }
    }

    if(k && v && k.length>=2 && k.length<=60 && v.length>=1 && v.length<=500){
      var kn = k.toUpperCase().trim();
      // Skip keys that are clearly not spec fields
      if(/^[A-Z0-9\s\(\)\/\-\_\.]+$/.test(kn)){
        pairs[kn] = v;
      }
    }
  }
  return pairs;
}

function compareDescBullets(desc1, desc2){
  var b1 = parseDescBullets(desc1);
  var b2 = parseDescBullets(desc2);
  var diffs = [];
  var seen = {}, allKeys = [];
  Object.keys(b1).forEach(function(k){ if(!seen[k]){seen[k]=1;allKeys.push(k);} });
  Object.keys(b2).forEach(function(k){ if(!seen[k]){seen[k]=1;allKeys.push(k);} });
  allKeys.forEach(function(k){
    var v1 = b1[k]||'', v2 = b2[k]||'';
    if(!v1&&!v2) return;
    if(norm(v1)===norm(v2)) return;
    diffs.push({field:'Desc: '+k, v1:v1||'—', v2:v2||'—'});
  });
  return diffs;
}

function extractProducts(){
  // Note: read-more expansion is handled BEFORE this call via waitForReadMore()
  // Do NOT call clickReadMore() here — it would re-click already-expanded sections

  // ── Strategy 1: WALLE class-based selectors ───────────────────
  var keyRows = document.querySelectorAll('[class*="key-row"]');

  if(keyRows.length > 0){
    // Detect how many GTIN columns exist from first row with value cells
    var numGTINs = 0;
    for(var r=0;r<keyRows.length;r++){
      var cells = keyRows[r].querySelectorAll('[class*="group-gtin-column-cell"]:not([class*="stick"])');
      if(cells.length > numGTINs) numGTINs = cells.length;
      if(numGTINs >= 10) break; // cap
    }
    if(!numGTINs) numGTINs = 2; // fallback

    // Build product array for N GTINs
    var prods = [];
    for(var i=0;i<numGTINs;i++) prods.push(makeProduct(i));

    var getImgs = function(cell){
      if(!cell) return [];
      var imgs=cell.querySelectorAll('img'), srcs=[];
      for(var ix=0;ix<imgs.length;ix++){
        var s=imgs[ix].src||imgs[ix].getAttribute('src')||'';
        if(s&&s.indexOf('data:')<0&&s.indexOf('blob:')<0&&s.length>10) srcs.push(s);
      }
      return srcs;
    };

    for(var r=0;r<keyRows.length;r++){
      var row=keyRows[r];
      var labelEl=row.querySelector('[class*="stick-attributes"]');
      if(!labelEl) continue;
      var label=labelEl.innerText.trim();
      if(!label||shouldSkip(label)) continue;
      var ll=label.toLowerCase();

      var valCells=row.querySelectorAll('[class*="group-gtin-column-cell"]:not([class*="stick"])');
      if(!valCells.length) valCells=row.querySelectorAll('[class*="column"]');

      // Image rows
      if(ll.indexOf('image')>=0){
        var isMain=ll.indexOf('secondary')<0&&ll.indexOf('main')>=0;
        var isSec=ll.indexOf('secondary')>=0;
        if(isMain||isSec){
          for(var i=0;i<prods.length;i++){
            var srcs=getImgs(valCells[i]);
            if(isMain){ prods[i].imgs_main=srcs; if(srcs[0]) prods[i].img1=srcs[0]; }
            if(isSec){  prods[i].imgs_sec=srcs;  if(srcs[0]) prods[i].img2=srcs[0]; }
          }
        }
        continue;
      }

      // Regular attribute
      var vals=[];
      for(var i=0;i<numGTINs;i++){
        vals.push(valCells[i] ? cleanVal(valCells[i].innerText.trim()) : '');
      }
      if(vals.every(function(v){return !v;})) continue;

      for(var i=0;i<prods.length;i++){
        var v=vals[i]||'';
        if(ll==='gtin'){ if(v&&v!==label) prods[i].gtin=v; }
        else if(ll.indexOf('product name')>=0||ll.indexOf('item name')>=0) prods[i].name=v;
        else if(ll.indexOf('short desc')>=0||ll.indexOf('long desc')>=0||ll==='description'){
          // Append both short and long desc for maximum coverage
          if(prods[i].description && v) prods[i].description += ' ' + v;
          else if(v) prods[i].description = v;
        }
        else prods[i].attrs[label]=v;
      }
    }

    var valid=prods.filter(function(p){return p.name||Object.keys(p.attrs).length>2;});
    if(valid.length>=2) return valid.length===prods.length?prods:valid;
  }

  // ── Strategy 2: generic div/tr rows ────────────────────────────
  var p1=makeProduct(0), p2=makeProduct(1);
  var allDivs=document.querySelectorAll('div,tr'), found=0;
  for(var i=0;i<allDivs.length;i++){
    var el=allDivs[i], ch=el.children;
    if(ch.length<3) continue;
    var labelTxt=ch[0].innerText?ch[0].innerText.trim():ch[0].textContent.trim();
    if(!labelTxt||labelTxt.length>80||labelTxt.length<2||shouldSkip(labelTxt)) continue;
    var v1txt=ch[1].innerText?ch[1].innerText.trim():ch[1].textContent.trim();
    var v2txt=ch[2].innerText?ch[2].innerText.trim():ch[2].textContent.trim();
    if(!v1txt||labelTxt===v1txt) continue;
    var v1=cleanVal(v1txt), v2=cleanVal(v2txt), ll=labelTxt.toLowerCase();
    if(ll==='gtin'){if(v1)p1.gtin=v1;if(v2)p2.gtin=v2;found++;}
    else if(ll.indexOf('product name')>=0||ll.indexOf('item name')>=0){p1.name=v1;p2.name=v2;found++;}
    else if(ll.indexOf('short desc')>=0||ll.indexOf('long desc')>=0){p1.description=v1;p2.description=v2;found++;}
    else if(!shouldSkip(labelTxt)){p1.attrs[labelTxt]=v1;p2.attrs[labelTxt]=v2;found++;}
  }
  if(found>2||p1.name) return [p1,p2];

  // ── Nothing worked — show debug ───────────────────────────────
  var dbg=[];
  dbg.push('key-row divs: '+document.querySelectorAll('[class*="key-row"]').length);
  dbg.push('table count: '+document.querySelectorAll('table').length);
  dbg.push('tr count: '+document.querySelectorAll('tr').length);
  dbg.push('td count: '+document.querySelectorAll('td').length);
  // Sample first few elements with "key" in class
  var keySample=[];
  var allEls=document.querySelectorAll('*');
  var keyCount=0;
  for(var i=0;i<allEls.length&&keyCount<5;i++){
    var cls=(allEls[i].className||'').toString();
    if(cls.indexOf('key')>=0||cls.indexOf('row')>=0||cls.indexOf('attr')>=0){
      keySample.push(allEls[i].tagName+'.'+cls.slice(0,40)+': '+allEls[i].textContent.trim().slice(0,30));
      keyCount++;
    }
  }
  dbg.push('Classes with key/row/attr:<br>'+keySample.join('<br>'));
  showBody('<div class="err">⚠ Could not read WALLE data.<br><br>Debug:<br>'+dbg.join('<br>')+'</div>');
  return [];
}

// ═══ GTIN DETECTION ════════════════════════════════════════════
function hasGTINs(){
  // Check WALLE React DOM first (key-row divs)
  var keyRows = document.querySelectorAll('[class*="key-row"]');
  if(keyRows.length >= 3) return true;

  // Check for GTIN#1 / GTIN#2 text anywhere on page
  var body = document.body ? (document.body.innerText||document.body.textContent||'') : '';
  if(body.indexOf('GTIN#1')>=0 && body.indexOf('GTIN#2')>=0) return true;

  // Check for Product Name in any div with siblings
  var allDivs = document.querySelectorAll('div');
  for(var i=0;i<allDivs.length;i++){
    var ch = allDivs[i].children;
    if(ch.length>=3){
      var lbl=(ch[0].innerText||ch[0].textContent||'').trim().toLowerCase();
      if(lbl==='product name'||(lbl==='gtin'&&ch[1].textContent.trim().length>5)) return true;
    }
  }

  // Fallback: table-based
  var allTR=document.querySelectorAll('tr');
  for(var i=0;i<allTR.length;i++){
    var cells=allTR[i].querySelectorAll('td');
    if(cells.length<3) continue;
    var lbl=cells[0].textContent.trim().toLowerCase();
    if(lbl==='product name'||lbl==='gtin') return true;
  }
  return false;
}

// ═══ AUTO-WATCH — instant trigger in microseconds ══════════════
var _timer=null; // _analyzed declared above with panel vars

function triggerAnalysis(){
  if(_analyzed) return;
  _analyzed = true;
  clearInterval(_timer);
  if(_obs) _obs.disconnect();
  openPanel();
  runAnalysis(false);
}

// MutationObserver — fires instantly on DOM change
var _obs = new MutationObserver(function(){
  if(!_analyzed && hasGTINs()) triggerAnalysis();
});
_obs.observe(document.body, {childList:true, subtree:true, attributes:false});

// Also check immediately (page may already be loaded)
if(hasGTINs()){
  triggerAnalysis();
} else {
  // Fallback poll — fast 100ms in case MutationObserver misses it
  _timer = setInterval(function(){
    if(_analyzed){ clearInterval(_timer); return; }
    if(hasGTINs()) triggerAnalysis();
  }, 100);
  // After 30s show no-GTIN state
  setTimeout(function(){
    clearInterval(_timer);
    if(_obs) _obs.disconnect();
    if(!_analyzed){
      showBody('<div class="nogtin-card"><div class="nogtin-icon">🔍</div><div class="nogtin-title">No GTINs Found</div><div class="nogtin-sub">Open a WALLE comparison page, then click Analyze This Page.</div></div>');
      openPanel();
    }
  }, 30000);
}

// ═══ CATEGORY + VERDICT ════════════════════════════════════════
var MANDATORY={
  books:['edition','format','isbn'],clothing:['size','color','colour','pattern'],
  footwear:['size','color','width'],electronics:['model','configuration','wattage','capacity'],
  food:['flavor','flavour','count','pack','size','weight'],rugs:['size','color','pattern'],
  bedding:['size','color','thread count'],furniture:['color','finish','configuration'],
  automotive:['tire size','size','model','type','construction','vehicle type'],
  toys:['color','size','count','pack','platform'],
  general:['size','color','type','model','count','weight','material']
};
var CAT_NAMES={books:'Books',clothing:'Clothing',footwear:'Footwear',electronics:'Electronics',
  food:'Food',rugs:'Rugs',bedding:'Bedding',furniture:'Furniture',
  automotive:'Automotive',toys:'Toys',general:'General'};

function detectCat(p1,p2){
  // IMPROVEMENT 5: check WALLE's own Product Type attribute first — it's authoritative
  var pt=((p1.attrs['Product Type']||p2.attrs['Product Type']||'')).toLowerCase();
  if(/tire|tyre|brake|rotor|automotive/.test(pt)) return 'automotive';
  if(/shoe|boot|sandal|sneaker|footwear|slipper/.test(pt)) return 'footwear';
  if(/\b(?:book|novel|textbook)\b/.test(pt)) return 'books';
  if(/laptop|phone|tablet|television|monitor|computer|camera/.test(pt)||/computer replacement/i.test(pt)) return 'electronics';
  if(/food|beverage|supplement|snack|coffee/.test(pt)) return 'food';
  if(/\b(?:rug|carpet)\b/.test(pt)) return 'rugs';
  if(/bedding|mattress|comforter|duvet/.test(pt)) return 'bedding';
  if(/furniture|sofa|chair|table/.test(pt)) return 'furniture';
  if(/\btoy|\bgame/.test(pt)) return 'toys';
  if(/apparel|clothing|shirt|pant|dress|jacket|pajama|sleepwear/.test(pt)) return 'clothing';
  if(/ring|necklace|bracelet|earring|jewelry|jewellery|engagement|wedding/.test(pt)) return 'jewelry';
  if(/picture frame|frame/.test(pt)) return 'general';
  // Fallback: keyword scan of all product text
  var t=(p1.name+' '+p1.description+' '+Object.values(p1.attrs).join(' ')+
         p2.name+' '+p2.description+' '+Object.values(p2.attrs).join(' ')).toLowerCase();
  if(/\b(tire|tyre|vehicle|motor|wheel)\b/.test(t)) return 'automotive';
  if(/shoe|boot|sandal|sneaker|footwear|slipper/.test(t)) return 'footwear';
  if(/\b(book|novel|textbook|paperback|isbn)\b/.test(t)) return 'books';
  if(/\b(laptop|phone|tablet|television|monitor|computer|camera|electronics)\b/.test(t)) return 'electronics';
  if(/\b(food|snack|drink|beverage|cereal|coffee|supplement)\b/.test(t)) return 'food';
  if(/\b(rug|carpet|runner)\b/.test(t)) return 'rugs';
  if(/\b(bedding|comforter|duvet|mattress)\b/.test(t)) return 'bedding';
  if(/\b(sofa|couch|chair|table|desk|furniture)\b/.test(t)) return 'furniture';
  if(/\b(toy|game|puzzle|doll|disc|frisbee|flying|kids|play)\b/.test(t)) return 'toys';
  if(/\b(ring|necklace|bracelet|earring|jewelry|jewellery)\b/.test(t)) return 'jewelry';
  if(/shirt|pant|dress|jacket|jeans|sweater|clothing|apparel|pajama|sleepwear/.test(t)) return 'clothing';
  return 'general';
}
function computeVerdict(keyDiffs,nameSim,cat){
  var mnd=MANDATORY[cat]||MANDATORY.general;
  for(var i=0;i<keyDiffs.length;i++){
    var kl=keyDiffs[i].field.toLowerCase();
    if(mnd.some(function(m){return kl.indexOf(m)>=0;}))
      return {cls:'nd',txt:'NOT A DUPLICATE',
        reason:'"'+keyDiffs[i].field+'" differs — '+trunc(keyDiffs[i].v1,22)+' vs '+trunc(keyDiffs[i].v2,22),
        rule:'SOP: Key variant attribute difference'};
  }
  if(keyDiffs.length>=2) return {cls:'nd',txt:'NOT A DUPLICATE',
    reason:keyDiffs.map(function(d){return d.field;}).join(', ')+' differ',rule:'SOP: Multiple variant differences'};
  if(keyDiffs.length===1&&/color|colour|finish|pattern/.test(keyDiffs[0].field.toLowerCase()))
    return {cls:'nd',txt:'NOT A DUPLICATE',reason:'"'+keyDiffs[0].field+'" — distinct color/finish',rule:'SOP: Color/finish = distinct swatches'};
  if(nameSim>=0.8&&keyDiffs.length===0) return {cls:'dup',txt:'DUPLICATE',
    reason:'Name '+Math.round(nameSim*100)+'% match · No variant differences',rule:'SOP: No distinguishing differences'};
  if(nameSim>=0.5&&keyDiffs.length===0) return {cls:'dup',txt:'DUPLICATE',
    reason:'Name '+Math.round(nameSim*100)+'% · No variant differences found',rule:'SOP: Same product listings'};
  return {cls:'nsbd',txt:'NOT SURE – BAD DATA',
    reason:'Name '+Math.round(nameSim*100)+'% · '+keyDiffs.length+' key diff(s)',rule:'Manual review required'};
}

// ═══ VERTICAL DISCREPANCY ENGINE ════════════════════════════════
// Catches inconsistencies WITHIN a single product between:
// title/name vs attributes (e.g. "220V" in name but Voltage attr = "230V")

// Extract numbers+units from a string — returns array of {val, unit, raw}
function extractMeasurements(s){
  if(!s) return [];
  var results=[];
  // Pattern: number (optional decimal) + optional space + unit
  // Units: V, W, kg, g, lb, oz, cm, mm, m, ft, in, inch, pack, pcs, pieces, count, ml, l, fl oz, A, amp, mAh, Hz, rpm
  var re = /(\d+(?:\.\d+)?)\s*(ghz|mhz|hz|cttw|ct(?!\w)|carat|carats|kt|karat|karats|v|volt|volts|w|watt|watts|kg|kgs|g|gm|gms|lb|lbs|oz|ounce|ounces|cm|mm|ft|foot|feet|inches|inch|in(?!ch|\w)|pack|pcs|pc|piece|pieces|count|ltr|litre|liter|ml|l(?!b|t|i|e|[a-z])|amp|amps|mah|rpm|kw|gb|tb|mb)/gi;
  var match;
  while((match=re.exec(s))!==null){
    var num=parseFloat(match[1]);
    var unit=match[2].toLowerCase().replace(/\s+/g,'').replace(/\.$/,'');
    results.push({val:num, unit:unit, raw:match[0].trim()});
  }
  return results;
}

// Normalize unit aliases to canonical form
function canonUnit(u){
  var map={
    'volt':'v','volts':'v',
    'watt':'w','watts':'w','kw':'w',
    'kgs':'kg','gm':'g','gms':'g',
    'lbs':'lb','ounce':'oz','ounces':'oz',
    'foot':'ft','feet':'ft',
    'inch':'in','inches':'in',
    // Pack/count — but NOT carat (ct = carat in jewelry context)
    'pcs':'pack','pc':'pack','piece':'pack','pieces':'pack',
    'ltr':'l','litre':'l','liter':'l',
    'amp':'a','amps':'a',
    // Gold karat
    'kt':'karat','karats':'karat','k':'karat',
    // Carat weight (jewelry)
    'carat':'ct','carats':'ct','cttw':'ct',
    // Digital storage
    'gb':'gb','tb':'tb','mb':'mb',
    // Processor speed
    'mhz':'mhz','ghz':'ghz'
  };
  return map[u]||u;
}

// Check if two measurements conflict (same unit, different value)
function measureConflict(m1, m2){
  var u1=canonUnit(m1.unit), u2=canonUnit(m2.unit);
  if(u1!==u2) return false;
  return Math.abs(m1.val-m2.val)>0.01;
}

// IMPROVEMENT 4: Cross-unit normalization — convert to base unit before comparing
// Fixes "3 ft" vs "36 in" being flagged as different
var UNIT_TO_BASE={
  // length → cm
  'in':2.54,'inch':2.54,'inches':2.54,'ft':30.48,'foot':30.48,'feet':30.48,
  'mm':0.1,'cm':1,'m':100,
  // weight → g
  'g':1,'gm':1,'gms':1,'kg':1000,'kgs':1000,
  'oz':28.35,'ounce':28.35,'ounces':28.35,'lb':453.59,'lbs':453.59,
  // volume → ml
  'ml':1,'l':1000,'ltr':1000,'litre':1000,'liter':1000,
};
var UNIT_GROUPS_MAP={
  length:['in','inch','inches','ft','foot','feet','mm','cm','m'],
  weight:['g','gm','gms','kg','kgs','oz','ounce','ounces','lb','lbs'],
  volume:['ml','l','ltr','litre','liter'],
};
function sameUnitGroup(u1,u2){
  u1=u1.toLowerCase();u2=u2.toLowerCase();
  for(var g in UNIT_GROUPS_MAP){
    if(UNIT_GROUPS_MAP[g].indexOf(u1)>=0&&UNIT_GROUPS_MAP[g].indexOf(u2)>=0) return g;
  }
  return null;
}
function measurementsEquivalent(v1,v2){
  // Returns true if v1 and v2 express the same physical quantity in different units
  var m1=extractMeasurements(v1),m2=extractMeasurements(v2);
  if(!m1.length||!m2.length||m1.length!==m2.length) return null;
  for(var i=0;i<m1.length;i++){
    var matched=false;
    for(var j=0;j<m2.length;j++){
      var grp=sameUnitGroup(m1[i].unit,m2[j].unit);
      if(grp){
        var f1=UNIT_TO_BASE[m1[i].unit.toLowerCase()];
        var f2=UNIT_TO_BASE[m2[j].unit.toLowerCase()];
        if(f1&&f2){
          var diff=Math.abs(m1[i].val*f1 - m2[j].val*f2);
          var tol=Math.max(m1[i].val*f1,m2[j].val*f2)*0.02; // 2% tolerance
          if(diff<=tol){matched=true;break;}
        }
      }
    }
    if(!matched) return false;
  }
  return true;
}

// ATTR-to-TITLE field mapping — which attributes should match what in title
var ATTR_TITLE_CHECKS=[
  {attrPatterns:['voltage','volt','v (ac','v ac','operating voltage'],    unitPatterns:['v','volt','volts'],    label:'Voltage'},
  {attrPatterns:['wattage','power','watt'],                               unitPatterns:['w','watt','watts','kw'],label:'Wattage'},
  {attrPatterns:['weight','item weight','net weight','product weight'],   unitPatterns:['kg','g','lb','oz'],    label:'Weight'},
  {attrPatterns:['count per pack','pack count','quantity','multipack','total count','count'], unitPatterns:['pack','pcs','pc','piece','pieces','count'], label:'Count/Pack'},
  {attrPatterns:['capacity','volume','size'],                             unitPatterns:['ml','l','ltr','litre','fl oz'],label:'Volume'},
  {attrPatterns:['size','dimensions','length','width','height'],          unitPatterns:['cm','mm','m','ft','in','inch'],label:'Dimensions'},
  {attrPatterns:['amperage','current','amp'],                             unitPatterns:['a','amp','amps','mah'], label:'Amperage'},
  {attrPatterns:['frequency','hz'],                                       unitPatterns:['hz'],                  label:'Frequency'},
  // Thread count — plain number in title vs attribute (no unit)
  {attrPatterns:['thread count','thread'],                                unitPatterns:['tc','thread'],          label:'Thread Count', plainNum:true},
  // Metal purity / gold karat
  {attrPatterns:['metal purity','karat','karats','gold purity','purity'],  unitPatterns:['kt','karat','karats','k'], label:'Metal Purity/Karat'},
  // Carat weight (diamond/gemstone) — "1.72ct" in title vs "1 ct" in attr
  {attrPatterns:['carats','carat weight','diamond carat','total carat','cttw','gemstone weight'],
                                                                           unitPatterns:['ct','carat','carats','cttw'], label:'Carat Weight'},
  // Processor speed — "3.4GHz" in title vs attr
  {attrPatterns:['processor speed','clock speed','cpu speed','ghz'],       unitPatterns:['ghz','mhz'],           label:'Processor Speed'},
  // Storage — "1TB" vs "512GB"
  {attrPatterns:['data storage','hard drive','storage capacity','ssd','hdd'],unitPatterns:['gb','tb','mb'],      label:'Storage'},
  // RAM
  {attrPatterns:['ram','memory'],                                           unitPatterns:['gb','mb'],             label:'RAM'},
  // Diamond cut — detect cut name in title vs attr (semantic check)
  // Handled separately by checkDiamondCut()
];

// Extract number+unit mentions of a specific type from a string
function extractForUnits(text, unitPatterns){
  var results=[];
  var all=extractMeasurements(text);
  for(var i=0;i<all.length;i++){
    var cu=canonUnit(all[i].unit);
    for(var j=0;j<unitPatterns.length;j++){
      if(cu===canonUnit(unitPatterns[j])||all[i].unit.indexOf(unitPatterns[j])>=0){
        results.push(all[i]); break;
      }
    }
  }
  return results;
}

// Extract plain numbers that appear BEFORE a keyword in text
// e.g. "1500 Thread Count" → 1500
function extractPlainNumBefore(text, keywords){
  var results=[];
  for(var k=0;k<keywords.length;k++){
    var kw=keywords[k];
    var re=new RegExp('(\\d+(?:\\.\\d+)?)\\s*'+kw, 'gi');
    var m;
    while((m=re.exec(text))!==null){
      results.push({val:parseFloat(m[1]), unit:kw, raw:m[0].trim()});
    }
  }
  return results;
}

// Extract karat value from any string: "14K", "18kt", "14 karat", "14 kt" → 14
function extractKarat(s){
  if(!s) return null;
  // Match: number followed by K/KT/kt/karat/karats optionally
  var m = s.match(/(10|14|18|22|24)\s*(?:k|kt|karat|karats)/i);
  if(m) return parseInt(m[1]);
  // Also match plain karat numbers in attribute values like "14 kt" or just "14"
  m = s.match(/^(\d{2})\s*(?:k|kt|karat)?$/i);
  if(m && [10,14,18,22,24].indexOf(parseInt(m[1]))>=0) return parseInt(m[1]);
  return null;
}

// ── Diamond cut semantic checker ─────────────────────────────────
// "Round Cut" and "Round Brilliant Cut" are different enough to flag
var CUT_ALIASES = {
  'round brilliant cut':['round cut','round'],
  'princess cut':['princess','square cut'],
  'marquise cut':['marquise'],
  'cushion cut':['cushion'],
  'oval cut':['oval'],
  'pear cut':['pear','teardrop'],
  'emerald cut':['emerald'],
  'radiant cut':['radiant'],
  'asscher cut':['asscher'],
  'heart cut':['heart'],
  'trillion cut':['trillion','trilliant']
};
function normCut(s){
  s=(s||'').toLowerCase().replace(/[-_]/g,' ').trim();
  for(var full in CUT_ALIASES){
    if(s===full) return full;
    var aliases=CUT_ALIASES[full];
    for(var i=0;i<aliases.length;i++){
      if(s===aliases[i]||s.indexOf(aliases[i])>=0) return aliases[i]; // return alias to detect mismatch with full
    }
  }
  return s;
}
function extractCutFromText(text){
  var t=text.toLowerCase();
  var cuts=['round brilliant cut','marquise cut','princess cut','cushion cut',
            'oval cut','pear cut','emerald cut','radiant cut','asscher cut',
            'round cut','square cut','heart cut','trillion cut','trillion'];
  for(var i=0;i<cuts.length;i++){
    if(t.indexOf(cuts[i])>=0) return cuts[i];
  }
  // Generic: "X Cut" pattern
  var m=t.match(/(round|marquise|princess|cushion|oval|pear|emerald|radiant|asscher|heart|trillion)\s*(?:brilliant\s*)?cut/);
  return m?m[0]:null;
}

// ── Extract size from description text ──────────────────────────
function extractSizeFromDesc(text){
  if(!text) return [];
  var sizes=[];
  // Clothing size patterns: S, M, L, XL, XXL etc.
  var clMatch=text.match(/Size\s*:\s*([SMLX]+(?:L|XL)*)/i);
  if(clMatch) sizes.push({type:'clothing',val:clMatch[1].toUpperCase()});
  // Dimension patterns: 200x180x50cm, 137x153cm
  var dimMatch3D = text.match(/ (\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(cm|mm|in|inch|") /i);
  if(dimMatch3D) {
    sizes.push({type:'dimension',val:dimMatch3D[1]+'x'+dimMatch3D[2]+'x'+dimMatch3D[3]+dimMatch3D[4]});
  } else {
    var dimMatch=text.match(/ (\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(cm|mm|in|inch|") /i);
    if(dimMatch) sizes.push({type:'dimension',val:dimMatch[1]+'x'+dimMatch[2]+dimMatch[3]});
  }

  // Quart patterns
  var qtMatch=text.match(/(\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?)\s*(?:qt|quart|quarts)/i);
  if(qtMatch) sizes.push({type:'quart',val:qtMatch[0]});
  return sizes;
}

// Check one product for vertical discrepancies
function checkVertical(prod){
  var issues=[];
  var title=(prod.name||'')+' '+(prod.description||'');

  // ── SMART CHECK 1: Metal Purity / Karat ─────────────────────────
  // WALLE uses several different attribute names for gold karat:
  // "Metal Purity", "Karats", "Gold Purity", "Karat", "Metal Fineness"
  // Values can be: "14 kt", "18K", "14KT", "14 karat", "14" (plain)
  // NOTE: "Metal Purity" can also store carat weight (e.g. "1.9 ct") — skip those
  var attrKeys=Object.keys(prod.attrs);
  var karatAttrKey=null, karatAttrVal='', titleKarat=extractKarat(title);

  // Only run karat check if title actually mentions a karat value
  if(titleKarat!==null){
    // Search all attr keys for karat-related fields
    var karatKeyPatterns=['metal purity','karats','karat','gold purity','fineness','metal fineness','gold karat'];
    for(var k=0;k<attrKeys.length;k++){
      var kl=attrKeys[k].toLowerCase();
      if(karatKeyPatterns.some(function(p){return kl.indexOf(p)>=0;})){
        var candidate=prod.attrs[attrKeys[k]]||'';
        // Only use this attr if it actually contains a karat value (not just carat weight)
        // "14 kt" → karat ✓, "1.9 ct" → carat weight ✗, "18K" → karat ✓
        var candidateKarat=extractKarat(candidate);
        if(candidateKarat!==null){
          karatAttrKey=attrKeys[k];
          karatAttrVal=candidate;
          break;
        }
      }
    }
    if(karatAttrKey&&karatAttrVal){
      var attrKarat=extractKarat(karatAttrVal);
      if(attrKarat!==null&&titleKarat!==attrKarat){
        issues.push({
          type:'Metal Purity/Karat',
          attrKey:karatAttrKey,
          titleVal:titleKarat+'K (from title)',
          attrVal:attrKarat+'K ('+karatAttrVal+')',
          msg:'Metal purity mismatch: title says '+titleKarat+'K but '+karatAttrKey+' says '+attrKarat+'K'
        });
      }
    }
  }

  // ── SMART CHECK 2: Silver Purity (925, 999) ──────────────────────
  var silverPattern=/(925|999|999\.9|950|850|800)/;
  var titleSilver=title.match(silverPattern);
  if(titleSilver){
    for(var k=0;k<attrKeys.length;k++){
      var kl=attrKeys[k].toLowerCase();
      if(kl.indexOf('purity')>=0||kl.indexOf('fineness')>=0||kl.indexOf('metal')>=0){
        var attrSilver=(prod.attrs[attrKeys[k]]||'').match(silverPattern);
        if(attrSilver&&attrSilver[1]!==titleSilver[1]){
          issues.push({type:'Metal Purity',attrKey:attrKeys[k],
            titleVal:titleSilver[1]+' (from title)',attrVal:attrSilver[1]+' (from attribute)',
            msg:'Metal purity mismatch: title says '+titleSilver[1]+' but "'+attrKeys[k]+'" says '+attrSilver[1]});
        }
        break;
      }
    }
  }

  // ── SMART CHECK 3: Diamond Cut mismatch ────────────────────────
  var titleCut=extractCutFromText(title);
  if(titleCut){
    for(var k=0;k<attrKeys.length;k++){
      var kl=attrKeys[k].toLowerCase();
      if(kl.indexOf('diamond cut')>=0||kl.indexOf('cut')>=0||kl.indexOf('shape')>=0){
        var attrCut=extractCutFromText(prod.attrs[attrKeys[k]]||'');
        if(attrCut&&titleCut!==attrCut){
          // Normalize: "round cut" ≠ "round brilliant cut" — these ARE different
          var tNorm=normCut(titleCut), aNorm=normCut(attrCut);
          if(tNorm!==aNorm){
            issues.push({type:'Diamond Cut',attrKey:attrKeys[k],
              titleVal:titleCut,attrVal:attrCut,
              msg:'Diamond cut mismatch: title says "'+titleCut+'" but "'+attrKeys[k]+'" says "'+attrCut+'"'});
          }
        }
        break;
      }
    }
  }

  // ── SMART CHECK 4: Carat weight mismatch ───────────────────────
  // e.g. title "1.72ct" vs Metal Purity/Carats attr "1 ct"
  var titleCaratM=title.match(/(\d+(?:\.\d+)?)\s*(?:ct|cttw|carat|carats)/i);
  if(titleCaratM){
    var titleCt=parseFloat(titleCaratM[1]);
    for(var k=0;k<attrKeys.length;k++){
      var kl=attrKeys[k].toLowerCase();
      if(kl.indexOf('carat')>=0||kl.indexOf('cttw')>=0||kl.indexOf('carats')>=0){
        var attrCtM=(prod.attrs[attrKeys[k]]||'').match(/(\d+(?:\.\d+)?)\s*(?:ct|cttw|carat|carats)/i);
        if(attrCtM){
          var attrCt=parseFloat(attrCtM[1]);
          if(Math.abs(titleCt-attrCt)>0.05){
            issues.push({type:'Carat Weight',attrKey:attrKeys[k],
              titleVal:titleCt+'ct (from title)',attrVal:attrCt+'ct (from attribute)',
              msg:'Carat weight mismatch: title says '+titleCt+'ct but "'+attrKeys[k]+'" says '+attrCt+'ct'});
          }
        }
        break;
      }
    }
  }

  // ── SMART CHECK 5: Size in description vs Size attribute ────────
  var descSizes=extractSizeFromDesc(prod.description);
  if(descSizes.length){
    for(var ds=0;ds<descSizes.length;ds++){
      var dsz=descSizes[ds];
      // Check against relevant attribute
      if(dsz.type==='clothing'){
        var szAttr=prod.attrs['Clothing Size']||prod.attrs['Size']||'';
        if(szAttr&&szAttr.toUpperCase()!==dsz.val&&norm(szAttr)!==norm(dsz.val)){
          issues.push({type:'Size',attrKey:'Clothing Size',
            titleVal:dsz.val+' (from description)',attrVal:szAttr+' (attribute)',
            msg:'Size mismatch: description says "'+dsz.val+'" but Clothing Size attribute says "'+szAttr+'"'});
        }
      }
      if(dsz.type==='dimension'){
        var szAttr2=prod.attrs['Size']||prod.attrs['Dimensions']||'';
        if(szAttr2){
          // FIX(2025-06): normalize dimension strings before comparing
          // "28x7in" (from desc) vs "28 x 7" (from attr) are the SAME size — strip units + spaces
          function normDim(s){
            return s.toLowerCase()
                    .replace(/\s*(cm|mm|in|inch|inches|ft|feet|\")\s*/gi,'')
                    .replace(/\s*[x\u00d7]\s*/g,'x')
                    .replace(/\s/g,'').trim();
          }
          var nd=normDim(dsz.val), na=normDim(szAttr2);
          if(nd&&na&&nd.indexOf(na)<0&&na.indexOf(nd)<0){
            issues.push({type:'Size/Dimensions',attrKey:'Size',
              titleVal:dsz.val+' (from description)',attrVal:szAttr2+' (attribute)',
              msg:'Size mismatch: description mentions "'+dsz.val+'" but Size attribute says "'+szAttr2+'"'});
          }
        }
      }
      if(dsz.type==='quart'){
        var szAttr3=prod.attrs['Size']||prod.attrs['Capacity']||'';
        // Check title too
        var titleQt=title.match(/(\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?)\s*(?:qt|quart)/i);
        if(titleQt&&szAttr3&&norm(titleQt[0])!==norm(szAttr3)){
          issues.push({type:'Size/Capacity',attrKey:'Size',
            titleVal:titleQt[0]+' (from title)',attrVal:szAttr3+' (attribute)',
            msg:'Capacity mismatch: title says "'+titleQt[0]+'" but Size attribute says "'+szAttr3+'"'});
        }
      }
    }
  }

  // ── SMART CHECK 6: Hardcoded product-type specific title→attr checks ──
  // These are the most common WALLE vertical discrepancy patterns found in production
  var prodType=(prod.attrs['Product Type']||prod.attrs['product type']||'').toLowerCase();
  var allAttrKeys=Object.keys(prod.attrs);

  // RINGS/JEWELRY: Stone cut in title vs Diamond Cut attr
  // e.g. "Marquise Cut" in title but Diamond Cut attr = "Round Brilliant Cut"
  if(!titleCut){
    // Also search short description for cut
    titleCut = extractCutFromText(prod.description||'');
  }

  // JEWELRY: Gold type in title vs Material/Metal Type attr
  // e.g. title says "Rose Gold" but Material attr says "White Gold"
  var goldTypes={'rose gold':'rose gold','white gold':'white gold','yellow gold':'yellow gold',
                 'rose':'rose gold','white':'white gold','yellow':'yellow gold'};
  var titleGoldType=null;
  var tl=title.toLowerCase();
  if(tl.indexOf('rose gold')>=0) titleGoldType='rose gold';
  else if(tl.indexOf('white gold')>=0) titleGoldType='white gold';
  else if(tl.indexOf('yellow gold')>=0) titleGoldType='yellow gold';

  if(titleGoldType){
    for(var k=0;k<allAttrKeys.length;k++){
      var kl=allAttrKeys[k].toLowerCase();
      if(kl==='material'||kl==='metal type'||kl==='metal'){
        var attrGold=(prod.attrs[allAttrKeys[k]]||'').toLowerCase();
        // Check if attr mentions a DIFFERENT gold type
        var attrGoldType=null;
        if(attrGold.indexOf('rose gold')>=0) attrGoldType='rose gold';
        else if(attrGold.indexOf('white gold')>=0) attrGoldType='white gold';
        else if(attrGold.indexOf('yellow gold')>=0) attrGoldType='yellow gold';
        if(attrGoldType&&titleGoldType!==attrGoldType){
          issues.push({type:'Gold Type',attrKey:allAttrKeys[k],
            titleVal:titleGoldType+' (title)',attrVal:attrGoldType+' (attribute)',
            msg:'Gold type mismatch: title says "'+titleGoldType+'" but '+allAttrKeys[k]+' says "'+attrGoldType+'"'});
        }
        break;
      }
    }
  }

  // CLOTHING: Size in title vs Clothing Size attr
  // e.g. title "White S(S)" but Clothing Size attr = "M"
  var titleSizeMatch=title.match(/([SMLX]+L?|[Xx][Xx]?[Ll]?|(?:\d+X?L?))(?:\s*\(([SMLX]+L?)\))?/);
  if(titleSizeMatch){
    var titleSz=(titleSizeMatch[2]||titleSizeMatch[1]).toUpperCase();
    // Valid clothing sizes only
    if(['XS','S','M','L','XL','XXL','XXXL','2XL','3XL','4XL'].indexOf(titleSz)>=0){
      for(var k=0;k<allAttrKeys.length;k++){
        var kl=allAttrKeys[k].toLowerCase();
        if(kl==='clothing size'||kl==='size'&&prodType.indexOf('shirt')>=0||
           kl==='size'&&prodType.indexOf('pant')>=0||kl==='size'&&prodType.indexOf('short')>=0){
          var attrSz=(prod.attrs[allAttrKeys[k]]||'').toUpperCase().trim();
          if(attrSz&&attrSz!==titleSz&&attrSz.indexOf(titleSz)<0&&titleSz.indexOf(attrSz)<0){
            issues.push({type:'Clothing Size',attrKey:allAttrKeys[k],
              titleVal:titleSz+' (from title)',attrVal:attrSz+' (attribute)',
              msg:'Size mismatch: title says "'+titleSz+'" but Clothing Size attr says "'+attrSz+'"'});
          }
          break;
        }
      }
    }
  }

  // ELECTRONICS: Warranty mentioned in title/desc vs Has Written Warranty attr
  var hasWarrantyMention=(title+' '+(prod.description||'')).toLowerCase().indexOf('warrant')>=0;
  if(hasWarrantyMention){
    for(var k=0;k<allAttrKeys.length;k++){
      if(allAttrKeys[k].toLowerCase()==='has written warranty'){
        var wVal=(prod.attrs[allAttrKeys[k]]||'').toLowerCase();
        if(wVal==='no'||wVal==='-'||wVal===''){
          issues.push({type:'Warranty',attrKey:allAttrKeys[k],
            titleVal:'Warranty mentioned in title/desc',attrVal:wVal||'Not set',
            msg:'Warranty mentioned in description but Has Written Warranty attribute is "'+( wVal||'empty')+'"'});
        }
        break;
      }
    }
  }

  // IMPROVEMENT 7: Color in description vs Color attribute
  // Catches "Available in Blue" in description but Color attribute = "Red"
  var COLOR_WORDS=['red','blue','green','yellow','purple','orange','pink','brown',
    'black','white','gray','grey','silver','gold','rose','navy','teal','beige',
    'cream','ivory','maroon','olive','coral','violet','indigo','lime','magenta',
    'turquoise','copper','bronze','champagne','charcoal','khaki','lavender'];
  var colorAttrKey2=null, colorAttrVal2='';
  for(var k=0;k<allAttrKeys.length;k++){
    var kl=allAttrKeys[k].toLowerCase();
    if(kl==='color'||kl==='colour'||kl==='actual color'||kl==='item color'){
      colorAttrKey2=allAttrKeys[k];
      colorAttrVal2=(prod.attrs[allAttrKeys[k]]||'').toLowerCase();
      break;
    }
  }
  if(colorAttrKey2&&colorAttrVal2&&colorAttrVal2!=='multicolor'&&colorAttrVal2!=='multi'&&colorAttrVal2!=='various'){
    var attrColorWords=COLOR_WORDS.filter(function(c){return colorAttrVal2.indexOf(c)>=0;});
    if(attrColorWords.length>0){
      var descLower=(prod.description||'').toLowerCase();
      // Look for explicit "Color: X" or "Available in X" patterns in description with a DIFFERENT color
      var descExplicit=descLower.match(/(?:color|colour)\s*:\s*([a-z]+)/i);
      if(descExplicit){
        var descColorWord=descExplicit[1].toLowerCase();
        if(COLOR_WORDS.indexOf(descColorWord)>=0&&attrColorWords.indexOf(descColorWord)<0){
          issues.push({type:'Color',attrKey:colorAttrKey2,
            titleVal:descColorWord+' (in description)',attrVal:colorAttrVal2+' (attribute)',
            msg:'Color discrepancy: description says "'+descColorWord+'" but '+colorAttrKey2+' attribute says "'+colorAttrVal2+'"'});
        }
      }
    }
  }

  // GENERAL: Weight mismatch — title mentions weight vs Weight attr
  var titleWeightM=title.match(/(\d+(?:\.\d+)?)\s*(kg|g|lb|lbs|oz|gram|grams)/i);
  if(titleWeightM){
    var titleWt=parseFloat(titleWeightM[1]);
    var titleWtUnit=titleWeightM[2].toLowerCase().replace('grams','g').replace('gram','g').replace('lbs','lb');
    for(var k=0;k<allAttrKeys.length;k++){
      var kl=allAttrKeys[k].toLowerCase();
      if(kl.indexOf('weight')>=0&&kl.indexOf('assembled')<0){
        var attrWtM=(prod.attrs[allAttrKeys[k]]||'').match(/(\d+(?:\.\d+)?)\s*(kg|g|lb|lbs|oz|gram|grams)/i);
        if(attrWtM){
          var attrWt=parseFloat(attrWtM[1]);
          var attrWtUnit=attrWtM[2].toLowerCase().replace('grams','g').replace('gram','g').replace('lbs','lb');
          if(titleWtUnit===attrWtUnit&&Math.abs(titleWt-attrWt)>0.1){
            issues.push({type:'Weight',attrKey:allAttrKeys[k],
              titleVal:titleWt+titleWtUnit+' (title)',attrVal:attrWt+attrWtUnit+' (attribute)',
              msg:'Weight mismatch: title says '+titleWt+titleWtUnit+' but '+allAttrKeys[k]+' says '+attrWt+attrWtUnit});
          }
        }
        break;
      }
    }
  }

  for(var ci=0;ci<ATTR_TITLE_CHECKS.length;ci++){
    var chk=ATTR_TITLE_CHECKS[ci];

    // Find matching attribute key
    var attrKey=null, attrVal='';
    var attrKeys=Object.keys(prod.attrs);
    for(var k=0;k<attrKeys.length;k++){
      var kl=attrKeys[k].toLowerCase();
      if(chk.attrPatterns.some(function(p){return kl.indexOf(p)>=0;})){
        attrKey=attrKeys[k]; attrVal=prod.attrs[attrKeys[k]]||''; break;
      }
    }
    if(!attrKey||!attrVal) continue;

    var titleMeasures=[], attrMeasures=[];

    if(chk.plainNum){
      // For plain-number attributes (Thread Count, piece count etc.)
      // Extract number appearing before the keyword in title
      titleMeasures=extractPlainNumBefore(title, chk.attrPatterns);
      // Attribute value is just a number — parse it
      var attrNum=parseFloat((attrVal+'').replace(/[^\d.]/g,''));
      if(!isNaN(attrNum)) attrMeasures=[{val:attrNum, unit:chk.attrPatterns[0], raw:attrVal.trim()}];
    } else {
      titleMeasures=extractForUnits(title, chk.unitPatterns);
      attrMeasures=extractForUnits(attrVal, chk.unitPatterns);
    }

    if(!titleMeasures.length||!attrMeasures.length) continue;

    for(var t=0;t<titleMeasures.length;t++){
      for(var a=0;a<attrMeasures.length;a++){
        var tv=titleMeasures[t].val, av=attrMeasures[a].val;
        if(Math.abs(tv-av)>0.01){
          issues.push({
            type: chk.label,
            attrKey: attrKey,
            titleVal: titleMeasures[t].raw,
            attrVal:  attrMeasures[a].raw,
            msg: chk.label+' mismatch: title says "'+titleMeasures[t].raw+'" but '+attrKey+' says "'+attrMeasures[a].raw+'"'
          });
        }
      }
    }
  }

  // Extra checks:

  // 1. Pack count from title ("18 Pack", "Set of 6", "6 Pieces") vs count attr
  var packTitleMatch = title.match(/(\d+)\s*(?:pack|pcs|pieces|piece|set of|count|ct)/i)||
                       title.match(/(?:set of|pack of)\s*(\d+)/i);
  if(packTitleMatch){
    var titleCount=parseInt(packTitleMatch[1]||packTitleMatch[2]);
    var countAttrs=['count per pack','multipack quantity','total count','quantity'];
    for(var k=0;k<Object.keys(prod.attrs).length;k++){
      var ak=Object.keys(prod.attrs)[k];
      var akl=ak.toLowerCase();
      if(countAttrs.some(function(p){return akl.indexOf(p)>=0;})){
        var attrNum=parseInt((prod.attrs[ak]||'').replace(/[^\d]/g,''));
        if(attrNum&&titleCount&&Math.abs(attrNum-titleCount)>0){
          issues.push({
            type:'Count/Pack',attrKey:ak,
            titleVal:titleCount+' (from title)',attrVal:attrNum+' (attribute)',
            msg:'Count mismatch: title says '+titleCount+' but '+ak+' = '+attrNum
          });
        }
        break;
      }
    }
  }

  // 2. Size from title vs Size attribute
  var dimTitle3D = title.match(/(\d+(?:\.\d+)?)\s*["'"]?\s*[x×]\s*(\d+(?:\.\d+)?)\s*["'"]?\s*[x×]\s*(\d+(?:\.\d+)?)/i);
  var dimTitle2D = title.match(/(\d+(?:\.\d+)?)\s*["'"]?\s*[x×]\s*(\d+(?:\.\d+)?)/i);
  var tDim = dimTitle3D || dimTitle2D;

  if(tDim){
    var sizeAttr = prod.attrs['Size']||prod.attrs['size']||prod.attrs['Dimensions']||'';
    var dimAttr3D = sizeAttr.match(/(\d+(?:\.\d+)?)\s*["'"]?\s*[x×]\s*(\d+(?:\.\d+)?)\s*["'"]?\s*[x×]\s*(\d+(?:\.\d+)?)/i);
    var dimAttr2D = sizeAttr.match(/(\d+(?:\.\d+)?)\s*["'"]?\s*[x×]\s*(\d+(?:\.\d+)?)/i);
    var aDim = dimAttr3D || dimAttr2D;

    if(aDim){
      var tw=parseFloat(tDim[1]), th=parseFloat(tDim[2]);
      var aw=parseFloat(aDim[1]), ah=parseFloat(aDim[2]);
      
      var isMismatch = Math.abs(tw-aw)>0.1 || Math.abs(th-ah)>0.1;

      // If BOTH have a third dimension, compare it
      if(tDim[3] && aDim[3]){
          var td=parseFloat(tDim[3]), ad=parseFloat(aDim[3]);
          if(Math.abs(td-ad)>0.1) isMismatch = true;
      }

      if(isMismatch){
        issues.push({
          type:'Dimensions',attrKey:'Size/Dimensions',
          titleVal:tDim[0],attrVal:aDim[0],
          msg:'Size mismatch: title says "'+tDim[0]+'" but attribute says "'+aDim[0]+'"'
        });
      }
    }
  }

  // 2.5 Gemini Specs vs Title/Attr
  if(prod.imageData && prod.imageData.specs){
    var specs = prod.imageData.specs;
    var dimsToCheck = (specs.product_dimensions || []).concat(specs.package_or_shell_dimensions || []);
    dimsToCheck.forEach(function(dimStr){
      var oDim = dimStr.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)(?:\s*[x×]\s*(\d+(?:\.\d+)?))?/i);
      if(oDim){
        var ow=parseFloat(oDim[1]), oh=parseFloat(oDim[2]), od=oDim[3]?parseFloat(oDim[3]):null;
        if(tDim){
           var tw=parseFloat(tDim[1]), th=parseFloat(tDim[2]), td=tDim[3]?parseFloat(tDim[3]):null;
           var isMismatch = Math.abs(tw-ow)>0.1 || Math.abs(th-oh)>0.1;
           if(td && od && Math.abs(td-od)>0.1) isMismatch=true;
           if(isMismatch){
             issues.push({
               type:'AI Dimensions',attrKey:'Image Data',
               titleVal:tDim[0] + ' (Title)',attrVal:dimStr + ' (Image)',
               msg:'Image text says "'+dimStr+'" but Title says "'+tDim[0]+'"'
             });
           }
        }
      }
    });
  }

  // 3. Missing critical attribute but mentioned in title
  var criticalChecks=[
    {titleRe:/(color|colour|colou?red?)/i, attrPatterns:['color','colour'], label:'Color'},
    {titleRe:/(\d+)\s*v/i,                  attrPatterns:['voltage','volt'], label:'Voltage'},
    {titleRe:/(\d+)\s*w/i,                  attrPatterns:['wattage','watt'], label:'Wattage'},
  ];
  for(var ci=0;ci<criticalChecks.length;ci++){
    var cc2=criticalChecks[ci];
    if(!cc2.titleRe.test(title)) continue;
    var hasAttr=Object.keys(prod.attrs).some(function(k){
      return cc2.attrPatterns.some(function(p){return k.toLowerCase().indexOf(p)>=0;});
    });
    if(!hasAttr){
      issues.push({
        type:cc2.label, attrKey:'(missing)',
        titleVal:'mentioned in title', attrVal:'attribute empty/missing',
        msg:cc2.label+' mentioned in title but no corresponding attribute found'
      });
    }
  }

  return issues;
}

// ═══ GEMINI AI INTEGRATION ════════════════════════════════════════
var GEMINI_API_KEY = "";
var GEMINI_PROMPT = `
{
  "raw_text": "A full dump of all the readable text in the image",
  "specs": {
    "product_dimensions": ["strict format: Length x Width x Depth/Height [unit], e.g. 200x180x50cm or 137x153cm"],
    "package_or_shell_dimensions": ["strict format: Length x Width x Depth [unit], e.g. 22x10x5in"],
    "clothing_size": ["S", "M", "L", "XL", "etc"],
    "volume_quarts": ["e.g. 5 qt", "1.5 quarts"],
    "weight": "extracted weight here, e.g. 45 kg",
    "color": "extracted color",
    "voltage": "e.g. 220v",
    "wattage": "e.g. 50w",
    "other_specs": {
        "Material": "example material",
        "Processor": "example processor",
        "RAM": "example RAM",
        "Storage": "example storage",
        "Compatibility": "what it fits or is designed for",
        "Package Contents": "what is included"
    }
  }
}

Rules:
1. If a specific field is not found in the image, omit it entirely from the JSON or leave it null.
2. DIMENSIONS FORMATTING: You must normalize all 2D or 3D measurements into the strict format L x W x D unit (e.g., "10 x 5 x 2 cm" or "10 x 5 cm"). Do not include words like "Length" or "Width" in the output string, just the numbers, the 'x' separator, and the unit.
3. PRODUCT VS SHELL: Intelligently separate the dimensions of the core "product" itself from the dimensions of the "shell", "packaging", or "box" it comes in. Put them in their respective arrays.
4. The "other_specs" object is a catch-all for stone color, metal, cut, purity, karat, vehicle fitment, part numbers, etc.
5. ONLY return the raw JSON object. No extra text, no explanations, no markdown formatting.
`;

function urlToBase64(url) {
  return new Promise(function(resolve, reject) {
    fetch(url)
      .then(function(response) { return response.blob(); })
      .then(function(blob) {
        var reader = new FileReader();
        reader.onloadend = function() { resolve(reader.result.split(',')[1]); }
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      })
      .catch(function(e) { resolve(null); }); // resolve null on CORS fail instead of breaking promise all
  });
}

function fetchGeminiData(products) {
  if (!GEMINI_API_KEY) {
    products.forEach(function(p) { p.imageData = null; });
    return Promise.resolve();
  }

  showBody('<div class="status-line" style="margin:20px;text-align:center;color:#666">Running AI Vision Analysis...</div>');
  return new Promise(function(resolve) {
    var prodPromises = products.map(function(p) {
      p.imageData = null;
      var allImgs = (p.imgs_main || []).concat(p.imgs_sec || []).filter(Boolean);
      allImgs = allImgs.filter(function(item, pos) { return allImgs.indexOf(item) === pos; }); // unique
      
      if(allImgs.length === 0) return Promise.resolve();

      // Convert all images to base64
      return Promise.all(allImgs.map(urlToBase64)).then(function(base64Arr) {
        var validBase64 = base64Arr.filter(Boolean);
        if(validBase64.length === 0) return Promise.resolve(); // all failed CORS or empty

        var parts = validBase64.map(function(b64) {
          return { "inlineData": { "mimeType": "image/jpeg", "data": b64 } };
        });
        parts.push({ "text": GEMINI_PROMPT });

        var payload = { "contents": [{ "parts": parts }] };
        var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=" + GEMINI_API_KEY;

        return fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(function(res) { return res.json(); }).then(function(data) {
          try {
            var rawText = data.candidates[0].content.parts[0].text;
            var cleanText = rawText.trim().replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
            p.imageData = JSON.parse(cleanText);
          } catch(e) { console.log('Gemini Parse Error:', e, data); }
        }).catch(function(e) { console.log('Gemini Fetch Error:', e); });
      });
    });

    Promise.all(prodPromises).then(resolve);
  });
}

// ═══ IMAGE SET COMPARISON ══════════════════════════════════════
// Compare two arrays of image URLs — normalize (strip query params, lowercase)
function normImgUrl(url){
  if(!url) return '';
  try{
    var u=url.split('?')[0].split('#')[0].toLowerCase();
    // Extract just the filename portion for robust comparison
    var parts=u.split('/');
    return parts[parts.length-1]||u;
  }catch(e){ return url.toLowerCase(); }
}
function compareImgSets(set1, set2){
  if(!set1.length&&!set2.length) return null; // no images at all
  if(!set1.length||!set2.length) return false; // one side missing
  // Compare normalized filenames
  var n1=set1.map(normImgUrl), n2=set2.map(normImgUrl);
  // Check if primary image matches
  if(n1[0]!==n2[0]) return false;
  // All match
  return true;
}

// ═══ WARNING BUILDER ════════════════════════════════════════════
// Generates warnings when products look completely identical
function buildWarnings(keyDiffs,otherDiffs,mainSame,secSame,p1,p2,vert1,vert2){
  var warnings=[];
  var totalDiffs=keyDiffs.length+otherDiffs.length;
  var vertCount=(vert1?vert1.length:0)+(vert2?vert2.length:0);

  // Warning: completely identical (no diffs at all)
  if(totalDiffs===0&&vertCount===0&&mainSame!==false&&secSame!==false){
    warnings.push({
      level:'high',
      title:'Products appear completely identical',
      items:[
        'No attribute differences found between GTINs',
        mainSame===true?'Main images are identical':'Main images not compared',
        secSame===true?'Secondary images are identical':'Secondary images not compared',
        'Consider marking as Duplicate'
      ]
    });
  }

  // Warning: images same but attributes differ
  if(mainSame===true&&secSame===true&&totalDiffs>0){
    warnings.push({
      level:'med',
      title:'Same images but '+totalDiffs+' attribute difference'+(totalDiffs>1?'s':''),
      items:['Both GTINs share identical product images','Attribute differences may indicate a data entry error or variant confusion']
    });
  }

  // Warning: images different but no attribute diffs
  if((mainSame===false||secSame===false)&&totalDiffs===0){
    warnings.push({
      level:'med',
      title:'Different images but no attribute differences',
      items:[
        mainSame===false?'Main images differ':'Main images match',
        secSame===false?'Secondary images differ':'Secondary images match',
        'Image difference may indicate packaging variant or photography issue'
      ]
    });
  }

  // Warning: Vertical discrepancies found
  if(vertCount>0){
    var msgs=[];
    if(vert1&&vert1.length) vert1.forEach(function(v){msgs.push(p1.gtin+': '+v.msg);});
    if(vert2&&vert2.length) vert2.forEach(function(v){msgs.push(p2.gtin+': '+v.msg);});
    warnings.push({
      level:'high',
      title:vertCount+' Vertical data inconsistenc'+(vertCount>1?'ies':'y') +' found',
      items:msgs
    });
  }

  return warnings;
}

// ═══ ANALYSIS ══════════════════════════════════════════════════
function showBody(html){ shadow.getElementById('body').innerHTML=html; }
function setScanning(){
  showBody('<div class="scan-card"><div class="scan-bars"><div class="scan-bar"></div><div class="scan-bar"></div><div class="scan-bar"></div><div class="scan-bar"></div><div class="scan-bar"></div></div><div class="scan-txt">Analyzing…</div><div class="scan-sub">Reading comparison table</div></div>');
}
function runAnalysis(manual){
  _analyzed=true; setScanning();
  // IMPROVEMENT 1: wait for React DOM to settle after expanding descriptions
  setTimeout(function(){
    waitForReadMore(function(){
    try{
      var products=extractProducts();
      if(!products||products.length<2) return;

      // ── GEMINI AI INTEGRATION ──────────────────────────────────
      fetchGeminiData(products).then(function() {

      // ── 2-GTIN path (existing, unchanged) ──────────────────────
      if(products.length===2){
        _panelWidth = 360;
        wrap.style.setProperty('--panel-w','360px');
        host.style.setProperty('width','360px','important');
        var p1=products[0],p2=products[1];
        var cat=detectCat(p1,p2);
        var nameSim=sim(p1.name,p2.name);
        var keyDiffs=[],otherDiffs=[],matchAttrs=[];

        // ── Product Name
        // FIX(2025-06): only show as "matching" when names are TRULY identical after normalisation.
        // Names that are similar-but-not-identical (e.g. differ by a model number) go to otherDiffs.
        if(meaningful(p1.name,p2.name)){
          otherDiffs.push({field:'Product Name',v1:cleanVal(p1.name),v2:cleanVal(p2.name)});
        } else if(p1.name && norm(cleanVal(p1.name))===norm(cleanVal(p2.name))){
          matchAttrs.push({k:'Product Name',v:trunc(p1.name,40)});
        }
        // (names that fall in the grey zone — similar but not identical — are silently omitted)

        // ── Description (short + long) — use strict smart comparison
        var d1=cleanVal(p1.description), d2=cleanVal(p2.description);
        if(d1||d2){
          if(meaningfulDesc(d1,d2)){
            var descSim=sim(d1,d2);
            otherDiffs.push({
              field:'Product Description',
              v1:d1||'—', v2:d2||'—',
              simPct:Math.round(descSim*100)
            });
          } else {
            matchAttrs.push({k:'Product Description',v:trunc(d1||d2,50)});
          }
          // ── Deep dive: extract structured bullet key-values from description
          // Catches things like "STONE COLOR: D/VVS1" vs "STONE COLOR: D/VVS19"
          var bulletDiffs = compareDescBullets(p1.description, p2.description);
          bulletDiffs.forEach(function(bd){
            // Add as key diff if it's a spec-type field, else other diff
            var fk = bd.field.toLowerCase();
            var isSpecField = fk.indexOf('stone')>=0||fk.indexOf('metal')>=0||
                              fk.indexOf('color')>=0||fk.indexOf('colour')>=0||
                              fk.indexOf('size')>=0||fk.indexOf('weight')>=0||
                              fk.indexOf('carat')>=0||fk.indexOf('material')>=0||
                              fk.indexOf('cut')>=0||fk.indexOf('purity')>=0||
                              fk.indexOf('karat')>=0||fk.indexOf('capacity')>=0||
                              fk.indexOf('dimension')>=0||fk.indexOf('watt')>=0||
                              fk.indexOf('volt')>=0||fk.indexOf('processor')>=0||
                              fk.indexOf('ram')>=0||fk.indexOf('storage')>=0||
                              // IMPROVEMENT 6: compatibility fields from description bullets
                              fk.indexOf('compat')>=0||fk.indexOf('fits')>=0||
                              fk.indexOf('fitment')>=0||fk.indexOf('works with')>=0||
                              fk.indexOf('designed for')>=0||fk.indexOf('vehicle')>=0||
                              fk.indexOf('model number')>=0||fk.indexOf('part number')>=0||
                              // Package/contents differences
                              fk.indexOf('package')>=0||fk.indexOf('what you get')>=0||
                              fk.indexOf('includes')>=0||fk.indexOf('contents')>=0;
            if(isSpecField) keyDiffs.push(bd);
            else otherDiffs.push(bd);
          });
        }

        // ── All other attributes
        var allK=[],seen={};
        Object.keys(p1.attrs).forEach(function(k){if(!seen[k]){seen[k]=1;allK.push(k);}});
        Object.keys(p2.attrs).forEach(function(k){if(!seen[k]){seen[k]=1;allK.push(k);}});
        for(var i=0;i<allK.length;i++){
          var k=allK[i]; if(shouldSkip(k)) continue;
          var v1=p1.attrs[k]||'',v2=p2.attrs[k]||'';
          if(meaningful(v1,v2,k)){
            var d={field:k,v1:cleanVal(v1),v2:cleanVal(v2)};
            if(isKey(k)) keyDiffs.push(d); else otherDiffs.push(d);
          } else if(v1||v2) matchAttrs.push({k:k,v:trunc(cleanVal(v1)||cleanVal(v2),40)});
        }

        var mainSame=compareImgSets(p1.imgs_main||[p1.img1].filter(Boolean),p2.imgs_main||[p2.img1].filter(Boolean));
        var secSame =compareImgSets(p1.imgs_sec||[p1.img2].filter(Boolean), p2.imgs_sec||[p2.img2].filter(Boolean));
        var vert1=checkVertical(p1);
        var vert2=checkVertical(p2);
        
        // ── Gemini Horizontal Check ───────────────────────────────
        var d1str = (p1.imageData && p1.imageData.specs) ? JSON.stringify(p1.imageData.specs) : null;
        var d2str = (p2.imageData && p2.imageData.specs) ? JSON.stringify(p2.imageData.specs) : null;
        if (d1str || d2str) {
           if (d1str !== d2str) {
              keyDiffs.push({
                 field: 'AI Extracted Specs',
                 v1: d1str ? 'Specs Found (See AI Table)' : 'No specs found',
                 v2: d2str ? 'Specs Found (See AI Table)' : 'No specs found'
              });
           } else {
              matchAttrs.push({k:'AI Extracted Specs', v:'Matched exactly'});
           }
        }

        _diffCount=keyDiffs.length+otherDiffs.length;
        // IMPROVEMENT 8: progressive rendering — key diffs first, rest in next tick
        // Agents see the most important info immediately without waiting for full render
        renderPass1(p1,p2,cat,keyDiffs,otherDiffs,matchAttrs,mainSame,secSame,vert1,vert2);

      // ── N-GTIN path (3+ GTINs) ──────────────────────────────────
      } else {
        // Auto-expand panel width: 360 base + 120 per extra GTIN, max 600
        var n=products.length;
        _panelWidth = Math.min(600, 360 + (n-2)*120);
        wrap.style.setProperty('--panel-w', _panelWidth+'px');
        host.style.setProperty('width', _panelWidth+'px','important');
        var cat=detectCat(products[0],products[1]);
        renderMulti(products, cat);
      }
      }); // end fetchGeminiData

    }catch(e){ showBody('<div class="err">⚠ Error: '+esc(e.message)+'</div>'); }
    }); // end waitForReadMore
  },manual?100:400);
}

// ═══ RENDER ════════════════════════════════════════════════════
function imgCell(src,lbl){
  return '<div class="img-cell"><div class="img-lbl">'+lbl+'</div>'+
    (src?'<img src="'+src+'" onerror="this.style.display=\'none\'">':
    '<div style="width:72px;height:72px;background:#f5f5f5;border-radius:4px;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:9px;color:#bbb;">None</div>')+
    '</div>';
}
function diffRow(d,delay){
  var e1=!d.v1||d.v1==='—', e2=!d.v2||d.v2==='—';
  var simBadge = d.simPct!==undefined
    ? '<span style="font-size:8px;background:rgba(0,0,0,.07);border-radius:8px;padding:1px 6px;font-weight:600;color:#666;margin-left:4px;">'+d.simPct+'% similar</span>'
    : '';
  return '<div class="drow" style="animation:slideUp .25s '+delay+'s ease both">'+
    '<div class="dlbl">'+esc(d.field)+simBadge+'</div>'+
    '<div class="dvals">'+
      '<div class="dval'+(e1?' muted':' red')+'">'+esc(e1?'—':trunc(d.v1,160))+'</div>'+
      '<div class="dval'+(e2?' muted':' grn')+'">'+esc(e2?'—':trunc(d.v2,160))+'</div>'+
    '</div></div>';
}
// IMPROVEMENT 8: two-pass rendering — status + key diffs immediately, rest next tick
function renderPass1(p1,p2,cat,keyDiffs,otherDiffs,matchAttrs,mainSame,secSame,vert1,vert2){
  // Pass 1: render header + key diffs immediately so agents can see them right away
  var totalDiffs=keyDiffs.length+otherDiffs.length;
  var vertCount=(vert1?vert1.length:0)+(vert2?vert2.length:0);
  var html='';
  html+='<div class="status-line">'+esc(p1.gtin||'GTIN#1')+' vs '+esc(p2.gtin||'GTIN#2')+'</div>';
  html+='<div class="cat-row">'+
    '<div class="cat-box"><div class="cat-lbl">Category</div><div class="cat-val">'+esc((CAT_NAMES[cat]||cat).toUpperCase())+'</div></div>'+
    '<div class="cat-box"><div class="cat-lbl">Cross-GTIN Diffs</div><div class="cat-val" style="color:'+(totalDiffs>0?'#c0392b':'#1a7f4b')+'">'+totalDiffs+(totalDiffs===0?' None':totalDiffs===1?' field':' fields')+'</div></div>'+
    '<div class="cat-box"><div class="cat-lbl">Vertical</div><div class="cat-val" style="color:'+(vertCount>0?'#3d3df5':'#1a7f4b')+'">'+vertCount+(vertCount===0?' None':vertCount===1?' issue':' issues')+'</div></div>'+
  '</div>';
  if(keyDiffs.length){
    html+='<div class="diff-table"><div class="diff-hdr">Key Differences <span class="diff-badge">'+keyDiffs.length+'</span></div>'+
      '<div class="diff-col-hdr"><div>'+esc(trunc(p1.gtin,16))+'</div><div>'+esc(trunc(p2.gtin,16))+'</div></div>';
    for(var i=0;i<keyDiffs.length;i++) html+=diffRow(keyDiffs[i],.05*i);
    html+='</div>';
  }
  // Loading placeholder for the rest
  html+='<div id="_pass2" style="opacity:.5;font-size:10px;text-align:center;padding:10px;color:#888">Loading other attributes…</div>';
  showBody(html);
  // Pass 2: fill in the rest (warnings, images, other diffs, matches, vertical)
  setTimeout(function(){
    render(p1,p2,cat,keyDiffs,otherDiffs,matchAttrs,mainSame,secSame,p1,p2,vert1,vert2);
  },0);
}

function render(p1,p2,cat,keyDiffs,otherDiffs,matchAttrs,mainSame,secSame,rp1,rp2,vert1,vert2){
  var totalDiffs=keyDiffs.length+otherDiffs.length;
  var vertCount=(vert1?vert1.length:0)+(vert2?vert2.length:0);
  var html='';

  // STATUS LINE — GTINs + diff count summary only, no decision
  html+='<div class="status-line">'+esc(p1.gtin||'GTIN#1')+' vs '+esc(p2.gtin||'GTIN#2')+'</div>';

  // SUMMARY CHIPS — category + counts only
  html+='<div class="cat-row">'+
    '<div class="cat-box"><div class="cat-lbl">Category</div><div class="cat-val">'+esc((CAT_NAMES[cat]||cat).toUpperCase())+'</div></div>'+
    '<div class="cat-box"><div class="cat-lbl">Cross-GTIN Diffs</div><div class="cat-val" style="color:'+(totalDiffs>0?'#c0392b':'#1a7f4b')+'">'+totalDiffs+(totalDiffs===0?' None':totalDiffs===1?' field':' fields')+'</div></div>'+
    '<div class="cat-box"><div class="cat-lbl">Vertical</div><div class="cat-val" style="color:'+(vertCount>0?'#3d3df5':'#1a7f4b')+'">'+vertCount+(vertCount===0?' None':vertCount===1?' issue':' issues')+'</div></div>'+
  '</div>';

  // WARNINGS
  var warnings=buildWarnings(keyDiffs,otherDiffs,mainSame,secSame,rp1,rp2,vert1,vert2);
  if(warnings.length){
    warnings.forEach(function(w){
      var color=w.level==='high'?'#92400e':'#78350f';
      var bg=w.level==='high'?'#fff8e1':'#fffbf0';
      var brd=w.level==='high'?'#f0c040':'#fde68a';
      html+='<div class="warn-banner" style="background:'+bg+';border-color:'+brd+'">'+
        '<div class="warn-icon">'+(w.level==='high'?'⚠️':'ℹ️')+'</div>'+
        '<div class="warn-body">'+
          '<div class="warn-title" style="color:'+color+'">'+esc(w.title)+'</div>'+
          '<div class="warn-list">'+w.items.map(function(i){return '• '+esc(i);}).join('<br>')+'</div>'+
        '</div>'+
      '</div>';
    });
  }

  // IMAGES
  if(mainSame!==null||secSame!==null){
    html+='<div class="img-section">';
    if(mainSame!==null){
      html+='<div class="img-sec-hdr">Main Image</div>'+
        '<div class="img-row">'+imgCell(rp1.img1,'GTIN#1')+imgCell(rp2.img1,'GTIN#2')+'</div>'+
        '<div style="text-align:center;padding:4px 0 6px"><span class="img-badge '+(mainSame?'same':'diff')+'">'+(mainSame?'✓ SAME IMAGE':'⚠ DIFFERENT IMAGE')+'</span></div>';
    }
    if(secSame!==null){
      html+='<div class="img-sec-hdr">Secondary Image</div>'+
        '<div class="img-row">'+imgCell(rp1.img2,'GTIN#1')+imgCell(rp2.img2,'GTIN#2')+'</div>'+
        '<div style="text-align:center;padding:4px 0 6px"><span class="img-badge '+(secSame?'same':'diff')+'">'+(secSame?'✓ SAME IMAGE':'⚠ DIFFERENT IMAGE')+'</span></div>';
    }
    html+='</div>';
  }



  // ── DIFFERENCES FIRST (most important) ──────────────────────────

  // KEY DIFFERENCES
  if(keyDiffs.length){
    html+='<div class="diff-table"><div class="diff-hdr">Key Differences <span class="diff-badge">'+keyDiffs.length+'</span></div>'+
      '<div class="diff-col-hdr"><div>'+esc(trunc(p1.gtin,16))+'</div><div>'+esc(trunc(p2.gtin,16))+'</div></div>';
    for(var i=0;i<keyDiffs.length;i++) html+=diffRow(keyDiffs[i],.05*i);
    html+='</div>';
  }

  // OTHER DIFFERENCES (including description and name diffs)
  if(otherDiffs.length){
    html+='<div class="diff-table" style="animation-delay:.1s">'+
      '<div class="diff-hdr" style="background:#fef3c7;border-color:#fde68a;color:#92400e">Other Differences <span class="diff-badge" style="background:#92400e">'+otherDiffs.length+'</span></div>'+
      '<div class="diff-col-hdr"><div>'+esc(trunc(p1.gtin,16))+'</div><div>'+esc(trunc(p2.gtin,16))+'</div></div>';
    for(var i=0;i<otherDiffs.length;i++) html+=diffRow(otherDiffs[i],.05*i);
    html+='</div>';
  }

  if(!keyDiffs.length&&!otherDiffs.length){
    html+='<div class="match-all" style="text-align:center"><div style="font-size:13px;font-weight:700;color:#1a7f4b">✓ No cross-GTIN differences found</div><div style="font-size:11px;color:#555;margin-top:4px">All compared attributes are identical</div></div>';
  }

  // ── MATCHING ATTRIBUTES LAST ──────────────────────────────────
  if(matchAttrs.length){
    html+='<div class="match-all"><div class="match-all-hdr">✓ MATCHING ATTRIBUTES</div>';
    matchAttrs.slice(0,15).forEach(function(a){
      html+='<div class="match-row"><div class="match-field">'+esc(a.k)+'</div><div class="match-val">'+esc(a.v||'—')+'</div></div>';
    });
    html+='</div>';
  }

  // ── VERTICAL DISCREPANCY SECTION ─────────────────────────────
  var hasVert = (vert1&&vert1.length)||(vert2&&vert2.length);
  if(hasVert){
    html+='<div class="diff-table" style="animation:slideUp .4s .35s ease both">'+
      '<div class="diff-hdr" style="background:#f0f4ff;border-color:#c5c8ff;color:#3d3df5">'+
        '⚡ Vertical Discrepancy '+
        '<span class="diff-badge" style="background:#3d3df5">'+((vert1?vert1.length:0)+(vert2?vert2.length:0))+'</span>'+
      '</div>';

    // GTIN#1 issues
    if(vert1&&vert1.length){
      html+='<div style="padding:5px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#3d3df5;background:#f8f9ff;border-bottom:1px solid #eee;">GTIN#1 — Title vs Attributes</div>';
      for(var i=0;i<vert1.length;i++){
        html+='<div class="drow" style="animation:slideUp .25s '+(0.05*i)+'s ease both">'+
          '<div class="dlbl">'+esc(vert1[i].type)+' — '+esc(vert1[i].attrKey)+'</div>'+
          '<div class="dvals">'+
            '<div class="dval red" style="flex:1">Title: <b>'+esc(vert1[i].titleVal)+'</b></div>'+
            '<div class="dval" style="background:#fff8e1;color:#92400e;flex:1">Attr: <b>'+esc(vert1[i].attrVal)+'</b></div>'+
          '</div>'+
          '<div style="padding:3px 10px 5px;font-size:9px;color:#666;font-style:italic">'+esc(vert1[i].msg)+'</div>'+
        '</div>';
      }
    }

    // GTIN#2 issues
    if(vert2&&vert2.length){
      html+='<div style="padding:5px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#3d3df5;background:#f8f9ff;border-bottom:1px solid #eee;border-top:1px solid #eee;">GTIN#2 — Title vs Attributes</div>';
      for(var i=0;i<vert2.length;i++){
        html+='<div class="drow" style="animation:slideUp .25s '+(0.05*i)+'s ease both">'+
          '<div class="dlbl">'+esc(vert2[i].type)+' — '+esc(vert2[i].attrKey)+'</div>'+
          '<div class="dvals">'+
            '<div class="dval red" style="flex:1">Title: <b>'+esc(vert2[i].titleVal)+'</b></div>'+
            '<div class="dval" style="background:#fff8e1;color:#92400e;flex:1">Attr: <b>'+esc(vert2[i].attrVal)+'</b></div>'+
          '</div>'+
          '<div style="padding:3px 10px 5px;font-size:9px;color:#666;font-style:italic">'+esc(vert2[i].msg)+'</div>'+
        '</div>';
        0.
      }
    }
    html+='</div>';
  }

  // ── AI IMAGE SPECS ─────────────────────────────────────────────
  if((p1 && p1.imageData) || (p2 && p2.imageData)){
    html+='<div class="diff-table" style="animation:slideUp .4s .4s ease both">'+
      '<div class="diff-hdr" style="background:#f5f3ff;border-color:#ddd6fe;color:#5b21b6">'+
        '✨ AI Image Specs (Gemini 3.5 Flash)'+
      '</div>';
    
    function renderSpec(p, idx) {
      if(!p || !p.imageData || !p.imageData.specs) return '';
      var specStr = JSON.stringify(p.imageData.specs, null, 2);
      return '<div style="padding:6px 10px; border-bottom:1px solid #f0f0f0;">'+
             '<div style="font-size:9px; font-weight:bold; color:#777;">GTIN#'+idx+' AI Extracted Specs:</div>'+
             '<pre style="font-size:9px; color:#333; margin:4px 0 0; background:#f9f9f9; padding:4px; border-radius:3px; overflow-x:auto;">'+esc(specStr)+'</pre>'+
             '</div>';
    }
    
    html+=renderSpec(p1, 1);
    html+=renderSpec(p2, 2);
    html+='</div>';
  }

  showBody(html);
}

// ═══ RENDER MULTI (3+ GTINs) ════════════════════════════════════
function renderMulti(products, cat){
  var n = products.length;
  _diffCount = 0;

  // ── Collect all attribute keys across all products
  var allK=[], seen={};
  products.forEach(function(p){
    Object.keys(p.attrs).forEach(function(k){
      if(!seen[k]&&!shouldSkip(k)){seen[k]=1;allK.push(k);}
    });
  });

  // ── For each attribute, check if any product differs from p0 (GTIN#1 as reference)
  var ref = products[0];
  var keyDiffRows=[], otherDiffRows=[], matchRows=[];

  // Name
  var nameVals = products.map(function(p){return cleanVal(p.name)||'—';});
  var nameDiffers = nameVals.some(function(v){return norm(v)!==norm(nameVals[0]);});
  if(nameDiffers) otherDiffRows.push({field:'Product Name', vals:nameVals});
  else if(nameVals[0]!=='—') matchRows.push({k:'Product Name', v:trunc(nameVals[0],40)});

  // Description
  var descVals = products.map(function(p){return cleanVal(p.description)||'—';});
  var descDiffers = descVals.some(function(v){return meaningfulDesc(v,descVals[0]);});
  if(descDiffers) otherDiffRows.push({field:'Product Description', vals:descVals, simPct:Math.round(sim(descVals[0],descVals[1]||'')*100)});
  else if(descVals[0]!=='—') matchRows.push({k:'Product Description', v:trunc(descVals[0],50)});

  // Deep bullet parse across all products — find spec diffs buried in description
  // Compare each product's description against GTIN#1 (reference)
  if(products.length>=2){
    var ref0 = products[0];
    var refBullets = parseDescBullets(ref0.description||'');
    for(var pi=1;pi<products.length;pi++){
      var bDiffs = compareDescBullets(ref0.description||'', products[pi].description||'');
      bDiffs.forEach(function(bd){
        // Add as N-GTIN row: build vals array (—  for products not compared yet)
        var vals = products.map(function(p,idx){
          if(idx===0) return bd.v1;
          if(idx===pi) return bd.v2;
          // For other products, check their description too
          var pBullets = parseDescBullets(p.description||'');
          var fieldKey = bd.field.replace('Desc: ','');
          return pBullets[fieldKey]||'—';
        });
        // Check if already added
        var exists = keyDiffRows.some(function(r){return r.field===bd.field;}) ||
                     otherDiffRows.some(function(r){return r.field===bd.field;});
        if(!exists){
          var fk=bd.field.toLowerCase();
          var isSpec=fk.indexOf('stone')>=0||fk.indexOf('metal')>=0||fk.indexOf('color')>=0||
                     fk.indexOf('carat')>=0||fk.indexOf('cut')>=0||fk.indexOf('purity')>=0||
                     fk.indexOf('size')>=0||fk.indexOf('weight')>=0||fk.indexOf('watt')>=0;
          if(isSpec) keyDiffRows.push({field:bd.field,vals:vals});
          else otherDiffRows.push({field:bd.field,vals:vals});
        }
      });
    }
  }

  allK.forEach(function(k){
    var vals = products.map(function(p){return cleanVal(p.attrs[k])||'—';});
    // Use meaningful() with field key — catches near-matches like Round Cut vs Round Brilliant Cut
    var raw0 = products[0].attrs[k]||'';
    var differs = vals.some(function(v,vi){
      if(vi===0) return false;
      var rawV = products[vi]?products[vi].attrs[k]||'':'';
      return meaningful(raw0, rawV, k);
    });
    if(differs){
      _diffCount++;
      if(isKey(k)) keyDiffRows.push({field:k,vals:vals});
      else otherDiffRows.push({field:k,vals:vals});
    } else if(vals[0]!=='—'){
      matchRows.push({k:k,v:trunc(vals[0],40)});
    }
  });

  // ── Vertical checks on each product
  var vertIssues=[];
  products.forEach(function(p){
    var v=checkVertical(p);
    if(v&&v.length) v.forEach(function(issue){vertIssues.push({gtin:p.gtin,issue:issue});});
  });

  // ── Image comparison: all vs ref
  var imgMainSame = products.every(function(p){
    return compareImgSets(p.imgs_main||[p.img1].filter(Boolean), ref.imgs_main||[ref.img1].filter(Boolean))!==false;
  });
  var imgSecSame = products.every(function(p){
    return compareImgSets(p.imgs_sec||[p.img2].filter(Boolean), ref.imgs_sec||[ref.img2].filter(Boolean))!==false;
  });

  // ── GTIN column header width
  var colW = Math.max(60, Math.floor(310/n));

  // ── Build HTML ──────────────────────────────────────────────────
  var html='';

  // Status
  html+='<div class="status-line">'+n+' GTINs detected — comparing all vs GTIN#1</div>';

  // Summary chips
  html+='<div class="cat-row">'+
    '<div class="cat-box"><div class="cat-lbl">Category</div><div class="cat-val">'+esc((CAT_NAMES[cat]||cat).toUpperCase())+'</div></div>'+
    '<div class="cat-box"><div class="cat-lbl">GTINs</div><div class="cat-val" style="color:#3d3df5">'+n+'</div></div>'+
    '<div class="cat-box"><div class="cat-lbl">Diffs</div><div class="cat-val" style="color:'+(_diffCount>0?'#c0392b':'#1a7f4b')+'">'+_diffCount+(_diffCount===0?' None':'')+' </div></div>'+
  '</div>';

  // Images
  if(ref.img1||ref.img2){
    html+='<div class="img-section">';
    if(ref.img1){
      html+='<div class="img-sec-hdr">Main Images <span style="font-size:8px;padding:1px 6px;border-radius:8px;font-weight:700;'+( imgMainSame?'background:#dcfce7;color:#15803d':'background:#fee2e2;color:#b91c1c')+'">'+(imgMainSame?'✓ ALL SAME':'⚠ DIFFER')+'</span></div>';
      html+='<div class="multi-scroll"><div style="display:flex;gap:1px;background:#f0f0f0;">';
      products.forEach(function(p,i){
        html+=imgCell(p.img1||p.img2,'GTIN#'+(i+1));
      });
      html+='</div></div>';
    }
    if(ref.img2){
      html+='<div class="img-sec-hdr" style="margin-top:2px">Secondary Images <span style="font-size:8px;padding:1px 6px;border-radius:8px;font-weight:700;'+(imgSecSame?'background:#dcfce7;color:#15803d':'background:#fee2e2;color:#b91c1c')+'">'+(imgSecSame?'✓ ALL SAME':'⚠ DIFFER')+'</span></div>';
      html+='<div class="multi-scroll"><div style="display:flex;gap:1px;background:#f0f0f0;">';
      products.forEach(function(p,i){
        html+=imgCell(p.img2,'GTIN#'+(i+1));
      });
      html+='</div></div>';
    }
    html+='</div>';
  }

  // Helper to build multi-col diff table
  function multiTable(title,rows,hdrStyle,badgeStyle){
    if(!rows.length) return '';
    // Column header row
    var colHdr='<div style="display:flex;background:#f8f9fa;border-bottom:1px solid #f0f0f0;">';
    products.forEach(function(p,i){
      colHdr+='<div style="flex:1;padding:4px 8px;font-size:8px;font-weight:700;text-transform:uppercase;color:#aaa;border-right:1px solid #f0f0f0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+esc(trunc(p.gtin,14))+'</div>';
    });
    colHdr+='</div>';

    var rowsHtml='';
    rows.forEach(function(r,ri){
      var refVal=norm(r.vals[0]);
      var simBadge=r.simPct!==undefined?'<span style="font-size:8px;background:rgba(0,0,0,.07);border-radius:8px;padding:1px 6px;font-weight:600;color:#666;margin-left:4px;">'+r.simPct+'% similar</span>':'';
      rowsHtml+='<div class="drow" style="animation:slideUp .2s '+(ri*0.04)+'s ease both">'+
        '<div class="dlbl">'+esc(r.field)+simBadge+'</div>'+
        '<div class="dvals">';
      r.vals.forEach(function(v,vi){
        var differs = vi>0 && norm(v)!==refVal && v!=='—';
        var missing = v==='—';
        var cls = missing?' muted': (vi===0?' grn': (differs?' red':' grn'));
        rowsHtml+='<div class="dval'+cls+'" style="flex:1;min-width:0;">'+esc(trunc(v,90))+'</div>';
      });
      rowsHtml+='</div></div>';
    });

    return '<div class="diff-table" style="animation:slideUp .4s ease both">'+
      '<div class="diff-hdr" style="'+hdrStyle+'">'+title+' <span class="diff-badge" style="'+badgeStyle+'">'+rows.length+'</span></div>'+
      '<div class="multi-scroll">'+colHdr+rowsHtml+'</div>'+
      '</div>';
  }

  // Key differences
  html+=multiTable('Key Differences',keyDiffRows,
    'background:#fdecea;border-color:#f5b7b7;color:#c0392b',
    'background:#c0392b;color:#fff');

  // Other differences
  html+=multiTable('Other Differences',otherDiffRows,
    'background:#fef3c7;border-color:#fde68a;color:#92400e',
    'background:#92400e;color:#fff');

  // Matching attributes
  if(matchRows.length){
    html+='<div class="match-all"><div class="match-all-hdr">✓ MATCHING ACROSS ALL GTINs</div>';
    matchRows.slice(0,15).forEach(function(a){
      html+='<div class="match-row"><div class="match-field">'+esc(a.k)+'</div><div class="match-val">'+esc(a.v||'—')+'</div></div>';
    });
    html+='</div>';
  }

  // No diffs
  if(!keyDiffRows.length&&!otherDiffRows.length){
    html+='<div class="match-all" style="text-align:center">'+
      '<div style="font-size:13px;font-weight:700;color:#1a7f4b">✓ All '+n+' GTINs are identical</div>'+
      '<div style="font-size:11px;color:#555;margin-top:4px">No attribute differences found across any GTIN</div>'+
    '</div>';
  }

  // Vertical discrepancies
  if(vertIssues.length){
    html+='<div class="diff-table" style="animation:slideUp .4s .3s ease both">'+
      '<div class="diff-hdr" style="background:#f0f4ff;border-color:#c5c8ff;color:#3d3df5">'+
        '⚡ Vertical Discrepancy <span class="diff-badge" style="background:#3d3df5">'+vertIssues.length+'</span>'+
      '</div>';
    vertIssues.forEach(function(vi,i){
      var gtinIdx=products.findIndex(function(p){return p.gtin===vi.gtin;});
      var gtinLabel=gtinIdx>=0?'GTIN#'+(gtinIdx+1):vi.gtin;
      html+='<div class="drow" style="animation:slideUp .2s '+(i*0.04)+'s ease both">'+
        '<div class="dlbl">'+esc(gtinLabel)+' · '+esc(vi.issue.type)+' — '+esc(vi.issue.attrKey)+'</div>'+
        '<div class="dvals">'+
          '<div class="dval red" style="flex:1">Title: <b>'+esc(vi.issue.titleVal)+'</b></div>'+
          '<div class="dval" style="background:#fff8e1;color:#92400e;flex:1">Attr: <b>'+esc(vi.issue.attrVal)+'</b></div>'+
        '</div>'+
        '<div style="padding:3px 10px 5px;font-size:9px;color:#666;font-style:italic">'+esc(vi.issue.msg)+'</div>'+
      '</div>';
    });
    html+='</div>';
  }

  showBody(html);
}

} // end init()
