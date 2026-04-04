var cl=Object.defineProperty;var hl=(s,t,e)=>t in s?cl(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e;var Oe=(s,t,e)=>(hl(s,typeof t!="symbol"?t+"":t,e),e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function e(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerpolicy&&(r.referrerPolicy=i.referrerpolicy),i.crossorigin==="use-credentials"?r.credentials="include":i.crossorigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(i){if(i.ep)return;i.ep=!0;const r=e(i);fetch(i.href,r)}})();var vn=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function ul(s){if(s.__esModule)return s;var t=s.default;if(typeof t=="function"){var e=function n(){if(this instanceof n){var i=[null];i.push.apply(i,arguments);var r=Function.bind.apply(t,i);return new r}return t.apply(this,arguments)};e.prototype=t.prototype}else e={};return Object.defineProperty(e,"__esModule",{value:!0}),Object.keys(s).forEach(function(n){var i=Object.getOwnPropertyDescriptor(s,n);Object.defineProperty(e,n,i.get?i:{enumerable:!0,get:function(){return s[n]}})}),e}var cs={},dl={get exports(){return cs},set exports(s){cs=s}};(function(s,t){(function(e,n){s.exports=n()})(vn,function(){var e=function(){function n(f){return o.appendChild(f.dom),f}function i(f){for(var v=0;v<o.children.length;v++)o.children[v].style.display=v===f?"block":"none";r=f}var r=0,o=document.createElement("div");o.style.cssText="position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000",o.addEventListener("click",function(f){f.preventDefault(),i(++r%o.children.length)},!1);var a=(performance||Date).now(),l=a,c=0,h=n(new e.Panel("FPS","#0ff","#002")),u=n(new e.Panel("MS","#0f0","#020"));if(self.performance&&self.performance.memory)var d=n(new e.Panel("MB","#f08","#201"));return i(0),{REVISION:16,dom:o,addPanel:n,showPanel:i,begin:function(){a=(performance||Date).now()},end:function(){c++;var f=(performance||Date).now();if(u.update(f-a,200),f>l+1e3&&(h.update(1e3*c/(f-l),100),l=f,c=0,d)){var v=performance.memory;d.update(v.usedJSHeapSize/1048576,v.jsHeapSizeLimit/1048576)}return f},update:function(){a=this.end()},domElement:o,setMode:i}};return e.Panel=function(n,i,r){var o=1/0,a=0,l=Math.round,c=l(window.devicePixelRatio||1),h=80*c,u=48*c,d=3*c,f=2*c,v=3*c,m=15*c,p=74*c,g=30*c,y=document.createElement("canvas");y.width=h,y.height=u,y.style.cssText="width:80px;height:48px";var x=y.getContext("2d");return x.font="bold "+9*c+"px Helvetica,Arial,sans-serif",x.textBaseline="top",x.fillStyle=r,x.fillRect(0,0,h,u),x.fillStyle=i,x.fillText(n,d,f),x.fillRect(v,m,p,g),x.fillStyle=r,x.globalAlpha=.9,x.fillRect(v,m,p,g),{dom:y,update:function(w,M){o=Math.min(o,w),a=Math.max(a,w),x.fillStyle=r,x.globalAlpha=1,x.fillRect(0,0,h,m),x.fillStyle=i,x.fillText(l(w)+" "+n+" ("+l(o)+"-"+l(a)+")",d,f),x.drawImage(y,v+c,m,p-c,g,v,m,p-c,g),x.fillRect(v+p-c,m,c,g),x.fillStyle=r,x.globalAlpha=.9,x.fillRect(v+p-c,m,c,l((1-w/M)*g))}}},e})})(dl);class fl{constructor(){this.instance=new cs,this.instance.showPanel(3),this.active=!1,this.max=40,this.ignoreMaxed=!0,this.activate()}activate(){this.active=!0,document.body.appendChild(this.instance.dom)}deactivate(){this.active=!1,document.body.removeChild(this.instance.dom)}setRenderPanel(t){this.render={},this.render.context=t,this.render.extension=this.render.context.getExtension("EXT_disjoint_timer_query_webgl2"),this.render.panel=this.instance.addPanel(new cs.Panel("Render (ms)","#f8f","#212")),(!(typeof WebGL2RenderingContext<"u"&&t instanceof WebGL2RenderingContext)||!this.render.extension)&&this.deactivate()}beforeRender(){if(!this.active)return;this.queryCreated=!1;let t=!1;if(this.render.query){t=this.render.context.getQueryParameter(this.render.query,this.render.context.QUERY_RESULT_AVAILABLE);const e=this.render.context.getParameter(this.render.extension.GPU_DISJOINT_EXT);if(t&&!e){const n=this.render.context.getQueryParameter(this.render.query,this.render.context.QUERY_RESULT),i=Math.min(n/1e3/1e3,this.max);i===this.max&&this.ignoreMaxed||this.render.panel.update(i,this.max)}}(t||!this.render.query)&&(this.queryCreated=!0,this.render.query=this.render.context.createQuery(),this.render.context.beginQuery(this.render.extension.TIME_ELAPSED_EXT,this.render.query))}afterRender(){this.active&&this.queryCreated&&this.render.context.endQuery(this.render.extension.TIME_ELAPSED_EXT)}update(){this.active&&this.instance.update()}destroy(){this.deactivate()}}/**
 * lil-gui
 * https://lil-gui.georgealways.com
 * @version 0.17.0
 * @author George Michael Brower
 * @license MIT
 */class Ze{constructor(t,e,n,i,r="div"){this.parent=t,this.object=e,this.property=n,this._disabled=!1,this._hidden=!1,this.initialValue=this.getValue(),this.domElement=document.createElement("div"),this.domElement.classList.add("controller"),this.domElement.classList.add(i),this.$name=document.createElement("div"),this.$name.classList.add("name"),Ze.nextNameID=Ze.nextNameID||0,this.$name.id=`lil-gui-name-${++Ze.nextNameID}`,this.$widget=document.createElement(r),this.$widget.classList.add("widget"),this.$disable=this.$widget,this.domElement.appendChild(this.$name),this.domElement.appendChild(this.$widget),this.parent.children.push(this),this.parent.controllers.push(this),this.parent.$children.appendChild(this.domElement),this._listenCallback=this._listenCallback.bind(this),this.name(n)}name(t){return this._name=t,this.$name.innerHTML=t,this}onChange(t){return this._onChange=t,this}_callOnChange(){this.parent._callOnChange(this),this._onChange!==void 0&&this._onChange.call(this,this.getValue()),this._changed=!0}onFinishChange(t){return this._onFinishChange=t,this}_callOnFinishChange(){this._changed&&(this.parent._callOnFinishChange(this),this._onFinishChange!==void 0&&this._onFinishChange.call(this,this.getValue())),this._changed=!1}reset(){return this.setValue(this.initialValue),this._callOnFinishChange(),this}enable(t=!0){return this.disable(!t)}disable(t=!0){return t===this._disabled?this:(this._disabled=t,this.domElement.classList.toggle("disabled",t),this.$disable.toggleAttribute("disabled",t),this)}show(t=!0){return this._hidden=!t,this.domElement.style.display=this._hidden?"none":"",this}hide(){return this.show(!1)}options(t){const e=this.parent.add(this.object,this.property,t);return e.name(this._name),this.destroy(),e}min(t){return this}max(t){return this}step(t){return this}decimals(t){return this}listen(t=!0){return this._listening=t,this._listenCallbackID!==void 0&&(cancelAnimationFrame(this._listenCallbackID),this._listenCallbackID=void 0),this._listening&&this._listenCallback(),this}_listenCallback(){this._listenCallbackID=requestAnimationFrame(this._listenCallback);const t=this.save();t!==this._listenPrevValue&&this.updateDisplay(),this._listenPrevValue=t}getValue(){return this.object[this.property]}setValue(t){return this.object[this.property]=t,this._callOnChange(),this.updateDisplay(),this}updateDisplay(){return this}load(t){return this.setValue(t),this._callOnFinishChange(),this}save(){return this.getValue()}destroy(){this.listen(!1),this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.controllers.splice(this.parent.controllers.indexOf(this),1),this.parent.$children.removeChild(this.domElement)}}class pl extends Ze{constructor(t,e,n){super(t,e,n,"boolean","label"),this.$input=document.createElement("input"),this.$input.setAttribute("type","checkbox"),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$widget.appendChild(this.$input),this.$input.addEventListener("change",()=>{this.setValue(this.$input.checked),this._callOnFinishChange()}),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.checked=this.getValue(),this}}function or(s){let t,e;return(t=s.match(/(#|0x)?([a-f0-9]{6})/i))?e=t[2]:(t=s.match(/rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/))?e=parseInt(t[1]).toString(16).padStart(2,0)+parseInt(t[2]).toString(16).padStart(2,0)+parseInt(t[3]).toString(16).padStart(2,0):(t=s.match(/^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i))&&(e=t[1]+t[1]+t[2]+t[2]+t[3]+t[3]),e?"#"+e:!1}const ml={isPrimitive:!0,match:s=>typeof s=="string",fromHexString:or,toHexString:or},Ti={isPrimitive:!0,match:s=>typeof s=="number",fromHexString:s=>parseInt(s.substring(1),16),toHexString:s=>"#"+s.toString(16).padStart(6,0)},gl={isPrimitive:!1,match:Array.isArray,fromHexString(s,t,e=1){const n=Ti.fromHexString(s);t[0]=(n>>16&255)/255*e,t[1]=(n>>8&255)/255*e,t[2]=(n&255)/255*e},toHexString([s,t,e],n=1){n=255/n;const i=s*n<<16^t*n<<8^e*n<<0;return Ti.toHexString(i)}},vl={isPrimitive:!1,match:s=>Object(s)===s,fromHexString(s,t,e=1){const n=Ti.fromHexString(s);t.r=(n>>16&255)/255*e,t.g=(n>>8&255)/255*e,t.b=(n&255)/255*e},toHexString({r:s,g:t,b:e},n=1){n=255/n;const i=s*n<<16^t*n<<8^e*n<<0;return Ti.toHexString(i)}},Al=[ml,Ti,gl,vl];function xl(s){return Al.find(t=>t.match(s))}class Sl extends Ze{constructor(t,e,n,i){super(t,e,n,"color"),this.$input=document.createElement("input"),this.$input.setAttribute("type","color"),this.$input.setAttribute("tabindex",-1),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$text=document.createElement("input"),this.$text.setAttribute("type","text"),this.$text.setAttribute("spellcheck","false"),this.$text.setAttribute("aria-labelledby",this.$name.id),this.$display=document.createElement("div"),this.$display.classList.add("display"),this.$display.appendChild(this.$input),this.$widget.appendChild(this.$display),this.$widget.appendChild(this.$text),this._format=xl(this.initialValue),this._rgbScale=i,this._initialValueHexString=this.save(),this._textFocused=!1,this.$input.addEventListener("input",()=>{this._setValueFromHexString(this.$input.value)}),this.$input.addEventListener("blur",()=>{this._callOnFinishChange()}),this.$text.addEventListener("input",()=>{const r=or(this.$text.value);r&&this._setValueFromHexString(r)}),this.$text.addEventListener("focus",()=>{this._textFocused=!0,this.$text.select()}),this.$text.addEventListener("blur",()=>{this._textFocused=!1,this.updateDisplay(),this._callOnFinishChange()}),this.$disable=this.$text,this.updateDisplay()}reset(){return this._setValueFromHexString(this._initialValueHexString),this}_setValueFromHexString(t){if(this._format.isPrimitive){const e=this._format.fromHexString(t);this.setValue(e)}else this._format.fromHexString(t,this.getValue(),this._rgbScale),this._callOnChange(),this.updateDisplay()}save(){return this._format.toHexString(this.getValue(),this._rgbScale)}load(t){return this._setValueFromHexString(t),this._callOnFinishChange(),this}updateDisplay(){return this.$input.value=this._format.toHexString(this.getValue(),this._rgbScale),this._textFocused||(this.$text.value=this.$input.value.substring(1)),this.$display.style.backgroundColor=this.$input.value,this}}class ys extends Ze{constructor(t,e,n){super(t,e,n,"function"),this.$button=document.createElement("button"),this.$button.appendChild(this.$name),this.$widget.appendChild(this.$button),this.$button.addEventListener("click",i=>{i.preventDefault(),this.getValue().call(this.object)}),this.$button.addEventListener("touchstart",()=>{},{passive:!0}),this.$disable=this.$button}}class yl extends Ze{constructor(t,e,n,i,r,o){super(t,e,n,"number"),this._initInput(),this.min(i),this.max(r);const a=o!==void 0;this.step(a?o:this._getImplicitStep(),a),this.updateDisplay()}decimals(t){return this._decimals=t,this.updateDisplay(),this}min(t){return this._min=t,this._onUpdateMinMax(),this}max(t){return this._max=t,this._onUpdateMinMax(),this}step(t,e=!0){return this._step=t,this._stepExplicit=e,this}updateDisplay(){const t=this.getValue();if(this._hasSlider){let e=(t-this._min)/(this._max-this._min);e=Math.max(0,Math.min(e,1)),this.$fill.style.width=e*100+"%"}return this._inputFocused||(this.$input.value=this._decimals===void 0?t:t.toFixed(this._decimals)),this}_initInput(){this.$input=document.createElement("input"),this.$input.setAttribute("type","number"),this.$input.setAttribute("step","any"),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$widget.appendChild(this.$input),this.$disable=this.$input;const t=()=>{let g=parseFloat(this.$input.value);isNaN(g)||(this._stepExplicit&&(g=this._snap(g)),this.setValue(this._clamp(g)))},e=g=>{const y=parseFloat(this.$input.value);isNaN(y)||(this._snapClampSetValue(y+g),this.$input.value=this.getValue())},n=g=>{g.code==="Enter"&&this.$input.blur(),g.code==="ArrowUp"&&(g.preventDefault(),e(this._step*this._arrowKeyMultiplier(g))),g.code==="ArrowDown"&&(g.preventDefault(),e(this._step*this._arrowKeyMultiplier(g)*-1))},i=g=>{this._inputFocused&&(g.preventDefault(),e(this._step*this._normalizeMouseWheel(g)))};let r=!1,o,a,l,c,h;const u=5,d=g=>{o=g.clientX,a=l=g.clientY,r=!0,c=this.getValue(),h=0,window.addEventListener("mousemove",f),window.addEventListener("mouseup",v)},f=g=>{if(r){const y=g.clientX-o,x=g.clientY-a;Math.abs(x)>u?(g.preventDefault(),this.$input.blur(),r=!1,this._setDraggingStyle(!0,"vertical")):Math.abs(y)>u&&v()}if(!r){const y=g.clientY-l;h-=y*this._step*this._arrowKeyMultiplier(g),c+h>this._max?h=this._max-c:c+h<this._min&&(h=this._min-c),this._snapClampSetValue(c+h)}l=g.clientY},v=()=>{this._setDraggingStyle(!1,"vertical"),this._callOnFinishChange(),window.removeEventListener("mousemove",f),window.removeEventListener("mouseup",v)},m=()=>{this._inputFocused=!0},p=()=>{this._inputFocused=!1,this.updateDisplay(),this._callOnFinishChange()};this.$input.addEventListener("input",t),this.$input.addEventListener("keydown",n),this.$input.addEventListener("wheel",i,{passive:!1}),this.$input.addEventListener("mousedown",d),this.$input.addEventListener("focus",m),this.$input.addEventListener("blur",p)}_initSlider(){this._hasSlider=!0,this.$slider=document.createElement("div"),this.$slider.classList.add("slider"),this.$fill=document.createElement("div"),this.$fill.classList.add("fill"),this.$slider.appendChild(this.$fill),this.$widget.insertBefore(this.$slider,this.$input),this.domElement.classList.add("hasSlider");const t=(g,y,x,w,M)=>(g-y)/(x-y)*(M-w)+w,e=g=>{const y=this.$slider.getBoundingClientRect();let x=t(g,y.left,y.right,this._min,this._max);this._snapClampSetValue(x)},n=g=>{this._setDraggingStyle(!0),e(g.clientX),window.addEventListener("mousemove",i),window.addEventListener("mouseup",r)},i=g=>{e(g.clientX)},r=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener("mousemove",i),window.removeEventListener("mouseup",r)};let o=!1,a,l;const c=g=>{g.preventDefault(),this._setDraggingStyle(!0),e(g.touches[0].clientX),o=!1},h=g=>{g.touches.length>1||(this._hasScrollBar?(a=g.touches[0].clientX,l=g.touches[0].clientY,o=!0):c(g),window.addEventListener("touchmove",u,{passive:!1}),window.addEventListener("touchend",d))},u=g=>{if(o){const y=g.touches[0].clientX-a,x=g.touches[0].clientY-l;Math.abs(y)>Math.abs(x)?c(g):(window.removeEventListener("touchmove",u),window.removeEventListener("touchend",d))}else g.preventDefault(),e(g.touches[0].clientX)},d=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener("touchmove",u),window.removeEventListener("touchend",d)},f=this._callOnFinishChange.bind(this),v=400;let m;const p=g=>{if(Math.abs(g.deltaX)<Math.abs(g.deltaY)&&this._hasScrollBar)return;g.preventDefault();const x=this._normalizeMouseWheel(g)*this._step;this._snapClampSetValue(this.getValue()+x),this.$input.value=this.getValue(),clearTimeout(m),m=setTimeout(f,v)};this.$slider.addEventListener("mousedown",n),this.$slider.addEventListener("touchstart",h,{passive:!1}),this.$slider.addEventListener("wheel",p,{passive:!1})}_setDraggingStyle(t,e="horizontal"){this.$slider&&this.$slider.classList.toggle("active",t),document.body.classList.toggle("lil-gui-dragging",t),document.body.classList.toggle(`lil-gui-${e}`,t)}_getImplicitStep(){return this._hasMin&&this._hasMax?(this._max-this._min)/1e3:.1}_onUpdateMinMax(){!this._hasSlider&&this._hasMin&&this._hasMax&&(this._stepExplicit||this.step(this._getImplicitStep(),!1),this._initSlider(),this.updateDisplay())}_normalizeMouseWheel(t){let{deltaX:e,deltaY:n}=t;return Math.floor(t.deltaY)!==t.deltaY&&t.wheelDelta&&(e=0,n=-t.wheelDelta/120,n*=this._stepExplicit?1:10),e+-n}_arrowKeyMultiplier(t){let e=this._stepExplicit?1:10;return t.shiftKey?e*=10:t.altKey&&(e/=10),e}_snap(t){const e=Math.round(t/this._step)*this._step;return parseFloat(e.toPrecision(15))}_clamp(t){return t<this._min&&(t=this._min),t>this._max&&(t=this._max),t}_snapClampSetValue(t){this.setValue(this._clamp(this._snap(t)))}get _hasScrollBar(){const t=this.parent.root.$children;return t.scrollHeight>t.clientHeight}get _hasMin(){return this._min!==void 0}get _hasMax(){return this._max!==void 0}}class Ml extends Ze{constructor(t,e,n,i){super(t,e,n,"option"),this.$select=document.createElement("select"),this.$select.setAttribute("aria-labelledby",this.$name.id),this.$display=document.createElement("div"),this.$display.classList.add("display"),this._values=Array.isArray(i)?i:Object.values(i),this._names=Array.isArray(i)?i:Object.keys(i),this._names.forEach(r=>{const o=document.createElement("option");o.innerHTML=r,this.$select.appendChild(o)}),this.$select.addEventListener("change",()=>{this.setValue(this._values[this.$select.selectedIndex]),this._callOnFinishChange()}),this.$select.addEventListener("focus",()=>{this.$display.classList.add("focus")}),this.$select.addEventListener("blur",()=>{this.$display.classList.remove("focus")}),this.$widget.appendChild(this.$select),this.$widget.appendChild(this.$display),this.$disable=this.$select,this.updateDisplay()}updateDisplay(){const t=this.getValue(),e=this._values.indexOf(t);return this.$select.selectedIndex=e,this.$display.innerHTML=e===-1?t:this._names[e],this}}class wl extends Ze{constructor(t,e,n){super(t,e,n,"string"),this.$input=document.createElement("input"),this.$input.setAttribute("type","text"),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$input.addEventListener("input",()=>{this.setValue(this.$input.value)}),this.$input.addEventListener("keydown",i=>{i.code==="Enter"&&this.$input.blur()}),this.$input.addEventListener("blur",()=>{this._callOnFinishChange()}),this.$widget.appendChild(this.$input),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.value=this.getValue(),this}}const bl=`.lil-gui {
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: 1;
  font-weight: normal;
  font-style: normal;
  text-align: left;
  background-color: var(--background-color);
  color: var(--text-color);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  --background-color: #1f1f1f;
  --text-color: #ebebeb;
  --title-background-color: #111111;
  --title-text-color: #ebebeb;
  --widget-color: #424242;
  --hover-color: #4f4f4f;
  --focus-color: #595959;
  --number-color: #2cc9ff;
  --string-color: #a2db3c;
  --font-size: 11px;
  --input-font-size: 11px;
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  --font-family-mono: Menlo, Monaco, Consolas, "Droid Sans Mono", monospace;
  --padding: 4px;
  --spacing: 4px;
  --widget-height: 20px;
  --name-width: 45%;
  --slider-knob-width: 2px;
  --slider-input-width: 27%;
  --color-input-width: 27%;
  --slider-input-min-width: 45px;
  --color-input-min-width: 45px;
  --folder-indent: 7px;
  --widget-padding: 0 0 0 3px;
  --widget-border-radius: 2px;
  --checkbox-size: calc(0.75 * var(--widget-height));
  --scrollbar-width: 5px;
}
.lil-gui, .lil-gui * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.lil-gui.root {
  width: var(--width, 245px);
  display: flex;
  flex-direction: column;
}
.lil-gui.root > .title {
  background: var(--title-background-color);
  color: var(--title-text-color);
}
.lil-gui.root > .children {
  overflow-x: hidden;
  overflow-y: auto;
}
.lil-gui.root > .children::-webkit-scrollbar {
  width: var(--scrollbar-width);
  height: var(--scrollbar-width);
  background: var(--background-color);
}
.lil-gui.root > .children::-webkit-scrollbar-thumb {
  border-radius: var(--scrollbar-width);
  background: var(--focus-color);
}
@media (pointer: coarse) {
  .lil-gui.allow-touch-styles {
    --widget-height: 28px;
    --padding: 6px;
    --spacing: 6px;
    --font-size: 13px;
    --input-font-size: 16px;
    --folder-indent: 10px;
    --scrollbar-width: 7px;
    --slider-input-min-width: 50px;
    --color-input-min-width: 65px;
  }
}
.lil-gui.force-touch-styles {
  --widget-height: 28px;
  --padding: 6px;
  --spacing: 6px;
  --font-size: 13px;
  --input-font-size: 16px;
  --folder-indent: 10px;
  --scrollbar-width: 7px;
  --slider-input-min-width: 50px;
  --color-input-min-width: 65px;
}
.lil-gui.autoPlace {
  max-height: 100%;
  position: fixed;
  top: 0;
  right: 15px;
  z-index: 1001;
}

.lil-gui .controller {
  display: flex;
  align-items: center;
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
}
.lil-gui .controller.disabled {
  opacity: 0.5;
}
.lil-gui .controller.disabled, .lil-gui .controller.disabled * {
  pointer-events: none !important;
}
.lil-gui .controller > .name {
  min-width: var(--name-width);
  flex-shrink: 0;
  white-space: pre;
  padding-right: var(--spacing);
  line-height: var(--widget-height);
}
.lil-gui .controller .widget {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: var(--widget-height);
}
.lil-gui .controller.string input {
  color: var(--string-color);
}
.lil-gui .controller.boolean .widget {
  cursor: pointer;
}
.lil-gui .controller.color .display {
  width: 100%;
  height: var(--widget-height);
  border-radius: var(--widget-border-radius);
  position: relative;
}
@media (hover: hover) {
  .lil-gui .controller.color .display:hover:before {
    content: " ";
    display: block;
    position: absolute;
    border-radius: var(--widget-border-radius);
    border: 1px solid #fff9;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}
.lil-gui .controller.color input[type=color] {
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.lil-gui .controller.color input[type=text] {
  margin-left: var(--spacing);
  font-family: var(--font-family-mono);
  min-width: var(--color-input-min-width);
  width: var(--color-input-width);
  flex-shrink: 0;
}
.lil-gui .controller.option select {
  opacity: 0;
  position: absolute;
  width: 100%;
  max-width: 100%;
}
.lil-gui .controller.option .display {
  position: relative;
  pointer-events: none;
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  line-height: var(--widget-height);
  max-width: 100%;
  overflow: hidden;
  word-break: break-all;
  padding-left: 0.55em;
  padding-right: 1.75em;
  background: var(--widget-color);
}
@media (hover: hover) {
  .lil-gui .controller.option .display.focus {
    background: var(--focus-color);
  }
}
.lil-gui .controller.option .display.active {
  background: var(--focus-color);
}
.lil-gui .controller.option .display:after {
  font-family: "lil-gui";
  content: "↕";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  padding-right: 0.375em;
}
.lil-gui .controller.option .widget,
.lil-gui .controller.option select {
  cursor: pointer;
}
@media (hover: hover) {
  .lil-gui .controller.option .widget:hover .display {
    background: var(--hover-color);
  }
}
.lil-gui .controller.number input {
  color: var(--number-color);
}
.lil-gui .controller.number.hasSlider input {
  margin-left: var(--spacing);
  width: var(--slider-input-width);
  min-width: var(--slider-input-min-width);
  flex-shrink: 0;
}
.lil-gui .controller.number .slider {
  width: 100%;
  height: var(--widget-height);
  background-color: var(--widget-color);
  border-radius: var(--widget-border-radius);
  padding-right: var(--slider-knob-width);
  overflow: hidden;
  cursor: ew-resize;
  touch-action: pan-y;
}
@media (hover: hover) {
  .lil-gui .controller.number .slider:hover {
    background-color: var(--hover-color);
  }
}
.lil-gui .controller.number .slider.active {
  background-color: var(--focus-color);
}
.lil-gui .controller.number .slider.active .fill {
  opacity: 0.95;
}
.lil-gui .controller.number .fill {
  height: 100%;
  border-right: var(--slider-knob-width) solid var(--number-color);
  box-sizing: content-box;
}

.lil-gui-dragging .lil-gui {
  --hover-color: var(--widget-color);
}
.lil-gui-dragging * {
  cursor: ew-resize !important;
}

.lil-gui-dragging.lil-gui-vertical * {
  cursor: ns-resize !important;
}

.lil-gui .title {
  --title-height: calc(var(--widget-height) + var(--spacing) * 1.25);
  height: var(--title-height);
  line-height: calc(var(--title-height) - 4px);
  font-weight: 600;
  padding: 0 var(--padding);
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
  outline: none;
  text-decoration-skip: objects;
}
.lil-gui .title:before {
  font-family: "lil-gui";
  content: "▾";
  padding-right: 2px;
  display: inline-block;
}
.lil-gui .title:active {
  background: var(--title-background-color);
  opacity: 0.75;
}
@media (hover: hover) {
  body:not(.lil-gui-dragging) .lil-gui .title:hover {
    background: var(--title-background-color);
    opacity: 0.85;
  }
  .lil-gui .title:focus {
    text-decoration: underline var(--focus-color);
  }
}
.lil-gui.root > .title:focus {
  text-decoration: none !important;
}
.lil-gui.closed > .title:before {
  content: "▸";
}
.lil-gui.closed > .children {
  transform: translateY(-7px);
  opacity: 0;
}
.lil-gui.closed:not(.transition) > .children {
  display: none;
}
.lil-gui.transition > .children {
  transition-duration: 300ms;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.2, 0.6, 0.35, 1);
  overflow: hidden;
  pointer-events: none;
}
.lil-gui .children:empty:before {
  content: "Empty";
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
  display: block;
  height: var(--widget-height);
  font-style: italic;
  line-height: var(--widget-height);
  opacity: 0.5;
}
.lil-gui.root > .children > .lil-gui > .title {
  border: 0 solid var(--widget-color);
  border-width: 1px 0;
  transition: border-color 300ms;
}
.lil-gui.root > .children > .lil-gui.closed > .title {
  border-bottom-color: transparent;
}
.lil-gui + .controller {
  border-top: 1px solid var(--widget-color);
  margin-top: 0;
  padding-top: var(--spacing);
}
.lil-gui .lil-gui .lil-gui > .title {
  border: none;
}
.lil-gui .lil-gui .lil-gui > .children {
  border: none;
  margin-left: var(--folder-indent);
  border-left: 2px solid var(--widget-color);
}
.lil-gui .lil-gui .controller {
  border: none;
}

.lil-gui input {
  -webkit-tap-highlight-color: transparent;
  border: 0;
  outline: none;
  font-family: var(--font-family);
  font-size: var(--input-font-size);
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  background: var(--widget-color);
  color: var(--text-color);
  width: 100%;
}
@media (hover: hover) {
  .lil-gui input:hover {
    background: var(--hover-color);
  }
  .lil-gui input:active {
    background: var(--focus-color);
  }
}
.lil-gui input:disabled {
  opacity: 1;
}
.lil-gui input[type=text],
.lil-gui input[type=number] {
  padding: var(--widget-padding);
}
.lil-gui input[type=text]:focus,
.lil-gui input[type=number]:focus {
  background: var(--focus-color);
}
.lil-gui input::-webkit-outer-spin-button,
.lil-gui input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.lil-gui input[type=number] {
  -moz-appearance: textfield;
}
.lil-gui input[type=checkbox] {
  appearance: none;
  -webkit-appearance: none;
  height: var(--checkbox-size);
  width: var(--checkbox-size);
  border-radius: var(--widget-border-radius);
  text-align: center;
  cursor: pointer;
}
.lil-gui input[type=checkbox]:checked:before {
  font-family: "lil-gui";
  content: "✓";
  font-size: var(--checkbox-size);
  line-height: var(--checkbox-size);
}
@media (hover: hover) {
  .lil-gui input[type=checkbox]:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui button {
  -webkit-tap-highlight-color: transparent;
  outline: none;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-size);
  color: var(--text-color);
  width: 100%;
  height: var(--widget-height);
  text-transform: none;
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
  border: 1px solid var(--widget-color);
  text-align: center;
  line-height: calc(var(--widget-height) - 4px);
}
@media (hover: hover) {
  .lil-gui button:hover {
    background: var(--hover-color);
    border-color: var(--hover-color);
  }
  .lil-gui button:focus {
    border-color: var(--focus-color);
  }
}
.lil-gui button:active {
  background: var(--focus-color);
}

@font-face {
  font-family: "lil-gui";
  src: url("data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAAUsAAsAAAAACJwAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABHU1VCAAABCAAAAH4AAADAImwmYE9TLzIAAAGIAAAAPwAAAGBKqH5SY21hcAAAAcgAAAD0AAACrukyyJBnbHlmAAACvAAAAF8AAACEIZpWH2hlYWQAAAMcAAAAJwAAADZfcj2zaGhlYQAAA0QAAAAYAAAAJAC5AHhobXR4AAADXAAAABAAAABMAZAAAGxvY2EAAANsAAAAFAAAACgCEgIybWF4cAAAA4AAAAAeAAAAIAEfABJuYW1lAAADoAAAASIAAAIK9SUU/XBvc3QAAATEAAAAZgAAAJCTcMc2eJxVjbEOgjAURU+hFRBK1dGRL+ALnAiToyMLEzFpnPz/eAshwSa97517c/MwwJmeB9kwPl+0cf5+uGPZXsqPu4nvZabcSZldZ6kfyWnomFY/eScKqZNWupKJO6kXN3K9uCVoL7iInPr1X5baXs3tjuMqCtzEuagm/AAlzQgPAAB4nGNgYRBlnMDAysDAYM/gBiT5oLQBAwuDJAMDEwMrMwNWEJDmmsJwgCFeXZghBcjlZMgFCzOiKOIFAB71Bb8AeJy1kjFuwkAQRZ+DwRAwBtNQRUGKQ8OdKCAWUhAgKLhIuAsVSpWz5Bbkj3dEgYiUIszqWdpZe+Z7/wB1oCYmIoboiwiLT2WjKl/jscrHfGg/pKdMkyklC5Zs2LEfHYpjcRoPzme9MWWmk3dWbK9ObkWkikOetJ554fWyoEsmdSlt+uR0pCJR34b6t/TVg1SY3sYvdf8vuiKrpyaDXDISiegp17p7579Gp3p++y7HPAiY9pmTibljrr85qSidtlg4+l25GLCaS8e6rRxNBmsnERunKbaOObRz7N72ju5vdAjYpBXHgJylOAVsMseDAPEP8LYoUHicY2BiAAEfhiAGJgZWBgZ7RnFRdnVJELCQlBSRlATJMoLV2DK4glSYs6ubq5vbKrJLSbGrgEmovDuDJVhe3VzcXFwNLCOILB/C4IuQ1xTn5FPilBTj5FPmBAB4WwoqAHicY2BkYGAA4sk1sR/j+W2+MnAzpDBgAyEMQUCSg4EJxAEAwUgFHgB4nGNgZGBgSGFggJMhDIwMqEAYAByHATJ4nGNgAIIUNEwmAABl3AGReJxjYAACIQYlBiMGJ3wQAEcQBEV4nGNgZGBgEGZgY2BiAAEQyQWEDAz/wXwGAAsPATIAAHicXdBNSsNAHAXwl35iA0UQXYnMShfS9GPZA7T7LgIu03SSpkwzYTIt1BN4Ak/gKTyAeCxfw39jZkjymzcvAwmAW/wgwHUEGDb36+jQQ3GXGot79L24jxCP4gHzF/EIr4jEIe7wxhOC3g2TMYy4Q7+Lu/SHuEd/ivt4wJd4wPxbPEKMX3GI5+DJFGaSn4qNzk8mcbKSR6xdXdhSzaOZJGtdapd4vVPbi6rP+cL7TGXOHtXKll4bY1Xl7EGnPtp7Xy2n00zyKLVHfkHBa4IcJ2oD3cgggWvt/V/FbDrUlEUJhTn/0azVWbNTNr0Ens8de1tceK9xZmfB1CPjOmPH4kitmvOubcNpmVTN3oFJyjzCvnmrwhJTzqzVj9jiSX911FjeAAB4nG3HMRKCMBBA0f0giiKi4DU8k0V2GWbIZDOh4PoWWvq6J5V8If9NVNQcaDhyouXMhY4rPTcG7jwYmXhKq8Wz+p762aNaeYXom2n3m2dLTVgsrCgFJ7OTmIkYbwIbC6vIB7WmFfAAAA==") format("woff");
}`;function _l(s){const t=document.createElement("style");t.innerHTML=s;const e=document.querySelector("head link[rel=stylesheet], head style");e?document.head.insertBefore(t,e):document.head.appendChild(t)}let Jr=!1;class Tr{constructor({parent:t,autoPlace:e=t===void 0,container:n,width:i,title:r="Controls",injectStyles:o=!0,touchStyles:a=!0}={}){if(this.parent=t,this.root=t?t.root:this,this.children=[],this.controllers=[],this.folders=[],this._closed=!1,this._hidden=!1,this.domElement=document.createElement("div"),this.domElement.classList.add("lil-gui"),this.$title=document.createElement("div"),this.$title.classList.add("title"),this.$title.setAttribute("role","button"),this.$title.setAttribute("aria-expanded",!0),this.$title.setAttribute("tabindex",0),this.$title.addEventListener("click",()=>this.openAnimated(this._closed)),this.$title.addEventListener("keydown",l=>{(l.code==="Enter"||l.code==="Space")&&(l.preventDefault(),this.$title.click())}),this.$title.addEventListener("touchstart",()=>{},{passive:!0}),this.$children=document.createElement("div"),this.$children.classList.add("children"),this.domElement.appendChild(this.$title),this.domElement.appendChild(this.$children),this.title(r),a&&this.domElement.classList.add("allow-touch-styles"),this.parent){this.parent.children.push(this),this.parent.folders.push(this),this.parent.$children.appendChild(this.domElement);return}this.domElement.classList.add("root"),!Jr&&o&&(_l(bl),Jr=!0),n?n.appendChild(this.domElement):e&&(this.domElement.classList.add("autoPlace"),document.body.appendChild(this.domElement)),i&&this.domElement.style.setProperty("--width",i+"px"),this.domElement.addEventListener("keydown",l=>l.stopPropagation()),this.domElement.addEventListener("keyup",l=>l.stopPropagation())}add(t,e,n,i,r){if(Object(n)===n)return new Ml(this,t,e,n);const o=t[e];switch(typeof o){case"number":return new yl(this,t,e,n,i,r);case"boolean":return new pl(this,t,e);case"string":return new wl(this,t,e);case"function":return new ys(this,t,e)}console.error(`gui.add failed
	property:`,e,`
	object:`,t,`
	value:`,o)}addColor(t,e,n=1){return new Sl(this,t,e,n)}addFolder(t){return new Tr({parent:this,title:t})}load(t,e=!0){return t.controllers&&this.controllers.forEach(n=>{n instanceof ys||n._name in t.controllers&&n.load(t.controllers[n._name])}),e&&t.folders&&this.folders.forEach(n=>{n._title in t.folders&&n.load(t.folders[n._title])}),this}save(t=!0){const e={controllers:{},folders:{}};return this.controllers.forEach(n=>{if(!(n instanceof ys)){if(n._name in e.controllers)throw new Error(`Cannot save GUI with duplicate property "${n._name}"`);e.controllers[n._name]=n.save()}}),t&&this.folders.forEach(n=>{if(n._title in e.folders)throw new Error(`Cannot save GUI with duplicate folder "${n._title}"`);e.folders[n._title]=n.save()}),e}open(t=!0){return this._closed=!t,this.$title.setAttribute("aria-expanded",!this._closed),this.domElement.classList.toggle("closed",this._closed),this}close(){return this.open(!1)}show(t=!0){return this._hidden=!t,this.domElement.style.display=this._hidden?"none":"",this}hide(){return this.show(!1)}openAnimated(t=!0){return this._closed=!t,this.$title.setAttribute("aria-expanded",!this._closed),requestAnimationFrame(()=>{const e=this.$children.clientHeight;this.$children.style.height=e+"px",this.domElement.classList.add("transition");const n=r=>{r.target===this.$children&&(this.$children.style.height="",this.domElement.classList.remove("transition"),this.$children.removeEventListener("transitionend",n))};this.$children.addEventListener("transitionend",n);const i=t?this.$children.scrollHeight:0;this.domElement.classList.toggle("closed",!t),requestAnimationFrame(()=>{this.$children.style.height=i+"px"})}),this}title(t){return this._title=t,this.$title.innerHTML=t,this}reset(t=!0){return(t?this.controllersRecursive():this.controllers).forEach(n=>n.reset()),this}onChange(t){return this._onChange=t,this}_callOnChange(t){this.parent&&this.parent._callOnChange(t),this._onChange!==void 0&&this._onChange.call(this,{object:t.object,property:t.property,value:t.getValue(),controller:t})}onFinishChange(t){return this._onFinishChange=t,this}_callOnFinishChange(t){this.parent&&this.parent._callOnFinishChange(t),this._onFinishChange!==void 0&&this._onFinishChange.call(this,{object:t.object,property:t.property,value:t.getValue(),controller:t})}destroy(){this.parent&&(this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.folders.splice(this.parent.folders.indexOf(this),1)),this.domElement.parentElement&&this.domElement.parentElement.removeChild(this.domElement),Array.from(this.children).forEach(t=>t.destroy())}controllersRecursive(){let t=Array.from(this.controllers);return this.folders.forEach(e=>{t=t.concat(e.controllersRecursive())}),t}foldersRecursive(){let t=Array.from(this.folders);return this.folders.forEach(e=>{t=t.concat(e.foldersRecursive())}),t}}class Tl{constructor(){this.instance=new Tr({width:320,title:"调试面板"});const t=window.document.styleSheets[0];t.insertRule(`
            .lil-gui .lil-gui > .children
            {
                border: none;
                margin-left: var(--folder-indent);
                border-left: 2px solid var(--widget-color);
            }
        `,t.cssRules.length),t.insertRule(`
            .lil-gui.root > .children > .lil-gui > .title
            {
                border-width: 1px 0 0 0;
            }
        `,t.cssRules.length),this.tree={},this.tree.folder=this.instance,this.tree.children={}}getFolder(t){const e=t.split("/");let n=this.tree;for(const i of e){let r=n.children[i];r||(r={},r.folder=n.folder.addFolder(i),r.folder.close(),r.children={}),n.children[i]=r,n=r}return n.folder}}const ei=class{static getInstance(){return ei.instance}constructor(){if(ei.instance)return ei.instance;ei.instance=this,this.active=!1,location.hash==="#debug"&&this.activate()}activate(){this.active||(this.active=!0,this.ui=new Tl,this.stats=new fl)}};let nn=ei;Oe(nn,"instance");class Cl{constructor(){this.start=Date.now()/1e3,this.current=this.start,this.elapsed=0,this.delta=16/1e3}update(){const t=Date.now()/1e3;this.delta=t-this.current,this.elapsed+=this.delta,this.current=t,this.delta>60/1e3&&(this.delta=60/1e3)}}var pn={},El={get exports(){return pn},set exports(s){pn=s}},ri=typeof Reflect=="object"?Reflect:null,Vr=ri&&typeof ri.apply=="function"?ri.apply:function(t,e,n){return Function.prototype.apply.call(t,e,n)},rs;ri&&typeof ri.ownKeys=="function"?rs=ri.ownKeys:Object.getOwnPropertySymbols?rs=function(t){return Object.getOwnPropertyNames(t).concat(Object.getOwnPropertySymbols(t))}:rs=function(t){return Object.getOwnPropertyNames(t)};function Pl(s){console&&console.warn&&console.warn(s)}var go=Number.isNaN||function(t){return t!==t};function It(){It.init.call(this)}El.exports=It;pn.once=kl;It.EventEmitter=It;It.prototype._events=void 0;It.prototype._eventsCount=0;It.prototype._maxListeners=void 0;var Zr=10;function ds(s){if(typeof s!="function")throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof s)}Object.defineProperty(It,"defaultMaxListeners",{enumerable:!0,get:function(){return Zr},set:function(s){if(typeof s!="number"||s<0||go(s))throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received '+s+".");Zr=s}});It.init=function(){(this._events===void 0||this._events===Object.getPrototypeOf(this)._events)&&(this._events=Object.create(null),this._eventsCount=0),this._maxListeners=this._maxListeners||void 0};It.prototype.setMaxListeners=function(t){if(typeof t!="number"||t<0||go(t))throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received '+t+".");return this._maxListeners=t,this};function vo(s){return s._maxListeners===void 0?It.defaultMaxListeners:s._maxListeners}It.prototype.getMaxListeners=function(){return vo(this)};It.prototype.emit=function(t){for(var e=[],n=1;n<arguments.length;n++)e.push(arguments[n]);var i=t==="error",r=this._events;if(r!==void 0)i=i&&r.error===void 0;else if(!i)return!1;if(i){var o;if(e.length>0&&(o=e[0]),o instanceof Error)throw o;var a=new Error("Unhandled error."+(o?" ("+o.message+")":""));throw a.context=o,a}var l=r[t];if(l===void 0)return!1;if(typeof l=="function")Vr(l,this,e);else for(var c=l.length,h=Mo(l,c),n=0;n<c;++n)Vr(h[n],this,e);return!0};function Ao(s,t,e,n){var i,r,o;if(ds(e),r=s._events,r===void 0?(r=s._events=Object.create(null),s._eventsCount=0):(r.newListener!==void 0&&(s.emit("newListener",t,e.listener?e.listener:e),r=s._events),o=r[t]),o===void 0)o=r[t]=e,++s._eventsCount;else if(typeof o=="function"?o=r[t]=n?[e,o]:[o,e]:n?o.unshift(e):o.push(e),i=vo(s),i>0&&o.length>i&&!o.warned){o.warned=!0;var a=new Error("Possible EventEmitter memory leak detected. "+o.length+" "+String(t)+" listeners added. Use emitter.setMaxListeners() to increase limit");a.name="MaxListenersExceededWarning",a.emitter=s,a.type=t,a.count=o.length,Pl(a)}return s}It.prototype.addListener=function(t,e){return Ao(this,t,e,!1)};It.prototype.on=It.prototype.addListener;It.prototype.prependListener=function(t,e){return Ao(this,t,e,!0)};function zl(){if(!this.fired)return this.target.removeListener(this.type,this.wrapFn),this.fired=!0,arguments.length===0?this.listener.call(this.target):this.listener.apply(this.target,arguments)}function xo(s,t,e){var n={fired:!1,wrapFn:void 0,target:s,type:t,listener:e},i=zl.bind(n);return i.listener=e,n.wrapFn=i,i}It.prototype.once=function(t,e){return ds(e),this.on(t,xo(this,t,e)),this};It.prototype.prependOnceListener=function(t,e){return ds(e),this.prependListener(t,xo(this,t,e)),this};It.prototype.removeListener=function(t,e){var n,i,r,o,a;if(ds(e),i=this._events,i===void 0)return this;if(n=i[t],n===void 0)return this;if(n===e||n.listener===e)--this._eventsCount===0?this._events=Object.create(null):(delete i[t],i.removeListener&&this.emit("removeListener",t,n.listener||e));else if(typeof n!="function"){for(r=-1,o=n.length-1;o>=0;o--)if(n[o]===e||n[o].listener===e){a=n[o].listener,r=o;break}if(r<0)return this;r===0?n.shift():Ll(n,r),n.length===1&&(i[t]=n[0]),i.removeListener!==void 0&&this.emit("removeListener",t,a||e)}return this};It.prototype.off=It.prototype.removeListener;It.prototype.removeAllListeners=function(t){var e,n,i;if(n=this._events,n===void 0)return this;if(n.removeListener===void 0)return arguments.length===0?(this._events=Object.create(null),this._eventsCount=0):n[t]!==void 0&&(--this._eventsCount===0?this._events=Object.create(null):delete n[t]),this;if(arguments.length===0){var r=Object.keys(n),o;for(i=0;i<r.length;++i)o=r[i],o!=="removeListener"&&this.removeAllListeners(o);return this.removeAllListeners("removeListener"),this._events=Object.create(null),this._eventsCount=0,this}if(e=n[t],typeof e=="function")this.removeListener(t,e);else if(e!==void 0)for(i=e.length-1;i>=0;i--)this.removeListener(t,e[i]);return this};function So(s,t,e){var n=s._events;if(n===void 0)return[];var i=n[t];return i===void 0?[]:typeof i=="function"?e?[i.listener||i]:[i]:e?Rl(i):Mo(i,i.length)}It.prototype.listeners=function(t){return So(this,t,!0)};It.prototype.rawListeners=function(t){return So(this,t,!1)};It.listenerCount=function(s,t){return typeof s.listenerCount=="function"?s.listenerCount(t):yo.call(s,t)};It.prototype.listenerCount=yo;function yo(s){var t=this._events;if(t!==void 0){var e=t[s];if(typeof e=="function")return 1;if(e!==void 0)return e.length}return 0}It.prototype.eventNames=function(){return this._eventsCount>0?rs(this._events):[]};function Mo(s,t){for(var e=new Array(t),n=0;n<t;++n)e[n]=s[n];return e}function Ll(s,t){for(;t+1<s.length;t++)s[t]=s[t+1];s.pop()}function Rl(s){for(var t=new Array(s.length),e=0;e<t.length;++e)t[e]=s[e].listener||s[e];return t}function kl(s,t){return new Promise(function(e,n){function i(o){s.removeListener(t,r),n(o)}function r(){typeof s.removeListener=="function"&&s.removeListener("error",i),e([].slice.call(arguments))}wo(s,t,r,{once:!0}),t!=="error"&&Dl(s,i,{once:!0})})}function Dl(s,t,e){typeof s.on=="function"&&wo(s,"error",t,e)}function wo(s,t,e,n){if(typeof s.on=="function")n.once?s.once(t,e):s.on(t,e);else if(typeof s.addEventListener=="function")s.addEventListener(t,function i(r){n.once&&s.removeEventListener(t,i),e(r)});else throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type '+typeof s)}class Il{constructor(){this.game=Kt.getInstance(),this.state=Ot.getInstance(),this.events=new pn,this.setKeys(),this.setPointer(),this.events.on("debugDown",()=>{location.hash==="#debug"?location.hash="":location.hash="debug",location.reload()})}setKeys(){this.keys={},this.keys.map=[{codes:["ArrowUp","KeyW"],name:"forward"},{codes:["ArrowRight","KeyD"],name:"strafeRight"},{codes:["ArrowDown","KeyS"],name:"backward"},{codes:["ArrowLeft","KeyA"],name:"strafeLeft"},{codes:["ShiftLeft","ShiftRight"],name:"boost"},{codes:["KeyP"],name:"pointerLock"},{codes:["KeyV"],name:"cameraMode"},{codes:["KeyB"],name:"debug"},{codes:["KeyF"],name:"fullscreen"},{codes:["Space"],name:"jump"},{codes:["ControlLeft","KeyC"],name:"crouch"}],this.keys.down={};for(const t of this.keys.map)this.keys.down[t.name]=!1;this.keys.findPerCode=t=>this.keys.map.find(e=>e.codes.includes(t)),window.addEventListener("keydown",t=>{const e=this.keys.findPerCode(t.code);e&&(this.events.emit("keyDown",e.name),this.events.emit(`${e.name}Down`),this.keys.down[e.name]=!0)}),window.addEventListener("keyup",t=>{const e=this.keys.findPerCode(t.code);e&&(this.events.emit("keyUp",e.name),this.events.emit(`${e.name}Up`),this.keys.down[e.name]=!1)})}setPointer(){this.pointer={},this.pointer.down=!1,this.pointer.deltaTemp={x:0,y:0},this.pointer.delta={x:0,y:0},window.addEventListener("pointerdown",t=>{this.pointer.down=!0}),window.addEventListener("pointermove",t=>{this.pointer.deltaTemp.x+=t.movementX,this.pointer.deltaTemp.y+=t.movementY}),window.addEventListener("pointerup",()=>{this.pointer.down=!1})}update(){this.pointer.delta.x=this.pointer.deltaTemp.x,this.pointer.delta.y=this.pointer.deltaTemp.y,this.pointer.deltaTemp.x=0,this.pointer.deltaTemp.y=0}}class Nl{constructor(){this.game=Kt.getInstance(),this.state=Ot.getInstance(),this.controls=this.state.controls,this.domElement=this.game.domElement,this.width=null,this.height=null,this.smallestSide=null,this.biggestSide=null,this.pixelRatio=null,this.clampedPixelRatio=null,this.setPointerLock(),this.setFullscreen(),this.controls.events.on("pointerLockDown",()=>{this.pointerLock.toggle()}),this.controls.events.on("fullscreenDown",()=>{this.fullscreen.toggle()}),this.resize()}setPointerLock(){this.pointerLock={},this.pointerLock.active=!1,this.pointerLock.toggle=()=>{this.pointerLock.active?this.pointerLock.deactivate():this.pointerLock.activate()},this.pointerLock.activate=()=>{this.domElement&&this.domElement.requestPointerLock&&this.domElement.requestPointerLock()},this.pointerLock.deactivate=()=>{document.exitPointerLock()},document.addEventListener("pointerlockchange",()=>{this.pointerLock.active=!!document.pointerLockElement})}setFullscreen(){this.fullscreen={},this.fullscreen.active=!1,this.fullscreen.toggle=()=>{this.fullscreen.active?this.fullscreen.deactivate():this.fullscreen.activate()},this.fullscreen.activate=()=>{this.domElement&&this.domElement.requestFullscreen&&this.domElement.requestFullscreen()},this.fullscreen.deactivate=()=>{document.exitFullscreen()},document.addEventListener("fullscreenchange",()=>{this.fullscreen.active=!!document.fullscreenElement})}normalise(t){const e=Math.min(this.width,this.height);return{x:t.x/e,y:t.y/e}}resize(){this.width=window.innerWidth,this.height=window.innerHeight,this.smallestSide=this.width<this.height?this.width:this.height,this.biggestSide=this.width>this.height?this.width:this.height,this.pixelRatio=window.devicePixelRatio,this.clampedPixelRatio=Math.min(this.pixelRatio,2)}}class Ol{constructor(){this.game=Kt.getInstance(),this.state=Ot.getInstance(),this.debug=nn.getInstance(),this.autoUpdate=!0,this.timeProgress=0,this.progress=0,this.duration=15,this.setDebug()}update(){const t=this.state.time;this.autoUpdate&&(this.timeProgress+=t.delta/this.duration,this.progress=this.timeProgress%1)}setDebug(){if(!this.debug.active)return;const t=this.debug.ui.getFolder("状态/日夜循环");t.add(this,"autoUpdate").name("自动更新"),t.add(this,"progress").min(0).max(1).step(.001).name("进度"),t.add(this,"duration").min(5).max(100).step(1).name("周期时长")}}class Fl{constructor(){this.game=Kt.getInstance(),this.state=Ot.getInstance(),this.theta=Math.PI*.8,this.phi=Math.PI*.45,this.position={x:0,y:0,z:0}}update(){const e=-(this.state.day.progress+.25)*Math.PI*2;this.phi=(Math.sin(e)*.3+.5)*Math.PI,this.theta=(Math.cos(e)*.3+.5)*Math.PI;const n=Math.sin(this.phi);this.position.x=n*Math.sin(this.theta),this.position.y=Math.cos(this.phi),this.position.z=n*Math.cos(this.theta)}}var Bl=1e-6,fe=typeof Float32Array<"u"?Float32Array:Array;Math.hypot||(Math.hypot=function(){for(var s=0,t=arguments.length;t--;)s+=arguments[t]*arguments[t];return Math.sqrt(s)});function Ul(){var s=new fe(9);return fe!=Float32Array&&(s[1]=0,s[2]=0,s[3]=0,s[5]=0,s[6]=0,s[7]=0),s[0]=1,s[4]=1,s[8]=1,s}function bo(){var s=new fe(16);return fe!=Float32Array&&(s[1]=0,s[2]=0,s[3]=0,s[4]=0,s[6]=0,s[7]=0,s[8]=0,s[9]=0,s[11]=0,s[12]=0,s[13]=0,s[14]=0),s[0]=1,s[5]=1,s[10]=1,s[15]=1,s}function Hl(s,t,e){var n=Math.sin(e),i=Math.cos(e),r=t[4],o=t[5],a=t[6],l=t[7],c=t[8],h=t[9],u=t[10],d=t[11];return t!==s&&(s[0]=t[0],s[1]=t[1],s[2]=t[2],s[3]=t[3],s[12]=t[12],s[13]=t[13],s[14]=t[14],s[15]=t[15]),s[4]=r*i+c*n,s[5]=o*i+h*n,s[6]=a*i+u*n,s[7]=l*i+d*n,s[8]=c*i-r*n,s[9]=h*i-o*n,s[10]=u*i-a*n,s[11]=d*i-l*n,s}function Gl(s,t,e){var n=Math.sin(e),i=Math.cos(e),r=t[0],o=t[1],a=t[2],l=t[3],c=t[8],h=t[9],u=t[10],d=t[11];return t!==s&&(s[4]=t[4],s[5]=t[5],s[6]=t[6],s[7]=t[7],s[12]=t[12],s[13]=t[13],s[14]=t[14],s[15]=t[15]),s[0]=r*i-c*n,s[1]=o*i-h*n,s[2]=a*i-u*n,s[3]=l*i-d*n,s[8]=r*n+c*i,s[9]=o*n+h*i,s[10]=a*n+u*i,s[11]=l*n+d*i,s}function Jl(s,t){return s[0]=t[12],s[1]=t[13],s[2]=t[14],s}function Vl(s,t){var e=t[0],n=t[1],i=t[2],r=t[4],o=t[5],a=t[6],l=t[8],c=t[9],h=t[10];return s[0]=Math.hypot(e,n,i),s[1]=Math.hypot(r,o,a),s[2]=Math.hypot(l,c,h),s}function Zl(s,t){var e=new fe(3);Vl(e,t);var n=1/e[0],i=1/e[1],r=1/e[2],o=t[0]*n,a=t[1]*i,l=t[2]*r,c=t[4]*n,h=t[5]*i,u=t[6]*r,d=t[8]*n,f=t[9]*i,v=t[10]*r,m=o+h+v,p=0;return m>0?(p=Math.sqrt(m+1)*2,s[3]=.25*p,s[0]=(u-f)/p,s[1]=(d-l)/p,s[2]=(a-c)/p):o>h&&o>v?(p=Math.sqrt(1+o-h-v)*2,s[3]=(u-f)/p,s[0]=.25*p,s[1]=(a+c)/p,s[2]=(d+l)/p):h>v?(p=Math.sqrt(1+h-o-v)*2,s[3]=(d-l)/p,s[0]=(a+c)/p,s[1]=.25*p,s[2]=(u+f)/p):(p=Math.sqrt(1+v-o-h)*2,s[3]=(a-c)/p,s[0]=(d+l)/p,s[1]=(u+f)/p,s[2]=.25*p),s}function Wl(s,t,e,n){var i=t[0],r=t[1],o=t[2],a=n[0],l=n[1],c=n[2],h=i-e[0],u=r-e[1],d=o-e[2],f=h*h+u*u+d*d;f>0&&(f=1/Math.sqrt(f),h*=f,u*=f,d*=f);var v=l*d-c*u,m=c*h-a*d,p=a*u-l*h;return f=v*v+m*m+p*p,f>0&&(f=1/Math.sqrt(f),v*=f,m*=f,p*=f),s[0]=v,s[1]=m,s[2]=p,s[3]=0,s[4]=u*p-d*m,s[5]=d*v-h*p,s[6]=h*m-u*v,s[7]=0,s[8]=h,s[9]=u,s[10]=d,s[11]=0,s[12]=i,s[13]=r,s[14]=o,s[15]=1,s}function He(){var s=new fe(3);return fe!=Float32Array&&(s[0]=0,s[1]=0,s[2]=0),s}function as(s){var t=new fe(3);return t[0]=s[0],t[1]=s[1],t[2]=s[2],t}function Xl(s){var t=s[0],e=s[1],n=s[2];return Math.hypot(t,e,n)}function Ge(s,t,e){var n=new fe(3);return n[0]=s,n[1]=t,n[2]=e,n}function Ci(s,t){return s[0]=t[0],s[1]=t[1],s[2]=t[2],s}function hn(s,t,e){return s[0]=t[0]+e[0],s[1]=t[1]+e[1],s[2]=t[2]+e[2],s}function ql(s,t,e){return s[0]=t[0]-e[0],s[1]=t[1]-e[1],s[2]=t[2]-e[2],s}function Yl(s,t,e){return s[0]=t[0]*e,s[1]=t[1]*e,s[2]=t[2]*e,s}function On(s,t){return s[0]=-t[0],s[1]=-t[1],s[2]=-t[2],s}function _o(s,t){var e=t[0],n=t[1],i=t[2],r=e*e+n*n+i*i;return r>0&&(r=1/Math.sqrt(r)),s[0]=t[0]*r,s[1]=t[1]*r,s[2]=t[2]*r,s}function hs(s,t){return s[0]*t[0]+s[1]*t[1]+s[2]*t[2]}function En(s,t,e){var n=t[0],i=t[1],r=t[2],o=e[0],a=e[1],l=e[2];return s[0]=i*l-r*a,s[1]=r*o-n*l,s[2]=n*a-i*o,s}function jl(s,t,e){var n=t[0],i=t[1],r=t[2],o=e[3]*n+e[7]*i+e[11]*r+e[15];return o=o||1,s[0]=(e[0]*n+e[4]*i+e[8]*r+e[12])/o,s[1]=(e[1]*n+e[5]*i+e[9]*r+e[13])/o,s[2]=(e[2]*n+e[6]*i+e[10]*r+e[14])/o,s}function Kl(s,t,e){var n=e[0],i=e[1],r=e[2],o=e[3],a=t[0],l=t[1],c=t[2],h=i*c-r*l,u=r*a-n*c,d=n*l-i*a,f=i*d-r*u,v=r*h-n*d,m=n*u-i*h,p=o*2;return h*=p,u*=p,d*=p,f*=2,v*=2,m*=2,s[0]=a+h+f,s[1]=l+u+v,s[2]=c+d+m,s}function Wr(s,t){var e=s[0],n=s[1],i=s[2],r=t[0],o=t[1],a=t[2],l=Math.sqrt(e*e+n*n+i*i),c=Math.sqrt(r*r+o*o+a*a),h=l*c,u=h&&hs(s,t)/h;return Math.acos(Math.min(Math.max(u,-1),1))}var Ql=ql,To=Xl;(function(){var s=He();return function(t,e,n,i,r,o){var a,l;for(e||(e=3),n||(n=0),i?l=Math.min(i*e+n,t.length):l=t.length,a=n;a<l;a+=e)s[0]=t[a],s[1]=t[a+1],s[2]=t[a+2],r(s,s,o),t[a]=s[0],t[a+1]=s[1],t[a+2]=s[2];return t}})();function $l(){var s=new fe(4);return fe!=Float32Array&&(s[0]=0,s[1]=0,s[2]=0,s[3]=0),s}function tc(s,t){var e=t[0],n=t[1],i=t[2],r=t[3],o=e*e+n*n+i*i+r*r;return o>0&&(o=1/Math.sqrt(o)),s[0]=e*o,s[1]=n*o,s[2]=i*o,s[3]=r*o,s}(function(){var s=$l();return function(t,e,n,i,r,o){var a,l;for(e||(e=4),n||(n=0),i?l=Math.min(i*e+n,t.length):l=t.length,a=n;a<l;a+=e)s[0]=t[a],s[1]=t[a+1],s[2]=t[a+2],s[3]=t[a+3],r(s,s,o),t[a]=s[0],t[a+1]=s[1],t[a+2]=s[2],t[a+3]=s[3];return t}})();function lr(){var s=new fe(4);return fe!=Float32Array&&(s[0]=0,s[1]=0,s[2]=0),s[3]=1,s}function ec(s,t,e){e=e*.5;var n=Math.sin(e);return s[0]=n*t[0],s[1]=n*t[1],s[2]=n*t[2],s[3]=Math.cos(e),s}function Ms(s,t,e,n){var i=t[0],r=t[1],o=t[2],a=t[3],l=e[0],c=e[1],h=e[2],u=e[3],d,f,v,m,p;return f=i*l+r*c+o*h+a*u,f<0&&(f=-f,l=-l,c=-c,h=-h,u=-u),1-f>Bl?(d=Math.acos(f),v=Math.sin(d),m=Math.sin((1-n)*d)/v,p=Math.sin(n*d)/v):(m=1-n,p=n),s[0]=m*i+p*l,s[1]=m*r+p*c,s[2]=m*o+p*h,s[3]=m*a+p*u,s}function nc(s,t){var e=t[0]+t[4]+t[8],n;if(e>0)n=Math.sqrt(e+1),s[3]=.5*n,n=.5/n,s[0]=(t[5]-t[7])*n,s[1]=(t[6]-t[2])*n,s[2]=(t[1]-t[3])*n;else{var i=0;t[4]>t[0]&&(i=1),t[8]>t[i*3+i]&&(i=2);var r=(i+1)%3,o=(i+2)%3;n=Math.sqrt(t[i*3+i]-t[r*3+r]-t[o*3+o]+1),s[i]=.5*n,n=.5/n,s[3]=(t[r*3+o]-t[o*3+r])*n,s[r]=(t[r*3+i]+t[i*3+r])*n,s[o]=(t[o*3+i]+t[i*3+o])*n}return s}var Co=tc;(function(){var s=He(),t=Ge(1,0,0),e=Ge(0,1,0);return function(n,i,r){var o=hs(i,r);return o<-.999999?(En(s,t,i),To(s)<1e-6&&En(s,e,i),_o(s,s),ec(n,s,Math.PI),n):o>.999999?(n[0]=0,n[1]=0,n[2]=0,n[3]=1,n):(En(s,i,r),n[0]=s[0],n[1]=s[1],n[2]=s[2],n[3]=1+o,Co(n,n))}})();(function(){var s=lr(),t=lr();return function(e,n,i,r,o,a){return Ms(s,n,o,a),Ms(t,i,r,a),Ms(e,s,t,2*a*(1-a)),e}})();(function(){var s=Ul();return function(t,e,n,i){return s[0]=n[0],s[3]=n[1],s[6]=n[2],s[1]=i[0],s[4]=i[1],s[7]=i[2],s[2]=-e[0],s[5]=-e[1],s[8]=-e[2],Co(t,nc(t,s))}})();function Cr(){var s=new fe(8);return fe!=Float32Array&&(s[0]=0,s[1]=0,s[2]=0,s[4]=0,s[5]=0,s[6]=0,s[7]=0),s[3]=1,s}function ic(s,t,e){var n=e[0]*.5,i=e[1]*.5,r=e[2]*.5,o=t[0],a=t[1],l=t[2],c=t[3];return s[0]=o,s[1]=a,s[2]=l,s[3]=c,s[4]=n*c+i*l-r*a,s[5]=i*c+r*o-n*l,s[6]=r*c+n*a-i*o,s[7]=-n*o-i*a-r*l,s}function Eo(s,t){var e=lr();Zl(e,t);var n=new fe(3);return Jl(n,t),ic(s,e,n),s}function Xr(s,t){return s[0]=t[0],s[1]=t[1],s[2]=t[2],s[3]=t[3],s[4]=t[4],s[5]=t[5],s[6]=t[6],s[7]=t[7],s}class sc{constructor(t){this.state=Ot.getInstance(),this.viewport=this.state.viewport,this.controls=this.state.controls,this.player=t,this.active=!1,this.gameUp=Ge(0,1,0),this.position=He(),this.quaternion=Cr(),this.distance=15,this.phi=Math.PI*.45,this.theta=-Math.PI*.25,this.aboveOffset=2,this.phiLimits={min:.1,max:Math.PI-.1}}activate(){this.active=!0}deactivate(){this.active=!1}update(){if(!this.active)return;if(this.controls.pointer.down||this.viewport.pointerLock.active){const a=this.viewport.normalise(this.controls.pointer.delta);this.phi-=a.y*2,this.theta-=a.x*2,this.phi<this.phiLimits.min&&(this.phi=this.phiLimits.min),this.phi>this.phiLimits.max&&(this.phi=this.phiLimits.max)}const t=Math.sin(this.phi)*this.distance,e=Ge(t*Math.sin(this.theta),Math.cos(this.phi)*this.distance,t*Math.cos(this.theta));hn(this.position,this.player.position.current,e);const n=Ge(this.player.position.current[0],this.player.position.current[1]+this.aboveOffset,this.player.position.current[2]),i=bo();Wl(i,this.position,n,this.gameUp),Eo(this.quaternion,i);const o=this.state.chunks.getElevationForPosition(this.position[0],this.position[2]);o&&this.position[1]<o+1&&(this.position[1]=o+1)}}class rc{constructor(t){this.game=Kt.getInstance(),this.state=Ot.getInstance(),this.viewport=this.state.viewport,this.time=this.state.time,this.controls=this.state.controls,this.player=t,this.active=!1,this.gameUp=Ge(0,1,0),this.defaultForward=Ge(0,0,1),this.forward=as(this.defaultForward),this.rightward=He(),this.upward=He(),this.backward=He(),this.leftward=He(),this.downward=He(),En(this.rightward,this.gameUp,this.forward),En(this.upward,this.forward,this.rightward),On(this.backward,this.forward),On(this.leftward,this.rightward),On(this.downward,this.upward),this.position=Ge(40,10,40),this.quaternion=Cr(),this.rotateX=-Math.PI*.15,this.rotateY=Math.PI*.25,this.rotateXLimits={min:-Math.PI*.5,max:Math.PI*.5}}activate(t=null,e=null){if(this.active=!0,t!==null&&e!==null){Ci(this.position,t);const n=as(this.defaultForward);Kl(n,n,e);const i=as(n);i[1]=0,this.rotateY=Wr(this.defaultForward,i),hs(n,Ge(1,0,0))<0&&(this.rotateY*=-1),this.rotateX=Wr(n,i),hs(n,Ge(0,1,0))>0&&(this.rotateX*=-1)}}deactivate(){this.active=!1}update(){if(!this.active)return;if(this.controls.pointer.down||this.viewport.pointerLock.active){const i=this.viewport.normalise(this.controls.pointer.delta);this.rotateX-=i.y*2,this.rotateY-=i.x*2,this.rotateX<this.rotateXLimits.min&&(this.rotateX=this.rotateXLimits.min),this.rotateX>this.rotateXLimits.max&&(this.rotateX=this.rotateXLimits.max)}const t=bo();Gl(t,t,this.rotateY),Hl(t,t,this.rotateX),Eo(this.quaternion,t),Ci(this.forward,this.defaultForward),jl(this.forward,this.forward,t),En(this.rightward,this.gameUp,this.forward),En(this.upward,this.forward,this.rightward),On(this.backward,this.forward),On(this.leftward,this.rightward),On(this.downward,this.upward);const e=He();this.controls.keys.down.forward&&hn(e,e,this.backward),this.controls.keys.down.backward&&hn(e,e,this.forward),this.controls.keys.down.strafeRight&&hn(e,e,this.rightward),this.controls.keys.down.strafeLeft&&hn(e,e,this.leftward),this.controls.keys.down.jump&&hn(e,e,this.upward),this.controls.keys.down.crouch&&hn(e,e,this.downward);const n=(this.controls.keys.down.boost?30:10)*this.time.delta;_o(e,e),Yl(e,e,n),hn(this.position,this.position,e)}}var Yt;let qr=(Yt=class{constructor(t){this.game=Kt.getInstance(),this.state=Ot.getInstance(),this.controls=this.state.controls,this.player=t,this.position=He(),this.quaternion=Cr(),this.mode=Yt.MODE_THIRDPERSON,this.thirdPerson=new sc(this.player),this.fly=new rc(this.player),this.mode===Yt.MODE_THIRDPERSON?this.thirdPerson.activate():this.mode===Yt.MODE_FLY&&this.fly.activate(),this.controls.events.on("cameraModeDown",()=>{this.mode===Yt.MODE_THIRDPERSON?(this.mode=Yt.MODE_FLY,this.fly.activate(this.position,this.quaternion),this.thirdPerson.deactivate()):this.mode===Yt.MODE_FLY&&(this.mode=Yt.MODE_THIRDPERSON,this.fly.deactivate(),this.thirdPerson.activate())}),this.setDebug()}update(){this.thirdPerson.update(),this.fly.update(),this.mode===Yt.MODE_THIRDPERSON?(Ci(this.position,this.thirdPerson.position),Xr(this.quaternion,this.thirdPerson.quaternion)):this.mode===Yt.MODE_FLY&&(Ci(this.position,this.fly.position),Xr(this.quaternion,this.fly.quaternion))}setDebug(){const t=this.game.debug;if(!t.active)return;t.ui.getFolder("状态/玩家/视角").add(this,"mode",{第三人称:Yt.MODE_THIRDPERSON,自由飞行:Yt.MODE_FLY}).name("视角模式").onChange(()=>{this.mode===Yt.MODE_THIRDPERSON?(this.fly.deactivate(),this.thirdPerson.activate()):this.mode===Yt.MODE_FLY&&(this.fly.activate(this.position,this.quaternion),this.thirdPerson.deactivate())})}},Oe(Yt,"MODE_THIRDPERSON",1),Oe(Yt,"MODE_FLY",2),Yt),ac=class{constructor(){this.game=Kt.getInstance(),this.state=Ot.getInstance(),this.time=this.state.time,this.controls=this.state.controls,this.rotation=0,this.inputSpeed=10,this.inputBoostSpeed=30,this.speed=0,this.position={},this.position.current=Ge(10,0,1),this.position.previous=as(this.position.current),this.position.delta=He(),this.jump={},this.jump.velocity=0,this.jump.strength=15,this.jump.gravity=30,this.jump.isGrounded=!0,this.camera=new qr(this)}update(){if(this.camera.mode!==qr.MODE_FLY&&(this.controls.keys.down.forward||this.controls.keys.down.backward||this.controls.keys.down.strafeLeft||this.controls.keys.down.strafeRight)){this.rotation=this.camera.thirdPerson.theta,this.controls.keys.down.forward?this.controls.keys.down.strafeLeft?this.rotation+=Math.PI*.25:this.controls.keys.down.strafeRight&&(this.rotation-=Math.PI*.25):this.controls.keys.down.backward?this.controls.keys.down.strafeLeft?this.rotation+=Math.PI*.75:this.controls.keys.down.strafeRight?this.rotation-=Math.PI*.75:this.rotation-=Math.PI:this.controls.keys.down.strafeLeft?this.rotation+=Math.PI*.5:this.controls.keys.down.strafeRight&&(this.rotation-=Math.PI*.5);const n=this.controls.keys.down.boost?this.inputBoostSpeed:this.inputSpeed,i=Math.sin(this.rotation)*this.time.delta*n,r=Math.cos(this.rotation)*this.time.delta*n;this.position.current[0]-=i,this.position.current[2]-=r}Ql(this.position.delta,this.position.current,this.position.previous),Ci(this.position.previous,this.position.current),this.speed=To(this.position.delta),this.camera.update(),this.controls.keys.down.jump&&this.jump.isGrounded&&(this.jump.velocity=this.jump.strength,this.jump.isGrounded=!1);const e=this.state.chunks.getElevationForPosition(this.position.current[0],this.position.current[2]);e!=null?this.jump.isGrounded?this.position.current[1]=e:(this.jump.velocity-=this.jump.gravity*this.time.delta,this.position.current[1]+=this.jump.velocity*this.time.delta,this.position.current[1]<=e&&(this.position.current[1]=e,this.jump.velocity=0,this.jump.isGrounded=!0)):this.jump.isGrounded?this.position.current[1]=0:(this.jump.velocity-=this.jump.gravity*this.time.delta,this.position.current[1]+=this.jump.velocity*this.time.delta,this.position.current[1]<=0&&(this.position.current[1]=0,this.jump.velocity=0,this.jump.isGrounded=!0))}};var cr={},oc={get exports(){return cr},set exports(s){cr=s}};(function(s){(function(t,e,n){function i(l){var c=this,h=a();c.next=function(){var u=2091639*c.s0+c.c*23283064365386963e-26;return c.s0=c.s1,c.s1=c.s2,c.s2=u-(c.c=u|0)},c.c=1,c.s0=h(" "),c.s1=h(" "),c.s2=h(" "),c.s0-=h(l),c.s0<0&&(c.s0+=1),c.s1-=h(l),c.s1<0&&(c.s1+=1),c.s2-=h(l),c.s2<0&&(c.s2+=1),h=null}function r(l,c){return c.c=l.c,c.s0=l.s0,c.s1=l.s1,c.s2=l.s2,c}function o(l,c){var h=new i(l),u=c&&c.state,d=h.next;return d.int32=function(){return h.next()*4294967296|0},d.double=function(){return d()+(d()*2097152|0)*11102230246251565e-32},d.quick=d,u&&(typeof u=="object"&&r(u,h),d.state=function(){return r(h,{})}),d}function a(){var l=4022871197,c=function(h){h=String(h);for(var u=0;u<h.length;u++){l+=h.charCodeAt(u);var d=.02519603282416938*l;l=d>>>0,d-=l,d*=l,l=d>>>0,d-=l,l+=d*4294967296}return(l>>>0)*23283064365386963e-26};return c}e&&e.exports?e.exports=o:n&&n.amd?n(function(){return o}):this.alea=o})(vn,s,!1)})(oc);var hr={},lc={get exports(){return hr},set exports(s){hr=s}};(function(s){(function(t,e,n){function i(a){var l=this,c="";l.x=0,l.y=0,l.z=0,l.w=0,l.next=function(){var u=l.x^l.x<<11;return l.x=l.y,l.y=l.z,l.z=l.w,l.w^=l.w>>>19^u^u>>>8},a===(a|0)?l.x=a:c+=a;for(var h=0;h<c.length+64;h++)l.x^=c.charCodeAt(h)|0,l.next()}function r(a,l){return l.x=a.x,l.y=a.y,l.z=a.z,l.w=a.w,l}function o(a,l){var c=new i(a),h=l&&l.state,u=function(){return(c.next()>>>0)/4294967296};return u.double=function(){do var d=c.next()>>>11,f=(c.next()>>>0)/4294967296,v=(d+f)/(1<<21);while(v===0);return v},u.int32=c.next,u.quick=u,h&&(typeof h=="object"&&r(h,c),u.state=function(){return r(c,{})}),u}e&&e.exports?e.exports=o:n&&n.amd?n(function(){return o}):this.xor128=o})(vn,s,!1)})(lc);var ur={},cc={get exports(){return ur},set exports(s){ur=s}};(function(s){(function(t,e,n){function i(a){var l=this,c="";l.next=function(){var u=l.x^l.x>>>2;return l.x=l.y,l.y=l.z,l.z=l.w,l.w=l.v,(l.d=l.d+362437|0)+(l.v=l.v^l.v<<4^(u^u<<1))|0},l.x=0,l.y=0,l.z=0,l.w=0,l.v=0,a===(a|0)?l.x=a:c+=a;for(var h=0;h<c.length+64;h++)l.x^=c.charCodeAt(h)|0,h==c.length&&(l.d=l.x<<10^l.x>>>4),l.next()}function r(a,l){return l.x=a.x,l.y=a.y,l.z=a.z,l.w=a.w,l.v=a.v,l.d=a.d,l}function o(a,l){var c=new i(a),h=l&&l.state,u=function(){return(c.next()>>>0)/4294967296};return u.double=function(){do var d=c.next()>>>11,f=(c.next()>>>0)/4294967296,v=(d+f)/(1<<21);while(v===0);return v},u.int32=c.next,u.quick=u,h&&(typeof h=="object"&&r(h,c),u.state=function(){return r(c,{})}),u}e&&e.exports?e.exports=o:n&&n.amd?n(function(){return o}):this.xorwow=o})(vn,s,!1)})(cc);var dr={},hc={get exports(){return dr},set exports(s){dr=s}};(function(s){(function(t,e,n){function i(a){var l=this;l.next=function(){var h=l.x,u=l.i,d,f;return d=h[u],d^=d>>>7,f=d^d<<24,d=h[u+1&7],f^=d^d>>>10,d=h[u+3&7],f^=d^d>>>3,d=h[u+4&7],f^=d^d<<7,d=h[u+7&7],d=d^d<<13,f^=d^d<<9,h[u]=f,l.i=u+1&7,f};function c(h,u){var d,f=[];if(u===(u|0))f[0]=u;else for(u=""+u,d=0;d<u.length;++d)f[d&7]=f[d&7]<<15^u.charCodeAt(d)+f[d+1&7]<<13;for(;f.length<8;)f.push(0);for(d=0;d<8&&f[d]===0;++d);for(d==8?f[7]=-1:f[d],h.x=f,h.i=0,d=256;d>0;--d)h.next()}c(l,a)}function r(a,l){return l.x=a.x.slice(),l.i=a.i,l}function o(a,l){a==null&&(a=+new Date);var c=new i(a),h=l&&l.state,u=function(){return(c.next()>>>0)/4294967296};return u.double=function(){do var d=c.next()>>>11,f=(c.next()>>>0)/4294967296,v=(d+f)/(1<<21);while(v===0);return v},u.int32=c.next,u.quick=u,h&&(h.x&&r(h,c),u.state=function(){return r(c,{})}),u}e&&e.exports?e.exports=o:n&&n.amd?n(function(){return o}):this.xorshift7=o})(vn,s,!1)})(hc);var fr={},uc={get exports(){return fr},set exports(s){fr=s}};(function(s){(function(t,e,n){function i(a){var l=this;l.next=function(){var h=l.w,u=l.X,d=l.i,f,v;return l.w=h=h+1640531527|0,v=u[d+34&127],f=u[d=d+1&127],v^=v<<13,f^=f<<17,v^=v>>>15,f^=f>>>12,v=u[d]=v^f,l.i=d,v+(h^h>>>16)|0};function c(h,u){var d,f,v,m,p,g=[],y=128;for(u===(u|0)?(f=u,u=null):(u=u+"\0",f=0,y=Math.max(y,u.length)),v=0,m=-32;m<y;++m)u&&(f^=u.charCodeAt((m+32)%u.length)),m===0&&(p=f),f^=f<<10,f^=f>>>15,f^=f<<4,f^=f>>>13,m>=0&&(p=p+1640531527|0,d=g[m&127]^=f+p,v=d==0?v+1:0);for(v>=128&&(g[(u&&u.length||0)&127]=-1),v=127,m=4*128;m>0;--m)f=g[v+34&127],d=g[v=v+1&127],f^=f<<13,d^=d<<17,f^=f>>>15,d^=d>>>12,g[v]=f^d;h.w=p,h.X=g,h.i=v}c(l,a)}function r(a,l){return l.i=a.i,l.w=a.w,l.X=a.X.slice(),l}function o(a,l){a==null&&(a=+new Date);var c=new i(a),h=l&&l.state,u=function(){return(c.next()>>>0)/4294967296};return u.double=function(){do var d=c.next()>>>11,f=(c.next()>>>0)/4294967296,v=(d+f)/(1<<21);while(v===0);return v},u.int32=c.next,u.quick=u,h&&(h.X&&r(h,c),u.state=function(){return r(c,{})}),u}e&&e.exports?e.exports=o:n&&n.amd?n(function(){return o}):this.xor4096=o})(vn,s,!1)})(uc);var pr={},dc={get exports(){return pr},set exports(s){pr=s}};(function(s){(function(t,e,n){function i(a){var l=this,c="";l.next=function(){var u=l.b,d=l.c,f=l.d,v=l.a;return u=u<<25^u>>>7^d,d=d-f|0,f=f<<24^f>>>8^v,v=v-u|0,l.b=u=u<<20^u>>>12^d,l.c=d=d-f|0,l.d=f<<16^d>>>16^v,l.a=v-u|0},l.a=0,l.b=0,l.c=-1640531527,l.d=1367130551,a===Math.floor(a)?(l.a=a/4294967296|0,l.b=a|0):c+=a;for(var h=0;h<c.length+20;h++)l.b^=c.charCodeAt(h)|0,l.next()}function r(a,l){return l.a=a.a,l.b=a.b,l.c=a.c,l.d=a.d,l}function o(a,l){var c=new i(a),h=l&&l.state,u=function(){return(c.next()>>>0)/4294967296};return u.double=function(){do var d=c.next()>>>11,f=(c.next()>>>0)/4294967296,v=(d+f)/(1<<21);while(v===0);return v},u.int32=c.next,u.quick=u,h&&(typeof h=="object"&&r(h,c),u.state=function(){return r(c,{})}),u}e&&e.exports?e.exports=o:n&&n.amd?n(function(){return o}):this.tychei=o})(vn,s,!1)})(dc);var mr={},fc={get exports(){return mr},set exports(s){mr=s}};const pc={},mc=Object.freeze(Object.defineProperty({__proto__:null,default:pc},Symbol.toStringTag,{value:"Module"})),gc=ul(mc);(function(s){(function(t,e,n){var i=256,r=6,o=52,a="random",l=n.pow(i,r),c=n.pow(2,o),h=c*2,u=i-1,d;function f(w,M,C){var z=[];M=M==!0?{entropy:!0}:M||{};var A=g(p(M.entropy?[w,x(e)]:w??y(),3),z),T=new v(z),k=function(){for(var V=T.g(r),X=l,D=0;V<c;)V=(V+D)*i,X*=i,D=T.g(1);for(;V>=h;)V/=2,X/=2,D>>>=1;return(V+D)/X};return k.int32=function(){return T.g(4)|0},k.quick=function(){return T.g(4)/4294967296},k.double=k,g(x(T.S),e),(M.pass||C||function(V,X,D,L){return L&&(L.S&&m(L,T),V.state=function(){return m(T,{})}),D?(n[a]=V,X):V})(k,A,"global"in M?M.global:this==n,M.state)}function v(w){var M,C=w.length,z=this,A=0,T=z.i=z.j=0,k=z.S=[];for(C||(w=[C++]);A<i;)k[A]=A++;for(A=0;A<i;A++)k[A]=k[T=u&T+w[A%C]+(M=k[A])],k[T]=M;(z.g=function(V){for(var X,D=0,L=z.i,G=z.j,q=z.S;V--;)X=q[L=u&L+1],D=D*i+q[u&(q[L]=q[G=u&G+X])+(q[G]=X)];return z.i=L,z.j=G,D})(i)}function m(w,M){return M.i=w.i,M.j=w.j,M.S=w.S.slice(),M}function p(w,M){var C=[],z=typeof w,A;if(M&&z=="object")for(A in w)try{C.push(p(w[A],M-1))}catch{}return C.length?C:z=="string"?w:w+"\0"}function g(w,M){for(var C=w+"",z,A=0;A<C.length;)M[u&A]=u&(z^=M[u&A]*19)+C.charCodeAt(A++);return x(M)}function y(){try{var w;return d&&(w=d.randomBytes)?w=w(i):(w=new Uint8Array(i),(t.crypto||t.msCrypto).getRandomValues(w)),x(w)}catch{var M=t.navigator,C=M&&M.plugins;return[+new Date,t,C,t.screen,x(e)]}}function x(w){return String.fromCharCode.apply(0,w)}if(g(n.random(),e),s.exports){s.exports=f;try{d=gc}catch{}}else n["seed"+a]=f})(typeof self<"u"?self:vn,[],Math)})(fc);var vc=cr,Ac=hr,xc=ur,Sc=dr,yc=fr,Mc=pr,Nn=mr;Nn.alea=vc;Nn.xor128=Ac;Nn.xorwow=xc;Nn.xorshift7=Sc;Nn.xor4096=yc;Nn.tychei=Mc;var wc=Nn;function bc(){return new Worker("/assets/Terrain-537569b0.js")}let _c=class{constructor(t,e,n,i,r,o,a){this.terrains=t,this.id=e,this.size=n,this.x=i,this.z=r,this.precision=o,this.elevationOffset=a,this.halfSize=this.size*.5,this.ready=!1,this.renderInstance=null,this.events=new pn}create(t){this.positions=t.positions,this.normals=t.normals,this.indices=t.indices,this.texture=t.texture,this.uv=t.uv,this.ready=!0,this.events.emit("ready")}getElevationForPosition(t,e){if(!this.ready)return;const n=this.terrains.subdivisions,i=n+1,r=this.size/n,o=t-this.x+this.halfSize,a=e-this.z+this.halfSize,l=o/r%1,c=a/r%1,h=Math.floor(o/r),u=Math.floor(a/r),d=h+1,f=u+1,v=l<c?h:h+1,m=l<c?u+1:u,p=(u*i+h)*3,g=(m*i+v)*3,y=(f*i+d)*3,x=l<c?1-c:1-l,w=l<c?-(l-c):l-c,M=1-x-w,C=this.positions[p+1],z=this.positions[g+1],A=this.positions[y+1];return C*x+z*w+A*M}destroy(){this.events.emit("destroy")}};var se;let Tc=(se=class{constructor(){this.game=Kt.getInstance(),this.state=Ot.getInstance(),this.debug=nn.getInstance(),this.seed=this.game.seed+"b",this.random=new wc(this.seed),this.subdivisions=40,this.lacunarity=2.05,this.persistence=.45,this.maxIterations=6,this.baseFrequency=.003,this.baseAmplitude=180,this.power=2,this.elevationOffset=1,this.segments=this.subdivisions+1,this.iterationsFormula=se.ITERATIONS_FORMULA_POWERMIX,this.lastId=0,this.terrains=new Map,this.events=new pn,this.iterationsOffsets=[];for(let t=0;t<this.maxIterations;t++)this.iterationsOffsets.push([(this.random()-.5)*2e5,(this.random()-.5)*2e5]);this.setWorkers(),this.setDebug()}setWorkers(){this.worker=bc(),this.worker.onmessage=t=>{const e=this.terrains.get(t.data.id);e&&e.create(t.data)}}getIterationsForPrecision(t){if(this.iterationsFormula===se.ITERATIONS_FORMULA_MAX)return this.maxIterations;if(this.iterationsFormula===se.ITERATIONS_FORMULA_MIN)return Math.floor((this.maxIterations-1)*t)+1;if(this.iterationsFormula===se.ITERATIONS_FORMULA_MIX)return Math.round((this.maxIterations*t+this.maxIterations)/2);if(this.iterationsFormula===se.ITERATIONS_FORMULA_POWERMIX)return Math.round((this.maxIterations*(1-Math.pow(1-t,2))+this.maxIterations)/2)}create(t,e,n,i){const r=this.lastId++,o=this.getIterationsForPrecision(i),a=new _c(this,r,t,e,n,i);return this.terrains.set(a.id,a),this.worker.postMessage({id:a.id,x:e,z:n,seed:this.seed,subdivisions:this.subdivisions,size:t,lacunarity:this.lacunarity,persistence:this.persistence,iterations:o,baseFrequency:this.baseFrequency,baseAmplitude:this.baseAmplitude,power:this.power,elevationOffset:this.elevationOffset,iterationsOffsets:this.iterationsOffsets}),this.events.emit("create",a),a}destroyTerrain(t){const e=this.terrains.get(t);e&&(e.destroy(),this.terrains.delete(t))}recreate(){for(const[t,e]of this.terrains){const n=this.getIterationsForPrecision(e.precision);this.worker.postMessage({id:e.id,size:e.size,x:e.x,z:e.z,seed:this.seed,subdivisions:this.subdivisions,lacunarity:this.lacunarity,persistence:this.persistence,iterations:n,baseFrequency:this.baseFrequency,baseAmplitude:this.baseAmplitude,power:this.power,elevationOffset:this.elevationOffset,iterationsOffsets:this.iterationsOffsets})}}setDebug(){if(!this.debug.active)return;const t=this.debug.ui.getFolder("状态/地形");t.add(this,"subdivisions").min(1).max(400).step(1).name("细分程度").onFinishChange(()=>this.recreate()),t.add(this,"lacunarity").min(1).max(5).step(.01).name("间隙度").onFinishChange(()=>this.recreate()),t.add(this,"persistence").min(0).max(1).step(.01).name("持续度").onFinishChange(()=>this.recreate()),t.add(this,"maxIterations").min(1).max(10).step(1).name("最大迭代").onFinishChange(()=>this.recreate()),t.add(this,"baseFrequency").min(0).max(.01).step(1e-4).name("基础频率").onFinishChange(()=>this.recreate()),t.add(this,"baseAmplitude").min(0).max(500).step(.1).name("基础振幅").onFinishChange(()=>this.recreate()),t.add(this,"power").min(1).max(10).step(1).name("幂次").onFinishChange(()=>this.recreate()),t.add(this,"elevationOffset").min(-10).max(10).step(1).name("高度偏移").onFinishChange(()=>this.recreate()),t.add(this,"iterationsFormula",{最大值:se.ITERATIONS_FORMULA_MAX,最小值:se.ITERATIONS_FORMULA_MIN,混合:se.ITERATIONS_FORMULA_MIX,幂次混合:se.ITERATIONS_FORMULA_POWERMIX}).name("迭代公式").onFinishChange(()=>this.recreate())}},Oe(se,"ITERATIONS_FORMULA_MAX",1),Oe(se,"ITERATIONS_FORMULA_MIN",2),Oe(se,"ITERATIONS_FORMULA_MIX",3),Oe(se,"ITERATIONS_FORMULA_POWERMIX",4),se),Cc=class{constructor(t,e,n,i,r,o,a,l){this.state=Ot.getInstance(),this.id=t,this.chunks=e,this.parent=n,this.quadPosition=i,this.size=r,this.x=o,this.z=a,this.depth=l,this.precision=this.depth/this.chunks.maxDepth,this.maxSplit=this.depth===this.chunks.maxDepth,this.splitted=!1,this.splitting=!1,this.unsplitting=!1,this.needsCheck=!0,this.terrainNeedsUpdate=!0,this.neighbours=new Map,this.children=new Map,this.ready=!1,this.final=!1,this.halfSize=r*.5,this.quarterSize=this.halfSize*.5,this.bounding={xMin:this.x-this.halfSize,xMax:this.x+this.halfSize,zMin:this.z-this.halfSize,zMax:this.z+this.halfSize},this.events=new pn,this.check(),this.splitted||this.createFinal(),this.testReady()}check(){if(!this.needsCheck)return;this.needsCheck=!1,this.chunks.underSplitDistance(this.size,this.x,this.z)?!this.maxSplit&&!this.splitted&&this.split():this.splitted&&this.unsplit();for(const[e,n]of this.children)n.check()}update(){this.final&&this.terrainNeedsUpdate&&this.neighbours.size===4&&(this.createTerrain(),this.terrainNeedsUpdate=!1);for(const[t,e]of this.children)e.update()}setNeighbours(t,e,n,i){this.neighbours.set("n",t),this.neighbours.set("e",e),this.neighbours.set("s",n),this.neighbours.set("w",i)}testReady(){if(this.splitted){let t=0;for(const[e,n]of this.children)n.ready&&t++;t===4&&this.setReady()}else this.terrain&&this.terrain.ready&&this.setReady()}setReady(){if(!this.ready){if(this.ready=!0,this.splitting&&(this.splitting=!1,this.destroyFinal()),this.unsplitting){this.unsplitting=!1;for(const[t,e]of this.children)e.destroy();this.children.clear()}this.events.emit("ready")}}unsetReady(){this.ready&&(this.ready=!1,this.events.emit("unready"))}split(){this.splitting=!0,this.splitted=!0,this.unsetReady();const t=this.chunks.create(this,"ne",this.halfSize,this.x+this.quarterSize,this.z-this.quarterSize,this.depth+1);this.children.set("ne",t);const e=this.chunks.create(this,"nw",this.halfSize,this.x-this.quarterSize,this.z-this.quarterSize,this.depth+1);this.children.set("nw",e);const n=this.chunks.create(this,"sw",this.halfSize,this.x-this.quarterSize,this.z+this.quarterSize,this.depth+1);this.children.set("sw",n);const i=this.chunks.create(this,"se",this.halfSize,this.x+this.quarterSize,this.z+this.quarterSize,this.depth+1);this.children.set("se",i);for(const[r,o]of this.children)o.events.on("ready",()=>{this.testReady()})}unsplit(){this.splitted&&(this.splitted=!1,this.unsplitting=!0,this.unsetReady(),this.createFinal())}createTerrain(){this.destroyTerrain(),this.terrain=this.state.terrains.create(this.size,this.x,this.z,this.precision),this.terrain.events.on("ready",()=>{this.testReady()})}destroyTerrain(){this.terrain&&this.state.terrains.destroyTerrain(this.terrain.id)}createFinal(){this.final||(this.final=!0,this.terrainNeedsUpdate=!0)}destroyFinal(){this.final&&(this.final=!1,this.terrainNeedsUpdate=!1,this.destroyTerrain())}destroy(){for(const[t,e]of this.children)e.off("ready");if(this.splitted)this.unsplit();else if(this.unsplitting){for(const[t,e]of this.children)e.destroy();this.children.clear()}this.destroyFinal(),this.events.emit("destroy")}isInside(t,e){return t>this.bounding.xMin&&t<this.bounding.xMax&&e>this.bounding.zMin&&e<this.bounding.zMax}getChildChunkForPosition(t,e){if(!this.splitted)return this;for(const[n,i]of this.children)if(i.isInside(t,e))return i.getChildChunkForPosition(t,e);return!1}},Ec=class{constructor(){this.state=Ot.getInstance(),this.minSize=64,this.maxDepth=4,this.maxSize=this.minSize*Math.pow(2,this.maxDepth),this.splitRatioPerSize=1.3,this.lastId=0,this.events=new pn,this.mainChunks=new Map,this.allChunks=new Map,this.playerChunkKey=null,this.check()}check(){for(const[e,n]of this.allChunks)n.needsCheck=!0;const t=this.getMainChunksCoordinates();for(const[e,n]of this.mainChunks)t.find(i=>i.key===e)||(n.destroy(),this.mainChunks.delete(e));for(const e of t)if(!this.mainChunks.has(e.key)){const n=this.create(null,null,this.maxSize,e.x,e.z,0);this.mainChunks.set(e.key,n)}for(const[e,n]of this.mainChunks)n.check();this.updateAllNeighbours()}update(){const t=this.state.player,e=`${Math.round(t.position.current[0]/this.minSize*2+.5)}${Math.round(t.position.current[2]/this.minSize*2+.5)}`;e!==this.playerChunkKey&&(this.playerChunkKey=e,this.check());for(const[n,i]of this.mainChunks)i.update()}create(t,e,n,i,r,o){const a=this.lastId++,l=new Cc(a,this,t,e,n,i,r,o);return this.allChunks.set(a,l),this.events.emit("create",l),l}updateAllNeighbours(){for(const[e,n]of this.mainChunks){const i=e.split(","),r=parseFloat(i[0]),o=parseFloat(i[1]),a=`${r},${o-1}`,l=`${r+1},${o}`,c=`${r},${o+1}`,h=`${r-1},${o}`,u=this.mainChunks.get(a)??!1,d=this.mainChunks.get(l)??!1,f=this.mainChunks.get(c)??!1,v=this.mainChunks.get(h)??!1;n.setNeighbours(u,d,f,v)}const t=[...this.allChunks.values()].filter(e=>e.depth>0).sort((e,n)=>e.depth-n.depth);for(const e of t){let n=!1,i=!1,r=!1,o=!1;if(e.quadPosition==="sw")n=e.parent.children.get("nw");else if(e.quadPosition==="se")n=e.parent.children.get("ne");else{const a=e.parent.neighbours.get("n");a&&(a.splitted?n=a.children.get(e.quadPosition==="nw"?"sw":"se"):n=a)}if(e.quadPosition==="nw")i=e.parent.children.get("ne");else if(e.quadPosition==="sw")i=e.parent.children.get("se");else{const a=e.parent.neighbours.get("e");a&&(a.splitted?i=a.children.get(e.quadPosition==="ne"?"nw":"sw"):i=a)}if(e.quadPosition==="nw")r=e.parent.children.get("sw");else if(e.quadPosition==="ne")r=e.parent.children.get("se");else{const a=e.parent.neighbours.get("s");a&&(a.splitted?r=a.children.get(e.quadPosition==="sw"?"nw":"ne"):r=a)}if(e.quadPosition==="ne")o=e.parent.children.get("nw");else if(e.quadPosition==="se")o=e.parent.children.get("sw");else{const a=e.parent.neighbours.get("w");a&&(a.splitted?o=a.children.get(e.quadPosition==="nw"?"ne":"se"):o=a)}e.setNeighbours(n,i,r,o)}}getMainChunksCoordinates(){const t=this.state.player,e=Math.round(t.position.current[0]/this.maxSize),n=Math.round(t.position.current[2]/this.maxSize),i=[{x:e,z:n},{x:e,z:n+1},{x:e+1,z:n+1},{x:e+1,z:n},{x:e+1,z:n-1},{x:e,z:n-1},{x:e-1,z:n-1},{x:e-1,z:n},{x:e-1,z:n+1}];for(const r of i)r.coordinatesX=r.x,r.coordinatesZ=r.z,r.key=`${r.x},${r.z}`,r.x*=this.maxSize,r.z*=this.maxSize;return i}underSplitDistance(t,e,n){const i=this.state.player;return Math.hypot(i.position.current[0]-e,i.position.current[2]-n)<t*this.splitRatioPerSize}getChildChunkForPosition(t,e){for(const[n,i]of this.mainChunks)if(i.isInside(t,e))return i}getDeepestChunkForPosition(t,e){const n=this.getChildChunkForPosition(t,e);return n?n.getChildChunkForPosition(t,e):!1}getElevationForPosition(t,e){const n=this.getDeepestChunkForPosition(t,e);return!n||!n.terrain?!1:n.terrain.getElevationForPosition(t,e)}};const ni=class{static getInstance(){return ni.instance}constructor(){if(ni.instance)return ni.instance;ni.instance=this,this.time=new Cl,this.controls=new Il,this.viewport=new Nl,this.day=new Ol,this.sun=new Fl,this.player=new ac,this.terrains=new Tc,this.chunks=new Ec}resize(){this.viewport.resize()}update(){this.time.update(),this.controls.update(),this.day.update(),this.sun.update(),this.player.update(),this.chunks.update()}};let Ot=ni;Oe(Ot,"instance");/**
 * @license
 * Copyright 2010-2023 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Er="149",Pc=0,Yr=1,zc=2,Po=1,Lc=2,Mi=3,mn=0,ye=1,un=2,fn=0,Ln=1,gr=2,jr=3,vr=4,Rc=5,Qn=100,kc=101,Dc=102,Kr=103,Qr=104,Ic=200,Nc=201,Oc=202,Fc=203,zo=204,Lo=205,Bc=206,Uc=207,Hc=208,Gc=209,Jc=210,Vc=0,Zc=1,Wc=2,Ar=3,Xc=4,qc=5,Yc=6,jc=7,Ro=0,Kc=1,Qc=2,sn=0,$c=1,th=2,eh=3,nh=4,ih=5,Pr=300,oi=301,li=302,xr=303,Sr=304,fs=306,Ei=1e3,Ee=1001,yr=1002,re=1003,$r=1004,ws=1005,Se=1006,sh=1007,Pi=1008,Dn=1009,rh=1010,ah=1011,ko=1012,oh=1013,Pn=1014,dn=1015,zi=1016,lh=1017,ch=1018,ai=1020,hh=1021,Ie=1023,uh=1024,dh=1025,Rn=1026,ci=1027,fh=1028,ph=1029,mh=1030,gh=1031,vh=1033,bs=33776,_s=33777,Ts=33778,Cs=33779,ta=35840,ea=35841,na=35842,ia=35843,Ah=36196,sa=37492,ra=37496,aa=37808,oa=37809,la=37810,ca=37811,ha=37812,ua=37813,da=37814,fa=37815,pa=37816,ma=37817,ga=37818,va=37819,Aa=37820,xa=37821,Es=36492,xh=36283,Sa=36284,ya=36285,Ma=36286,In=3e3,Ft=3001,Sh=3200,yh=3201,Mh=0,wh=1,Je="srgb",Li="srgb-linear",Ps=7680,bh=519,wa=35044,ba="300 es",Mr=1035;class ui{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;const n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;const i=this._listeners[t];if(i!==void 0){const r=i.indexOf(e);r!==-1&&i.splice(r,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const n=this._listeners[t.type];if(n!==void 0){t.target=this;const i=n.slice(0);for(let r=0,o=i.length;r<o;r++)i[r].call(this,t);t.target=null}}}const he=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],zs=Math.PI/180,_a=180/Math.PI;function Ri(){const s=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(he[s&255]+he[s>>8&255]+he[s>>16&255]+he[s>>24&255]+"-"+he[t&255]+he[t>>8&255]+"-"+he[t>>16&15|64]+he[t>>24&255]+"-"+he[e&63|128]+he[e>>8&255]+"-"+he[e>>16&255]+he[e>>24&255]+he[n&255]+he[n>>8&255]+he[n>>16&255]+he[n>>24&255]).toLowerCase()}function ue(s,t,e){return Math.max(t,Math.min(e,s))}function _h(s,t){return(s%t+t)%t}function Ls(s,t,e){return(1-e)*s+e*t}function Ta(s){return(s&s-1)===0&&s!==0}function wr(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function Oi(s,t){switch(t.constructor){case Float32Array:return s;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function _e(s,t){switch(t.constructor){case Float32Array:return s;case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}class lt{constructor(t=0,e=0){lt.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,i=t.elements;return this.x=i[0]*e+i[3]*n+i[6],this.y=i[1]*e+i[4]*n+i[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=this.x<0?Math.ceil(this.x):Math.floor(this.x),this.y=this.y<0?Math.ceil(this.y):Math.floor(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),i=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*n-o*i+t.x,this.y=r*i+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Pe{constructor(){Pe.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1]}set(t,e,n,i,r,o,a,l,c){const h=this.elements;return h[0]=t,h[1]=i,h[2]=a,h[3]=e,h[4]=r,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,i=e.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],f=n[5],v=n[8],m=i[0],p=i[3],g=i[6],y=i[1],x=i[4],w=i[7],M=i[2],C=i[5],z=i[8];return r[0]=o*m+a*y+l*M,r[3]=o*p+a*x+l*C,r[6]=o*g+a*w+l*z,r[1]=c*m+h*y+u*M,r[4]=c*p+h*x+u*C,r[7]=c*g+h*w+u*z,r[2]=d*m+f*y+v*M,r[5]=d*p+f*x+v*C,r[8]=d*g+f*w+v*z,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8];return e*o*h-e*a*c-n*r*h+n*a*l+i*r*c-i*o*l}invert(){const t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],u=h*o-a*c,d=a*l-h*r,f=c*r-o*l,v=e*u+n*d+i*f;if(v===0)return this.set(0,0,0,0,0,0,0,0,0);const m=1/v;return t[0]=u*m,t[1]=(i*c-h*n)*m,t[2]=(a*n-i*o)*m,t[3]=d*m,t[4]=(h*e-i*l)*m,t[5]=(i*r-a*e)*m,t[6]=f*m,t[7]=(n*l-c*e)*m,t[8]=(o*e-n*r)*m,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,i,r,o,a){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+t,-i*c,i*l,-i*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return this.premultiply(Rs.makeScale(t,e)),this}rotate(t){return this.premultiply(Rs.makeRotation(-t)),this}translate(t,e){return this.premultiply(Rs.makeTranslation(t,e)),this}makeTranslation(t,e){return this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let i=0;i<9;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const Rs=new Pe;function Do(s){for(let t=s.length-1;t>=0;--t)if(s[t]>=65535)return!0;return!1}function us(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function kn(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function os(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}const ks={[Je]:{[Li]:kn},[Li]:{[Je]:os}},ge={legacyMode:!0,get workingColorSpace(){return Li},set workingColorSpace(s){console.warn("THREE.ColorManagement: .workingColorSpace is readonly.")},convert:function(s,t,e){if(this.legacyMode||t===e||!t||!e)return s;if(ks[t]&&ks[t][e]!==void 0){const n=ks[t][e];return s.r=n(s.r),s.g=n(s.g),s.b=n(s.b),s}throw new Error("Unsupported color space conversion.")},fromWorkingColorSpace:function(s,t){return this.convert(s,this.workingColorSpace,t)},toWorkingColorSpace:function(s,t){return this.convert(s,t,this.workingColorSpace)}},Io={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},qt={r:0,g:0,b:0},Fe={h:0,s:0,l:0},Fi={h:0,s:0,l:0};function Ds(s,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?s+(t-s)*6*e:e<1/2?t:e<2/3?s+(t-s)*6*(2/3-e):s}function Bi(s,t){return t.r=s.r,t.g=s.g,t.b=s.b,t}class _t{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,e===void 0&&n===void 0?this.set(t):this.setRGB(t,e,n)}set(t){return t&&t.isColor?this.copy(t):typeof t=="number"?this.setHex(t):typeof t=="string"&&this.setStyle(t),this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Je){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,ge.toWorkingColorSpace(this,e),this}setRGB(t,e,n,i=ge.workingColorSpace){return this.r=t,this.g=e,this.b=n,ge.toWorkingColorSpace(this,i),this}setHSL(t,e,n,i=ge.workingColorSpace){if(t=_h(t,1),e=ue(e,0,1),n=ue(n,0,1),e===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+e):n+e-n*e,o=2*n-r;this.r=Ds(o,r,t+1/3),this.g=Ds(o,r,t),this.b=Ds(o,r,t-1/3)}return ge.toWorkingColorSpace(this,i),this}setStyle(t,e=Je){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let i;if(i=/^((?:rgb|hsl)a?)\(([^\)]*)\)/.exec(t)){let r;const o=i[1],a=i[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return this.r=Math.min(255,parseInt(r[1],10))/255,this.g=Math.min(255,parseInt(r[2],10))/255,this.b=Math.min(255,parseInt(r[3],10))/255,ge.toWorkingColorSpace(this,e),n(r[4]),this;if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return this.r=Math.min(100,parseInt(r[1],10))/100,this.g=Math.min(100,parseInt(r[2],10))/100,this.b=Math.min(100,parseInt(r[3],10))/100,ge.toWorkingColorSpace(this,e),n(r[4]),this;break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a)){const l=parseFloat(r[1])/360,c=parseFloat(r[2])/100,h=parseFloat(r[3])/100;return n(r[4]),this.setHSL(l,c,h,e)}break}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=i[1],o=r.length;if(o===3)return this.r=parseInt(r.charAt(0)+r.charAt(0),16)/255,this.g=parseInt(r.charAt(1)+r.charAt(1),16)/255,this.b=parseInt(r.charAt(2)+r.charAt(2),16)/255,ge.toWorkingColorSpace(this,e),this;if(o===6)return this.r=parseInt(r.charAt(0)+r.charAt(1),16)/255,this.g=parseInt(r.charAt(2)+r.charAt(3),16)/255,this.b=parseInt(r.charAt(4)+r.charAt(5),16)/255,ge.toWorkingColorSpace(this,e),this}return t&&t.length>0?this.setColorName(t,e):this}setColorName(t,e=Je){const n=Io[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=kn(t.r),this.g=kn(t.g),this.b=kn(t.b),this}copyLinearToSRGB(t){return this.r=os(t.r),this.g=os(t.g),this.b=os(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Je){return ge.fromWorkingColorSpace(Bi(this,qt),t),ue(qt.r*255,0,255)<<16^ue(qt.g*255,0,255)<<8^ue(qt.b*255,0,255)<<0}getHexString(t=Je){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=ge.workingColorSpace){ge.fromWorkingColorSpace(Bi(this,qt),e);const n=qt.r,i=qt.g,r=qt.b,o=Math.max(n,i,r),a=Math.min(n,i,r);let l,c;const h=(a+o)/2;if(a===o)l=0,c=0;else{const u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case n:l=(i-r)/u+(i<r?6:0);break;case i:l=(r-n)/u+2;break;case r:l=(n-i)/u+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=ge.workingColorSpace){return ge.fromWorkingColorSpace(Bi(this,qt),e),t.r=qt.r,t.g=qt.g,t.b=qt.b,t}getStyle(t=Je){return ge.fromWorkingColorSpace(Bi(this,qt),t),t!==Je?`color(${t} ${qt.r} ${qt.g} ${qt.b})`:`rgb(${qt.r*255|0},${qt.g*255|0},${qt.b*255|0})`}offsetHSL(t,e,n){return this.getHSL(Fe),Fe.h+=t,Fe.s+=e,Fe.l+=n,this.setHSL(Fe.h,Fe.s,Fe.l),this}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Fe),t.getHSL(Fi);const n=Ls(Fe.h,Fi.h,e),i=Ls(Fe.s,Fi.s,e),r=Ls(Fe.l,Fi.l,e);return this.setHSL(n,i,r),this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}_t.NAMES=Io;let Fn;class No{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{Fn===void 0&&(Fn=us("canvas")),Fn.width=t.width,Fn.height=t.height;const n=Fn.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=Fn}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=us("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const i=n.getImageData(0,0,t.width,t.height),r=i.data;for(let o=0;o<r.length;o++)r[o]=kn(r[o]/255)*255;return n.putImageData(i,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(kn(e[n]/255)*255):e[n]=kn(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}class Oo{constructor(t=null){this.isSource=!0,this.uuid=Ri(),this.data=t,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let o=0,a=i.length;o<a;o++)i[o].isDataTexture?r.push(Is(i[o].image)):r.push(Is(i[o]))}else r=Is(i);n.url=r}return e||(t.images[this.uuid]=n),n}}function Is(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?No.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Th=0;class de extends ui{constructor(t=de.DEFAULT_IMAGE,e=de.DEFAULT_MAPPING,n=Ee,i=Ee,r=Se,o=Pi,a=Ie,l=Dn,c=de.DEFAULT_ANISOTROPY,h=In){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Th++}),this.uuid=Ri(),this.name="",this.source=new Oo(t),this.mipmaps=[],this.mapping=e,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new lt(0,0),this.repeat=new lt(1,1),this.center=new lt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Pe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.encoding=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.encoding=t.encoding,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.5,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,type:this.type,encoding:this.encoding,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Pr)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Ei:t.x=t.x-Math.floor(t.x);break;case Ee:t.x=t.x<0?0:1;break;case yr:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Ei:t.y=t.y-Math.floor(t.y);break;case Ee:t.y=t.y<0?0:1;break;case yr:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}}de.DEFAULT_IMAGE=null;de.DEFAULT_MAPPING=Pr;de.DEFAULT_ANISOTROPY=1;class ae{constructor(t=0,e=0,n=0,i=1){ae.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=i}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,i){return this.x=t,this.y=e,this.z=n,this.w=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,i=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*i+o[12]*r,this.y=o[1]*e+o[5]*n+o[9]*i+o[13]*r,this.z=o[2]*e+o[6]*n+o[10]*i+o[14]*r,this.w=o[3]*e+o[7]*n+o[11]*i+o[15]*r,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,i,r;const l=t.elements,c=l[0],h=l[4],u=l[8],d=l[1],f=l[5],v=l[9],m=l[2],p=l[6],g=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-m)<.01&&Math.abs(v-p)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+m)<.1&&Math.abs(v+p)<.1&&Math.abs(c+f+g-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const x=(c+1)/2,w=(f+1)/2,M=(g+1)/2,C=(h+d)/4,z=(u+m)/4,A=(v+p)/4;return x>w&&x>M?x<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(x),i=C/n,r=z/n):w>M?w<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(w),n=C/i,r=A/i):M<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(M),n=z/r,i=A/r),this.set(n,i,r,e),this}let y=Math.sqrt((p-v)*(p-v)+(u-m)*(u-m)+(d-h)*(d-h));return Math.abs(y)<.001&&(y=1),this.x=(p-v)/y,this.y=(u-m)/y,this.z=(d-h)/y,this.w=Math.acos((c+f+g-1)/2),this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=this.x<0?Math.ceil(this.x):Math.floor(this.x),this.y=this.y<0?Math.ceil(this.y):Math.floor(this.y),this.z=this.z<0?Math.ceil(this.z):Math.floor(this.z),this.w=this.w<0?Math.ceil(this.w):Math.floor(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class rn extends ui{constructor(t=1,e=1,n={}){super(),this.isWebGLRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new ae(0,0,t,e),this.scissorTest=!1,this.viewport=new ae(0,0,t,e);const i={width:t,height:e,depth:1};this.texture=new de(i,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.encoding),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=n.generateMipmaps!==void 0?n.generateMipmaps:!1,this.texture.internalFormat=n.internalFormat!==void 0?n.internalFormat:null,this.texture.minFilter=n.minFilter!==void 0?n.minFilter:Se,this.depthBuffer=n.depthBuffer!==void 0?n.depthBuffer:!0,this.stencilBuffer=n.stencilBuffer!==void 0?n.stencilBuffer:!1,this.depthTexture=n.depthTexture!==void 0?n.depthTexture:null,this.samples=n.samples!==void 0?n.samples:0}setSize(t,e,n=1){(this.width!==t||this.height!==e||this.depth!==n)&&(this.width=t,this.height=e,this.depth=n,this.texture.image.width=t,this.texture.image.height=e,this.texture.image.depth=n,this.dispose()),this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.viewport.copy(t.viewport),this.texture=t.texture.clone(),this.texture.isRenderTargetTexture=!0;const e=Object.assign({},t.texture.image);return this.texture.source=new Oo(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Fo extends de{constructor(t=null,e=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=re,this.minFilter=re,this.wrapR=Ee,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Ch extends de{constructor(t=null,e=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=re,this.minFilter=re,this.wrapR=Ee,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class ki{constructor(t=0,e=0,n=0,i=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=i}static slerpFlat(t,e,n,i,r,o,a){let l=n[i+0],c=n[i+1],h=n[i+2],u=n[i+3];const d=r[o+0],f=r[o+1],v=r[o+2],m=r[o+3];if(a===0){t[e+0]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u;return}if(a===1){t[e+0]=d,t[e+1]=f,t[e+2]=v,t[e+3]=m;return}if(u!==m||l!==d||c!==f||h!==v){let p=1-a;const g=l*d+c*f+h*v+u*m,y=g>=0?1:-1,x=1-g*g;if(x>Number.EPSILON){const M=Math.sqrt(x),C=Math.atan2(M,g*y);p=Math.sin(p*C)/M,a=Math.sin(a*C)/M}const w=a*y;if(l=l*p+d*w,c=c*p+f*w,h=h*p+v*w,u=u*p+m*w,p===1-a){const M=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=M,c*=M,h*=M,u*=M}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,n,i,r,o){const a=n[i],l=n[i+1],c=n[i+2],h=n[i+3],u=r[o],d=r[o+1],f=r[o+2],v=r[o+3];return t[e]=a*v+h*u+l*f-c*d,t[e+1]=l*v+h*d+c*u-a*f,t[e+2]=c*v+h*f+a*d-l*u,t[e+3]=h*v-a*u-l*d-c*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,i){return this._x=t,this._y=e,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e){const n=t._x,i=t._y,r=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(i/2),u=a(r/2),d=l(n/2),f=l(i/2),v=l(r/2);switch(o){case"XYZ":this._x=d*h*u+c*f*v,this._y=c*f*u-d*h*v,this._z=c*h*v+d*f*u,this._w=c*h*u-d*f*v;break;case"YXZ":this._x=d*h*u+c*f*v,this._y=c*f*u-d*h*v,this._z=c*h*v-d*f*u,this._w=c*h*u+d*f*v;break;case"ZXY":this._x=d*h*u-c*f*v,this._y=c*f*u+d*h*v,this._z=c*h*v+d*f*u,this._w=c*h*u-d*f*v;break;case"ZYX":this._x=d*h*u-c*f*v,this._y=c*f*u+d*h*v,this._z=c*h*v-d*f*u,this._w=c*h*u+d*f*v;break;case"YZX":this._x=d*h*u+c*f*v,this._y=c*f*u+d*h*v,this._z=c*h*v-d*f*u,this._w=c*h*u-d*f*v;break;case"XZY":this._x=d*h*u-c*f*v,this._y=c*f*u-d*h*v,this._z=c*h*v+d*f*u,this._w=c*h*u+d*f*v;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e!==!1&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,i=Math.sin(n);return this._x=t.x*i,this._y=t.y*i,this._z=t.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],i=e[4],r=e[8],o=e[1],a=e[5],l=e[9],c=e[2],h=e[6],u=e[10],d=n+a+u;if(d>0){const f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(o-i)*f}else if(n>a&&n>u){const f=2*Math.sqrt(1+n-a-u);this._w=(h-l)/f,this._x=.25*f,this._y=(i+o)/f,this._z=(r+c)/f}else if(a>u){const f=2*Math.sqrt(1+a-n-u);this._w=(r-c)/f,this._x=(i+o)/f,this._y=.25*f,this._z=(l+h)/f}else{const f=2*Math.sqrt(1+u-n-a);this._w=(o-i)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(ue(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const i=Math.min(1,e/n);return this.slerp(t,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,i=t._y,r=t._z,o=t._w,a=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+o*a+i*c-r*l,this._y=i*h+o*l+r*a-n*c,this._z=r*h+o*c+n*l-i*a,this._w=o*h-n*a-i*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const n=this._x,i=this._y,r=this._z,o=this._w;let a=o*t._w+n*t._x+i*t._y+r*t._z;if(a<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,a=-a):this.copy(t),a>=1)return this._w=o,this._x=n,this._y=i,this._z=r,this;const l=1-a*a;if(l<=Number.EPSILON){const f=1-e;return this._w=f*o+e*this._w,this._x=f*n+e*this._x,this._y=f*i+e*this._y,this._z=f*r+e*this._z,this.normalize(),this._onChangeCallback(),this}const c=Math.sqrt(l),h=Math.atan2(c,a),u=Math.sin((1-e)*h)/c,d=Math.sin(e*h)/c;return this._w=o*u+this._w*d,this._x=n*u+this._x*d,this._y=i*u+this._y*d,this._z=r*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=Math.random(),e=Math.sqrt(1-t),n=Math.sqrt(t),i=2*Math.PI*Math.random(),r=2*Math.PI*Math.random();return this.set(e*Math.cos(i),n*Math.sin(r),n*Math.cos(r),e*Math.sin(i))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class P{constructor(t=0,e=0,n=0){P.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Ca.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Ca.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,i=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*i,this.y=r[1]*e+r[4]*n+r[7]*i,this.z=r[2]*e+r[5]*n+r[8]*i,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,i=this.z,r=t.elements,o=1/(r[3]*e+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*i+r[12])*o,this.y=(r[1]*e+r[5]*n+r[9]*i+r[13])*o,this.z=(r[2]*e+r[6]*n+r[10]*i+r[14])*o,this}applyQuaternion(t){const e=this.x,n=this.y,i=this.z,r=t.x,o=t.y,a=t.z,l=t.w,c=l*e+o*i-a*n,h=l*n+a*e-r*i,u=l*i+r*n-o*e,d=-r*e-o*n-a*i;return this.x=c*l+d*-r+h*-a-u*-o,this.y=h*l+d*-o+u*-r-c*-a,this.z=u*l+d*-a+c*-o-h*-r,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,i=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*i,this.y=r[1]*e+r[5]*n+r[9]*i,this.z=r[2]*e+r[6]*n+r[10]*i,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=this.x<0?Math.ceil(this.x):Math.floor(this.x),this.y=this.y<0?Math.ceil(this.y):Math.floor(this.y),this.z=this.z<0?Math.ceil(this.z):Math.floor(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,i=t.y,r=t.z,o=e.x,a=e.y,l=e.z;return this.x=i*l-r*a,this.y=r*o-n*l,this.z=n*a-i*o,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Ns.copy(this).projectOnVector(t),this.sub(Ns)}reflect(t){return this.sub(Ns.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(ue(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,i=this.z-t.z;return e*e+n*n+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const i=Math.sin(e)*t;return this.x=i*Math.sin(n),this.y=Math.cos(e)*t,this.z=i*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),i=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=i,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=(Math.random()-.5)*2,e=Math.random()*Math.PI*2,n=Math.sqrt(1-t**2);return this.x=n*Math.cos(e),this.y=n*Math.sin(e),this.z=t,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Ns=new P,Ca=new ki;class Di{constructor(t=new P(1/0,1/0,1/0),e=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){let e=1/0,n=1/0,i=1/0,r=-1/0,o=-1/0,a=-1/0;for(let l=0,c=t.length;l<c;l+=3){const h=t[l],u=t[l+1],d=t[l+2];h<e&&(e=h),u<n&&(n=u),d<i&&(i=d),h>r&&(r=h),u>o&&(o=u),d>a&&(a=d)}return this.min.set(e,n,i),this.max.set(r,o,a),this}setFromBufferAttribute(t){let e=1/0,n=1/0,i=1/0,r=-1/0,o=-1/0,a=-1/0;for(let l=0,c=t.count;l<c;l++){const h=t.getX(l),u=t.getY(l),d=t.getZ(l);h<e&&(e=h),u<n&&(n=u),d<i&&(i=d),h>r&&(r=h),u>o&&(o=u),d>a&&(a=d)}return this.min.set(e,n,i),this.max.set(r,o,a),this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=Mn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0)if(e&&n.attributes!=null&&n.attributes.position!==void 0){const r=n.attributes.position;for(let o=0,a=r.count;o<a;o++)Mn.fromBufferAttribute(r,o).applyMatrix4(t.matrixWorld),this.expandByPoint(Mn)}else n.boundingBox===null&&n.computeBoundingBox(),Os.copy(n.boundingBox),Os.applyMatrix4(t.matrixWorld),this.union(Os);const i=t.children;for(let r=0,o=i.length;r<o;r++)this.expandByObject(i[r],e);return this}containsPoint(t){return!(t.x<this.min.x||t.x>this.max.x||t.y<this.min.y||t.y>this.max.y||t.z<this.min.z||t.z>this.max.z)}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return!(t.max.x<this.min.x||t.min.x>this.max.x||t.max.y<this.min.y||t.min.y>this.max.y||t.max.z<this.min.z||t.min.z>this.max.z)}intersectsSphere(t){return this.clampPoint(t.center,Mn),Mn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(mi),Ui.subVectors(this.max,mi),Bn.subVectors(t.a,mi),Un.subVectors(t.b,mi),Hn.subVectors(t.c,mi),an.subVectors(Un,Bn),on.subVectors(Hn,Un),wn.subVectors(Bn,Hn);let e=[0,-an.z,an.y,0,-on.z,on.y,0,-wn.z,wn.y,an.z,0,-an.x,on.z,0,-on.x,wn.z,0,-wn.x,-an.y,an.x,0,-on.y,on.x,0,-wn.y,wn.x,0];return!Fs(e,Bn,Un,Hn,Ui)||(e=[1,0,0,0,1,0,0,0,1],!Fs(e,Bn,Un,Hn,Ui))?!1:(Hi.crossVectors(an,on),e=[Hi.x,Hi.y,Hi.z],Fs(e,Bn,Un,Hn,Ui))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return Mn.copy(t).clamp(this.min,this.max).sub(t).length()}getBoundingSphere(t){return this.getCenter(t.center),t.radius=this.getSize(Mn).length()*.5,t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(je[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),je[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),je[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),je[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),je[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),je[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),je[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),je[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(je),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const je=[new P,new P,new P,new P,new P,new P,new P,new P],Mn=new P,Os=new Di,Bn=new P,Un=new P,Hn=new P,an=new P,on=new P,wn=new P,mi=new P,Ui=new P,Hi=new P,bn=new P;function Fs(s,t,e,n,i){for(let r=0,o=s.length-3;r<=o;r+=3){bn.fromArray(s,r);const a=i.x*Math.abs(bn.x)+i.y*Math.abs(bn.y)+i.z*Math.abs(bn.z),l=t.dot(bn),c=e.dot(bn),h=n.dot(bn);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}const Eh=new Di,gi=new P,Bs=new P;class ps{constructor(t=new P,e=-1){this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):Eh.setFromPoints(t).getCenter(n);let i=0;for(let r=0,o=t.length;r<o;r++)i=Math.max(i,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(i),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;gi.subVectors(t,this.center);const e=gi.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),i=(n-this.radius)*.5;this.center.addScaledVector(gi,i/n),this.radius+=i}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Bs.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(gi.copy(t.center).add(Bs)),this.expandByPoint(gi.copy(t.center).sub(Bs))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Ke=new P,Us=new P,Gi=new P,ln=new P,Hs=new P,Ji=new P,Gs=new P;class Bo{constructor(t=new P,e=new P(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.direction).multiplyScalar(t).add(this.origin)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Ke)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.direction).multiplyScalar(n).add(this.origin)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=Ke.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Ke.copy(this.direction).multiplyScalar(e).add(this.origin),Ke.distanceToSquared(t))}distanceSqToSegment(t,e,n,i){Us.copy(t).add(e).multiplyScalar(.5),Gi.copy(e).sub(t).normalize(),ln.copy(this.origin).sub(Us);const r=t.distanceTo(e)*.5,o=-this.direction.dot(Gi),a=ln.dot(this.direction),l=-ln.dot(Gi),c=ln.lengthSq(),h=Math.abs(1-o*o);let u,d,f,v;if(h>0)if(u=o*l-a,d=o*a-l,v=r*h,u>=0)if(d>=-v)if(d<=v){const m=1/h;u*=m,d*=m,f=u*(u+o*d+2*a)+d*(o*u+d+2*l)+c}else d=r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d<=-v?(u=Math.max(0,-(-o*r+a)),d=u>0?-r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c):d<=v?(u=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(u=Math.max(0,-(o*r+a)),d=u>0?r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c);else d=o>0?-r:r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;return n&&n.copy(this.direction).multiplyScalar(u).add(this.origin),i&&i.copy(Gi).multiplyScalar(d).add(Us),f}intersectSphere(t,e){Ke.subVectors(t.center,this.origin);const n=Ke.dot(this.direction),i=Ke.dot(Ke)-n*n,r=t.radius*t.radius;if(i>r)return null;const o=Math.sqrt(r-i),a=n-o,l=n+o;return a<0&&l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,i,r,o,a,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(t.min.x-d.x)*c,i=(t.max.x-d.x)*c):(n=(t.max.x-d.x)*c,i=(t.min.x-d.x)*c),h>=0?(r=(t.min.y-d.y)*h,o=(t.max.y-d.y)*h):(r=(t.max.y-d.y)*h,o=(t.min.y-d.y)*h),n>o||r>i||((r>n||isNaN(n))&&(n=r),(o<i||isNaN(i))&&(i=o),u>=0?(a=(t.min.z-d.z)*u,l=(t.max.z-d.z)*u):(a=(t.max.z-d.z)*u,l=(t.min.z-d.z)*u),n>l||a>i)||((a>n||n!==n)&&(n=a),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,e)}intersectsBox(t){return this.intersectBox(t,Ke)!==null}intersectTriangle(t,e,n,i,r){Hs.subVectors(e,t),Ji.subVectors(n,t),Gs.crossVectors(Hs,Ji);let o=this.direction.dot(Gs),a;if(o>0){if(i)return null;a=1}else if(o<0)a=-1,o=-o;else return null;ln.subVectors(this.origin,t);const l=a*this.direction.dot(Ji.crossVectors(ln,Ji));if(l<0)return null;const c=a*this.direction.dot(Hs.cross(ln));if(c<0||l+c>o)return null;const h=-a*ln.dot(Gs);return h<0?null:this.at(h/o,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class jt{constructor(){jt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]}set(t,e,n,i,r,o,a,l,c,h,u,d,f,v,m,p){const g=this.elements;return g[0]=t,g[4]=e,g[8]=n,g[12]=i,g[1]=r,g[5]=o,g[9]=a,g[13]=l,g[2]=c,g[6]=h,g[10]=u,g[14]=d,g[3]=f,g[7]=v,g[11]=m,g[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new jt().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,n=t.elements,i=1/Gn.setFromMatrixColumn(t,0).length(),r=1/Gn.setFromMatrixColumn(t,1).length(),o=1/Gn.setFromMatrixColumn(t,2).length();return e[0]=n[0]*i,e[1]=n[1]*i,e[2]=n[2]*i,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,i=t.y,r=t.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(i),c=Math.sin(i),h=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){const d=o*h,f=o*u,v=a*h,m=a*u;e[0]=l*h,e[4]=-l*u,e[8]=c,e[1]=f+v*c,e[5]=d-m*c,e[9]=-a*l,e[2]=m-d*c,e[6]=v+f*c,e[10]=o*l}else if(t.order==="YXZ"){const d=l*h,f=l*u,v=c*h,m=c*u;e[0]=d+m*a,e[4]=v*a-f,e[8]=o*c,e[1]=o*u,e[5]=o*h,e[9]=-a,e[2]=f*a-v,e[6]=m+d*a,e[10]=o*l}else if(t.order==="ZXY"){const d=l*h,f=l*u,v=c*h,m=c*u;e[0]=d-m*a,e[4]=-o*u,e[8]=v+f*a,e[1]=f+v*a,e[5]=o*h,e[9]=m-d*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){const d=o*h,f=o*u,v=a*h,m=a*u;e[0]=l*h,e[4]=v*c-f,e[8]=d*c+m,e[1]=l*u,e[5]=m*c+d,e[9]=f*c-v,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){const d=o*l,f=o*c,v=a*l,m=a*c;e[0]=l*h,e[4]=m-d*u,e[8]=v*u+f,e[1]=u,e[5]=o*h,e[9]=-a*h,e[2]=-c*h,e[6]=f*u+v,e[10]=d-m*u}else if(t.order==="XZY"){const d=o*l,f=o*c,v=a*l,m=a*c;e[0]=l*h,e[4]=-u,e[8]=c*h,e[1]=d*u+m,e[5]=o*h,e[9]=f*u-v,e[2]=v*u-f,e[6]=a*h,e[10]=m*u+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Ph,t,zh)}lookAt(t,e,n){const i=this.elements;return Te.subVectors(t,e),Te.lengthSq()===0&&(Te.z=1),Te.normalize(),cn.crossVectors(n,Te),cn.lengthSq()===0&&(Math.abs(n.z)===1?Te.x+=1e-4:Te.z+=1e-4,Te.normalize(),cn.crossVectors(n,Te)),cn.normalize(),Vi.crossVectors(Te,cn),i[0]=cn.x,i[4]=Vi.x,i[8]=Te.x,i[1]=cn.y,i[5]=Vi.y,i[9]=Te.y,i[2]=cn.z,i[6]=Vi.z,i[10]=Te.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,i=e.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],f=n[13],v=n[2],m=n[6],p=n[10],g=n[14],y=n[3],x=n[7],w=n[11],M=n[15],C=i[0],z=i[4],A=i[8],T=i[12],k=i[1],V=i[5],X=i[9],D=i[13],L=i[2],G=i[6],q=i[10],j=i[14],Z=i[3],$=i[7],Q=i[11],ct=i[15];return r[0]=o*C+a*k+l*L+c*Z,r[4]=o*z+a*V+l*G+c*$,r[8]=o*A+a*X+l*q+c*Q,r[12]=o*T+a*D+l*j+c*ct,r[1]=h*C+u*k+d*L+f*Z,r[5]=h*z+u*V+d*G+f*$,r[9]=h*A+u*X+d*q+f*Q,r[13]=h*T+u*D+d*j+f*ct,r[2]=v*C+m*k+p*L+g*Z,r[6]=v*z+m*V+p*G+g*$,r[10]=v*A+m*X+p*q+g*Q,r[14]=v*T+m*D+p*j+g*ct,r[3]=y*C+x*k+w*L+M*Z,r[7]=y*z+x*V+w*G+M*$,r[11]=y*A+x*X+w*q+M*Q,r[15]=y*T+x*D+w*j+M*ct,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],i=t[8],r=t[12],o=t[1],a=t[5],l=t[9],c=t[13],h=t[2],u=t[6],d=t[10],f=t[14],v=t[3],m=t[7],p=t[11],g=t[15];return v*(+r*l*u-i*c*u-r*a*d+n*c*d+i*a*f-n*l*f)+m*(+e*l*f-e*c*d+r*o*d-i*o*f+i*c*h-r*l*h)+p*(+e*c*u-e*a*f-r*o*u+n*o*f+r*a*h-n*c*h)+g*(-i*a*h-e*l*u+e*a*d+i*o*u-n*o*d+n*l*h)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const i=this.elements;return t.isVector3?(i[12]=t.x,i[13]=t.y,i[14]=t.z):(i[12]=t,i[13]=e,i[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],u=t[9],d=t[10],f=t[11],v=t[12],m=t[13],p=t[14],g=t[15],y=u*p*c-m*d*c+m*l*f-a*p*f-u*l*g+a*d*g,x=v*d*c-h*p*c-v*l*f+o*p*f+h*l*g-o*d*g,w=h*m*c-v*u*c+v*a*f-o*m*f-h*a*g+o*u*g,M=v*u*l-h*m*l-v*a*d+o*m*d+h*a*p-o*u*p,C=e*y+n*x+i*w+r*M;if(C===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const z=1/C;return t[0]=y*z,t[1]=(m*d*r-u*p*r-m*i*f+n*p*f+u*i*g-n*d*g)*z,t[2]=(a*p*r-m*l*r+m*i*c-n*p*c-a*i*g+n*l*g)*z,t[3]=(u*l*r-a*d*r-u*i*c+n*d*c+a*i*f-n*l*f)*z,t[4]=x*z,t[5]=(h*p*r-v*d*r+v*i*f-e*p*f-h*i*g+e*d*g)*z,t[6]=(v*l*r-o*p*r-v*i*c+e*p*c+o*i*g-e*l*g)*z,t[7]=(o*d*r-h*l*r+h*i*c-e*d*c-o*i*f+e*l*f)*z,t[8]=w*z,t[9]=(v*u*r-h*m*r-v*n*f+e*m*f+h*n*g-e*u*g)*z,t[10]=(o*m*r-v*a*r+v*n*c-e*m*c-o*n*g+e*a*g)*z,t[11]=(h*a*r-o*u*r-h*n*c+e*u*c+o*n*f-e*a*f)*z,t[12]=M*z,t[13]=(h*m*i-v*u*i+v*n*d-e*m*d-h*n*p+e*u*p)*z,t[14]=(v*a*i-o*m*i-v*n*l+e*m*l+o*n*p-e*a*p)*z,t[15]=(o*u*i-h*a*i+h*n*l-e*u*l-o*n*d+e*a*d)*z,this}scale(t){const e=this.elements,n=t.x,i=t.y,r=t.z;return e[0]*=n,e[4]*=i,e[8]*=r,e[1]*=n,e[5]*=i,e[9]*=r,e[2]*=n,e[6]*=i,e[10]*=r,e[3]*=n,e[7]*=i,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],i=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,i))}makeTranslation(t,e,n){return this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),i=Math.sin(e),r=1-n,o=t.x,a=t.y,l=t.z,c=r*o,h=r*a;return this.set(c*o+n,c*a-i*l,c*l+i*a,0,c*a+i*l,h*a+n,h*l-i*o,0,c*l-i*a,h*l+i*o,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,i,r,o){return this.set(1,n,r,0,t,1,o,0,e,i,1,0,0,0,0,1),this}compose(t,e,n){const i=this.elements,r=e._x,o=e._y,a=e._z,l=e._w,c=r+r,h=o+o,u=a+a,d=r*c,f=r*h,v=r*u,m=o*h,p=o*u,g=a*u,y=l*c,x=l*h,w=l*u,M=n.x,C=n.y,z=n.z;return i[0]=(1-(m+g))*M,i[1]=(f+w)*M,i[2]=(v-x)*M,i[3]=0,i[4]=(f-w)*C,i[5]=(1-(d+g))*C,i[6]=(p+y)*C,i[7]=0,i[8]=(v+x)*z,i[9]=(p-y)*z,i[10]=(1-(d+m))*z,i[11]=0,i[12]=t.x,i[13]=t.y,i[14]=t.z,i[15]=1,this}decompose(t,e,n){const i=this.elements;let r=Gn.set(i[0],i[1],i[2]).length();const o=Gn.set(i[4],i[5],i[6]).length(),a=Gn.set(i[8],i[9],i[10]).length();this.determinant()<0&&(r=-r),t.x=i[12],t.y=i[13],t.z=i[14],Be.copy(this);const c=1/r,h=1/o,u=1/a;return Be.elements[0]*=c,Be.elements[1]*=c,Be.elements[2]*=c,Be.elements[4]*=h,Be.elements[5]*=h,Be.elements[6]*=h,Be.elements[8]*=u,Be.elements[9]*=u,Be.elements[10]*=u,e.setFromRotationMatrix(Be),n.x=r,n.y=o,n.z=a,this}makePerspective(t,e,n,i,r,o){const a=this.elements,l=2*r/(e-t),c=2*r/(n-i),h=(e+t)/(e-t),u=(n+i)/(n-i),d=-(o+r)/(o-r),f=-2*o*r/(o-r);return a[0]=l,a[4]=0,a[8]=h,a[12]=0,a[1]=0,a[5]=c,a[9]=u,a[13]=0,a[2]=0,a[6]=0,a[10]=d,a[14]=f,a[3]=0,a[7]=0,a[11]=-1,a[15]=0,this}makeOrthographic(t,e,n,i,r,o){const a=this.elements,l=1/(e-t),c=1/(n-i),h=1/(o-r),u=(e+t)*l,d=(n+i)*c,f=(o+r)*h;return a[0]=2*l,a[4]=0,a[8]=0,a[12]=-u,a[1]=0,a[5]=2*c,a[9]=0,a[13]=-d,a[2]=0,a[6]=0,a[10]=-2*h,a[14]=-f,a[3]=0,a[7]=0,a[11]=0,a[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let i=0;i<16;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}}const Gn=new P,Be=new jt,Ph=new P(0,0,0),zh=new P(1,1,1),cn=new P,Vi=new P,Te=new P,Ea=new jt,Pa=new ki;class ms{constructor(t=0,e=0,n=0,i=ms.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=i}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,i=this._order){return this._x=t,this._y=e,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const i=t.elements,r=i[0],o=i[4],a=i[8],l=i[1],c=i[5],h=i[9],u=i[2],d=i[6],f=i[10];switch(e){case"XYZ":this._y=Math.asin(ue(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-ue(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(ue(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-ue(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(ue(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-ue(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Ea.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Ea,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Pa.setFromEuler(this),this.setFromQuaternion(Pa,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}ms.DEFAULT_ORDER="XYZ";class Uo{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let Lh=0;const za=new P,Jn=new ki,Qe=new jt,Zi=new P,vi=new P,Rh=new P,kh=new ki,La=new P(1,0,0),Ra=new P(0,1,0),ka=new P(0,0,1),Dh={type:"added"},Da={type:"removed"};class Me extends ui{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Lh++}),this.uuid=Ri(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Me.DEFAULT_UP.clone();const t=new P,e=new ms,n=new ki,i=new P(1,1,1);function r(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new jt},normalMatrix:{value:new Pe}}),this.matrix=new jt,this.matrixWorld=new jt,this.matrixAutoUpdate=Me.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.matrixWorldAutoUpdate=Me.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.layers=new Uo,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Jn.setFromAxisAngle(t,e),this.quaternion.multiply(Jn),this}rotateOnWorldAxis(t,e){return Jn.setFromAxisAngle(t,e),this.quaternion.premultiply(Jn),this}rotateX(t){return this.rotateOnAxis(La,t)}rotateY(t){return this.rotateOnAxis(Ra,t)}rotateZ(t){return this.rotateOnAxis(ka,t)}translateOnAxis(t,e){return za.copy(t).applyQuaternion(this.quaternion),this.position.add(za.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(La,t)}translateY(t){return this.translateOnAxis(Ra,t)}translateZ(t){return this.translateOnAxis(ka,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Qe.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Zi.copy(t):Zi.set(t,e,n);const i=this.parent;this.updateWorldMatrix(!0,!1),vi.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Qe.lookAt(vi,Zi,this.up):Qe.lookAt(Zi,vi,this.up),this.quaternion.setFromRotationMatrix(Qe),i&&(Qe.extractRotation(i.matrixWorld),Jn.setFromRotationMatrix(Qe),this.quaternion.premultiply(Jn.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.parent!==null&&t.parent.remove(t),t.parent=this,this.children.push(t),t.dispatchEvent(Dh)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Da)),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){for(let t=0;t<this.children.length;t++){const e=this.children[t];e.parent=null,e.dispatchEvent(Da)}return this.children.length=0,this}attach(t){return this.updateWorldMatrix(!0,!1),Qe.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Qe.multiply(t.parent.matrixWorld)),t.applyMatrix4(Qe),this.add(t),t.updateWorldMatrix(!1,!0),this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,i=this.children.length;n<i;n++){const o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e){let n=[];this[t]===e&&n.push(this);for(let i=0,r=this.children.length;i<r;i++){const o=this.children[i].getObjectsByProperty(t,e);o.length>0&&(n=n.concat(o))}return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(vi,t,Rh),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(vi,kh,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,i=e.length;n<i;n++){const r=e[n];(r.matrixWorldAutoUpdate===!0||t===!0)&&r.updateMatrixWorld(t)}}updateWorldMatrix(t,e){const n=this.parent;if(t===!0&&n!==null&&n.matrixWorldAutoUpdate===!0&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),e===!0){const i=this.children;for(let r=0,o=i.length;r<o;r++){const a=i[r];a.matrixWorldAutoUpdate===!0&&a.updateWorldMatrix(!1,!0)}}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.5,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(t.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];r(t.shapes,u)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(t.materials,this.material[l]));i.material=a}else i.material=r(t.materials,this.material);if(this.children.length>0){i.children=[];for(let a=0;a<this.children.length;a++)i.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){i.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];i.animations.push(r(t.animations,l))}}if(e){const a=o(t.geometries),l=o(t.materials),c=o(t.textures),h=o(t.images),u=o(t.shapes),d=o(t.skeletons),f=o(t.animations),v=o(t.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),v.length>0&&(n.nodes=v)}return n.object=i,n;function o(a){const l=[];for(const c in a){const h=a[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const i=t.children[n];this.add(i.clone())}return this}}Me.DEFAULT_UP=new P(0,1,0);Me.DEFAULT_MATRIX_AUTO_UPDATE=!0;Me.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Ue=new P,$e=new P,Js=new P,tn=new P,Vn=new P,Zn=new P,Ia=new P,Vs=new P,Zs=new P,Ws=new P;class en{constructor(t=new P,e=new P,n=new P){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,i){i.subVectors(n,e),Ue.subVectors(t,e),i.cross(Ue);const r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(t,e,n,i,r){Ue.subVectors(i,e),$e.subVectors(n,e),Js.subVectors(t,e);const o=Ue.dot(Ue),a=Ue.dot($e),l=Ue.dot(Js),c=$e.dot($e),h=$e.dot(Js),u=o*c-a*a;if(u===0)return r.set(-2,-1,-1);const d=1/u,f=(c*l-a*h)*d,v=(o*h-a*l)*d;return r.set(1-f-v,v,f)}static containsPoint(t,e,n,i){return this.getBarycoord(t,e,n,i,tn),tn.x>=0&&tn.y>=0&&tn.x+tn.y<=1}static getUV(t,e,n,i,r,o,a,l){return this.getBarycoord(t,e,n,i,tn),l.set(0,0),l.addScaledVector(r,tn.x),l.addScaledVector(o,tn.y),l.addScaledVector(a,tn.z),l}static isFrontFacing(t,e,n,i){return Ue.subVectors(n,e),$e.subVectors(t,e),Ue.cross($e).dot(i)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,i){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[i]),this}setFromAttributeAndIndices(t,e,n,i){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,i),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Ue.subVectors(this.c,this.b),$e.subVectors(this.a,this.b),Ue.cross($e).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return en.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return en.getBarycoord(t,this.a,this.b,this.c,e)}getUV(t,e,n,i,r){return en.getUV(t,this.a,this.b,this.c,e,n,i,r)}containsPoint(t){return en.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return en.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,i=this.b,r=this.c;let o,a;Vn.subVectors(i,n),Zn.subVectors(r,n),Vs.subVectors(t,n);const l=Vn.dot(Vs),c=Zn.dot(Vs);if(l<=0&&c<=0)return e.copy(n);Zs.subVectors(t,i);const h=Vn.dot(Zs),u=Zn.dot(Zs);if(h>=0&&u<=h)return e.copy(i);const d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return o=l/(l-h),e.copy(n).addScaledVector(Vn,o);Ws.subVectors(t,r);const f=Vn.dot(Ws),v=Zn.dot(Ws);if(v>=0&&f<=v)return e.copy(r);const m=f*c-l*v;if(m<=0&&c>=0&&v<=0)return a=c/(c-v),e.copy(n).addScaledVector(Zn,a);const p=h*v-f*u;if(p<=0&&u-h>=0&&f-v>=0)return Ia.subVectors(r,i),a=(u-h)/(u-h+(f-v)),e.copy(i).addScaledVector(Ia,a);const g=1/(p+m+d);return o=m*g,a=d*g,e.copy(n).addScaledVector(Vn,o).addScaledVector(Zn,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}let Ih=0;class Ii extends ui{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Ih++}),this.uuid=Ri(),this.name="",this.type="Material",this.blending=Ln,this.side=mn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.blendSrc=zo,this.blendDst=Lo,this.blendEquation=Qn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.depthFunc=Ar,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=bh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ps,this.stencilZFail=Ps,this.stencilZPass=Ps,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){console.warn("THREE.Material: '"+e+"' parameter is undefined.");continue}const i=this[e];if(i===void 0){console.warn("THREE."+this.type+": '"+e+"' is not a property of this material.");continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.5,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Ln&&(n.blending=this.blending),this.side!==mn&&(n.side=this.side),this.vertexColors&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=this.transparent),n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.stencilWrite=this.stencilWrite,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaToCoverage===!0&&(n.alphaToCoverage=this.alphaToCoverage),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=this.premultipliedAlpha),this.forceSinglePass===!0&&(n.forceSinglePass=this.forceSinglePass),this.wireframe===!0&&(n.wireframe=this.wireframe),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=this.flatShading),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(e){const r=i(t.textures),o=i(t.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const i=e.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}}class di extends Ii{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new _t(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Ro,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const Zt=new P,Wi=new lt;class Wt{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=wa,this.updateRange={offset:0,count:-1},this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[t+i]=e.array[n+i];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Wi.fromBufferAttribute(this,e),Wi.applyMatrix3(t),this.setXY(e,Wi.x,Wi.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Zt.fromBufferAttribute(this,e),Zt.applyMatrix3(t),this.setXYZ(e,Zt.x,Zt.y,Zt.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Zt.fromBufferAttribute(this,e),Zt.applyMatrix4(t),this.setXYZ(e,Zt.x,Zt.y,Zt.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Zt.fromBufferAttribute(this,e),Zt.applyNormalMatrix(t),this.setXYZ(e,Zt.x,Zt.y,Zt.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Zt.fromBufferAttribute(this,e),Zt.transformDirection(t),this.setXYZ(e,Zt.x,Zt.y,Zt.z);return this}set(t,e=0){return this.array.set(t,e),this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Oi(e,this.array)),e}setX(t,e){return this.normalized&&(e=_e(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Oi(e,this.array)),e}setY(t,e){return this.normalized&&(e=_e(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Oi(e,this.array)),e}setZ(t,e){return this.normalized&&(e=_e(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Oi(e,this.array)),e}setW(t,e){return this.normalized&&(e=_e(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=_e(e,this.array),n=_e(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,i){return t*=this.itemSize,this.normalized&&(e=_e(e,this.array),n=_e(n,this.array),i=_e(i,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this}setXYZW(t,e,n,i,r){return t*=this.itemSize,this.normalized&&(e=_e(e,this.array),n=_e(n,this.array),i=_e(i,this.array),r=_e(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==wa&&(t.usage=this.usage),(this.updateRange.offset!==0||this.updateRange.count!==-1)&&(t.updateRange=this.updateRange),t}copyColorsArray(){console.error("THREE.BufferAttribute: copyColorsArray() was removed in r144.")}copyVector2sArray(){console.error("THREE.BufferAttribute: copyVector2sArray() was removed in r144.")}copyVector3sArray(){console.error("THREE.BufferAttribute: copyVector3sArray() was removed in r144.")}copyVector4sArray(){console.error("THREE.BufferAttribute: copyVector4sArray() was removed in r144.")}}class Ho extends Wt{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class Go extends Wt{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class Ht extends Wt{constructor(t,e,n){super(new Float32Array(t),e,n)}}let Nh=0;const ke=new jt,Xs=new Me,Wn=new P,Ce=new Di,Ai=new Di,ie=new P;class oe extends ui{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Nh++}),this.uuid=Ri(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Do(t)?Go:Ho)(t,1):this.index=t,this}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Pe().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(t),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return ke.makeRotationFromQuaternion(t),this.applyMatrix4(ke),this}rotateX(t){return ke.makeRotationX(t),this.applyMatrix4(ke),this}rotateY(t){return ke.makeRotationY(t),this.applyMatrix4(ke),this}rotateZ(t){return ke.makeRotationZ(t),this.applyMatrix4(ke),this}translate(t,e,n){return ke.makeTranslation(t,e,n),this.applyMatrix4(ke),this}scale(t,e,n){return ke.makeScale(t,e,n),this.applyMatrix4(ke),this}lookAt(t){return Xs.lookAt(t),Xs.updateMatrix(),this.applyMatrix4(Xs.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Wn).negate(),this.translate(Wn.x,Wn.y,Wn.z),this}setFromPoints(t){const e=[];for(let n=0,i=t.length;n<i;n++){const r=t[n];e.push(r.x,r.y,r.z||0)}return this.setAttribute("position",new Ht(e,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Di);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,i=e.length;n<i;n++){const r=e[n];Ce.setFromBufferAttribute(r),this.morphTargetsRelative?(ie.addVectors(this.boundingBox.min,Ce.min),this.boundingBox.expandByPoint(ie),ie.addVectors(this.boundingBox.max,Ce.max),this.boundingBox.expandByPoint(ie)):(this.boundingBox.expandByPoint(Ce.min),this.boundingBox.expandByPoint(Ce.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ps);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingSphere.set(new P,1/0);return}if(t){const n=this.boundingSphere.center;if(Ce.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){const a=e[r];Ai.setFromBufferAttribute(a),this.morphTargetsRelative?(ie.addVectors(Ce.min,Ai.min),Ce.expandByPoint(ie),ie.addVectors(Ce.max,Ai.max),Ce.expandByPoint(ie)):(Ce.expandByPoint(Ai.min),Ce.expandByPoint(Ai.max))}Ce.getCenter(n);let i=0;for(let r=0,o=t.count;r<o;r++)ie.fromBufferAttribute(t,r),i=Math.max(i,n.distanceToSquared(ie));if(e)for(let r=0,o=e.length;r<o;r++){const a=e[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)ie.fromBufferAttribute(a,c),l&&(Wn.fromBufferAttribute(t,c),ie.add(Wn)),i=Math.max(i,n.distanceToSquared(ie))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.array,i=e.position.array,r=e.normal.array,o=e.uv.array,a=i.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Wt(new Float32Array(4*a),4));const l=this.getAttribute("tangent").array,c=[],h=[];for(let k=0;k<a;k++)c[k]=new P,h[k]=new P;const u=new P,d=new P,f=new P,v=new lt,m=new lt,p=new lt,g=new P,y=new P;function x(k,V,X){u.fromArray(i,k*3),d.fromArray(i,V*3),f.fromArray(i,X*3),v.fromArray(o,k*2),m.fromArray(o,V*2),p.fromArray(o,X*2),d.sub(u),f.sub(u),m.sub(v),p.sub(v);const D=1/(m.x*p.y-p.x*m.y);isFinite(D)&&(g.copy(d).multiplyScalar(p.y).addScaledVector(f,-m.y).multiplyScalar(D),y.copy(f).multiplyScalar(m.x).addScaledVector(d,-p.x).multiplyScalar(D),c[k].add(g),c[V].add(g),c[X].add(g),h[k].add(y),h[V].add(y),h[X].add(y))}let w=this.groups;w.length===0&&(w=[{start:0,count:n.length}]);for(let k=0,V=w.length;k<V;++k){const X=w[k],D=X.start,L=X.count;for(let G=D,q=D+L;G<q;G+=3)x(n[G+0],n[G+1],n[G+2])}const M=new P,C=new P,z=new P,A=new P;function T(k){z.fromArray(r,k*3),A.copy(z);const V=c[k];M.copy(V),M.sub(z.multiplyScalar(z.dot(V))).normalize(),C.crossVectors(A,V);const D=C.dot(h[k])<0?-1:1;l[k*4]=M.x,l[k*4+1]=M.y,l[k*4+2]=M.z,l[k*4+3]=D}for(let k=0,V=w.length;k<V;++k){const X=w[k],D=X.start,L=X.count;for(let G=D,q=D+L;G<q;G+=3)T(n[G+0]),T(n[G+1]),T(n[G+2])}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Wt(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);const i=new P,r=new P,o=new P,a=new P,l=new P,c=new P,h=new P,u=new P;if(t)for(let d=0,f=t.count;d<f;d+=3){const v=t.getX(d+0),m=t.getX(d+1),p=t.getX(d+2);i.fromBufferAttribute(e,v),r.fromBufferAttribute(e,m),o.fromBufferAttribute(e,p),h.subVectors(o,r),u.subVectors(i,r),h.cross(u),a.fromBufferAttribute(n,v),l.fromBufferAttribute(n,m),c.fromBufferAttribute(n,p),a.add(h),l.add(h),c.add(h),n.setXYZ(v,a.x,a.y,a.z),n.setXYZ(m,l.x,l.y,l.z),n.setXYZ(p,c.x,c.y,c.z)}else for(let d=0,f=e.count;d<f;d+=3)i.fromBufferAttribute(e,d+0),r.fromBufferAttribute(e,d+1),o.fromBufferAttribute(e,d+2),h.subVectors(o,r),u.subVectors(i,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}merge(){return console.error("THREE.BufferGeometry.merge() has been removed. Use THREE.BufferGeometryUtils.mergeBufferGeometries() instead."),this}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)ie.fromBufferAttribute(t,e),ie.normalize(),t.setXYZ(e,ie.x,ie.y,ie.z)}toNonIndexed(){function t(a,l){const c=a.array,h=a.itemSize,u=a.normalized,d=new c.constructor(l.length*h);let f=0,v=0;for(let m=0,p=l.length;m<p;m++){a.isInterleavedBufferAttribute?f=l[m]*a.data.stride+a.offset:f=l[m]*h;for(let g=0;g<h;g++)d[v++]=c[f++]}return new Wt(d,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new oe,n=this.index.array,i=this.attributes;for(const a in i){const l=i[a],c=t(l,n);e.setAttribute(a,c)}const r=this.morphAttributes;for(const a in r){const l=[],c=r[a];for(let h=0,u=c.length;h<u;h++){const d=c[h],f=t(d,n);l.push(f)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){const t={metadata:{version:4.5,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const l in n){const c=n[l];t.data.attributes[l]=c.toJSON(t.data)}const i={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){const f=c[u];h.push(f.toJSON(t.data))}h.length>0&&(i[l]=h,r=!0)}r&&(t.data.morphAttributes=i,t.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(t.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone(e));const i=t.attributes;for(const c in i){const h=i[c];this.setAttribute(c,h.clone(e))}const r=t.morphAttributes;for(const c in r){const h=[],u=r[c];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;const o=t.groups;for(let c=0,h=o.length;c<h;c++){const u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}const a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,t.parameters!==void 0&&(this.parameters=Object.assign({},t.parameters)),this}dispose(){this.dispatchEvent({type:"dispose"})}}const Na=new jt,Xn=new Bo,qs=new ps,xi=new P,Si=new P,yi=new P,Ys=new P,Xi=new P,qi=new lt,Yi=new lt,ji=new lt,js=new P,Ki=new P;class Gt extends Me{constructor(t=new oe,e=new di){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){const a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){const n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(i,t);const a=this.morphTargetInfluences;if(r&&a){Xi.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=a[l],u=r[l];h!==0&&(Ys.fromBufferAttribute(u,t),o?Xi.addScaledVector(Ys,h):Xi.addScaledVector(Ys.sub(e),h))}e.add(Xi)}return this.isSkinnedMesh&&this.boneTransform(t,e),e}raycast(t,e){const n=this.geometry,i=this.material,r=this.matrixWorld;if(i===void 0||(n.boundingSphere===null&&n.computeBoundingSphere(),qs.copy(n.boundingSphere),qs.applyMatrix4(r),t.ray.intersectsSphere(qs)===!1)||(Na.copy(r).invert(),Xn.copy(t.ray).applyMatrix4(Na),n.boundingBox!==null&&Xn.intersectsBox(n.boundingBox)===!1))return;let o;const a=n.index,l=n.attributes.position,c=n.attributes.uv,h=n.attributes.uv2,u=n.groups,d=n.drawRange;if(a!==null)if(Array.isArray(i))for(let f=0,v=u.length;f<v;f++){const m=u[f],p=i[m.materialIndex],g=Math.max(m.start,d.start),y=Math.min(a.count,Math.min(m.start+m.count,d.start+d.count));for(let x=g,w=y;x<w;x+=3){const M=a.getX(x),C=a.getX(x+1),z=a.getX(x+2);o=Qi(this,p,t,Xn,c,h,M,C,z),o&&(o.faceIndex=Math.floor(x/3),o.face.materialIndex=m.materialIndex,e.push(o))}}else{const f=Math.max(0,d.start),v=Math.min(a.count,d.start+d.count);for(let m=f,p=v;m<p;m+=3){const g=a.getX(m),y=a.getX(m+1),x=a.getX(m+2);o=Qi(this,i,t,Xn,c,h,g,y,x),o&&(o.faceIndex=Math.floor(m/3),e.push(o))}}else if(l!==void 0)if(Array.isArray(i))for(let f=0,v=u.length;f<v;f++){const m=u[f],p=i[m.materialIndex],g=Math.max(m.start,d.start),y=Math.min(l.count,Math.min(m.start+m.count,d.start+d.count));for(let x=g,w=y;x<w;x+=3){const M=x,C=x+1,z=x+2;o=Qi(this,p,t,Xn,c,h,M,C,z),o&&(o.faceIndex=Math.floor(x/3),o.face.materialIndex=m.materialIndex,e.push(o))}}else{const f=Math.max(0,d.start),v=Math.min(l.count,d.start+d.count);for(let m=f,p=v;m<p;m+=3){const g=m,y=m+1,x=m+2;o=Qi(this,i,t,Xn,c,h,g,y,x),o&&(o.faceIndex=Math.floor(m/3),e.push(o))}}}}function Oh(s,t,e,n,i,r,o,a){let l;if(t.side===ye?l=n.intersectTriangle(o,r,i,!0,a):l=n.intersectTriangle(i,r,o,t.side===mn,a),l===null)return null;Ki.copy(a),Ki.applyMatrix4(s.matrixWorld);const c=e.ray.origin.distanceTo(Ki);return c<e.near||c>e.far?null:{distance:c,point:Ki.clone(),object:s}}function Qi(s,t,e,n,i,r,o,a,l){s.getVertexPosition(o,xi),s.getVertexPosition(a,Si),s.getVertexPosition(l,yi);const c=Oh(s,t,e,n,xi,Si,yi,js);if(c){i&&(qi.fromBufferAttribute(i,o),Yi.fromBufferAttribute(i,a),ji.fromBufferAttribute(i,l),c.uv=en.getUV(js,xi,Si,yi,qi,Yi,ji,new lt)),r&&(qi.fromBufferAttribute(r,o),Yi.fromBufferAttribute(r,a),ji.fromBufferAttribute(r,l),c.uv2=en.getUV(js,xi,Si,yi,qi,Yi,ji,new lt));const h={a:o,b:a,c:l,normal:new P,materialIndex:0};en.getNormal(xi,Si,yi,h.normal),c.face=h}return c}class Ni extends oe{constructor(t=1,e=1,n=1,i=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:i,heightSegments:r,depthSegments:o};const a=this;i=Math.floor(i),r=Math.floor(r),o=Math.floor(o);const l=[],c=[],h=[],u=[];let d=0,f=0;v("z","y","x",-1,-1,n,e,t,o,r,0),v("z","y","x",1,-1,n,e,-t,o,r,1),v("x","z","y",1,1,t,n,e,i,o,2),v("x","z","y",1,-1,t,n,-e,i,o,3),v("x","y","z",1,-1,t,e,n,i,r,4),v("x","y","z",-1,-1,t,e,-n,i,r,5),this.setIndex(l),this.setAttribute("position",new Ht(c,3)),this.setAttribute("normal",new Ht(h,3)),this.setAttribute("uv",new Ht(u,2));function v(m,p,g,y,x,w,M,C,z,A,T){const k=w/z,V=M/A,X=w/2,D=M/2,L=C/2,G=z+1,q=A+1;let j=0,Z=0;const $=new P;for(let Q=0;Q<q;Q++){const ct=Q*V-D;for(let N=0;N<G;N++){const W=N*k-X;$[m]=W*y,$[p]=ct*x,$[g]=L,c.push($.x,$.y,$.z),$[m]=0,$[p]=0,$[g]=C>0?1:-1,h.push($.x,$.y,$.z),u.push(N/z),u.push(1-Q/A),j+=1}}for(let Q=0;Q<A;Q++)for(let ct=0;ct<z;ct++){const N=d+ct+G*Q,W=d+ct+G*(Q+1),nt=d+(ct+1)+G*(Q+1),it=d+(ct+1)+G*Q;l.push(N,W,it),l.push(W,nt,it),Z+=6}a.addGroup(f,Z,T),f+=Z,d+=j}}static fromJSON(t){return new Ni(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function hi(s){const t={};for(const e in s){t[e]={};for(const n in s[e]){const i=s[e][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?t[e][n]=i.clone():Array.isArray(i)?t[e][n]=i.slice():t[e][n]=i}}return t}function ve(s){const t={};for(let e=0;e<s.length;e++){const n=hi(s[e]);for(const i in n)t[i]=n[i]}return t}function Fh(s){const t=[];for(let e=0;e<s.length;e++)t.push(s[e].clone());return t}function Jo(s){return s.getRenderTarget()===null&&s.outputEncoding===Ft?Je:Li}const Bh={clone:hi,merge:ve};var Uh=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Hh=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class xe extends Ii{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Uh,this.fragmentShader=Hh,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv2:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=hi(t.uniforms),this.uniformsGroups=Fh(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const i in this.uniforms){const o=this.uniforms[i].value;o&&o.isTexture?e.uniforms[i]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[i]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[i]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[i]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[i]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[i]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[i]={type:"m4",value:o.toArray()}:e.uniforms[i]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}}let Vo=class extends Me{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new jt,this.projectionMatrix=new jt,this.projectionMatrixInverse=new jt}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(-e[8],-e[9],-e[10]).normalize()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}};class De extends Vo{constructor(t=50,e=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=_a*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(zs*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return _a*2*Math.atan(Math.tan(zs*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(t,e,n,i,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(zs*.5*this.fov)/this.zoom,n=2*e,i=this.aspect*n,r=-.5*i;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*i/l,e-=o.offsetY*n/c,i*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,e,e-n,t,this.far),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const qn=-90,Yn=1;class Gh extends Me{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n;const i=new De(qn,Yn,t,e);i.layers=this.layers,i.up.set(0,1,0),i.lookAt(1,0,0),this.add(i);const r=new De(qn,Yn,t,e);r.layers=this.layers,r.up.set(0,1,0),r.lookAt(-1,0,0),this.add(r);const o=new De(qn,Yn,t,e);o.layers=this.layers,o.up.set(0,0,-1),o.lookAt(0,1,0),this.add(o);const a=new De(qn,Yn,t,e);a.layers=this.layers,a.up.set(0,0,1),a.lookAt(0,-1,0),this.add(a);const l=new De(qn,Yn,t,e);l.layers=this.layers,l.up.set(0,1,0),l.lookAt(0,0,1),this.add(l);const c=new De(qn,Yn,t,e);c.layers=this.layers,c.up.set(0,1,0),c.lookAt(0,0,-1),this.add(c)}update(t,e){this.parent===null&&this.updateMatrixWorld();const n=this.renderTarget,[i,r,o,a,l,c]=this.children,h=t.getRenderTarget(),u=t.toneMapping,d=t.xr.enabled;t.toneMapping=sn,t.xr.enabled=!1;const f=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0),t.render(e,i),t.setRenderTarget(n,1),t.render(e,r),t.setRenderTarget(n,2),t.render(e,o),t.setRenderTarget(n,3),t.render(e,a),t.setRenderTarget(n,4),t.render(e,l),n.texture.generateMipmaps=f,t.setRenderTarget(n,5),t.render(e,c),t.setRenderTarget(h),t.toneMapping=u,t.xr.enabled=d,n.texture.needsPMREMUpdate=!0}}class Zo extends de{constructor(t,e,n,i,r,o,a,l,c,h){t=t!==void 0?t:[],e=e!==void 0?e:oi,super(t,e,n,i,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class Jh extends rn{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},i=[n,n,n,n,n,n];this.texture=new Zo(i,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.encoding),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:Se}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.encoding=e.encoding,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new Ni(5,5,5),r=new xe({name:"CubemapFromEquirect",uniforms:hi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:ye,blending:fn});r.uniforms.tEquirect.value=e;const o=new Gt(i,r),a=e.minFilter;return e.minFilter===Pi&&(e.minFilter=Se),new Gh(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e,n,i){const r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,i);t.setRenderTarget(r)}}const Ks=new P,Vh=new P,Zh=new Pe;class _n{constructor(t=new P(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,i){return this.normal.set(t,e,n),this.constant=i,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const i=Ks.subVectors(n,e).cross(Vh.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(i,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(this.normal).multiplyScalar(-this.distanceToPoint(t)).add(t)}intersectLine(t,e){const n=t.delta(Ks),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const r=-(t.start.dot(this.normal)+this.constant)/i;return r<0||r>1?null:e.copy(n).multiplyScalar(r).add(t.start)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||Zh.getNormalMatrix(t),i=this.coplanarPoint(Ks).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const jn=new ps,$i=new P;class Wo{constructor(t=new _n,e=new _n,n=new _n,i=new _n,r=new _n,o=new _n){this.planes=[t,e,n,i,r,o]}set(t,e,n,i,r,o){const a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(i),a[4].copy(r),a[5].copy(o),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t){const e=this.planes,n=t.elements,i=n[0],r=n[1],o=n[2],a=n[3],l=n[4],c=n[5],h=n[6],u=n[7],d=n[8],f=n[9],v=n[10],m=n[11],p=n[12],g=n[13],y=n[14],x=n[15];return e[0].setComponents(a-i,u-l,m-d,x-p).normalize(),e[1].setComponents(a+i,u+l,m+d,x+p).normalize(),e[2].setComponents(a+r,u+c,m+f,x+g).normalize(),e[3].setComponents(a-r,u-c,m-f,x-g).normalize(),e[4].setComponents(a-o,u-h,m-v,x-y).normalize(),e[5].setComponents(a+o,u+h,m+v,x+y).normalize(),this}intersectsObject(t){const e=t.geometry;return e.boundingSphere===null&&e.computeBoundingSphere(),jn.copy(e.boundingSphere).applyMatrix4(t.matrixWorld),this.intersectsSphere(jn)}intersectsSprite(t){return jn.center.set(0,0,0),jn.radius=.7071067811865476,jn.applyMatrix4(t.matrixWorld),this.intersectsSphere(jn)}intersectsSphere(t){const e=this.planes,n=t.center,i=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const i=e[n];if($i.x=i.normal.x>0?t.max.x:t.min.x,$i.y=i.normal.y>0?t.max.y:t.min.y,$i.z=i.normal.z>0?t.max.z:t.min.z,i.distanceToPoint($i)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Xo(){let s=null,t=!1,e=null,n=null;function i(r,o){e(r,o),n=s.requestAnimationFrame(i)}return{start:function(){t!==!0&&e!==null&&(n=s.requestAnimationFrame(i),t=!0)},stop:function(){s.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){s=r}}}function Wh(s,t){const e=t.isWebGL2,n=new WeakMap;function i(c,h){const u=c.array,d=c.usage,f=s.createBuffer();s.bindBuffer(h,f),s.bufferData(h,u,d),c.onUploadCallback();let v;if(u instanceof Float32Array)v=5126;else if(u instanceof Uint16Array)if(c.isFloat16BufferAttribute)if(e)v=5131;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else v=5123;else if(u instanceof Int16Array)v=5122;else if(u instanceof Uint32Array)v=5125;else if(u instanceof Int32Array)v=5124;else if(u instanceof Int8Array)v=5120;else if(u instanceof Uint8Array)v=5121;else if(u instanceof Uint8ClampedArray)v=5121;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+u);return{buffer:f,type:v,bytesPerElement:u.BYTES_PER_ELEMENT,version:c.version}}function r(c,h,u){const d=h.array,f=h.updateRange;s.bindBuffer(u,c),f.count===-1?s.bufferSubData(u,0,d):(e?s.bufferSubData(u,f.offset*d.BYTES_PER_ELEMENT,d,f.offset,f.count):s.bufferSubData(u,f.offset*d.BYTES_PER_ELEMENT,d.subarray(f.offset,f.offset+f.count)),f.count=-1),h.onUploadCallback()}function o(c){return c.isInterleavedBufferAttribute&&(c=c.data),n.get(c)}function a(c){c.isInterleavedBufferAttribute&&(c=c.data);const h=n.get(c);h&&(s.deleteBuffer(h.buffer),n.delete(c))}function l(c,h){if(c.isGLBufferAttribute){const d=n.get(c);(!d||d.version<c.version)&&n.set(c,{buffer:c.buffer,type:c.type,bytesPerElement:c.elementSize,version:c.version});return}c.isInterleavedBufferAttribute&&(c=c.data);const u=n.get(c);u===void 0?n.set(c,i(c,h)):u.version<c.version&&(r(u.buffer,c,h),u.version=c.version)}return{get:o,remove:a,update:l}}class gn extends oe{constructor(t=1,e=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:i};const r=t/2,o=e/2,a=Math.floor(n),l=Math.floor(i),c=a+1,h=l+1,u=t/a,d=e/l,f=[],v=[],m=[],p=[];for(let g=0;g<h;g++){const y=g*d-o;for(let x=0;x<c;x++){const w=x*u-r;v.push(w,-y,0),m.push(0,0,1),p.push(x/a),p.push(1-g/l)}}for(let g=0;g<l;g++)for(let y=0;y<a;y++){const x=y+c*g,w=y+c*(g+1),M=y+1+c*(g+1),C=y+1+c*g;f.push(x,w,C),f.push(w,M,C)}this.setIndex(f),this.setAttribute("position",new Ht(v,3)),this.setAttribute("normal",new Ht(m,3)),this.setAttribute("uv",new Ht(p,2))}static fromJSON(t){return new gn(t.width,t.height,t.widthSegments,t.heightSegments)}}var Xh=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vUv ).g;
#endif`,qh=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Yh=`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,jh=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Kh=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vUv2 ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Qh=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,$h="vec3 transformed = vec3( position );",tu=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,eu=`vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 f0, const in float f90, const in float roughness ) {
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
	float D = D_GGX( alpha, dotNH );
	return F * ( V * D );
}
#ifdef USE_IRIDESCENCE
	vec3 BRDF_GGX_Iridescence( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 f0, const in float f90, const in float iridescence, const in vec3 iridescenceFresnel, const in float roughness ) {
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = mix( F_Schlick( f0, f90, dotVH ), iridescenceFresnel, iridescence );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif`,nu=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			 return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float R21 = R12;
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,iu=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vUv );
		vec2 dSTdy = dFdy( vUv );
		float Hll = bumpScale * texture2D( bumpMap, vUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = dFdx( surf_pos.xyz );
		vec3 vSigmaY = dFdy( surf_pos.xyz );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,su=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#pragma unroll_loop_start
	for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
		plane = clippingPlanes[ i ];
		if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
	}
	#pragma unroll_loop_end
	#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
		bool clipped = true;
		#pragma unroll_loop_start
		for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
		}
		#pragma unroll_loop_end
		if ( clipped ) discard;
	#endif
#endif`,ru=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,au=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,ou=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,lu=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,cu=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,hu=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,uu=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,du=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
struct GeometricContext {
	vec3 position;
	vec3 normal;
	vec3 viewDir;
#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal;
#endif
};
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}`,fu=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_v0 0.339
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_v1 0.276
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_v4 0.046
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_v5 0.016
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_v6 0.0038
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,pu=`vec3 transformedNormal = objectNormal;
#ifdef USE_INSTANCING
	mat3 m = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( m[ 0 ], m[ 0 ] ), dot( m[ 1 ], m[ 1 ] ), dot( m[ 2 ], m[ 2 ] ) );
	transformedNormal = m * transformedNormal;
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	vec3 transformedTangent = ( modelViewMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,mu=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,gu=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vUv ).x * displacementScale + displacementBias );
#endif`,vu=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Au=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,xu="gl_FragColor = linearToOutputTexel( gl_FragColor );",Su=`vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,yu=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Mu=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,wu=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,bu=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,_u=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Tu=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Cu=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Eu=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Pu=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,zu=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Lu=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vUv2 );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,Ru=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,ku=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Du=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in GeometricContext geometry, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in GeometricContext geometry, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Iu=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
uniform vec3 lightProbe[ 9 ];
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	#if defined ( PHYSICALLY_CORRECT_LIGHTS )
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#else
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#endif
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, const in GeometricContext geometry, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in GeometricContext geometry, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometry.position;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in GeometricContext geometry, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometry.position;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Nu=`#if defined( USE_ENVMAP )
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#if defined( ENVMAP_TYPE_CUBE_UV )
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#if defined( ENVMAP_TYPE_CUBE_UV )
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
#endif`,Ou=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Fu=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in GeometricContext geometry, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometry.normal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in GeometricContext geometry, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Bu=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Uu=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometry.viewDir, geometry.normal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Hu=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( geometryNormal ) ), abs( dFdy( geometryNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULARINTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vUv ).a;
		#endif
		#ifdef USE_SPECULARCOLORMAP
			specularColorFactor *= texture2D( specularColorMap, vUv ).rgb;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEENCOLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEENROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vUv ).a;
	#endif
#endif`,Gu=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
};
vec3 clearcoatSpecular = vec3( 0.0 );
vec3 sheenSpecular = vec3( 0.0 );
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometry.normal;
		vec3 viewDir = geometry.viewDir;
		vec3 position = geometry.position;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometry.clearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecular += ccIrradiance * BRDF_GGX( directLight.direction, geometry.viewDir, geometry.clearcoatNormal, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecular += irradiance * BRDF_Sheen( directLight.direction, geometry.viewDir, geometry.normal, material.sheenColor, material.sheenRoughness );
	#endif
	#ifdef USE_IRIDESCENCE
		reflectedLight.directSpecular += irradiance * BRDF_GGX_Iridescence( directLight.direction, geometry.viewDir, geometry.normal, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness );
	#else
		reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometry.viewDir, geometry.normal, material.specularColor, material.specularF90, material.roughness );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecular += clearcoatRadiance * EnvironmentBRDF( geometry.clearcoatNormal, geometry.viewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecular += irradiance * material.sheenColor * IBLSheenBRDF( geometry.normal, geometry.viewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometry.normal, geometry.viewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometry.normal, geometry.viewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Ju=`
GeometricContext geometry;
geometry.position = - vViewPosition;
geometry.normal = normal;
geometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
#ifdef USE_CLEARCOAT
	geometry.clearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometry.viewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometry, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometry, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, geometry, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	irradiance += getLightProbeIrradiance( lightProbe, geometry.normal );
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry.normal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Vu=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vUv2 );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometry.normal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	radiance += getIBLRadiance( geometry.viewDir, geometry.normal, material.roughness );
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometry.viewDir, geometry.clearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Zu=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometry, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometry, material, reflectedLight );
#endif`,Wu=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Xu=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,qu=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,Yu=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,ju=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Ku=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Qu=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,$u=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	uniform mat3 uvTransform;
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,td=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vUv );
	metalnessFactor *= texelMetalness.b;
#endif`,ed=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,nd=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,id=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
	#endif
#endif`,sd=`#ifdef USE_MORPHTARGETS
	uniform float morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
		uniform sampler2DArray morphTargetsTexture;
		uniform ivec2 morphTargetsTextureSize;
		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
			int y = texelIndex / morphTargetsTextureSize.x;
			int x = texelIndex - y * morphTargetsTextureSize.x;
			ivec3 morphUV = ivec3( x, y, morphTargetIndex );
			return texelFetch( morphTargetsTexture, morphUV, 0 );
		}
	#else
		#ifndef USE_MORPHNORMALS
			uniform float morphTargetInfluences[ 8 ];
		#else
			uniform float morphTargetInfluences[ 4 ];
		#endif
	#endif
#endif`,rd=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		transformed += morphTarget0 * morphTargetInfluences[ 0 ];
		transformed += morphTarget1 * morphTargetInfluences[ 1 ];
		transformed += morphTarget2 * morphTargetInfluences[ 2 ];
		transformed += morphTarget3 * morphTargetInfluences[ 3 ];
		#ifndef USE_MORPHNORMALS
			transformed += morphTarget4 * morphTargetInfluences[ 4 ];
			transformed += morphTarget5 * morphTargetInfluences[ 5 ];
			transformed += morphTarget6 * morphTargetInfluences[ 6 ];
			transformed += morphTarget7 * morphTargetInfluences[ 7 ];
		#endif
	#endif
#endif`,ad=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	#ifdef USE_TANGENT
		vec3 tangent = normalize( vTangent );
		vec3 bitangent = normalize( vBitangent );
		#ifdef DOUBLE_SIDED
			tangent = tangent * faceDirection;
			bitangent = bitangent * faceDirection;
		#endif
		#if defined( TANGENTSPACE_NORMALMAP ) || defined( USE_CLEARCOAT_NORMALMAP )
			mat3 vTBN = mat3( tangent, bitangent, normal );
		#endif
	#endif
#endif
vec3 geometryNormal = normal;`,od=`#ifdef OBJECTSPACE_NORMALMAP
	normal = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( TANGENTSPACE_NORMALMAP )
	vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	#ifdef USE_TANGENT
		normal = normalize( vTBN * mapN );
	#else
		normal = perturbNormal2Arb( - vViewPosition, normal, mapN, faceDirection );
	#endif
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,ld=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,cd=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,hd=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,ud=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef OBJECTSPACE_NORMALMAP
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( TANGENTSPACE_NORMALMAP ) || defined ( USE_CLEARCOAT_NORMALMAP ) )
	vec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm, vec3 mapN, float faceDirection ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( vUv.st );
		vec2 st1 = dFdy( vUv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : faceDirection * inversesqrt( det );
		return normalize( T * ( mapN.x * scale ) + B * ( mapN.y * scale ) + N * mapN.z );
	}
#endif`,dd=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = geometryNormal;
#endif`,fd=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	#ifdef USE_TANGENT
		clearcoatNormal = normalize( vTBN * clearcoatMapN );
	#else
		clearcoatNormal = perturbNormal2Arb( - vViewPosition, clearcoatNormal, clearcoatMapN, faceDirection );
	#endif
#endif`,pd=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif`,md=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,gd=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha + 0.1;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,vd=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float linearClipZ, const in float near, const in float far ) {
	return linearClipZ * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float invClipZ, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * invClipZ - far );
}`,Ad=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,xd=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Sd=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,yd=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Md=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vUv );
	roughnessFactor *= texelRoughness.g;
#endif`,wd=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,bd=`#if NUM_SPOT_LIGHT_COORDS > 0
  varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
  uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
			) * ( 1.0 / 9.0 );
		#else
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif`,_d=`#if NUM_SPOT_LIGHT_COORDS > 0
  uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
  varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Td=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Cd=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Ed=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Pd=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	uniform int boneTextureSize;
	mat4 getBoneMatrix( const in float i ) {
		float j = i * 4.0;
		float x = mod( j, float( boneTextureSize ) );
		float y = floor( j / float( boneTextureSize ) );
		float dx = 1.0 / float( boneTextureSize );
		float dy = 1.0 / float( boneTextureSize );
		y = dy * ( y + 0.5 );
		vec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );
		vec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );
		vec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );
		vec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );
		mat4 bone = mat4( v1, v2, v3, v4 );
		return bone;
	}
#endif`,zd=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Ld=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Rd=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,kd=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Dd=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Id=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return toneMappingExposure * color;
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Nd=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmission = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmission.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmission.rgb, material.transmission );
#endif`,Od=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float framebufferLod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		#ifdef texture2DLodEXT
			return texture2DLodEXT( transmissionSamplerMap, fragCoord.xy, framebufferLod );
		#else
			return texture2D( transmissionSamplerMap, fragCoord.xy, framebufferLod );
		#endif
	}
	vec3 applyVolumeAttenuation( const in vec3 radiance, const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return radiance;
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance * radiance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		vec3 attenuatedColor = applyVolumeAttenuation( transmittedLight.rgb, length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		return vec4( ( 1.0 - F ) * attenuatedColor * diffuseColor, transmittedLight.a );
	}
#endif`,Fd=`#if ( defined( USE_UV ) && ! defined( UVS_VERTEX_ONLY ) )
	varying vec2 vUv;
#endif`,Bd=`#ifdef USE_UV
	#ifdef UVS_VERTEX_ONLY
		vec2 vUv;
	#else
		varying vec2 vUv;
	#endif
	uniform mat3 uvTransform;
#endif`,Ud=`#ifdef USE_UV
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
#endif`,Hd=`#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
	varying vec2 vUv2;
#endif`,Gd=`#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
	attribute vec2 uv2;
	varying vec2 vUv2;
	uniform mat3 uv2Transform;
#endif`,Jd=`#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
	vUv2 = ( uv2Transform * vec3( uv2, 1 ) ).xy;
#endif`,Vd=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Zd=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Wd=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,Xd=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,qd=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,Yd=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,jd=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,Kd=`#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Qd=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,$d=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,tf=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,ef=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,nf=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,sf=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,rf=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,af=`#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,of=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vUv2 );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,lf=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,cf=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,hf=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,uf=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,df=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
	vViewPosition = - mvPosition.xyz;
#endif
}`,ff=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), opacity );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,pf=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,mf=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,gf=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,vf=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULARINTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
	#ifdef USE_SPECULARCOLORMAP
		uniform sampler2D specularColorMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEENCOLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEENROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <bsdfs>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecular;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometry.clearcoatNormal, geometry.viewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + clearcoatSpecular * material.clearcoat;
	#endif
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Af=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,xf=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Sf=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,yf=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Mf=`#include <common>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,wf=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
}`,bf=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,_f=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
}`,bt={alphamap_fragment:Xh,alphamap_pars_fragment:qh,alphatest_fragment:Yh,alphatest_pars_fragment:jh,aomap_fragment:Kh,aomap_pars_fragment:Qh,begin_vertex:$h,beginnormal_vertex:tu,bsdfs:eu,iridescence_fragment:nu,bumpmap_pars_fragment:iu,clipping_planes_fragment:su,clipping_planes_pars_fragment:ru,clipping_planes_pars_vertex:au,clipping_planes_vertex:ou,color_fragment:lu,color_pars_fragment:cu,color_pars_vertex:hu,color_vertex:uu,common:du,cube_uv_reflection_fragment:fu,defaultnormal_vertex:pu,displacementmap_pars_vertex:mu,displacementmap_vertex:gu,emissivemap_fragment:vu,emissivemap_pars_fragment:Au,encodings_fragment:xu,encodings_pars_fragment:Su,envmap_fragment:yu,envmap_common_pars_fragment:Mu,envmap_pars_fragment:wu,envmap_pars_vertex:bu,envmap_physical_pars_fragment:Nu,envmap_vertex:_u,fog_vertex:Tu,fog_pars_vertex:Cu,fog_fragment:Eu,fog_pars_fragment:Pu,gradientmap_pars_fragment:zu,lightmap_fragment:Lu,lightmap_pars_fragment:Ru,lights_lambert_fragment:ku,lights_lambert_pars_fragment:Du,lights_pars_begin:Iu,lights_toon_fragment:Ou,lights_toon_pars_fragment:Fu,lights_phong_fragment:Bu,lights_phong_pars_fragment:Uu,lights_physical_fragment:Hu,lights_physical_pars_fragment:Gu,lights_fragment_begin:Ju,lights_fragment_maps:Vu,lights_fragment_end:Zu,logdepthbuf_fragment:Wu,logdepthbuf_pars_fragment:Xu,logdepthbuf_pars_vertex:qu,logdepthbuf_vertex:Yu,map_fragment:ju,map_pars_fragment:Ku,map_particle_fragment:Qu,map_particle_pars_fragment:$u,metalnessmap_fragment:td,metalnessmap_pars_fragment:ed,morphcolor_vertex:nd,morphnormal_vertex:id,morphtarget_pars_vertex:sd,morphtarget_vertex:rd,normal_fragment_begin:ad,normal_fragment_maps:od,normal_pars_fragment:ld,normal_pars_vertex:cd,normal_vertex:hd,normalmap_pars_fragment:ud,clearcoat_normal_fragment_begin:dd,clearcoat_normal_fragment_maps:fd,clearcoat_pars_fragment:pd,iridescence_pars_fragment:md,output_fragment:gd,packing:vd,premultiplied_alpha_fragment:Ad,project_vertex:xd,dithering_fragment:Sd,dithering_pars_fragment:yd,roughnessmap_fragment:Md,roughnessmap_pars_fragment:wd,shadowmap_pars_fragment:bd,shadowmap_pars_vertex:_d,shadowmap_vertex:Td,shadowmask_pars_fragment:Cd,skinbase_vertex:Ed,skinning_pars_vertex:Pd,skinning_vertex:zd,skinnormal_vertex:Ld,specularmap_fragment:Rd,specularmap_pars_fragment:kd,tonemapping_fragment:Dd,tonemapping_pars_fragment:Id,transmission_fragment:Nd,transmission_pars_fragment:Od,uv_pars_fragment:Fd,uv_pars_vertex:Bd,uv_vertex:Ud,uv2_pars_fragment:Hd,uv2_pars_vertex:Gd,uv2_vertex:Jd,worldpos_vertex:Vd,background_vert:Zd,background_frag:Wd,backgroundCube_vert:Xd,backgroundCube_frag:qd,cube_vert:Yd,cube_frag:jd,depth_vert:Kd,depth_frag:Qd,distanceRGBA_vert:$d,distanceRGBA_frag:tf,equirect_vert:ef,equirect_frag:nf,linedashed_vert:sf,linedashed_frag:rf,meshbasic_vert:af,meshbasic_frag:of,meshlambert_vert:lf,meshlambert_frag:cf,meshmatcap_vert:hf,meshmatcap_frag:uf,meshnormal_vert:df,meshnormal_frag:ff,meshphong_vert:pf,meshphong_frag:mf,meshphysical_vert:gf,meshphysical_frag:vf,meshtoon_vert:Af,meshtoon_frag:xf,points_vert:Sf,points_frag:yf,shadow_vert:Mf,shadow_frag:wf,sprite_vert:bf,sprite_frag:_f},et={common:{diffuse:{value:new _t(16777215)},opacity:{value:1},map:{value:null},uvTransform:{value:new Pe},uv2Transform:{value:new Pe},alphaMap:{value:null},alphaTest:{value:0}},specularmap:{specularMap:{value:null}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1}},emissivemap:{emissiveMap:{value:null}},bumpmap:{bumpMap:{value:null},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalScale:{value:new lt(1,1)}},displacementmap:{displacementMap:{value:null},displacementScale:{value:1},displacementBias:{value:0}},roughnessmap:{roughnessMap:{value:null}},metalnessmap:{metalnessMap:{value:null}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new _t(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new _t(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaTest:{value:0},uvTransform:{value:new Pe}},sprite:{diffuse:{value:new _t(16777215)},opacity:{value:1},center:{value:new lt(.5,.5)},rotation:{value:0},map:{value:null},alphaMap:{value:null},alphaTest:{value:0},uvTransform:{value:new Pe}}},Ve={basic:{uniforms:ve([et.common,et.specularmap,et.envmap,et.aomap,et.lightmap,et.fog]),vertexShader:bt.meshbasic_vert,fragmentShader:bt.meshbasic_frag},lambert:{uniforms:ve([et.common,et.specularmap,et.envmap,et.aomap,et.lightmap,et.emissivemap,et.bumpmap,et.normalmap,et.displacementmap,et.fog,et.lights,{emissive:{value:new _t(0)}}]),vertexShader:bt.meshlambert_vert,fragmentShader:bt.meshlambert_frag},phong:{uniforms:ve([et.common,et.specularmap,et.envmap,et.aomap,et.lightmap,et.emissivemap,et.bumpmap,et.normalmap,et.displacementmap,et.fog,et.lights,{emissive:{value:new _t(0)},specular:{value:new _t(1118481)},shininess:{value:30}}]),vertexShader:bt.meshphong_vert,fragmentShader:bt.meshphong_frag},standard:{uniforms:ve([et.common,et.envmap,et.aomap,et.lightmap,et.emissivemap,et.bumpmap,et.normalmap,et.displacementmap,et.roughnessmap,et.metalnessmap,et.fog,et.lights,{emissive:{value:new _t(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:bt.meshphysical_vert,fragmentShader:bt.meshphysical_frag},toon:{uniforms:ve([et.common,et.aomap,et.lightmap,et.emissivemap,et.bumpmap,et.normalmap,et.displacementmap,et.gradientmap,et.fog,et.lights,{emissive:{value:new _t(0)}}]),vertexShader:bt.meshtoon_vert,fragmentShader:bt.meshtoon_frag},matcap:{uniforms:ve([et.common,et.bumpmap,et.normalmap,et.displacementmap,et.fog,{matcap:{value:null}}]),vertexShader:bt.meshmatcap_vert,fragmentShader:bt.meshmatcap_frag},points:{uniforms:ve([et.points,et.fog]),vertexShader:bt.points_vert,fragmentShader:bt.points_frag},dashed:{uniforms:ve([et.common,et.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:bt.linedashed_vert,fragmentShader:bt.linedashed_frag},depth:{uniforms:ve([et.common,et.displacementmap]),vertexShader:bt.depth_vert,fragmentShader:bt.depth_frag},normal:{uniforms:ve([et.common,et.bumpmap,et.normalmap,et.displacementmap,{opacity:{value:1}}]),vertexShader:bt.meshnormal_vert,fragmentShader:bt.meshnormal_frag},sprite:{uniforms:ve([et.sprite,et.fog]),vertexShader:bt.sprite_vert,fragmentShader:bt.sprite_frag},background:{uniforms:{uvTransform:{value:new Pe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:bt.background_vert,fragmentShader:bt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1}},vertexShader:bt.backgroundCube_vert,fragmentShader:bt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:bt.cube_vert,fragmentShader:bt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:bt.equirect_vert,fragmentShader:bt.equirect_frag},distanceRGBA:{uniforms:ve([et.common,et.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:bt.distanceRGBA_vert,fragmentShader:bt.distanceRGBA_frag},shadow:{uniforms:ve([et.lights,et.fog,{color:{value:new _t(0)},opacity:{value:1}}]),vertexShader:bt.shadow_vert,fragmentShader:bt.shadow_frag}};Ve.physical={uniforms:ve([Ve.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatNormalScale:{value:new lt(1,1)},clearcoatNormalMap:{value:null},iridescence:{value:0},iridescenceMap:{value:null},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},sheen:{value:0},sheenColor:{value:new _t(0)},sheenColorMap:{value:null},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},transmission:{value:0},transmissionMap:{value:null},transmissionSamplerSize:{value:new lt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},attenuationDistance:{value:0},attenuationColor:{value:new _t(0)},specularIntensity:{value:1},specularIntensityMap:{value:null},specularColor:{value:new _t(1,1,1)},specularColorMap:{value:null}}]),vertexShader:bt.meshphysical_vert,fragmentShader:bt.meshphysical_frag};const ts={r:0,b:0,g:0};function Tf(s,t,e,n,i,r,o){const a=new _t(0);let l=r===!0?0:1,c,h,u=null,d=0,f=null;function v(p,g){let y=!1,x=g.isScene===!0?g.background:null;x&&x.isTexture&&(x=(g.backgroundBlurriness>0?e:t).get(x));const w=s.xr,M=w.getSession&&w.getSession();M&&M.environmentBlendMode==="additive"&&(x=null),x===null?m(a,l):x&&x.isColor&&(m(x,1),y=!0),(s.autoClear||y)&&s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil),x&&(x.isCubeTexture||x.mapping===fs)?(h===void 0&&(h=new Gt(new Ni(1,1,1),new xe({name:"BackgroundCubeMaterial",uniforms:hi(Ve.backgroundCube.uniforms),vertexShader:Ve.backgroundCube.vertexShader,fragmentShader:Ve.backgroundCube.fragmentShader,side:ye,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(C,z,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(h)),h.material.uniforms.envMap.value=x,h.material.uniforms.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=g.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=g.backgroundIntensity,h.material.toneMapped=x.encoding!==Ft,(u!==x||d!==x.version||f!==s.toneMapping)&&(h.material.needsUpdate=!0,u=x,d=x.version,f=s.toneMapping),h.layers.enableAll(),p.unshift(h,h.geometry,h.material,0,0,null)):x&&x.isTexture&&(c===void 0&&(c=new Gt(new gn(2,2),new xe({name:"BackgroundMaterial",uniforms:hi(Ve.background.uniforms),vertexShader:Ve.background.vertexShader,fragmentShader:Ve.background.fragmentShader,side:mn,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=x,c.material.uniforms.backgroundIntensity.value=g.backgroundIntensity,c.material.toneMapped=x.encoding!==Ft,x.matrixAutoUpdate===!0&&x.updateMatrix(),c.material.uniforms.uvTransform.value.copy(x.matrix),(u!==x||d!==x.version||f!==s.toneMapping)&&(c.material.needsUpdate=!0,u=x,d=x.version,f=s.toneMapping),c.layers.enableAll(),p.unshift(c,c.geometry,c.material,0,0,null))}function m(p,g){p.getRGB(ts,Jo(s)),n.buffers.color.setClear(ts.r,ts.g,ts.b,g,o)}return{getClearColor:function(){return a},setClearColor:function(p,g=1){a.set(p),l=g,m(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(p){l=p,m(a,l)},render:v}}function Cf(s,t,e,n){const i=s.getParameter(34921),r=n.isWebGL2?null:t.get("OES_vertex_array_object"),o=n.isWebGL2||r!==null,a={},l=p(null);let c=l,h=!1;function u(L,G,q,j,Z){let $=!1;if(o){const Q=m(j,q,G);c!==Q&&(c=Q,f(c.object)),$=g(L,j,q,Z),$&&y(L,j,q,Z)}else{const Q=G.wireframe===!0;(c.geometry!==j.id||c.program!==q.id||c.wireframe!==Q)&&(c.geometry=j.id,c.program=q.id,c.wireframe=Q,$=!0)}Z!==null&&e.update(Z,34963),($||h)&&(h=!1,A(L,G,q,j),Z!==null&&s.bindBuffer(34963,e.get(Z).buffer))}function d(){return n.isWebGL2?s.createVertexArray():r.createVertexArrayOES()}function f(L){return n.isWebGL2?s.bindVertexArray(L):r.bindVertexArrayOES(L)}function v(L){return n.isWebGL2?s.deleteVertexArray(L):r.deleteVertexArrayOES(L)}function m(L,G,q){const j=q.wireframe===!0;let Z=a[L.id];Z===void 0&&(Z={},a[L.id]=Z);let $=Z[G.id];$===void 0&&($={},Z[G.id]=$);let Q=$[j];return Q===void 0&&(Q=p(d()),$[j]=Q),Q}function p(L){const G=[],q=[],j=[];for(let Z=0;Z<i;Z++)G[Z]=0,q[Z]=0,j[Z]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:G,enabledAttributes:q,attributeDivisors:j,object:L,attributes:{},index:null}}function g(L,G,q,j){const Z=c.attributes,$=G.attributes;let Q=0;const ct=q.getAttributes();for(const N in ct)if(ct[N].location>=0){const nt=Z[N];let it=$[N];if(it===void 0&&(N==="instanceMatrix"&&L.instanceMatrix&&(it=L.instanceMatrix),N==="instanceColor"&&L.instanceColor&&(it=L.instanceColor)),nt===void 0||nt.attribute!==it||it&&nt.data!==it.data)return!0;Q++}return c.attributesNum!==Q||c.index!==j}function y(L,G,q,j){const Z={},$=G.attributes;let Q=0;const ct=q.getAttributes();for(const N in ct)if(ct[N].location>=0){let nt=$[N];nt===void 0&&(N==="instanceMatrix"&&L.instanceMatrix&&(nt=L.instanceMatrix),N==="instanceColor"&&L.instanceColor&&(nt=L.instanceColor));const it={};it.attribute=nt,nt&&nt.data&&(it.data=nt.data),Z[N]=it,Q++}c.attributes=Z,c.attributesNum=Q,c.index=j}function x(){const L=c.newAttributes;for(let G=0,q=L.length;G<q;G++)L[G]=0}function w(L){M(L,0)}function M(L,G){const q=c.newAttributes,j=c.enabledAttributes,Z=c.attributeDivisors;q[L]=1,j[L]===0&&(s.enableVertexAttribArray(L),j[L]=1),Z[L]!==G&&((n.isWebGL2?s:t.get("ANGLE_instanced_arrays"))[n.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](L,G),Z[L]=G)}function C(){const L=c.newAttributes,G=c.enabledAttributes;for(let q=0,j=G.length;q<j;q++)G[q]!==L[q]&&(s.disableVertexAttribArray(q),G[q]=0)}function z(L,G,q,j,Z,$){n.isWebGL2===!0&&(q===5124||q===5125)?s.vertexAttribIPointer(L,G,q,Z,$):s.vertexAttribPointer(L,G,q,j,Z,$)}function A(L,G,q,j){if(n.isWebGL2===!1&&(L.isInstancedMesh||j.isInstancedBufferGeometry)&&t.get("ANGLE_instanced_arrays")===null)return;x();const Z=j.attributes,$=q.getAttributes(),Q=G.defaultAttributeValues;for(const ct in $){const N=$[ct];if(N.location>=0){let W=Z[ct];if(W===void 0&&(ct==="instanceMatrix"&&L.instanceMatrix&&(W=L.instanceMatrix),ct==="instanceColor"&&L.instanceColor&&(W=L.instanceColor)),W!==void 0){const nt=W.normalized,it=W.itemSize,O=e.get(W);if(O===void 0)continue;const Mt=O.buffer,dt=O.type,ft=O.bytesPerElement;if(W.isInterleavedBufferAttribute){const ot=W.data,Nt=ot.stride,wt=W.offset;if(ot.isInstancedInterleavedBuffer){for(let xt=0;xt<N.locationSize;xt++)M(N.location+xt,ot.meshPerAttribute);L.isInstancedMesh!==!0&&j._maxInstanceCount===void 0&&(j._maxInstanceCount=ot.meshPerAttribute*ot.count)}else for(let xt=0;xt<N.locationSize;xt++)w(N.location+xt);s.bindBuffer(34962,Mt);for(let xt=0;xt<N.locationSize;xt++)z(N.location+xt,it/N.locationSize,dt,nt,Nt*ft,(wt+it/N.locationSize*xt)*ft)}else{if(W.isInstancedBufferAttribute){for(let ot=0;ot<N.locationSize;ot++)M(N.location+ot,W.meshPerAttribute);L.isInstancedMesh!==!0&&j._maxInstanceCount===void 0&&(j._maxInstanceCount=W.meshPerAttribute*W.count)}else for(let ot=0;ot<N.locationSize;ot++)w(N.location+ot);s.bindBuffer(34962,Mt);for(let ot=0;ot<N.locationSize;ot++)z(N.location+ot,it/N.locationSize,dt,nt,it*ft,it/N.locationSize*ot*ft)}}else if(Q!==void 0){const nt=Q[ct];if(nt!==void 0)switch(nt.length){case 2:s.vertexAttrib2fv(N.location,nt);break;case 3:s.vertexAttrib3fv(N.location,nt);break;case 4:s.vertexAttrib4fv(N.location,nt);break;default:s.vertexAttrib1fv(N.location,nt)}}}}C()}function T(){X();for(const L in a){const G=a[L];for(const q in G){const j=G[q];for(const Z in j)v(j[Z].object),delete j[Z];delete G[q]}delete a[L]}}function k(L){if(a[L.id]===void 0)return;const G=a[L.id];for(const q in G){const j=G[q];for(const Z in j)v(j[Z].object),delete j[Z];delete G[q]}delete a[L.id]}function V(L){for(const G in a){const q=a[G];if(q[L.id]===void 0)continue;const j=q[L.id];for(const Z in j)v(j[Z].object),delete j[Z];delete q[L.id]}}function X(){D(),h=!0,c!==l&&(c=l,f(c.object))}function D(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:u,reset:X,resetDefaultState:D,dispose:T,releaseStatesOfGeometry:k,releaseStatesOfProgram:V,initAttributes:x,enableAttribute:w,disableUnusedAttributes:C}}function Ef(s,t,e,n){const i=n.isWebGL2;let r;function o(c){r=c}function a(c,h){s.drawArrays(r,c,h),e.update(h,r,1)}function l(c,h,u){if(u===0)return;let d,f;if(i)d=s,f="drawArraysInstanced";else if(d=t.get("ANGLE_instanced_arrays"),f="drawArraysInstancedANGLE",d===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}d[f](r,c,h,u),e.update(h,r,u)}this.setMode=o,this.render=a,this.renderInstances=l}function Pf(s,t,e){let n;function i(){if(n!==void 0)return n;if(t.has("EXT_texture_filter_anisotropic")===!0){const z=t.get("EXT_texture_filter_anisotropic");n=s.getParameter(z.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function r(z){if(z==="highp"){if(s.getShaderPrecisionFormat(35633,36338).precision>0&&s.getShaderPrecisionFormat(35632,36338).precision>0)return"highp";z="mediump"}return z==="mediump"&&s.getShaderPrecisionFormat(35633,36337).precision>0&&s.getShaderPrecisionFormat(35632,36337).precision>0?"mediump":"lowp"}const o=typeof WebGL2RenderingContext<"u"&&s instanceof WebGL2RenderingContext;let a=e.precision!==void 0?e.precision:"highp";const l=r(a);l!==a&&(console.warn("THREE.WebGLRenderer:",a,"not supported, using",l,"instead."),a=l);const c=o||t.has("WEBGL_draw_buffers"),h=e.logarithmicDepthBuffer===!0,u=s.getParameter(34930),d=s.getParameter(35660),f=s.getParameter(3379),v=s.getParameter(34076),m=s.getParameter(34921),p=s.getParameter(36347),g=s.getParameter(36348),y=s.getParameter(36349),x=d>0,w=o||t.has("OES_texture_float"),M=x&&w,C=o?s.getParameter(36183):0;return{isWebGL2:o,drawBuffers:c,getMaxAnisotropy:i,getMaxPrecision:r,precision:a,logarithmicDepthBuffer:h,maxTextures:u,maxVertexTextures:d,maxTextureSize:f,maxCubemapSize:v,maxAttributes:m,maxVertexUniforms:p,maxVaryings:g,maxFragmentUniforms:y,vertexTextures:x,floatFragmentTextures:w,floatVertexTextures:M,maxSamples:C}}function zf(s){const t=this;let e=null,n=0,i=!1,r=!1;const o=new _n,a=new Pe,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){const f=u.length!==0||d||n!==0||i;return i=d,n=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){e=h(u,d,0)},this.setState=function(u,d,f){const v=u.clippingPlanes,m=u.clipIntersection,p=u.clipShadows,g=s.get(u);if(!i||v===null||v.length===0||r&&!p)r?h(null):c();else{const y=r?0:n,x=y*4;let w=g.clippingState||null;l.value=w,w=h(v,d,x,f);for(let M=0;M!==x;++M)w[M]=e[M];g.clippingState=w,this.numIntersection=m?this.numPlanes:0,this.numPlanes+=y}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(u,d,f,v){const m=u!==null?u.length:0;let p=null;if(m!==0){if(p=l.value,v!==!0||p===null){const g=f+m*4,y=d.matrixWorldInverse;a.getNormalMatrix(y),(p===null||p.length<g)&&(p=new Float32Array(g));for(let x=0,w=f;x!==m;++x,w+=4)o.copy(u[x]).applyMatrix4(y,a),o.normal.toArray(p,w),p[w+3]=o.constant}l.value=p,l.needsUpdate=!0}return t.numPlanes=m,t.numIntersection=0,p}}function Lf(s){let t=new WeakMap;function e(o,a){return a===xr?o.mapping=oi:a===Sr&&(o.mapping=li),o}function n(o){if(o&&o.isTexture&&o.isRenderTargetTexture===!1){const a=o.mapping;if(a===xr||a===Sr)if(t.has(o)){const l=t.get(o).texture;return e(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new Jh(l.height/2);return c.fromEquirectangularTexture(s,o),t.set(o,c),o.addEventListener("dispose",i),e(c.texture,o.mapping)}else return null}}return o}function i(o){const a=o.target;a.removeEventListener("dispose",i);const l=t.get(a);l!==void 0&&(t.delete(a),l.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}class qo extends Vo{constructor(t=-1,e=1,n=1,i=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=i,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,i,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let r=n-t,o=n+t,a=i+e,l=i-e;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}const ti=4,Oa=[.125,.215,.35,.446,.526,.582],Cn=20,Qs=new qo,Fa=new _t;let $s=null;const Tn=(1+Math.sqrt(5))/2,Kn=1/Tn,Ba=[new P(1,1,1),new P(-1,1,1),new P(1,1,-1),new P(-1,1,-1),new P(0,Tn,Kn),new P(0,Tn,-Kn),new P(Kn,0,Tn),new P(-Kn,0,Tn),new P(Tn,Kn,0),new P(-Tn,Kn,0)];class Ua{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,i=100){$s=this._renderer.getRenderTarget(),this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(t,n,i,r),e>0&&this._blur(r,0,0,e),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Ja(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Ga(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget($s),t.scissorTest=!1,es(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===oi||t.mapping===li?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),$s=this._renderer.getRenderTarget();const n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:Se,minFilter:Se,generateMipmaps:!1,type:zi,format:Ie,encoding:In,depthBuffer:!1},i=Ha(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Ha(t,e,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Rf(r)),this._blurMaterial=kf(r,t,e)}return i}_compileMaterial(t){const e=new Gt(this._lodPlanes[0],t);this._renderer.compile(e,Qs)}_sceneToCubeUV(t,e,n,i){const a=new De(90,1,e,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,d=h.toneMapping;h.getClearColor(Fa),h.toneMapping=sn,h.autoClear=!1;const f=new di({name:"PMREM.Background",side:ye,depthWrite:!1,depthTest:!1}),v=new Gt(new Ni,f);let m=!1;const p=t.background;p?p.isColor&&(f.color.copy(p),t.background=null,m=!0):(f.color.copy(Fa),m=!0);for(let g=0;g<6;g++){const y=g%3;y===0?(a.up.set(0,l[g],0),a.lookAt(c[g],0,0)):y===1?(a.up.set(0,0,l[g]),a.lookAt(0,c[g],0)):(a.up.set(0,l[g],0),a.lookAt(0,0,c[g]));const x=this._cubeSize;es(i,y*x,g>2?x:0,x,x),h.setRenderTarget(i),m&&h.render(v,a),h.render(t,a)}v.geometry.dispose(),v.material.dispose(),h.toneMapping=d,h.autoClear=u,t.background=p}_textureToCubeUV(t,e){const n=this._renderer,i=t.mapping===oi||t.mapping===li;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=Ja()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Ga());const r=i?this._cubemapMaterial:this._equirectMaterial,o=new Gt(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=t;const l=this._cubeSize;es(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(o,Qs)}_applyPMREM(t){const e=this._renderer,n=e.autoClear;e.autoClear=!1;for(let i=1;i<this._lodPlanes.length;i++){const r=Math.sqrt(this._sigmas[i]*this._sigmas[i]-this._sigmas[i-1]*this._sigmas[i-1]),o=Ba[(i-1)%Ba.length];this._blur(t,i-1,i,r,o)}e.autoClear=n}_blur(t,e,n,i,r){const o=this._pingPongRenderTarget;this._halfBlur(t,o,e,n,i,"latitudinal",r),this._halfBlur(o,t,n,n,i,"longitudinal",r)}_halfBlur(t,e,n,i,r,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new Gt(this._lodPlanes[i],c),d=c.uniforms,f=this._sizeLods[n]-1,v=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*Cn-1),m=r/v,p=isFinite(r)?1+Math.floor(h*m):Cn;p>Cn&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${Cn}`);const g=[];let y=0;for(let z=0;z<Cn;++z){const A=z/m,T=Math.exp(-A*A/2);g.push(T),z===0?y+=T:z<p&&(y+=2*T)}for(let z=0;z<g.length;z++)g[z]=g[z]/y;d.envMap.value=t.texture,d.samples.value=p,d.weights.value=g,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);const{_lodMax:x}=this;d.dTheta.value=v,d.mipInt.value=x-n;const w=this._sizeLods[i],M=3*w*(i>x-ti?i-x+ti:0),C=4*(this._cubeSize-w);es(e,M,C,3*w,2*w),l.setRenderTarget(e),l.render(u,Qs)}}function Rf(s){const t=[],e=[],n=[];let i=s;const r=s-ti+1+Oa.length;for(let o=0;o<r;o++){const a=Math.pow(2,i);e.push(a);let l=1/a;o>s-ti?l=Oa[o-s+ti-1]:o===0&&(l=0),n.push(l);const c=1/(a-2),h=-c,u=1+c,d=[h,h,u,h,u,u,h,h,u,u,h,u],f=6,v=6,m=3,p=2,g=1,y=new Float32Array(m*v*f),x=new Float32Array(p*v*f),w=new Float32Array(g*v*f);for(let C=0;C<f;C++){const z=C%3*2/3-1,A=C>2?0:-1,T=[z,A,0,z+2/3,A,0,z+2/3,A+1,0,z,A,0,z+2/3,A+1,0,z,A+1,0];y.set(T,m*v*C),x.set(d,p*v*C);const k=[C,C,C,C,C,C];w.set(k,g*v*C)}const M=new oe;M.setAttribute("position",new Wt(y,m)),M.setAttribute("uv",new Wt(x,p)),M.setAttribute("faceIndex",new Wt(w,g)),t.push(M),i>ti&&i--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function Ha(s,t,e){const n=new rn(s,t,e);return n.texture.mapping=fs,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function es(s,t,e,n,i){s.viewport.set(t,e,n,i),s.scissor.set(t,e,n,i)}function kf(s,t,e){const n=new Float32Array(Cn),i=new P(0,1,0);return new xe({name:"SphericalGaussianBlur",defines:{n:Cn,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:zr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:fn,depthTest:!1,depthWrite:!1})}function Ga(){return new xe({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:zr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:fn,depthTest:!1,depthWrite:!1})}function Ja(){return new xe({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:zr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:fn,depthTest:!1,depthWrite:!1})}function zr(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Df(s){let t=new WeakMap,e=null;function n(a){if(a&&a.isTexture){const l=a.mapping,c=l===xr||l===Sr,h=l===oi||l===li;if(c||h)if(a.isRenderTargetTexture&&a.needsPMREMUpdate===!0){a.needsPMREMUpdate=!1;let u=t.get(a);return e===null&&(e=new Ua(s)),u=c?e.fromEquirectangular(a,u):e.fromCubemap(a,u),t.set(a,u),u.texture}else{if(t.has(a))return t.get(a).texture;{const u=a.image;if(c&&u&&u.height>0||h&&u&&i(u)){e===null&&(e=new Ua(s));const d=c?e.fromEquirectangular(a):e.fromCubemap(a);return t.set(a,d),a.addEventListener("dispose",r),d.texture}else return null}}}return a}function i(a){let l=0;const c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function r(a){const l=a.target;l.removeEventListener("dispose",r);const c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function o(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:o}}function If(s){const t={};function e(n){if(t[n]!==void 0)return t[n];let i;switch(n){case"WEBGL_depth_texture":i=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=s.getExtension(n)}return t[n]=i,i}return{has:function(n){return e(n)!==null},init:function(n){n.isWebGL2?e("EXT_color_buffer_float"):(e("WEBGL_depth_texture"),e("OES_texture_float"),e("OES_texture_half_float"),e("OES_texture_half_float_linear"),e("OES_standard_derivatives"),e("OES_element_index_uint"),e("OES_vertex_array_object"),e("ANGLE_instanced_arrays")),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture")},get:function(n){const i=e(n);return i===null&&console.warn("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function Nf(s,t,e,n){const i={},r=new WeakMap;function o(u){const d=u.target;d.index!==null&&t.remove(d.index);for(const v in d.attributes)t.remove(d.attributes[v]);d.removeEventListener("dispose",o),delete i[d.id];const f=r.get(d);f&&(t.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,e.memory.geometries--}function a(u,d){return i[d.id]===!0||(d.addEventListener("dispose",o),i[d.id]=!0,e.memory.geometries++),d}function l(u){const d=u.attributes;for(const v in d)t.update(d[v],34962);const f=u.morphAttributes;for(const v in f){const m=f[v];for(let p=0,g=m.length;p<g;p++)t.update(m[p],34962)}}function c(u){const d=[],f=u.index,v=u.attributes.position;let m=0;if(f!==null){const y=f.array;m=f.version;for(let x=0,w=y.length;x<w;x+=3){const M=y[x+0],C=y[x+1],z=y[x+2];d.push(M,C,C,z,z,M)}}else{const y=v.array;m=v.version;for(let x=0,w=y.length/3-1;x<w;x+=3){const M=x+0,C=x+1,z=x+2;d.push(M,C,C,z,z,M)}}const p=new(Do(d)?Go:Ho)(d,1);p.version=m;const g=r.get(u);g&&t.remove(g),r.set(u,p)}function h(u){const d=r.get(u);if(d){const f=u.index;f!==null&&d.version<f.version&&c(u)}else c(u);return r.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function Of(s,t,e,n){const i=n.isWebGL2;let r;function o(d){r=d}let a,l;function c(d){a=d.type,l=d.bytesPerElement}function h(d,f){s.drawElements(r,f,a,d*l),e.update(f,r,1)}function u(d,f,v){if(v===0)return;let m,p;if(i)m=s,p="drawElementsInstanced";else if(m=t.get("ANGLE_instanced_arrays"),p="drawElementsInstancedANGLE",m===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}m[p](r,f,a,d*l,v),e.update(f,r,v)}this.setMode=o,this.setIndex=c,this.render=h,this.renderInstances=u}function Ff(s){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(e.calls++,o){case 4:e.triangles+=a*(r/3);break;case 1:e.lines+=a*(r/2);break;case 3:e.lines+=a*(r-1);break;case 2:e.lines+=a*r;break;case 0:e.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function i(){e.frame++,e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:i,update:n}}function Bf(s,t){return s[0]-t[0]}function Uf(s,t){return Math.abs(t[1])-Math.abs(s[1])}function Hf(s,t,e){const n={},i=new Float32Array(8),r=new WeakMap,o=new ae,a=[];for(let c=0;c<8;c++)a[c]=[c,0];function l(c,h,u,d){const f=c.morphTargetInfluences;if(t.isWebGL2===!0){const m=h.morphAttributes.position||h.morphAttributes.normal||h.morphAttributes.color,p=m!==void 0?m.length:0;let g=r.get(h);if(g===void 0||g.count!==p){let q=function(){L.dispose(),r.delete(h),h.removeEventListener("dispose",q)};var v=q;g!==void 0&&g.texture.dispose();const w=h.morphAttributes.position!==void 0,M=h.morphAttributes.normal!==void 0,C=h.morphAttributes.color!==void 0,z=h.morphAttributes.position||[],A=h.morphAttributes.normal||[],T=h.morphAttributes.color||[];let k=0;w===!0&&(k=1),M===!0&&(k=2),C===!0&&(k=3);let V=h.attributes.position.count*k,X=1;V>t.maxTextureSize&&(X=Math.ceil(V/t.maxTextureSize),V=t.maxTextureSize);const D=new Float32Array(V*X*4*p),L=new Fo(D,V,X,p);L.type=dn,L.needsUpdate=!0;const G=k*4;for(let j=0;j<p;j++){const Z=z[j],$=A[j],Q=T[j],ct=V*X*4*j;for(let N=0;N<Z.count;N++){const W=N*G;w===!0&&(o.fromBufferAttribute(Z,N),D[ct+W+0]=o.x,D[ct+W+1]=o.y,D[ct+W+2]=o.z,D[ct+W+3]=0),M===!0&&(o.fromBufferAttribute($,N),D[ct+W+4]=o.x,D[ct+W+5]=o.y,D[ct+W+6]=o.z,D[ct+W+7]=0),C===!0&&(o.fromBufferAttribute(Q,N),D[ct+W+8]=o.x,D[ct+W+9]=o.y,D[ct+W+10]=o.z,D[ct+W+11]=Q.itemSize===4?o.w:1)}}g={count:p,texture:L,size:new lt(V,X)},r.set(h,g),h.addEventListener("dispose",q)}let y=0;for(let w=0;w<f.length;w++)y+=f[w];const x=h.morphTargetsRelative?1:1-y;d.getUniforms().setValue(s,"morphTargetBaseInfluence",x),d.getUniforms().setValue(s,"morphTargetInfluences",f),d.getUniforms().setValue(s,"morphTargetsTexture",g.texture,e),d.getUniforms().setValue(s,"morphTargetsTextureSize",g.size)}else{const m=f===void 0?0:f.length;let p=n[h.id];if(p===void 0||p.length!==m){p=[];for(let M=0;M<m;M++)p[M]=[M,0];n[h.id]=p}for(let M=0;M<m;M++){const C=p[M];C[0]=M,C[1]=f[M]}p.sort(Uf);for(let M=0;M<8;M++)M<m&&p[M][1]?(a[M][0]=p[M][0],a[M][1]=p[M][1]):(a[M][0]=Number.MAX_SAFE_INTEGER,a[M][1]=0);a.sort(Bf);const g=h.morphAttributes.position,y=h.morphAttributes.normal;let x=0;for(let M=0;M<8;M++){const C=a[M],z=C[0],A=C[1];z!==Number.MAX_SAFE_INTEGER&&A?(g&&h.getAttribute("morphTarget"+M)!==g[z]&&h.setAttribute("morphTarget"+M,g[z]),y&&h.getAttribute("morphNormal"+M)!==y[z]&&h.setAttribute("morphNormal"+M,y[z]),i[M]=A,x+=A):(g&&h.hasAttribute("morphTarget"+M)===!0&&h.deleteAttribute("morphTarget"+M),y&&h.hasAttribute("morphNormal"+M)===!0&&h.deleteAttribute("morphNormal"+M),i[M]=0)}const w=h.morphTargetsRelative?1:1-x;d.getUniforms().setValue(s,"morphTargetBaseInfluence",w),d.getUniforms().setValue(s,"morphTargetInfluences",i)}}return{update:l}}function Gf(s,t,e,n){let i=new WeakMap;function r(l){const c=n.render.frame,h=l.geometry,u=t.get(l,h);return i.get(u)!==c&&(t.update(u),i.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),e.update(l.instanceMatrix,34962),l.instanceColor!==null&&e.update(l.instanceColor,34962)),u}function o(){i=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:o}}const Yo=new de,jo=new Fo,Ko=new Ch,Qo=new Zo,Va=[],Za=[],Wa=new Float32Array(16),Xa=new Float32Array(9),qa=new Float32Array(4);function fi(s,t,e){const n=s[0];if(n<=0||n>0)return s;const i=t*e;let r=Va[i];if(r===void 0&&(r=new Float32Array(i),Va[i]=r),t!==0){n.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,s[o].toArray(r,a)}return r}function Qt(s,t){if(s.length!==t.length)return!1;for(let e=0,n=s.length;e<n;e++)if(s[e]!==t[e])return!1;return!0}function $t(s,t){for(let e=0,n=t.length;e<n;e++)s[e]=t[e]}function gs(s,t){let e=Za[t];e===void 0&&(e=new Int32Array(t),Za[t]=e);for(let n=0;n!==t;++n)e[n]=s.allocateTextureUnit();return e}function Jf(s,t){const e=this.cache;e[0]!==t&&(s.uniform1f(this.addr,t),e[0]=t)}function Vf(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Qt(e,t))return;s.uniform2fv(this.addr,t),$t(e,t)}}function Zf(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(s.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Qt(e,t))return;s.uniform3fv(this.addr,t),$t(e,t)}}function Wf(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Qt(e,t))return;s.uniform4fv(this.addr,t),$t(e,t)}}function Xf(s,t){const e=this.cache,n=t.elements;if(n===void 0){if(Qt(e,t))return;s.uniformMatrix2fv(this.addr,!1,t),$t(e,t)}else{if(Qt(e,n))return;qa.set(n),s.uniformMatrix2fv(this.addr,!1,qa),$t(e,n)}}function qf(s,t){const e=this.cache,n=t.elements;if(n===void 0){if(Qt(e,t))return;s.uniformMatrix3fv(this.addr,!1,t),$t(e,t)}else{if(Qt(e,n))return;Xa.set(n),s.uniformMatrix3fv(this.addr,!1,Xa),$t(e,n)}}function Yf(s,t){const e=this.cache,n=t.elements;if(n===void 0){if(Qt(e,t))return;s.uniformMatrix4fv(this.addr,!1,t),$t(e,t)}else{if(Qt(e,n))return;Wa.set(n),s.uniformMatrix4fv(this.addr,!1,Wa),$t(e,n)}}function jf(s,t){const e=this.cache;e[0]!==t&&(s.uniform1i(this.addr,t),e[0]=t)}function Kf(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Qt(e,t))return;s.uniform2iv(this.addr,t),$t(e,t)}}function Qf(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Qt(e,t))return;s.uniform3iv(this.addr,t),$t(e,t)}}function $f(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Qt(e,t))return;s.uniform4iv(this.addr,t),$t(e,t)}}function tp(s,t){const e=this.cache;e[0]!==t&&(s.uniform1ui(this.addr,t),e[0]=t)}function ep(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Qt(e,t))return;s.uniform2uiv(this.addr,t),$t(e,t)}}function np(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Qt(e,t))return;s.uniform3uiv(this.addr,t),$t(e,t)}}function ip(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Qt(e,t))return;s.uniform4uiv(this.addr,t),$t(e,t)}}function sp(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTexture2D(t||Yo,i)}function rp(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTexture3D(t||Ko,i)}function ap(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTextureCube(t||Qo,i)}function op(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTexture2DArray(t||jo,i)}function lp(s){switch(s){case 5126:return Jf;case 35664:return Vf;case 35665:return Zf;case 35666:return Wf;case 35674:return Xf;case 35675:return qf;case 35676:return Yf;case 5124:case 35670:return jf;case 35667:case 35671:return Kf;case 35668:case 35672:return Qf;case 35669:case 35673:return $f;case 5125:return tp;case 36294:return ep;case 36295:return np;case 36296:return ip;case 35678:case 36198:case 36298:case 36306:case 35682:return sp;case 35679:case 36299:case 36307:return rp;case 35680:case 36300:case 36308:case 36293:return ap;case 36289:case 36303:case 36311:case 36292:return op}}function cp(s,t){s.uniform1fv(this.addr,t)}function hp(s,t){const e=fi(t,this.size,2);s.uniform2fv(this.addr,e)}function up(s,t){const e=fi(t,this.size,3);s.uniform3fv(this.addr,e)}function dp(s,t){const e=fi(t,this.size,4);s.uniform4fv(this.addr,e)}function fp(s,t){const e=fi(t,this.size,4);s.uniformMatrix2fv(this.addr,!1,e)}function pp(s,t){const e=fi(t,this.size,9);s.uniformMatrix3fv(this.addr,!1,e)}function mp(s,t){const e=fi(t,this.size,16);s.uniformMatrix4fv(this.addr,!1,e)}function gp(s,t){s.uniform1iv(this.addr,t)}function vp(s,t){s.uniform2iv(this.addr,t)}function Ap(s,t){s.uniform3iv(this.addr,t)}function xp(s,t){s.uniform4iv(this.addr,t)}function Sp(s,t){s.uniform1uiv(this.addr,t)}function yp(s,t){s.uniform2uiv(this.addr,t)}function Mp(s,t){s.uniform3uiv(this.addr,t)}function wp(s,t){s.uniform4uiv(this.addr,t)}function bp(s,t,e){const n=this.cache,i=t.length,r=gs(e,i);Qt(n,r)||(s.uniform1iv(this.addr,r),$t(n,r));for(let o=0;o!==i;++o)e.setTexture2D(t[o]||Yo,r[o])}function _p(s,t,e){const n=this.cache,i=t.length,r=gs(e,i);Qt(n,r)||(s.uniform1iv(this.addr,r),$t(n,r));for(let o=0;o!==i;++o)e.setTexture3D(t[o]||Ko,r[o])}function Tp(s,t,e){const n=this.cache,i=t.length,r=gs(e,i);Qt(n,r)||(s.uniform1iv(this.addr,r),$t(n,r));for(let o=0;o!==i;++o)e.setTextureCube(t[o]||Qo,r[o])}function Cp(s,t,e){const n=this.cache,i=t.length,r=gs(e,i);Qt(n,r)||(s.uniform1iv(this.addr,r),$t(n,r));for(let o=0;o!==i;++o)e.setTexture2DArray(t[o]||jo,r[o])}function Ep(s){switch(s){case 5126:return cp;case 35664:return hp;case 35665:return up;case 35666:return dp;case 35674:return fp;case 35675:return pp;case 35676:return mp;case 5124:case 35670:return gp;case 35667:case 35671:return vp;case 35668:case 35672:return Ap;case 35669:case 35673:return xp;case 5125:return Sp;case 36294:return yp;case 36295:return Mp;case 36296:return wp;case 35678:case 36198:case 36298:case 36306:case 35682:return bp;case 35679:case 36299:case 36307:return _p;case 35680:case 36300:case 36308:case 36293:return Tp;case 36289:case 36303:case 36311:case 36292:return Cp}}class Pp{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.setValue=lp(e.type)}}class zp{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.size=e.size,this.setValue=Ep(e.type)}}class Lp{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const i=this.seq;for(let r=0,o=i.length;r!==o;++r){const a=i[r];a.setValue(t,e[a.id],n)}}}const tr=/(\w+)(\])?(\[|\.)?/g;function Ya(s,t){s.seq.push(t),s.map[t.id]=t}function Rp(s,t,e){const n=s.name,i=n.length;for(tr.lastIndex=0;;){const r=tr.exec(n),o=tr.lastIndex;let a=r[1];const l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===i){Ya(e,c===void 0?new Pp(a,s,t):new zp(a,s,t));break}else{let u=e.map[a];u===void 0&&(u=new Lp(a),Ya(e,u)),e=u}}}class ls{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,35718);for(let i=0;i<n;++i){const r=t.getActiveUniform(e,i),o=t.getUniformLocation(e,r.name);Rp(r,o,this)}}setValue(t,e,n,i){const r=this.map[e];r!==void 0&&r.setValue(t,n,i)}setOptional(t,e,n){const i=e[n];i!==void 0&&this.setValue(t,n,i)}static upload(t,e,n,i){for(let r=0,o=e.length;r!==o;++r){const a=e[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,i)}}static seqWithValue(t,e){const n=[];for(let i=0,r=t.length;i!==r;++i){const o=t[i];o.id in e&&n.push(o)}return n}}function ja(s,t,e){const n=s.createShader(t);return s.shaderSource(n,e),s.compileShader(n),n}let kp=0;function Dp(s,t){const e=s.split(`
`),n=[],i=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=i;o<r;o++){const a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}function Ip(s){switch(s){case In:return["Linear","( value )"];case Ft:return["sRGB","( value )"];default:return console.warn("THREE.WebGLProgram: Unsupported encoding:",s),["Linear","( value )"]}}function Ka(s,t,e){const n=s.getShaderParameter(t,35713),i=s.getShaderInfoLog(t).trim();if(n&&i==="")return"";const r=/ERROR: 0:(\d+)/.exec(i);if(r){const o=parseInt(r[1]);return e.toUpperCase()+`

`+i+`

`+Dp(s.getShaderSource(t),o)}else return i}function Np(s,t){const e=Ip(t);return"vec4 "+s+"( vec4 value ) { return LinearTo"+e[0]+e[1]+"; }"}function Op(s,t){let e;switch(t){case $c:e="Linear";break;case th:e="Reinhard";break;case eh:e="OptimizedCineon";break;case nh:e="ACESFilmic";break;case ih:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+s+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}function Fp(s){return[s.extensionDerivatives||s.envMapCubeUVHeight||s.bumpMap||s.tangentSpaceNormalMap||s.clearcoatNormalMap||s.flatShading||s.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(s.extensionFragDepth||s.logarithmicDepthBuffer)&&s.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",s.extensionDrawBuffers&&s.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(s.extensionShaderTextureLOD||s.envMap||s.transmission)&&s.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(wi).join(`
`)}function Bp(s){const t=[];for(const e in s){const n=s[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function Up(s,t){const e={},n=s.getProgramParameter(t,35721);for(let i=0;i<n;i++){const r=s.getActiveAttrib(t,i),o=r.name;let a=1;r.type===35674&&(a=2),r.type===35675&&(a=3),r.type===35676&&(a=4),e[o]={type:r.type,location:s.getAttribLocation(t,o),locationSize:a}}return e}function wi(s){return s!==""}function Qa(s,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function $a(s,t){return s.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const Hp=/^[ \t]*#include +<([\w\d./]+)>/gm;function br(s){return s.replace(Hp,Gp)}function Gp(s,t){const e=bt[t];if(e===void 0)throw new Error("Can not resolve #include <"+t+">");return br(e)}const Jp=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function to(s){return s.replace(Jp,Vp)}function Vp(s,t,e,n){let i="";for(let r=parseInt(t);r<parseInt(e);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function eo(s){let t="precision "+s.precision+` float;
precision `+s.precision+" int;";return s.precision==="highp"?t+=`
#define HIGH_PRECISION`:s.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function Zp(s){let t="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===Po?t="SHADOWMAP_TYPE_PCF":s.shadowMapType===Lc?t="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===Mi&&(t="SHADOWMAP_TYPE_VSM"),t}function Wp(s){let t="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case oi:case li:t="ENVMAP_TYPE_CUBE";break;case fs:t="ENVMAP_TYPE_CUBE_UV";break}return t}function Xp(s){let t="ENVMAP_MODE_REFLECTION";if(s.envMap)switch(s.envMapMode){case li:t="ENVMAP_MODE_REFRACTION";break}return t}function qp(s){let t="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case Ro:t="ENVMAP_BLENDING_MULTIPLY";break;case Kc:t="ENVMAP_BLENDING_MIX";break;case Qc:t="ENVMAP_BLENDING_ADD";break}return t}function Yp(s){const t=s.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),7*16)),texelHeight:n,maxMip:e}}function jp(s,t,e,n){const i=s.getContext(),r=e.defines;let o=e.vertexShader,a=e.fragmentShader;const l=Zp(e),c=Wp(e),h=Xp(e),u=qp(e),d=Yp(e),f=e.isWebGL2?"":Fp(e),v=Bp(r),m=i.createProgram();let p,g,y=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(p=[v].filter(wi).join(`
`),p.length>0&&(p+=`
`),g=[f,v].filter(wi).join(`
`),g.length>0&&(g+=`
`)):(p=[eo(e),"#define SHADER_NAME "+e.shaderName,v,e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.supportsVertexTextures?"#define VERTEX_TEXTURES":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMap&&e.objectSpaceNormalMap?"#define OBJECTSPACE_NORMALMAP":"",e.normalMap&&e.tangentSpaceNormalMap?"#define TANGENTSPACE_NORMALMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.displacementMap&&e.supportsVertexTextures?"#define USE_DISPLACEMENTMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularIntensityMap?"#define USE_SPECULARINTENSITYMAP":"",e.specularColorMap?"#define USE_SPECULARCOLORMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEENCOLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEENROUGHNESSMAP":"",e.vertexTangents?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUvs?"#define USE_UV":"",e.uvsVertexOnly?"#define UVS_VERTEX_ONLY":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors&&e.isWebGL2?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0&&e.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",e.morphTargetsCount>0&&e.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0&&e.isWebGL2?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.logarithmicDepthBuffer&&e.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(wi).join(`
`),g=[f,eo(e),"#define SHADER_NAME "+e.shaderName,v,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMap&&e.objectSpaceNormalMap?"#define OBJECTSPACE_NORMALMAP":"",e.normalMap&&e.tangentSpaceNormalMap?"#define TANGENTSPACE_NORMALMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularIntensityMap?"#define USE_SPECULARINTENSITYMAP":"",e.specularColorMap?"#define USE_SPECULARCOLORMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEENCOLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEENROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.vertexTangents?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUvs?"#define USE_UV":"",e.uvsVertexOnly?"#define UVS_VERTEX_ONLY":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.physicallyCorrectLights?"#define PHYSICALLY_CORRECT_LIGHTS":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.logarithmicDepthBuffer&&e.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==sn?"#define TONE_MAPPING":"",e.toneMapping!==sn?bt.tonemapping_pars_fragment:"",e.toneMapping!==sn?Op("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",bt.encodings_pars_fragment,Np("linearToOutputTexel",e.outputEncoding),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(wi).join(`
`)),o=br(o),o=Qa(o,e),o=$a(o,e),a=br(a),a=Qa(a,e),a=$a(a,e),o=to(o),a=to(a),e.isWebGL2&&e.isRawShaderMaterial!==!0&&(y=`#version 300 es
`,p=["precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,g=["#define varying in",e.glslVersion===ba?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===ba?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);const x=y+p+o,w=y+g+a,M=ja(i,35633,x),C=ja(i,35632,w);if(i.attachShader(m,M),i.attachShader(m,C),e.index0AttributeName!==void 0?i.bindAttribLocation(m,0,e.index0AttributeName):e.morphTargets===!0&&i.bindAttribLocation(m,0,"position"),i.linkProgram(m),s.debug.checkShaderErrors){const T=i.getProgramInfoLog(m).trim(),k=i.getShaderInfoLog(M).trim(),V=i.getShaderInfoLog(C).trim();let X=!0,D=!0;if(i.getProgramParameter(m,35714)===!1){X=!1;const L=Ka(i,M,"vertex"),G=Ka(i,C,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(m,35715)+`

Program Info Log: `+T+`
`+L+`
`+G)}else T!==""?console.warn("THREE.WebGLProgram: Program Info Log:",T):(k===""||V==="")&&(D=!1);D&&(this.diagnostics={runnable:X,programLog:T,vertexShader:{log:k,prefix:p},fragmentShader:{log:V,prefix:g}})}i.deleteShader(M),i.deleteShader(C);let z;this.getUniforms=function(){return z===void 0&&(z=new ls(i,m)),z};let A;return this.getAttributes=function(){return A===void 0&&(A=Up(i,m)),A},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(m),this.program=void 0},this.name=e.shaderName,this.id=kp++,this.cacheKey=t,this.usedTimes=1,this.program=m,this.vertexShader=M,this.fragmentShader=C,this}let Kp=0;class Qp{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,n=t.fragmentShader,i=this._getShaderStage(e),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(t);return o.has(i)===!1&&(o.add(i),i.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new $p(t),e.set(t,n)),n}}class $p{constructor(t){this.id=Kp++,this.code=t,this.usedTimes=0}}function tm(s,t,e,n,i,r,o){const a=new Uo,l=new Qp,c=[],h=i.isWebGL2,u=i.logarithmicDepthBuffer,d=i.vertexTextures;let f=i.precision;const v={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(A,T,k,V,X){const D=V.fog,L=X.geometry,G=A.isMeshStandardMaterial?V.environment:null,q=(A.isMeshStandardMaterial?e:t).get(A.envMap||G),j=q&&q.mapping===fs?q.image.height:null,Z=v[A.type];A.precision!==null&&(f=i.getMaxPrecision(A.precision),f!==A.precision&&console.warn("THREE.WebGLProgram.getParameters:",A.precision,"not supported, using",f,"instead."));const $=L.morphAttributes.position||L.morphAttributes.normal||L.morphAttributes.color,Q=$!==void 0?$.length:0;let ct=0;L.morphAttributes.position!==void 0&&(ct=1),L.morphAttributes.normal!==void 0&&(ct=2),L.morphAttributes.color!==void 0&&(ct=3);let N,W,nt,it;if(Z){const Nt=Ve[Z];N=Nt.vertexShader,W=Nt.fragmentShader}else N=A.vertexShader,W=A.fragmentShader,l.update(A),nt=l.getVertexShaderID(A),it=l.getFragmentShaderID(A);const O=s.getRenderTarget(),Mt=A.alphaTest>0,dt=A.clearcoat>0,ft=A.iridescence>0;return{isWebGL2:h,shaderID:Z,shaderName:A.type,vertexShader:N,fragmentShader:W,defines:A.defines,customVertexShaderID:nt,customFragmentShaderID:it,isRawShaderMaterial:A.isRawShaderMaterial===!0,glslVersion:A.glslVersion,precision:f,instancing:X.isInstancedMesh===!0,instancingColor:X.isInstancedMesh===!0&&X.instanceColor!==null,supportsVertexTextures:d,outputEncoding:O===null?s.outputEncoding:O.isXRRenderTarget===!0?O.texture.encoding:In,map:!!A.map,matcap:!!A.matcap,envMap:!!q,envMapMode:q&&q.mapping,envMapCubeUVHeight:j,lightMap:!!A.lightMap,aoMap:!!A.aoMap,emissiveMap:!!A.emissiveMap,bumpMap:!!A.bumpMap,normalMap:!!A.normalMap,objectSpaceNormalMap:A.normalMapType===wh,tangentSpaceNormalMap:A.normalMapType===Mh,decodeVideoTexture:!!A.map&&A.map.isVideoTexture===!0&&A.map.encoding===Ft,clearcoat:dt,clearcoatMap:dt&&!!A.clearcoatMap,clearcoatRoughnessMap:dt&&!!A.clearcoatRoughnessMap,clearcoatNormalMap:dt&&!!A.clearcoatNormalMap,iridescence:ft,iridescenceMap:ft&&!!A.iridescenceMap,iridescenceThicknessMap:ft&&!!A.iridescenceThicknessMap,displacementMap:!!A.displacementMap,roughnessMap:!!A.roughnessMap,metalnessMap:!!A.metalnessMap,specularMap:!!A.specularMap,specularIntensityMap:!!A.specularIntensityMap,specularColorMap:!!A.specularColorMap,opaque:A.transparent===!1&&A.blending===Ln,alphaMap:!!A.alphaMap,alphaTest:Mt,gradientMap:!!A.gradientMap,sheen:A.sheen>0,sheenColorMap:!!A.sheenColorMap,sheenRoughnessMap:!!A.sheenRoughnessMap,transmission:A.transmission>0,transmissionMap:!!A.transmissionMap,thicknessMap:!!A.thicknessMap,combine:A.combine,vertexTangents:!!A.normalMap&&!!L.attributes.tangent,vertexColors:A.vertexColors,vertexAlphas:A.vertexColors===!0&&!!L.attributes.color&&L.attributes.color.itemSize===4,vertexUvs:!!A.map||!!A.bumpMap||!!A.normalMap||!!A.specularMap||!!A.alphaMap||!!A.emissiveMap||!!A.roughnessMap||!!A.metalnessMap||!!A.clearcoatMap||!!A.clearcoatRoughnessMap||!!A.clearcoatNormalMap||!!A.iridescenceMap||!!A.iridescenceThicknessMap||!!A.displacementMap||!!A.transmissionMap||!!A.thicknessMap||!!A.specularIntensityMap||!!A.specularColorMap||!!A.sheenColorMap||!!A.sheenRoughnessMap,uvsVertexOnly:!(A.map||A.bumpMap||A.normalMap||A.specularMap||A.alphaMap||A.emissiveMap||A.roughnessMap||A.metalnessMap||A.clearcoatNormalMap||A.iridescenceMap||A.iridescenceThicknessMap||A.transmission>0||A.transmissionMap||A.thicknessMap||A.specularIntensityMap||A.specularColorMap||A.sheen>0||A.sheenColorMap||A.sheenRoughnessMap)&&!!A.displacementMap,fog:!!D,useFog:A.fog===!0,fogExp2:D&&D.isFogExp2,flatShading:!!A.flatShading,sizeAttenuation:A.sizeAttenuation,logarithmicDepthBuffer:u,skinning:X.isSkinnedMesh===!0,morphTargets:L.morphAttributes.position!==void 0,morphNormals:L.morphAttributes.normal!==void 0,morphColors:L.morphAttributes.color!==void 0,morphTargetsCount:Q,morphTextureStride:ct,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:A.dithering,shadowMapEnabled:s.shadowMap.enabled&&k.length>0,shadowMapType:s.shadowMap.type,toneMapping:A.toneMapped?s.toneMapping:sn,physicallyCorrectLights:s.physicallyCorrectLights,premultipliedAlpha:A.premultipliedAlpha,doubleSided:A.side===un,flipSided:A.side===ye,useDepthPacking:!!A.depthPacking,depthPacking:A.depthPacking||0,index0AttributeName:A.index0AttributeName,extensionDerivatives:A.extensions&&A.extensions.derivatives,extensionFragDepth:A.extensions&&A.extensions.fragDepth,extensionDrawBuffers:A.extensions&&A.extensions.drawBuffers,extensionShaderTextureLOD:A.extensions&&A.extensions.shaderTextureLOD,rendererExtensionFragDepth:h||n.has("EXT_frag_depth"),rendererExtensionDrawBuffers:h||n.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:h||n.has("EXT_shader_texture_lod"),customProgramCacheKey:A.customProgramCacheKey()}}function p(A){const T=[];if(A.shaderID?T.push(A.shaderID):(T.push(A.customVertexShaderID),T.push(A.customFragmentShaderID)),A.defines!==void 0)for(const k in A.defines)T.push(k),T.push(A.defines[k]);return A.isRawShaderMaterial===!1&&(g(T,A),y(T,A),T.push(s.outputEncoding)),T.push(A.customProgramCacheKey),T.join()}function g(A,T){A.push(T.precision),A.push(T.outputEncoding),A.push(T.envMapMode),A.push(T.envMapCubeUVHeight),A.push(T.combine),A.push(T.vertexUvs),A.push(T.fogExp2),A.push(T.sizeAttenuation),A.push(T.morphTargetsCount),A.push(T.morphAttributeCount),A.push(T.numDirLights),A.push(T.numPointLights),A.push(T.numSpotLights),A.push(T.numSpotLightMaps),A.push(T.numHemiLights),A.push(T.numRectAreaLights),A.push(T.numDirLightShadows),A.push(T.numPointLightShadows),A.push(T.numSpotLightShadows),A.push(T.numSpotLightShadowsWithMaps),A.push(T.shadowMapType),A.push(T.toneMapping),A.push(T.numClippingPlanes),A.push(T.numClipIntersection),A.push(T.depthPacking)}function y(A,T){a.disableAll(),T.isWebGL2&&a.enable(0),T.supportsVertexTextures&&a.enable(1),T.instancing&&a.enable(2),T.instancingColor&&a.enable(3),T.map&&a.enable(4),T.matcap&&a.enable(5),T.envMap&&a.enable(6),T.lightMap&&a.enable(7),T.aoMap&&a.enable(8),T.emissiveMap&&a.enable(9),T.bumpMap&&a.enable(10),T.normalMap&&a.enable(11),T.objectSpaceNormalMap&&a.enable(12),T.tangentSpaceNormalMap&&a.enable(13),T.clearcoat&&a.enable(14),T.clearcoatMap&&a.enable(15),T.clearcoatRoughnessMap&&a.enable(16),T.clearcoatNormalMap&&a.enable(17),T.iridescence&&a.enable(18),T.iridescenceMap&&a.enable(19),T.iridescenceThicknessMap&&a.enable(20),T.displacementMap&&a.enable(21),T.specularMap&&a.enable(22),T.roughnessMap&&a.enable(23),T.metalnessMap&&a.enable(24),T.gradientMap&&a.enable(25),T.alphaMap&&a.enable(26),T.alphaTest&&a.enable(27),T.vertexColors&&a.enable(28),T.vertexAlphas&&a.enable(29),T.vertexUvs&&a.enable(30),T.vertexTangents&&a.enable(31),T.uvsVertexOnly&&a.enable(32),A.push(a.mask),a.disableAll(),T.fog&&a.enable(0),T.useFog&&a.enable(1),T.flatShading&&a.enable(2),T.logarithmicDepthBuffer&&a.enable(3),T.skinning&&a.enable(4),T.morphTargets&&a.enable(5),T.morphNormals&&a.enable(6),T.morphColors&&a.enable(7),T.premultipliedAlpha&&a.enable(8),T.shadowMapEnabled&&a.enable(9),T.physicallyCorrectLights&&a.enable(10),T.doubleSided&&a.enable(11),T.flipSided&&a.enable(12),T.useDepthPacking&&a.enable(13),T.dithering&&a.enable(14),T.specularIntensityMap&&a.enable(15),T.specularColorMap&&a.enable(16),T.transmission&&a.enable(17),T.transmissionMap&&a.enable(18),T.thicknessMap&&a.enable(19),T.sheen&&a.enable(20),T.sheenColorMap&&a.enable(21),T.sheenRoughnessMap&&a.enable(22),T.decodeVideoTexture&&a.enable(23),T.opaque&&a.enable(24),A.push(a.mask)}function x(A){const T=v[A.type];let k;if(T){const V=Ve[T];k=Bh.clone(V.uniforms)}else k=A.uniforms;return k}function w(A,T){let k;for(let V=0,X=c.length;V<X;V++){const D=c[V];if(D.cacheKey===T){k=D,++k.usedTimes;break}}return k===void 0&&(k=new jp(s,T,A,r),c.push(k)),k}function M(A){if(--A.usedTimes===0){const T=c.indexOf(A);c[T]=c[c.length-1],c.pop(),A.destroy()}}function C(A){l.remove(A)}function z(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:x,acquireProgram:w,releaseProgram:M,releaseShaderCache:C,programs:c,dispose:z}}function em(){let s=new WeakMap;function t(r){let o=s.get(r);return o===void 0&&(o={},s.set(r,o)),o}function e(r){s.delete(r)}function n(r,o,a){s.get(r)[o]=a}function i(){s=new WeakMap}return{get:t,remove:e,update:n,dispose:i}}function nm(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.material.id!==t.material.id?s.material.id-t.material.id:s.z!==t.z?s.z-t.z:s.id-t.id}function no(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.z!==t.z?t.z-s.z:s.id-t.id}function io(){const s=[];let t=0;const e=[],n=[],i=[];function r(){t=0,e.length=0,n.length=0,i.length=0}function o(u,d,f,v,m,p){let g=s[t];return g===void 0?(g={id:u.id,object:u,geometry:d,material:f,groupOrder:v,renderOrder:u.renderOrder,z:m,group:p},s[t]=g):(g.id=u.id,g.object=u,g.geometry=d,g.material=f,g.groupOrder=v,g.renderOrder=u.renderOrder,g.z=m,g.group=p),t++,g}function a(u,d,f,v,m,p){const g=o(u,d,f,v,m,p);f.transmission>0?n.push(g):f.transparent===!0?i.push(g):e.push(g)}function l(u,d,f,v,m,p){const g=o(u,d,f,v,m,p);f.transmission>0?n.unshift(g):f.transparent===!0?i.unshift(g):e.unshift(g)}function c(u,d){e.length>1&&e.sort(u||nm),n.length>1&&n.sort(d||no),i.length>1&&i.sort(d||no)}function h(){for(let u=t,d=s.length;u<d;u++){const f=s[u];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:e,transmissive:n,transparent:i,init:r,push:a,unshift:l,finish:h,sort:c}}function im(){let s=new WeakMap;function t(n,i){const r=s.get(n);let o;return r===void 0?(o=new io,s.set(n,[o])):i>=r.length?(o=new io,r.push(o)):o=r[i],o}function e(){s=new WeakMap}return{get:t,dispose:e}}function sm(){const s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new P,color:new _t};break;case"SpotLight":e={position:new P,direction:new P,color:new _t,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new P,color:new _t,distance:0,decay:0};break;case"HemisphereLight":e={direction:new P,skyColor:new _t,groundColor:new _t};break;case"RectAreaLight":e={color:new _t,position:new P,halfWidth:new P,halfHeight:new P};break}return s[t.id]=e,e}}}function rm(){const s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new lt};break;case"SpotLight":e={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new lt};break;case"PointLight":e={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new lt,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[t.id]=e,e}}}let am=0;function om(s,t){return(t.castShadow?2:0)-(s.castShadow?2:0)+(t.map?1:0)-(s.map?1:0)}function lm(s,t){const e=new sm,n=rm(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0};for(let h=0;h<9;h++)i.probe.push(new P);const r=new P,o=new jt,a=new jt;function l(h,u){let d=0,f=0,v=0;for(let V=0;V<9;V++)i.probe[V].set(0,0,0);let m=0,p=0,g=0,y=0,x=0,w=0,M=0,C=0,z=0,A=0;h.sort(om);const T=u!==!0?Math.PI:1;for(let V=0,X=h.length;V<X;V++){const D=h[V],L=D.color,G=D.intensity,q=D.distance,j=D.shadow&&D.shadow.map?D.shadow.map.texture:null;if(D.isAmbientLight)d+=L.r*G*T,f+=L.g*G*T,v+=L.b*G*T;else if(D.isLightProbe)for(let Z=0;Z<9;Z++)i.probe[Z].addScaledVector(D.sh.coefficients[Z],G);else if(D.isDirectionalLight){const Z=e.get(D);if(Z.color.copy(D.color).multiplyScalar(D.intensity*T),D.castShadow){const $=D.shadow,Q=n.get(D);Q.shadowBias=$.bias,Q.shadowNormalBias=$.normalBias,Q.shadowRadius=$.radius,Q.shadowMapSize=$.mapSize,i.directionalShadow[m]=Q,i.directionalShadowMap[m]=j,i.directionalShadowMatrix[m]=D.shadow.matrix,w++}i.directional[m]=Z,m++}else if(D.isSpotLight){const Z=e.get(D);Z.position.setFromMatrixPosition(D.matrixWorld),Z.color.copy(L).multiplyScalar(G*T),Z.distance=q,Z.coneCos=Math.cos(D.angle),Z.penumbraCos=Math.cos(D.angle*(1-D.penumbra)),Z.decay=D.decay,i.spot[g]=Z;const $=D.shadow;if(D.map&&(i.spotLightMap[z]=D.map,z++,$.updateMatrices(D),D.castShadow&&A++),i.spotLightMatrix[g]=$.matrix,D.castShadow){const Q=n.get(D);Q.shadowBias=$.bias,Q.shadowNormalBias=$.normalBias,Q.shadowRadius=$.radius,Q.shadowMapSize=$.mapSize,i.spotShadow[g]=Q,i.spotShadowMap[g]=j,C++}g++}else if(D.isRectAreaLight){const Z=e.get(D);Z.color.copy(L).multiplyScalar(G),Z.halfWidth.set(D.width*.5,0,0),Z.halfHeight.set(0,D.height*.5,0),i.rectArea[y]=Z,y++}else if(D.isPointLight){const Z=e.get(D);if(Z.color.copy(D.color).multiplyScalar(D.intensity*T),Z.distance=D.distance,Z.decay=D.decay,D.castShadow){const $=D.shadow,Q=n.get(D);Q.shadowBias=$.bias,Q.shadowNormalBias=$.normalBias,Q.shadowRadius=$.radius,Q.shadowMapSize=$.mapSize,Q.shadowCameraNear=$.camera.near,Q.shadowCameraFar=$.camera.far,i.pointShadow[p]=Q,i.pointShadowMap[p]=j,i.pointShadowMatrix[p]=D.shadow.matrix,M++}i.point[p]=Z,p++}else if(D.isHemisphereLight){const Z=e.get(D);Z.skyColor.copy(D.color).multiplyScalar(G*T),Z.groundColor.copy(D.groundColor).multiplyScalar(G*T),i.hemi[x]=Z,x++}}y>0&&(t.isWebGL2||s.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=et.LTC_FLOAT_1,i.rectAreaLTC2=et.LTC_FLOAT_2):s.has("OES_texture_half_float_linear")===!0?(i.rectAreaLTC1=et.LTC_HALF_1,i.rectAreaLTC2=et.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),i.ambient[0]=d,i.ambient[1]=f,i.ambient[2]=v;const k=i.hash;(k.directionalLength!==m||k.pointLength!==p||k.spotLength!==g||k.rectAreaLength!==y||k.hemiLength!==x||k.numDirectionalShadows!==w||k.numPointShadows!==M||k.numSpotShadows!==C||k.numSpotMaps!==z)&&(i.directional.length=m,i.spot.length=g,i.rectArea.length=y,i.point.length=p,i.hemi.length=x,i.directionalShadow.length=w,i.directionalShadowMap.length=w,i.pointShadow.length=M,i.pointShadowMap.length=M,i.spotShadow.length=C,i.spotShadowMap.length=C,i.directionalShadowMatrix.length=w,i.pointShadowMatrix.length=M,i.spotLightMatrix.length=C+z-A,i.spotLightMap.length=z,i.numSpotLightShadowsWithMaps=A,k.directionalLength=m,k.pointLength=p,k.spotLength=g,k.rectAreaLength=y,k.hemiLength=x,k.numDirectionalShadows=w,k.numPointShadows=M,k.numSpotShadows=C,k.numSpotMaps=z,i.version=am++)}function c(h,u){let d=0,f=0,v=0,m=0,p=0;const g=u.matrixWorldInverse;for(let y=0,x=h.length;y<x;y++){const w=h[y];if(w.isDirectionalLight){const M=i.directional[d];M.direction.setFromMatrixPosition(w.matrixWorld),r.setFromMatrixPosition(w.target.matrixWorld),M.direction.sub(r),M.direction.transformDirection(g),d++}else if(w.isSpotLight){const M=i.spot[v];M.position.setFromMatrixPosition(w.matrixWorld),M.position.applyMatrix4(g),M.direction.setFromMatrixPosition(w.matrixWorld),r.setFromMatrixPosition(w.target.matrixWorld),M.direction.sub(r),M.direction.transformDirection(g),v++}else if(w.isRectAreaLight){const M=i.rectArea[m];M.position.setFromMatrixPosition(w.matrixWorld),M.position.applyMatrix4(g),a.identity(),o.copy(w.matrixWorld),o.premultiply(g),a.extractRotation(o),M.halfWidth.set(w.width*.5,0,0),M.halfHeight.set(0,w.height*.5,0),M.halfWidth.applyMatrix4(a),M.halfHeight.applyMatrix4(a),m++}else if(w.isPointLight){const M=i.point[f];M.position.setFromMatrixPosition(w.matrixWorld),M.position.applyMatrix4(g),f++}else if(w.isHemisphereLight){const M=i.hemi[p];M.direction.setFromMatrixPosition(w.matrixWorld),M.direction.transformDirection(g),p++}}}return{setup:l,setupView:c,state:i}}function so(s,t){const e=new lm(s,t),n=[],i=[];function r(){n.length=0,i.length=0}function o(u){n.push(u)}function a(u){i.push(u)}function l(u){e.setup(n,u)}function c(u){e.setupView(n,u)}return{init:r,state:{lightsArray:n,shadowsArray:i,lights:e},setupLights:l,setupLightsView:c,pushLight:o,pushShadow:a}}function cm(s,t){let e=new WeakMap;function n(r,o=0){const a=e.get(r);let l;return a===void 0?(l=new so(s,t),e.set(r,[l])):o>=a.length?(l=new so(s,t),a.push(l)):l=a[o],l}function i(){e=new WeakMap}return{get:n,dispose:i}}class hm extends Ii{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Sh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class um extends Ii{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.referencePosition=new P,this.nearDistance=1,this.farDistance=1e3,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.referencePosition.copy(t.referencePosition),this.nearDistance=t.nearDistance,this.farDistance=t.farDistance,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const dm=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,fm=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function pm(s,t,e){let n=new Wo;const i=new lt,r=new lt,o=new ae,a=new hm({depthPacking:yh}),l=new um,c={},h=e.maxTextureSize,u={[mn]:ye,[ye]:mn,[un]:un},d=new xe({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new lt},radius:{value:4}},vertexShader:dm,fragmentShader:fm}),f=d.clone();f.defines.HORIZONTAL_PASS=1;const v=new oe;v.setAttribute("position",new Wt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const m=new Gt(v,d),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Po,this.render=function(w,M,C){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||w.length===0)return;const z=s.getRenderTarget(),A=s.getActiveCubeFace(),T=s.getActiveMipmapLevel(),k=s.state;k.setBlending(fn),k.buffers.color.setClear(1,1,1,1),k.buffers.depth.setTest(!0),k.setScissorTest(!1);for(let V=0,X=w.length;V<X;V++){const D=w[V],L=D.shadow;if(L===void 0){console.warn("THREE.WebGLShadowMap:",D,"has no shadow.");continue}if(L.autoUpdate===!1&&L.needsUpdate===!1)continue;i.copy(L.mapSize);const G=L.getFrameExtents();if(i.multiply(G),r.copy(L.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(r.x=Math.floor(h/G.x),i.x=r.x*G.x,L.mapSize.x=r.x),i.y>h&&(r.y=Math.floor(h/G.y),i.y=r.y*G.y,L.mapSize.y=r.y)),L.map===null){const j=this.type!==Mi?{minFilter:re,magFilter:re}:{};L.map=new rn(i.x,i.y,j),L.map.texture.name=D.name+".shadowMap",L.camera.updateProjectionMatrix()}s.setRenderTarget(L.map),s.clear();const q=L.getViewportCount();for(let j=0;j<q;j++){const Z=L.getViewport(j);o.set(r.x*Z.x,r.y*Z.y,r.x*Z.z,r.y*Z.w),k.viewport(o),L.updateMatrices(D,j),n=L.getFrustum(),x(M,C,L.camera,D,this.type)}L.isPointLightShadow!==!0&&this.type===Mi&&g(L,C),L.needsUpdate=!1}p.needsUpdate=!1,s.setRenderTarget(z,A,T)};function g(w,M){const C=t.update(m);d.defines.VSM_SAMPLES!==w.blurSamples&&(d.defines.VSM_SAMPLES=w.blurSamples,f.defines.VSM_SAMPLES=w.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),w.mapPass===null&&(w.mapPass=new rn(i.x,i.y)),d.uniforms.shadow_pass.value=w.map.texture,d.uniforms.resolution.value=w.mapSize,d.uniforms.radius.value=w.radius,s.setRenderTarget(w.mapPass),s.clear(),s.renderBufferDirect(M,null,C,d,m,null),f.uniforms.shadow_pass.value=w.mapPass.texture,f.uniforms.resolution.value=w.mapSize,f.uniforms.radius.value=w.radius,s.setRenderTarget(w.map),s.clear(),s.renderBufferDirect(M,null,C,f,m,null)}function y(w,M,C,z,A,T){let k=null;const V=C.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(V!==void 0)k=V;else if(k=C.isPointLight===!0?l:a,s.localClippingEnabled&&M.clipShadows===!0&&Array.isArray(M.clippingPlanes)&&M.clippingPlanes.length!==0||M.displacementMap&&M.displacementScale!==0||M.alphaMap&&M.alphaTest>0||M.map&&M.alphaTest>0){const X=k.uuid,D=M.uuid;let L=c[X];L===void 0&&(L={},c[X]=L);let G=L[D];G===void 0&&(G=k.clone(),L[D]=G),k=G}return k.visible=M.visible,k.wireframe=M.wireframe,T===Mi?k.side=M.shadowSide!==null?M.shadowSide:M.side:k.side=M.shadowSide!==null?M.shadowSide:u[M.side],k.alphaMap=M.alphaMap,k.alphaTest=M.alphaTest,k.map=M.map,k.clipShadows=M.clipShadows,k.clippingPlanes=M.clippingPlanes,k.clipIntersection=M.clipIntersection,k.displacementMap=M.displacementMap,k.displacementScale=M.displacementScale,k.displacementBias=M.displacementBias,k.wireframeLinewidth=M.wireframeLinewidth,k.linewidth=M.linewidth,C.isPointLight===!0&&k.isMeshDistanceMaterial===!0&&(k.referencePosition.setFromMatrixPosition(C.matrixWorld),k.nearDistance=z,k.farDistance=A),k}function x(w,M,C,z,A){if(w.visible===!1)return;if(w.layers.test(M.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&A===Mi)&&(!w.frustumCulled||n.intersectsObject(w))){w.modelViewMatrix.multiplyMatrices(C.matrixWorldInverse,w.matrixWorld);const V=t.update(w),X=w.material;if(Array.isArray(X)){const D=V.groups;for(let L=0,G=D.length;L<G;L++){const q=D[L],j=X[q.materialIndex];if(j&&j.visible){const Z=y(w,j,z,C.near,C.far,A);s.renderBufferDirect(C,null,V,Z,w,q)}}}else if(X.visible){const D=y(w,X,z,C.near,C.far,A);s.renderBufferDirect(C,null,V,D,w,null)}}const k=w.children;for(let V=0,X=k.length;V<X;V++)x(k[V],M,C,z,A)}}function mm(s,t,e){const n=e.isWebGL2;function i(){let E=!1;const F=new ae;let Y=null;const at=new ae(0,0,0,0);return{setMask:function(ut){Y!==ut&&!E&&(s.colorMask(ut,ut,ut,ut),Y=ut)},setLocked:function(ut){E=ut},setClear:function(ut,kt,ee,ce,An){An===!0&&(ut*=ce,kt*=ce,ee*=ce),F.set(ut,kt,ee,ce),at.equals(F)===!1&&(s.clearColor(ut,kt,ee,ce),at.copy(F))},reset:function(){E=!1,Y=null,at.set(-1,0,0,0)}}}function r(){let E=!1,F=null,Y=null,at=null;return{setTest:function(ut){ut?Mt(2929):dt(2929)},setMask:function(ut){F!==ut&&!E&&(s.depthMask(ut),F=ut)},setFunc:function(ut){if(Y!==ut){switch(ut){case Vc:s.depthFunc(512);break;case Zc:s.depthFunc(519);break;case Wc:s.depthFunc(513);break;case Ar:s.depthFunc(515);break;case Xc:s.depthFunc(514);break;case qc:s.depthFunc(518);break;case Yc:s.depthFunc(516);break;case jc:s.depthFunc(517);break;default:s.depthFunc(515)}Y=ut}},setLocked:function(ut){E=ut},setClear:function(ut){at!==ut&&(s.clearDepth(ut),at=ut)},reset:function(){E=!1,F=null,Y=null,at=null}}}function o(){let E=!1,F=null,Y=null,at=null,ut=null,kt=null,ee=null,ce=null,An=null;return{setTest:function(Ut){E||(Ut?Mt(2960):dt(2960))},setMask:function(Ut){F!==Ut&&!E&&(s.stencilMask(Ut),F=Ut)},setFunc:function(Ut,qe,Re){(Y!==Ut||at!==qe||ut!==Re)&&(s.stencilFunc(Ut,qe,Re),Y=Ut,at=qe,ut=Re)},setOp:function(Ut,qe,Re){(kt!==Ut||ee!==qe||ce!==Re)&&(s.stencilOp(Ut,qe,Re),kt=Ut,ee=qe,ce=Re)},setLocked:function(Ut){E=Ut},setClear:function(Ut){An!==Ut&&(s.clearStencil(Ut),An=Ut)},reset:function(){E=!1,F=null,Y=null,at=null,ut=null,kt=null,ee=null,ce=null,An=null}}}const a=new i,l=new r,c=new o,h=new WeakMap,u=new WeakMap;let d={},f={},v=new WeakMap,m=[],p=null,g=!1,y=null,x=null,w=null,M=null,C=null,z=null,A=null,T=!1,k=null,V=null,X=null,D=null,L=null;const G=s.getParameter(35661);let q=!1,j=0;const Z=s.getParameter(7938);Z.indexOf("WebGL")!==-1?(j=parseFloat(/^WebGL (\d)/.exec(Z)[1]),q=j>=1):Z.indexOf("OpenGL ES")!==-1&&(j=parseFloat(/^OpenGL ES (\d)/.exec(Z)[1]),q=j>=2);let $=null,Q={};const ct=s.getParameter(3088),N=s.getParameter(2978),W=new ae().fromArray(ct),nt=new ae().fromArray(N);function it(E,F,Y){const at=new Uint8Array(4),ut=s.createTexture();s.bindTexture(E,ut),s.texParameteri(E,10241,9728),s.texParameteri(E,10240,9728);for(let kt=0;kt<Y;kt++)s.texImage2D(F+kt,0,6408,1,1,0,6408,5121,at);return ut}const O={};O[3553]=it(3553,3553,1),O[34067]=it(34067,34069,6),a.setClear(0,0,0,1),l.setClear(1),c.setClear(0),Mt(2929),l.setFunc(Ar),le(!1),Le(Yr),Mt(2884),pe(fn);function Mt(E){d[E]!==!0&&(s.enable(E),d[E]=!0)}function dt(E){d[E]!==!1&&(s.disable(E),d[E]=!1)}function ft(E,F){return f[E]!==F?(s.bindFramebuffer(E,F),f[E]=F,n&&(E===36009&&(f[36160]=F),E===36160&&(f[36009]=F)),!0):!1}function ot(E,F){let Y=m,at=!1;if(E)if(Y=v.get(F),Y===void 0&&(Y=[],v.set(F,Y)),E.isWebGLMultipleRenderTargets){const ut=E.texture;if(Y.length!==ut.length||Y[0]!==36064){for(let kt=0,ee=ut.length;kt<ee;kt++)Y[kt]=36064+kt;Y.length=ut.length,at=!0}}else Y[0]!==36064&&(Y[0]=36064,at=!0);else Y[0]!==1029&&(Y[0]=1029,at=!0);at&&(e.isWebGL2?s.drawBuffers(Y):t.get("WEBGL_draw_buffers").drawBuffersWEBGL(Y))}function Nt(E){return p!==E?(s.useProgram(E),p=E,!0):!1}const wt={[Qn]:32774,[kc]:32778,[Dc]:32779};if(n)wt[Kr]=32775,wt[Qr]=32776;else{const E=t.get("EXT_blend_minmax");E!==null&&(wt[Kr]=E.MIN_EXT,wt[Qr]=E.MAX_EXT)}const xt={[Ic]:0,[Nc]:1,[Oc]:768,[zo]:770,[Jc]:776,[Hc]:774,[Bc]:772,[Fc]:769,[Lo]:771,[Gc]:775,[Uc]:773};function pe(E,F,Y,at,ut,kt,ee,ce){if(E===fn){g===!0&&(dt(3042),g=!1);return}if(g===!1&&(Mt(3042),g=!0),E!==Rc){if(E!==y||ce!==T){if((x!==Qn||C!==Qn)&&(s.blendEquation(32774),x=Qn,C=Qn),ce)switch(E){case Ln:s.blendFuncSeparate(1,771,1,771);break;case gr:s.blendFunc(1,1);break;case jr:s.blendFuncSeparate(0,769,0,1);break;case vr:s.blendFuncSeparate(0,768,0,770);break;default:console.error("THREE.WebGLState: Invalid blending: ",E);break}else switch(E){case Ln:s.blendFuncSeparate(770,771,1,771);break;case gr:s.blendFunc(770,1);break;case jr:s.blendFuncSeparate(0,769,0,1);break;case vr:s.blendFunc(0,768);break;default:console.error("THREE.WebGLState: Invalid blending: ",E);break}w=null,M=null,z=null,A=null,y=E,T=ce}return}ut=ut||F,kt=kt||Y,ee=ee||at,(F!==x||ut!==C)&&(s.blendEquationSeparate(wt[F],wt[ut]),x=F,C=ut),(Y!==w||at!==M||kt!==z||ee!==A)&&(s.blendFuncSeparate(xt[Y],xt[at],xt[kt],xt[ee]),w=Y,M=at,z=kt,A=ee),y=E,T=!1}function ze(E,F){E.side===un?dt(2884):Mt(2884);let Y=E.side===ye;F&&(Y=!Y),le(Y),E.blending===Ln&&E.transparent===!1?pe(fn):pe(E.blending,E.blendEquation,E.blendSrc,E.blendDst,E.blendEquationAlpha,E.blendSrcAlpha,E.blendDstAlpha,E.premultipliedAlpha),l.setFunc(E.depthFunc),l.setTest(E.depthTest),l.setMask(E.depthWrite),a.setMask(E.colorWrite);const at=E.stencilWrite;c.setTest(at),at&&(c.setMask(E.stencilWriteMask),c.setFunc(E.stencilFunc,E.stencilRef,E.stencilFuncMask),c.setOp(E.stencilFail,E.stencilZFail,E.stencilZPass)),Dt(E.polygonOffset,E.polygonOffsetFactor,E.polygonOffsetUnits),E.alphaToCoverage===!0?Mt(32926):dt(32926)}function le(E){k!==E&&(E?s.frontFace(2304):s.frontFace(2305),k=E)}function Le(E){E!==Pc?(Mt(2884),E!==V&&(E===Yr?s.cullFace(1029):E===zc?s.cullFace(1028):s.cullFace(1032))):dt(2884),V=E}function Xt(E){E!==X&&(q&&s.lineWidth(E),X=E)}function Dt(E,F,Y){E?(Mt(32823),(D!==F||L!==Y)&&(s.polygonOffset(F,Y),D=F,L=Y)):dt(32823)}function Xe(E){E?Mt(3089):dt(3089)}function Ne(E){E===void 0&&(E=33984+G-1),$!==E&&(s.activeTexture(E),$=E)}function _(E,F,Y){Y===void 0&&($===null?Y=33984+G-1:Y=$);let at=Q[Y];at===void 0&&(at={type:void 0,texture:void 0},Q[Y]=at),(at.type!==E||at.texture!==F)&&($!==Y&&(s.activeTexture(Y),$=Y),s.bindTexture(E,F||O[E]),at.type=E,at.texture=F)}function S(){const E=Q[$];E!==void 0&&E.type!==void 0&&(s.bindTexture(E.type,null),E.type=void 0,E.texture=void 0)}function U(){try{s.compressedTexImage2D.apply(s,arguments)}catch(E){console.error("THREE.WebGLState:",E)}}function K(){try{s.compressedTexImage3D.apply(s,arguments)}catch(E){console.error("THREE.WebGLState:",E)}}function tt(){try{s.texSubImage2D.apply(s,arguments)}catch(E){console.error("THREE.WebGLState:",E)}}function st(){try{s.texSubImage3D.apply(s,arguments)}catch(E){console.error("THREE.WebGLState:",E)}}function St(){try{s.compressedTexSubImage2D.apply(s,arguments)}catch(E){console.error("THREE.WebGLState:",E)}}function rt(){try{s.compressedTexSubImage3D.apply(s,arguments)}catch(E){console.error("THREE.WebGLState:",E)}}function J(){try{s.texStorage2D.apply(s,arguments)}catch(E){console.error("THREE.WebGLState:",E)}}function gt(){try{s.texStorage3D.apply(s,arguments)}catch(E){console.error("THREE.WebGLState:",E)}}function At(){try{s.texImage2D.apply(s,arguments)}catch(E){console.error("THREE.WebGLState:",E)}}function ht(){try{s.texImage3D.apply(s,arguments)}catch(E){console.error("THREE.WebGLState:",E)}}function vt(E){W.equals(E)===!1&&(s.scissor(E.x,E.y,E.z,E.w),W.copy(E))}function pt(E){nt.equals(E)===!1&&(s.viewport(E.x,E.y,E.z,E.w),nt.copy(E))}function Lt(E,F){let Y=u.get(F);Y===void 0&&(Y=new WeakMap,u.set(F,Y));let at=Y.get(E);at===void 0&&(at=s.getUniformBlockIndex(F,E.name),Y.set(E,at))}function Bt(E,F){const at=u.get(F).get(E);h.get(F)!==at&&(s.uniformBlockBinding(F,at,E.__bindingPointIndex),h.set(F,at))}function te(){s.disable(3042),s.disable(2884),s.disable(2929),s.disable(32823),s.disable(3089),s.disable(2960),s.disable(32926),s.blendEquation(32774),s.blendFunc(1,0),s.blendFuncSeparate(1,0,1,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(513),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(519,0,4294967295),s.stencilOp(7680,7680,7680),s.clearStencil(0),s.cullFace(1029),s.frontFace(2305),s.polygonOffset(0,0),s.activeTexture(33984),s.bindFramebuffer(36160,null),n===!0&&(s.bindFramebuffer(36009,null),s.bindFramebuffer(36008,null)),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),d={},$=null,Q={},f={},v=new WeakMap,m=[],p=null,g=!1,y=null,x=null,w=null,M=null,C=null,z=null,A=null,T=!1,k=null,V=null,X=null,D=null,L=null,W.set(0,0,s.canvas.width,s.canvas.height),nt.set(0,0,s.canvas.width,s.canvas.height),a.reset(),l.reset(),c.reset()}return{buffers:{color:a,depth:l,stencil:c},enable:Mt,disable:dt,bindFramebuffer:ft,drawBuffers:ot,useProgram:Nt,setBlending:pe,setMaterial:ze,setFlipSided:le,setCullFace:Le,setLineWidth:Xt,setPolygonOffset:Dt,setScissorTest:Xe,activeTexture:Ne,bindTexture:_,unbindTexture:S,compressedTexImage2D:U,compressedTexImage3D:K,texImage2D:At,texImage3D:ht,updateUBOMapping:Lt,uniformBlockBinding:Bt,texStorage2D:J,texStorage3D:gt,texSubImage2D:tt,texSubImage3D:st,compressedTexSubImage2D:St,compressedTexSubImage3D:rt,scissor:vt,viewport:pt,reset:te}}function gm(s,t,e,n,i,r,o){const a=i.isWebGL2,l=i.maxTextures,c=i.maxCubemapSize,h=i.maxTextureSize,u=i.maxSamples,d=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,f=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),v=new WeakMap;let m;const p=new WeakMap;let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function y(_,S){return g?new OffscreenCanvas(_,S):us("canvas")}function x(_,S,U,K){let tt=1;if((_.width>K||_.height>K)&&(tt=K/Math.max(_.width,_.height)),tt<1||S===!0)if(typeof HTMLImageElement<"u"&&_ instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&_ instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&_ instanceof ImageBitmap){const st=S?wr:Math.floor,St=st(tt*_.width),rt=st(tt*_.height);m===void 0&&(m=y(St,rt));const J=U?y(St,rt):m;return J.width=St,J.height=rt,J.getContext("2d").drawImage(_,0,0,St,rt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+_.width+"x"+_.height+") to ("+St+"x"+rt+")."),J}else return"data"in _&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+_.width+"x"+_.height+")."),_;return _}function w(_){return Ta(_.width)&&Ta(_.height)}function M(_){return a?!1:_.wrapS!==Ee||_.wrapT!==Ee||_.minFilter!==re&&_.minFilter!==Se}function C(_,S){return _.generateMipmaps&&S&&_.minFilter!==re&&_.minFilter!==Se}function z(_){s.generateMipmap(_)}function A(_,S,U,K,tt=!1){if(a===!1)return S;if(_!==null){if(s[_]!==void 0)return s[_];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+_+"'")}let st=S;return S===6403&&(U===5126&&(st=33326),U===5131&&(st=33325),U===5121&&(st=33321)),S===33319&&(U===5126&&(st=33328),U===5131&&(st=33327),U===5121&&(st=33323)),S===6408&&(U===5126&&(st=34836),U===5131&&(st=34842),U===5121&&(st=K===Ft&&tt===!1?35907:32856),U===32819&&(st=32854),U===32820&&(st=32855)),(st===33325||st===33326||st===33327||st===33328||st===34842||st===34836)&&t.get("EXT_color_buffer_float"),st}function T(_,S,U){return C(_,U)===!0||_.isFramebufferTexture&&_.minFilter!==re&&_.minFilter!==Se?Math.log2(Math.max(S.width,S.height))+1:_.mipmaps!==void 0&&_.mipmaps.length>0?_.mipmaps.length:_.isCompressedTexture&&Array.isArray(_.image)?S.mipmaps.length:1}function k(_){return _===re||_===$r||_===ws?9728:9729}function V(_){const S=_.target;S.removeEventListener("dispose",V),D(S),S.isVideoTexture&&v.delete(S)}function X(_){const S=_.target;S.removeEventListener("dispose",X),G(S)}function D(_){const S=n.get(_);if(S.__webglInit===void 0)return;const U=_.source,K=p.get(U);if(K){const tt=K[S.__cacheKey];tt.usedTimes--,tt.usedTimes===0&&L(_),Object.keys(K).length===0&&p.delete(U)}n.remove(_)}function L(_){const S=n.get(_);s.deleteTexture(S.__webglTexture);const U=_.source,K=p.get(U);delete K[S.__cacheKey],o.memory.textures--}function G(_){const S=_.texture,U=n.get(_),K=n.get(S);if(K.__webglTexture!==void 0&&(s.deleteTexture(K.__webglTexture),o.memory.textures--),_.depthTexture&&_.depthTexture.dispose(),_.isWebGLCubeRenderTarget)for(let tt=0;tt<6;tt++)s.deleteFramebuffer(U.__webglFramebuffer[tt]),U.__webglDepthbuffer&&s.deleteRenderbuffer(U.__webglDepthbuffer[tt]);else{if(s.deleteFramebuffer(U.__webglFramebuffer),U.__webglDepthbuffer&&s.deleteRenderbuffer(U.__webglDepthbuffer),U.__webglMultisampledFramebuffer&&s.deleteFramebuffer(U.__webglMultisampledFramebuffer),U.__webglColorRenderbuffer)for(let tt=0;tt<U.__webglColorRenderbuffer.length;tt++)U.__webglColorRenderbuffer[tt]&&s.deleteRenderbuffer(U.__webglColorRenderbuffer[tt]);U.__webglDepthRenderbuffer&&s.deleteRenderbuffer(U.__webglDepthRenderbuffer)}if(_.isWebGLMultipleRenderTargets)for(let tt=0,st=S.length;tt<st;tt++){const St=n.get(S[tt]);St.__webglTexture&&(s.deleteTexture(St.__webglTexture),o.memory.textures--),n.remove(S[tt])}n.remove(S),n.remove(_)}let q=0;function j(){q=0}function Z(){const _=q;return _>=l&&console.warn("THREE.WebGLTextures: Trying to use "+_+" texture units while this GPU supports only "+l),q+=1,_}function $(_){const S=[];return S.push(_.wrapS),S.push(_.wrapT),S.push(_.wrapR||0),S.push(_.magFilter),S.push(_.minFilter),S.push(_.anisotropy),S.push(_.internalFormat),S.push(_.format),S.push(_.type),S.push(_.generateMipmaps),S.push(_.premultiplyAlpha),S.push(_.flipY),S.push(_.unpackAlignment),S.push(_.encoding),S.join()}function Q(_,S){const U=n.get(_);if(_.isVideoTexture&&Xe(_),_.isRenderTargetTexture===!1&&_.version>0&&U.__version!==_.version){const K=_.image;if(K===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(K.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{dt(U,_,S);return}}e.bindTexture(3553,U.__webglTexture,33984+S)}function ct(_,S){const U=n.get(_);if(_.version>0&&U.__version!==_.version){dt(U,_,S);return}e.bindTexture(35866,U.__webglTexture,33984+S)}function N(_,S){const U=n.get(_);if(_.version>0&&U.__version!==_.version){dt(U,_,S);return}e.bindTexture(32879,U.__webglTexture,33984+S)}function W(_,S){const U=n.get(_);if(_.version>0&&U.__version!==_.version){ft(U,_,S);return}e.bindTexture(34067,U.__webglTexture,33984+S)}const nt={[Ei]:10497,[Ee]:33071,[yr]:33648},it={[re]:9728,[$r]:9984,[ws]:9986,[Se]:9729,[sh]:9985,[Pi]:9987};function O(_,S,U){if(U?(s.texParameteri(_,10242,nt[S.wrapS]),s.texParameteri(_,10243,nt[S.wrapT]),(_===32879||_===35866)&&s.texParameteri(_,32882,nt[S.wrapR]),s.texParameteri(_,10240,it[S.magFilter]),s.texParameteri(_,10241,it[S.minFilter])):(s.texParameteri(_,10242,33071),s.texParameteri(_,10243,33071),(_===32879||_===35866)&&s.texParameteri(_,32882,33071),(S.wrapS!==Ee||S.wrapT!==Ee)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),s.texParameteri(_,10240,k(S.magFilter)),s.texParameteri(_,10241,k(S.minFilter)),S.minFilter!==re&&S.minFilter!==Se&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),t.has("EXT_texture_filter_anisotropic")===!0){const K=t.get("EXT_texture_filter_anisotropic");if(S.magFilter===re||S.minFilter!==ws&&S.minFilter!==Pi||S.type===dn&&t.has("OES_texture_float_linear")===!1||a===!1&&S.type===zi&&t.has("OES_texture_half_float_linear")===!1)return;(S.anisotropy>1||n.get(S).__currentAnisotropy)&&(s.texParameterf(_,K.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,i.getMaxAnisotropy())),n.get(S).__currentAnisotropy=S.anisotropy)}}function Mt(_,S){let U=!1;_.__webglInit===void 0&&(_.__webglInit=!0,S.addEventListener("dispose",V));const K=S.source;let tt=p.get(K);tt===void 0&&(tt={},p.set(K,tt));const st=$(S);if(st!==_.__cacheKey){tt[st]===void 0&&(tt[st]={texture:s.createTexture(),usedTimes:0},o.memory.textures++,U=!0),tt[st].usedTimes++;const St=tt[_.__cacheKey];St!==void 0&&(tt[_.__cacheKey].usedTimes--,St.usedTimes===0&&L(S)),_.__cacheKey=st,_.__webglTexture=tt[st].texture}return U}function dt(_,S,U){let K=3553;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(K=35866),S.isData3DTexture&&(K=32879);const tt=Mt(_,S),st=S.source;e.bindTexture(K,_.__webglTexture,33984+U);const St=n.get(st);if(st.version!==St.__version||tt===!0){e.activeTexture(33984+U),s.pixelStorei(37440,S.flipY),s.pixelStorei(37441,S.premultiplyAlpha),s.pixelStorei(3317,S.unpackAlignment),s.pixelStorei(37443,0);const rt=M(S)&&w(S.image)===!1;let J=x(S.image,rt,!1,h);J=Ne(S,J);const gt=w(J)||a,At=r.convert(S.format,S.encoding);let ht=r.convert(S.type),vt=A(S.internalFormat,At,ht,S.encoding,S.isVideoTexture);O(K,S,gt);let pt;const Lt=S.mipmaps,Bt=a&&S.isVideoTexture!==!0,te=St.__version===void 0||tt===!0,E=T(S,J,gt);if(S.isDepthTexture)vt=6402,a?S.type===dn?vt=36012:S.type===Pn?vt=33190:S.type===ai?vt=35056:vt=33189:S.type===dn&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),S.format===Rn&&vt===6402&&S.type!==ko&&S.type!==Pn&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),S.type=Pn,ht=r.convert(S.type)),S.format===ci&&vt===6402&&(vt=34041,S.type!==ai&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),S.type=ai,ht=r.convert(S.type))),te&&(Bt?e.texStorage2D(3553,1,vt,J.width,J.height):e.texImage2D(3553,0,vt,J.width,J.height,0,At,ht,null));else if(S.isDataTexture)if(Lt.length>0&&gt){Bt&&te&&e.texStorage2D(3553,E,vt,Lt[0].width,Lt[0].height);for(let F=0,Y=Lt.length;F<Y;F++)pt=Lt[F],Bt?e.texSubImage2D(3553,F,0,0,pt.width,pt.height,At,ht,pt.data):e.texImage2D(3553,F,vt,pt.width,pt.height,0,At,ht,pt.data);S.generateMipmaps=!1}else Bt?(te&&e.texStorage2D(3553,E,vt,J.width,J.height),e.texSubImage2D(3553,0,0,0,J.width,J.height,At,ht,J.data)):e.texImage2D(3553,0,vt,J.width,J.height,0,At,ht,J.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){Bt&&te&&e.texStorage3D(35866,E,vt,Lt[0].width,Lt[0].height,J.depth);for(let F=0,Y=Lt.length;F<Y;F++)pt=Lt[F],S.format!==Ie?At!==null?Bt?e.compressedTexSubImage3D(35866,F,0,0,0,pt.width,pt.height,J.depth,At,pt.data,0,0):e.compressedTexImage3D(35866,F,vt,pt.width,pt.height,J.depth,0,pt.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Bt?e.texSubImage3D(35866,F,0,0,0,pt.width,pt.height,J.depth,At,ht,pt.data):e.texImage3D(35866,F,vt,pt.width,pt.height,J.depth,0,At,ht,pt.data)}else{Bt&&te&&e.texStorage2D(3553,E,vt,Lt[0].width,Lt[0].height);for(let F=0,Y=Lt.length;F<Y;F++)pt=Lt[F],S.format!==Ie?At!==null?Bt?e.compressedTexSubImage2D(3553,F,0,0,pt.width,pt.height,At,pt.data):e.compressedTexImage2D(3553,F,vt,pt.width,pt.height,0,pt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Bt?e.texSubImage2D(3553,F,0,0,pt.width,pt.height,At,ht,pt.data):e.texImage2D(3553,F,vt,pt.width,pt.height,0,At,ht,pt.data)}else if(S.isDataArrayTexture)Bt?(te&&e.texStorage3D(35866,E,vt,J.width,J.height,J.depth),e.texSubImage3D(35866,0,0,0,0,J.width,J.height,J.depth,At,ht,J.data)):e.texImage3D(35866,0,vt,J.width,J.height,J.depth,0,At,ht,J.data);else if(S.isData3DTexture)Bt?(te&&e.texStorage3D(32879,E,vt,J.width,J.height,J.depth),e.texSubImage3D(32879,0,0,0,0,J.width,J.height,J.depth,At,ht,J.data)):e.texImage3D(32879,0,vt,J.width,J.height,J.depth,0,At,ht,J.data);else if(S.isFramebufferTexture){if(te)if(Bt)e.texStorage2D(3553,E,vt,J.width,J.height);else{let F=J.width,Y=J.height;for(let at=0;at<E;at++)e.texImage2D(3553,at,vt,F,Y,0,At,ht,null),F>>=1,Y>>=1}}else if(Lt.length>0&&gt){Bt&&te&&e.texStorage2D(3553,E,vt,Lt[0].width,Lt[0].height);for(let F=0,Y=Lt.length;F<Y;F++)pt=Lt[F],Bt?e.texSubImage2D(3553,F,0,0,At,ht,pt):e.texImage2D(3553,F,vt,At,ht,pt);S.generateMipmaps=!1}else Bt?(te&&e.texStorage2D(3553,E,vt,J.width,J.height),e.texSubImage2D(3553,0,0,0,At,ht,J)):e.texImage2D(3553,0,vt,At,ht,J);C(S,gt)&&z(K),St.__version=st.version,S.onUpdate&&S.onUpdate(S)}_.__version=S.version}function ft(_,S,U){if(S.image.length!==6)return;const K=Mt(_,S),tt=S.source;e.bindTexture(34067,_.__webglTexture,33984+U);const st=n.get(tt);if(tt.version!==st.__version||K===!0){e.activeTexture(33984+U),s.pixelStorei(37440,S.flipY),s.pixelStorei(37441,S.premultiplyAlpha),s.pixelStorei(3317,S.unpackAlignment),s.pixelStorei(37443,0);const St=S.isCompressedTexture||S.image[0].isCompressedTexture,rt=S.image[0]&&S.image[0].isDataTexture,J=[];for(let F=0;F<6;F++)!St&&!rt?J[F]=x(S.image[F],!1,!0,c):J[F]=rt?S.image[F].image:S.image[F],J[F]=Ne(S,J[F]);const gt=J[0],At=w(gt)||a,ht=r.convert(S.format,S.encoding),vt=r.convert(S.type),pt=A(S.internalFormat,ht,vt,S.encoding),Lt=a&&S.isVideoTexture!==!0,Bt=st.__version===void 0||K===!0;let te=T(S,gt,At);O(34067,S,At);let E;if(St){Lt&&Bt&&e.texStorage2D(34067,te,pt,gt.width,gt.height);for(let F=0;F<6;F++){E=J[F].mipmaps;for(let Y=0;Y<E.length;Y++){const at=E[Y];S.format!==Ie?ht!==null?Lt?e.compressedTexSubImage2D(34069+F,Y,0,0,at.width,at.height,ht,at.data):e.compressedTexImage2D(34069+F,Y,pt,at.width,at.height,0,at.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Lt?e.texSubImage2D(34069+F,Y,0,0,at.width,at.height,ht,vt,at.data):e.texImage2D(34069+F,Y,pt,at.width,at.height,0,ht,vt,at.data)}}}else{E=S.mipmaps,Lt&&Bt&&(E.length>0&&te++,e.texStorage2D(34067,te,pt,J[0].width,J[0].height));for(let F=0;F<6;F++)if(rt){Lt?e.texSubImage2D(34069+F,0,0,0,J[F].width,J[F].height,ht,vt,J[F].data):e.texImage2D(34069+F,0,pt,J[F].width,J[F].height,0,ht,vt,J[F].data);for(let Y=0;Y<E.length;Y++){const ut=E[Y].image[F].image;Lt?e.texSubImage2D(34069+F,Y+1,0,0,ut.width,ut.height,ht,vt,ut.data):e.texImage2D(34069+F,Y+1,pt,ut.width,ut.height,0,ht,vt,ut.data)}}else{Lt?e.texSubImage2D(34069+F,0,0,0,ht,vt,J[F]):e.texImage2D(34069+F,0,pt,ht,vt,J[F]);for(let Y=0;Y<E.length;Y++){const at=E[Y];Lt?e.texSubImage2D(34069+F,Y+1,0,0,ht,vt,at.image[F]):e.texImage2D(34069+F,Y+1,pt,ht,vt,at.image[F])}}}C(S,At)&&z(34067),st.__version=tt.version,S.onUpdate&&S.onUpdate(S)}_.__version=S.version}function ot(_,S,U,K,tt){const st=r.convert(U.format,U.encoding),St=r.convert(U.type),rt=A(U.internalFormat,st,St,U.encoding);n.get(S).__hasExternalTextures||(tt===32879||tt===35866?e.texImage3D(tt,0,rt,S.width,S.height,S.depth,0,st,St,null):e.texImage2D(tt,0,rt,S.width,S.height,0,st,St,null)),e.bindFramebuffer(36160,_),Dt(S)?d.framebufferTexture2DMultisampleEXT(36160,K,tt,n.get(U).__webglTexture,0,Xt(S)):(tt===3553||tt>=34069&&tt<=34074)&&s.framebufferTexture2D(36160,K,tt,n.get(U).__webglTexture,0),e.bindFramebuffer(36160,null)}function Nt(_,S,U){if(s.bindRenderbuffer(36161,_),S.depthBuffer&&!S.stencilBuffer){let K=33189;if(U||Dt(S)){const tt=S.depthTexture;tt&&tt.isDepthTexture&&(tt.type===dn?K=36012:tt.type===Pn&&(K=33190));const st=Xt(S);Dt(S)?d.renderbufferStorageMultisampleEXT(36161,st,K,S.width,S.height):s.renderbufferStorageMultisample(36161,st,K,S.width,S.height)}else s.renderbufferStorage(36161,K,S.width,S.height);s.framebufferRenderbuffer(36160,36096,36161,_)}else if(S.depthBuffer&&S.stencilBuffer){const K=Xt(S);U&&Dt(S)===!1?s.renderbufferStorageMultisample(36161,K,35056,S.width,S.height):Dt(S)?d.renderbufferStorageMultisampleEXT(36161,K,35056,S.width,S.height):s.renderbufferStorage(36161,34041,S.width,S.height),s.framebufferRenderbuffer(36160,33306,36161,_)}else{const K=S.isWebGLMultipleRenderTargets===!0?S.texture:[S.texture];for(let tt=0;tt<K.length;tt++){const st=K[tt],St=r.convert(st.format,st.encoding),rt=r.convert(st.type),J=A(st.internalFormat,St,rt,st.encoding),gt=Xt(S);U&&Dt(S)===!1?s.renderbufferStorageMultisample(36161,gt,J,S.width,S.height):Dt(S)?d.renderbufferStorageMultisampleEXT(36161,gt,J,S.width,S.height):s.renderbufferStorage(36161,J,S.width,S.height)}}s.bindRenderbuffer(36161,null)}function wt(_,S){if(S&&S.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(36160,_),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(S.depthTexture).__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),Q(S.depthTexture,0);const K=n.get(S.depthTexture).__webglTexture,tt=Xt(S);if(S.depthTexture.format===Rn)Dt(S)?d.framebufferTexture2DMultisampleEXT(36160,36096,3553,K,0,tt):s.framebufferTexture2D(36160,36096,3553,K,0);else if(S.depthTexture.format===ci)Dt(S)?d.framebufferTexture2DMultisampleEXT(36160,33306,3553,K,0,tt):s.framebufferTexture2D(36160,33306,3553,K,0);else throw new Error("Unknown depthTexture format")}function xt(_){const S=n.get(_),U=_.isWebGLCubeRenderTarget===!0;if(_.depthTexture&&!S.__autoAllocateDepthBuffer){if(U)throw new Error("target.depthTexture not supported in Cube render targets");wt(S.__webglFramebuffer,_)}else if(U){S.__webglDepthbuffer=[];for(let K=0;K<6;K++)e.bindFramebuffer(36160,S.__webglFramebuffer[K]),S.__webglDepthbuffer[K]=s.createRenderbuffer(),Nt(S.__webglDepthbuffer[K],_,!1)}else e.bindFramebuffer(36160,S.__webglFramebuffer),S.__webglDepthbuffer=s.createRenderbuffer(),Nt(S.__webglDepthbuffer,_,!1);e.bindFramebuffer(36160,null)}function pe(_,S,U){const K=n.get(_);S!==void 0&&ot(K.__webglFramebuffer,_,_.texture,36064,3553),U!==void 0&&xt(_)}function ze(_){const S=_.texture,U=n.get(_),K=n.get(S);_.addEventListener("dispose",X),_.isWebGLMultipleRenderTargets!==!0&&(K.__webglTexture===void 0&&(K.__webglTexture=s.createTexture()),K.__version=S.version,o.memory.textures++);const tt=_.isWebGLCubeRenderTarget===!0,st=_.isWebGLMultipleRenderTargets===!0,St=w(_)||a;if(tt){U.__webglFramebuffer=[];for(let rt=0;rt<6;rt++)U.__webglFramebuffer[rt]=s.createFramebuffer()}else{if(U.__webglFramebuffer=s.createFramebuffer(),st)if(i.drawBuffers){const rt=_.texture;for(let J=0,gt=rt.length;J<gt;J++){const At=n.get(rt[J]);At.__webglTexture===void 0&&(At.__webglTexture=s.createTexture(),o.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(a&&_.samples>0&&Dt(_)===!1){const rt=st?S:[S];U.__webglMultisampledFramebuffer=s.createFramebuffer(),U.__webglColorRenderbuffer=[],e.bindFramebuffer(36160,U.__webglMultisampledFramebuffer);for(let J=0;J<rt.length;J++){const gt=rt[J];U.__webglColorRenderbuffer[J]=s.createRenderbuffer(),s.bindRenderbuffer(36161,U.__webglColorRenderbuffer[J]);const At=r.convert(gt.format,gt.encoding),ht=r.convert(gt.type),vt=A(gt.internalFormat,At,ht,gt.encoding,_.isXRRenderTarget===!0),pt=Xt(_);s.renderbufferStorageMultisample(36161,pt,vt,_.width,_.height),s.framebufferRenderbuffer(36160,36064+J,36161,U.__webglColorRenderbuffer[J])}s.bindRenderbuffer(36161,null),_.depthBuffer&&(U.__webglDepthRenderbuffer=s.createRenderbuffer(),Nt(U.__webglDepthRenderbuffer,_,!0)),e.bindFramebuffer(36160,null)}}if(tt){e.bindTexture(34067,K.__webglTexture),O(34067,S,St);for(let rt=0;rt<6;rt++)ot(U.__webglFramebuffer[rt],_,S,36064,34069+rt);C(S,St)&&z(34067),e.unbindTexture()}else if(st){const rt=_.texture;for(let J=0,gt=rt.length;J<gt;J++){const At=rt[J],ht=n.get(At);e.bindTexture(3553,ht.__webglTexture),O(3553,At,St),ot(U.__webglFramebuffer,_,At,36064+J,3553),C(At,St)&&z(3553)}e.unbindTexture()}else{let rt=3553;(_.isWebGL3DRenderTarget||_.isWebGLArrayRenderTarget)&&(a?rt=_.isWebGL3DRenderTarget?32879:35866:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),e.bindTexture(rt,K.__webglTexture),O(rt,S,St),ot(U.__webglFramebuffer,_,S,36064,rt),C(S,St)&&z(rt),e.unbindTexture()}_.depthBuffer&&xt(_)}function le(_){const S=w(_)||a,U=_.isWebGLMultipleRenderTargets===!0?_.texture:[_.texture];for(let K=0,tt=U.length;K<tt;K++){const st=U[K];if(C(st,S)){const St=_.isWebGLCubeRenderTarget?34067:3553,rt=n.get(st).__webglTexture;e.bindTexture(St,rt),z(St),e.unbindTexture()}}}function Le(_){if(a&&_.samples>0&&Dt(_)===!1){const S=_.isWebGLMultipleRenderTargets?_.texture:[_.texture],U=_.width,K=_.height;let tt=16384;const st=[],St=_.stencilBuffer?33306:36096,rt=n.get(_),J=_.isWebGLMultipleRenderTargets===!0;if(J)for(let gt=0;gt<S.length;gt++)e.bindFramebuffer(36160,rt.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(36160,36064+gt,36161,null),e.bindFramebuffer(36160,rt.__webglFramebuffer),s.framebufferTexture2D(36009,36064+gt,3553,null,0);e.bindFramebuffer(36008,rt.__webglMultisampledFramebuffer),e.bindFramebuffer(36009,rt.__webglFramebuffer);for(let gt=0;gt<S.length;gt++){st.push(36064+gt),_.depthBuffer&&st.push(St);const At=rt.__ignoreDepthValues!==void 0?rt.__ignoreDepthValues:!1;if(At===!1&&(_.depthBuffer&&(tt|=256),_.stencilBuffer&&(tt|=1024)),J&&s.framebufferRenderbuffer(36008,36064,36161,rt.__webglColorRenderbuffer[gt]),At===!0&&(s.invalidateFramebuffer(36008,[St]),s.invalidateFramebuffer(36009,[St])),J){const ht=n.get(S[gt]).__webglTexture;s.framebufferTexture2D(36009,36064,3553,ht,0)}s.blitFramebuffer(0,0,U,K,0,0,U,K,tt,9728),f&&s.invalidateFramebuffer(36008,st)}if(e.bindFramebuffer(36008,null),e.bindFramebuffer(36009,null),J)for(let gt=0;gt<S.length;gt++){e.bindFramebuffer(36160,rt.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(36160,36064+gt,36161,rt.__webglColorRenderbuffer[gt]);const At=n.get(S[gt]).__webglTexture;e.bindFramebuffer(36160,rt.__webglFramebuffer),s.framebufferTexture2D(36009,36064+gt,3553,At,0)}e.bindFramebuffer(36009,rt.__webglMultisampledFramebuffer)}}function Xt(_){return Math.min(u,_.samples)}function Dt(_){const S=n.get(_);return a&&_.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function Xe(_){const S=o.render.frame;v.get(_)!==S&&(v.set(_,S),_.update())}function Ne(_,S){const U=_.encoding,K=_.format,tt=_.type;return _.isCompressedTexture===!0||_.isVideoTexture===!0||_.format===Mr||U!==In&&(U===Ft?a===!1?t.has("EXT_sRGB")===!0&&K===Ie?(_.format=Mr,_.minFilter=Se,_.generateMipmaps=!1):S=No.sRGBToLinear(S):(K!==Ie||tt!==Dn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture encoding:",U)),S}this.allocateTextureUnit=Z,this.resetTextureUnits=j,this.setTexture2D=Q,this.setTexture2DArray=ct,this.setTexture3D=N,this.setTextureCube=W,this.rebindTextures=pe,this.setupRenderTarget=ze,this.updateRenderTargetMipmap=le,this.updateMultisampleRenderTarget=Le,this.setupDepthRenderbuffer=xt,this.setupFrameBufferTexture=ot,this.useMultisampledRTT=Dt}function vm(s,t,e){const n=e.isWebGL2;function i(r,o=null){let a;if(r===Dn)return 5121;if(r===lh)return 32819;if(r===ch)return 32820;if(r===rh)return 5120;if(r===ah)return 5122;if(r===ko)return 5123;if(r===oh)return 5124;if(r===Pn)return 5125;if(r===dn)return 5126;if(r===zi)return n?5131:(a=t.get("OES_texture_half_float"),a!==null?a.HALF_FLOAT_OES:null);if(r===hh)return 6406;if(r===Ie)return 6408;if(r===uh)return 6409;if(r===dh)return 6410;if(r===Rn)return 6402;if(r===ci)return 34041;if(r===Mr)return a=t.get("EXT_sRGB"),a!==null?a.SRGB_ALPHA_EXT:null;if(r===fh)return 6403;if(r===ph)return 36244;if(r===mh)return 33319;if(r===gh)return 33320;if(r===vh)return 36249;if(r===bs||r===_s||r===Ts||r===Cs)if(o===Ft)if(a=t.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(r===bs)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(r===_s)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(r===Ts)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(r===Cs)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=t.get("WEBGL_compressed_texture_s3tc"),a!==null){if(r===bs)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(r===_s)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(r===Ts)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(r===Cs)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(r===ta||r===ea||r===na||r===ia)if(a=t.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(r===ta)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(r===ea)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(r===na)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(r===ia)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(r===Ah)return a=t.get("WEBGL_compressed_texture_etc1"),a!==null?a.COMPRESSED_RGB_ETC1_WEBGL:null;if(r===sa||r===ra)if(a=t.get("WEBGL_compressed_texture_etc"),a!==null){if(r===sa)return o===Ft?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(r===ra)return o===Ft?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(r===aa||r===oa||r===la||r===ca||r===ha||r===ua||r===da||r===fa||r===pa||r===ma||r===ga||r===va||r===Aa||r===xa)if(a=t.get("WEBGL_compressed_texture_astc"),a!==null){if(r===aa)return o===Ft?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(r===oa)return o===Ft?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(r===la)return o===Ft?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(r===ca)return o===Ft?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(r===ha)return o===Ft?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(r===ua)return o===Ft?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(r===da)return o===Ft?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(r===fa)return o===Ft?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(r===pa)return o===Ft?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(r===ma)return o===Ft?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(r===ga)return o===Ft?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(r===va)return o===Ft?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(r===Aa)return o===Ft?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(r===xa)return o===Ft?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(r===Es)if(a=t.get("EXT_texture_compression_bptc"),a!==null){if(r===Es)return o===Ft?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT}else return null;if(r===xh||r===Sa||r===ya||r===Ma)if(a=t.get("EXT_texture_compression_rgtc"),a!==null){if(r===Es)return a.COMPRESSED_RED_RGTC1_EXT;if(r===Sa)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(r===ya)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(r===Ma)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return r===ai?n?34042:(a=t.get("WEBGL_depth_texture"),a!==null?a.UNSIGNED_INT_24_8_WEBGL:null):s[r]!==void 0?s[r]:null}return{convert:i}}class Am extends De{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}class zn extends Me{constructor(){super(),this.isGroup=!0,this.type="Group"}}const xm={type:"move"};class er{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new zn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new zn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new zn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let i=null,r=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){o=!0;for(const m of t.hand.values()){const p=e.getJointPose(m,n),g=this._getHandJoint(c,m);p!==null&&(g.matrix.fromArray(p.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.jointRadius=p.radius),g.visible=p!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,v=.005;c.inputState.pinching&&d>f+v?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&d<=f-v&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(i=e.getPose(t.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),i.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity)):a.hasLinearVelocity=!1,i.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(xm)))}return a!==null&&(a.visible=i!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new zn;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}class Sm extends de{constructor(t,e,n,i,r,o,a,l,c,h){if(h=h!==void 0?h:Rn,h!==Rn&&h!==ci)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===Rn&&(n=Pn),n===void 0&&h===ci&&(n=ai),super(null,i,r,o,a,l,h,n,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=a!==void 0?a:re,this.minFilter=l!==void 0?l:re,this.flipY=!1,this.generateMipmaps=!1}}class ym extends ui{constructor(t,e){super();const n=this;let i=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,d=null,f=null,v=null;const m=e.getContextAttributes();let p=null,g=null;const y=[],x=[],w=new Set,M=new Map,C=new De;C.layers.enable(1),C.viewport=new ae;const z=new De;z.layers.enable(2),z.viewport=new ae;const A=[C,z],T=new Am;T.layers.enable(1),T.layers.enable(2);let k=null,V=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(N){let W=y[N];return W===void 0&&(W=new er,y[N]=W),W.getTargetRaySpace()},this.getControllerGrip=function(N){let W=y[N];return W===void 0&&(W=new er,y[N]=W),W.getGripSpace()},this.getHand=function(N){let W=y[N];return W===void 0&&(W=new er,y[N]=W),W.getHandSpace()};function X(N){const W=x.indexOf(N.inputSource);if(W===-1)return;const nt=y[W];nt!==void 0&&nt.dispatchEvent({type:N.type,data:N.inputSource})}function D(){i.removeEventListener("select",X),i.removeEventListener("selectstart",X),i.removeEventListener("selectend",X),i.removeEventListener("squeeze",X),i.removeEventListener("squeezestart",X),i.removeEventListener("squeezeend",X),i.removeEventListener("end",D),i.removeEventListener("inputsourceschange",L);for(let N=0;N<y.length;N++){const W=x[N];W!==null&&(x[N]=null,y[N].disconnect(W))}k=null,V=null,t.setRenderTarget(p),f=null,d=null,u=null,i=null,g=null,ct.stop(),n.isPresenting=!1,n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(N){r=N,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(N){a=N,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(N){c=N},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u},this.getFrame=function(){return v},this.getSession=function(){return i},this.setSession=async function(N){if(i=N,i!==null){if(p=t.getRenderTarget(),i.addEventListener("select",X),i.addEventListener("selectstart",X),i.addEventListener("selectend",X),i.addEventListener("squeeze",X),i.addEventListener("squeezestart",X),i.addEventListener("squeezeend",X),i.addEventListener("end",D),i.addEventListener("inputsourceschange",L),m.xrCompatible!==!0&&await e.makeXRCompatible(),i.renderState.layers===void 0||t.capabilities.isWebGL2===!1){const W={antialias:i.renderState.layers===void 0?m.antialias:!0,alpha:m.alpha,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(i,e,W),i.updateRenderState({baseLayer:f}),g=new rn(f.framebufferWidth,f.framebufferHeight,{format:Ie,type:Dn,encoding:t.outputEncoding,stencilBuffer:m.stencil})}else{let W=null,nt=null,it=null;m.depth&&(it=m.stencil?35056:33190,W=m.stencil?ci:Rn,nt=m.stencil?ai:Pn);const O={colorFormat:32856,depthFormat:it,scaleFactor:r};u=new XRWebGLBinding(i,e),d=u.createProjectionLayer(O),i.updateRenderState({layers:[d]}),g=new rn(d.textureWidth,d.textureHeight,{format:Ie,type:Dn,depthTexture:new Sm(d.textureWidth,d.textureHeight,nt,void 0,void 0,void 0,void 0,void 0,void 0,W),stencilBuffer:m.stencil,encoding:t.outputEncoding,samples:m.antialias?4:0});const Mt=t.properties.get(g);Mt.__ignoreDepthValues=d.ignoreDepthValues}g.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await i.requestReferenceSpace(a),ct.setContext(i),ct.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}};function L(N){for(let W=0;W<N.removed.length;W++){const nt=N.removed[W],it=x.indexOf(nt);it>=0&&(x[it]=null,y[it].disconnect(nt))}for(let W=0;W<N.added.length;W++){const nt=N.added[W];let it=x.indexOf(nt);if(it===-1){for(let Mt=0;Mt<y.length;Mt++)if(Mt>=x.length){x.push(nt),it=Mt;break}else if(x[Mt]===null){x[Mt]=nt,it=Mt;break}if(it===-1)break}const O=y[it];O&&O.connect(nt)}}const G=new P,q=new P;function j(N,W,nt){G.setFromMatrixPosition(W.matrixWorld),q.setFromMatrixPosition(nt.matrixWorld);const it=G.distanceTo(q),O=W.projectionMatrix.elements,Mt=nt.projectionMatrix.elements,dt=O[14]/(O[10]-1),ft=O[14]/(O[10]+1),ot=(O[9]+1)/O[5],Nt=(O[9]-1)/O[5],wt=(O[8]-1)/O[0],xt=(Mt[8]+1)/Mt[0],pe=dt*wt,ze=dt*xt,le=it/(-wt+xt),Le=le*-wt;W.matrixWorld.decompose(N.position,N.quaternion,N.scale),N.translateX(Le),N.translateZ(le),N.matrixWorld.compose(N.position,N.quaternion,N.scale),N.matrixWorldInverse.copy(N.matrixWorld).invert();const Xt=dt+le,Dt=ft+le,Xe=pe-Le,Ne=ze+(it-Le),_=ot*ft/Dt*Xt,S=Nt*ft/Dt*Xt;N.projectionMatrix.makePerspective(Xe,Ne,_,S,Xt,Dt)}function Z(N,W){W===null?N.matrixWorld.copy(N.matrix):N.matrixWorld.multiplyMatrices(W.matrixWorld,N.matrix),N.matrixWorldInverse.copy(N.matrixWorld).invert()}this.updateCamera=function(N){if(i===null)return;T.near=z.near=C.near=N.near,T.far=z.far=C.far=N.far,(k!==T.near||V!==T.far)&&(i.updateRenderState({depthNear:T.near,depthFar:T.far}),k=T.near,V=T.far);const W=N.parent,nt=T.cameras;Z(T,W);for(let O=0;O<nt.length;O++)Z(nt[O],W);T.matrixWorld.decompose(T.position,T.quaternion,T.scale),N.matrix.copy(T.matrix),N.matrix.decompose(N.position,N.quaternion,N.scale);const it=N.children;for(let O=0,Mt=it.length;O<Mt;O++)it[O].updateMatrixWorld(!0);nt.length===2?j(T,C,z):T.projectionMatrix.copy(C.projectionMatrix)},this.getCamera=function(){return T},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(N){l=N,d!==null&&(d.fixedFoveation=N),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=N)},this.getPlanes=function(){return w};let $=null;function Q(N,W){if(h=W.getViewerPose(c||o),v=W,h!==null){const nt=h.views;f!==null&&(t.setRenderTargetFramebuffer(g,f.framebuffer),t.setRenderTarget(g));let it=!1;nt.length!==T.cameras.length&&(T.cameras.length=0,it=!0);for(let O=0;O<nt.length;O++){const Mt=nt[O];let dt=null;if(f!==null)dt=f.getViewport(Mt);else{const ot=u.getViewSubImage(d,Mt);dt=ot.viewport,O===0&&(t.setRenderTargetTextures(g,ot.colorTexture,d.ignoreDepthValues?void 0:ot.depthStencilTexture),t.setRenderTarget(g))}let ft=A[O];ft===void 0&&(ft=new De,ft.layers.enable(O),ft.viewport=new ae,A[O]=ft),ft.matrix.fromArray(Mt.transform.matrix),ft.projectionMatrix.fromArray(Mt.projectionMatrix),ft.viewport.set(dt.x,dt.y,dt.width,dt.height),O===0&&T.matrix.copy(ft.matrix),it===!0&&T.cameras.push(ft)}}for(let nt=0;nt<y.length;nt++){const it=x[nt],O=y[nt];it!==null&&O!==void 0&&O.update(it,W,c||o)}if($&&$(N,W),W.detectedPlanes){n.dispatchEvent({type:"planesdetected",data:W.detectedPlanes});let nt=null;for(const it of w)W.detectedPlanes.has(it)||(nt===null&&(nt=[]),nt.push(it));if(nt!==null)for(const it of nt)w.delete(it),M.delete(it),n.dispatchEvent({type:"planeremoved",data:it});for(const it of W.detectedPlanes)if(!w.has(it))w.add(it),M.set(it,W.lastChangedTime),n.dispatchEvent({type:"planeadded",data:it});else{const O=M.get(it);it.lastChangedTime>O&&(M.set(it,it.lastChangedTime),n.dispatchEvent({type:"planechanged",data:it}))}}v=null}const ct=new Xo;ct.setAnimationLoop(Q),this.setAnimationLoop=function(N){$=N},this.dispose=function(){}}}function Mm(s,t){function e(m,p){p.color.getRGB(m.fogColor.value,Jo(s)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function n(m,p,g,y,x){p.isMeshBasicMaterial||p.isMeshLambertMaterial?i(m,p):p.isMeshToonMaterial?(i(m,p),h(m,p)):p.isMeshPhongMaterial?(i(m,p),c(m,p)):p.isMeshStandardMaterial?(i(m,p),u(m,p),p.isMeshPhysicalMaterial&&d(m,p,x)):p.isMeshMatcapMaterial?(i(m,p),f(m,p)):p.isMeshDepthMaterial?i(m,p):p.isMeshDistanceMaterial?(i(m,p),v(m,p)):p.isMeshNormalMaterial?i(m,p):p.isLineBasicMaterial?(r(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?a(m,p,g,y):p.isSpriteMaterial?l(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function i(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map),p.alphaMap&&(m.alphaMap.value=p.alphaMap),p.bumpMap&&(m.bumpMap.value=p.bumpMap,m.bumpScale.value=p.bumpScale,p.side===ye&&(m.bumpScale.value*=-1)),p.displacementMap&&(m.displacementMap.value=p.displacementMap,m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap),p.normalMap&&(m.normalMap.value=p.normalMap,m.normalScale.value.copy(p.normalScale),p.side===ye&&m.normalScale.value.negate()),p.specularMap&&(m.specularMap.value=p.specularMap),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const g=t.get(p).envMap;if(g&&(m.envMap.value=g,m.flipEnvMap.value=g.isCubeTexture&&g.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap){m.lightMap.value=p.lightMap;const w=s.physicallyCorrectLights!==!0?Math.PI:1;m.lightMapIntensity.value=p.lightMapIntensity*w}p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity);let y;p.map?y=p.map:p.specularMap?y=p.specularMap:p.displacementMap?y=p.displacementMap:p.normalMap?y=p.normalMap:p.bumpMap?y=p.bumpMap:p.roughnessMap?y=p.roughnessMap:p.metalnessMap?y=p.metalnessMap:p.alphaMap?y=p.alphaMap:p.emissiveMap?y=p.emissiveMap:p.clearcoatMap?y=p.clearcoatMap:p.clearcoatNormalMap?y=p.clearcoatNormalMap:p.clearcoatRoughnessMap?y=p.clearcoatRoughnessMap:p.iridescenceMap?y=p.iridescenceMap:p.iridescenceThicknessMap?y=p.iridescenceThicknessMap:p.specularIntensityMap?y=p.specularIntensityMap:p.specularColorMap?y=p.specularColorMap:p.transmissionMap?y=p.transmissionMap:p.thicknessMap?y=p.thicknessMap:p.sheenColorMap?y=p.sheenColorMap:p.sheenRoughnessMap&&(y=p.sheenRoughnessMap),y!==void 0&&(y.isWebGLRenderTarget&&(y=y.texture),y.matrixAutoUpdate===!0&&y.updateMatrix(),m.uvTransform.value.copy(y.matrix));let x;p.aoMap?x=p.aoMap:p.lightMap&&(x=p.lightMap),x!==void 0&&(x.isWebGLRenderTarget&&(x=x.texture),x.matrixAutoUpdate===!0&&x.updateMatrix(),m.uv2Transform.value.copy(x.matrix))}function r(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function a(m,p,g,y){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*g,m.scale.value=y*.5,p.map&&(m.map.value=p.map),p.alphaMap&&(m.alphaMap.value=p.alphaMap),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let x;p.map?x=p.map:p.alphaMap&&(x=p.alphaMap),x!==void 0&&(x.matrixAutoUpdate===!0&&x.updateMatrix(),m.uvTransform.value.copy(x.matrix))}function l(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map),p.alphaMap&&(m.alphaMap.value=p.alphaMap),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let g;p.map?g=p.map:p.alphaMap&&(g=p.alphaMap),g!==void 0&&(g.matrixAutoUpdate===!0&&g.updateMatrix(),m.uvTransform.value.copy(g.matrix))}function c(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function h(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function u(m,p){m.roughness.value=p.roughness,m.metalness.value=p.metalness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap),p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap),t.get(p).envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function d(m,p,g){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap)),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap),p.clearcoatNormalMap&&(m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),m.clearcoatNormalMap.value=p.clearcoatNormalMap,p.side===ye&&m.clearcoatNormalScale.value.negate())),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap)),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=g.texture,m.transmissionSamplerSize.value.set(g.width,g.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap)}function f(m,p){p.matcap&&(m.matcap.value=p.matcap)}function v(m,p){m.referencePosition.value.copy(p.referencePosition),m.nearDistance.value=p.nearDistance,m.farDistance.value=p.farDistance}return{refreshFogUniforms:e,refreshMaterialUniforms:n}}function wm(s,t,e,n){let i={},r={},o=[];const a=e.isWebGL2?s.getParameter(35375):0;function l(y,x){const w=x.program;n.uniformBlockBinding(y,w)}function c(y,x){let w=i[y.id];w===void 0&&(v(y),w=h(y),i[y.id]=w,y.addEventListener("dispose",p));const M=x.program;n.updateUBOMapping(y,M);const C=t.render.frame;r[y.id]!==C&&(d(y),r[y.id]=C)}function h(y){const x=u();y.__bindingPointIndex=x;const w=s.createBuffer(),M=y.__size,C=y.usage;return s.bindBuffer(35345,w),s.bufferData(35345,M,C),s.bindBuffer(35345,null),s.bindBufferBase(35345,x,w),w}function u(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(y){const x=i[y.id],w=y.uniforms,M=y.__cache;s.bindBuffer(35345,x);for(let C=0,z=w.length;C<z;C++){const A=w[C];if(f(A,C,M)===!0){const T=A.__offset,k=Array.isArray(A.value)?A.value:[A.value];let V=0;for(let X=0;X<k.length;X++){const D=k[X],L=m(D);typeof D=="number"?(A.__data[0]=D,s.bufferSubData(35345,T+V,A.__data)):D.isMatrix3?(A.__data[0]=D.elements[0],A.__data[1]=D.elements[1],A.__data[2]=D.elements[2],A.__data[3]=D.elements[0],A.__data[4]=D.elements[3],A.__data[5]=D.elements[4],A.__data[6]=D.elements[5],A.__data[7]=D.elements[0],A.__data[8]=D.elements[6],A.__data[9]=D.elements[7],A.__data[10]=D.elements[8],A.__data[11]=D.elements[0]):(D.toArray(A.__data,V),V+=L.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(35345,T,A.__data)}}s.bindBuffer(35345,null)}function f(y,x,w){const M=y.value;if(w[x]===void 0){if(typeof M=="number")w[x]=M;else{const C=Array.isArray(M)?M:[M],z=[];for(let A=0;A<C.length;A++)z.push(C[A].clone());w[x]=z}return!0}else if(typeof M=="number"){if(w[x]!==M)return w[x]=M,!0}else{const C=Array.isArray(w[x])?w[x]:[w[x]],z=Array.isArray(M)?M:[M];for(let A=0;A<C.length;A++){const T=C[A];if(T.equals(z[A])===!1)return T.copy(z[A]),!0}}return!1}function v(y){const x=y.uniforms;let w=0;const M=16;let C=0;for(let z=0,A=x.length;z<A;z++){const T=x[z],k={boundary:0,storage:0},V=Array.isArray(T.value)?T.value:[T.value];for(let X=0,D=V.length;X<D;X++){const L=V[X],G=m(L);k.boundary+=G.boundary,k.storage+=G.storage}if(T.__data=new Float32Array(k.storage/Float32Array.BYTES_PER_ELEMENT),T.__offset=w,z>0){C=w%M;const X=M-C;C!==0&&X-k.boundary<0&&(w+=M-C,T.__offset=w)}w+=k.storage}return C=w%M,C>0&&(w+=M-C),y.__size=w,y.__cache={},this}function m(y){const x={boundary:0,storage:0};return typeof y=="number"?(x.boundary=4,x.storage=4):y.isVector2?(x.boundary=8,x.storage=8):y.isVector3||y.isColor?(x.boundary=16,x.storage=12):y.isVector4?(x.boundary=16,x.storage=16):y.isMatrix3?(x.boundary=48,x.storage=48):y.isMatrix4?(x.boundary=64,x.storage=64):y.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",y),x}function p(y){const x=y.target;x.removeEventListener("dispose",p);const w=o.indexOf(x.__bindingPointIndex);o.splice(w,1),s.deleteBuffer(i[x.id]),delete i[x.id],delete r[x.id]}function g(){for(const y in i)s.deleteBuffer(i[y]);o=[],i={},r={}}return{bind:l,update:c,dispose:g}}function bm(){const s=us("canvas");return s.style.display="block",s}function $o(s={}){this.isWebGLRenderer=!0;const t=s.canvas!==void 0?s.canvas:bm(),e=s.context!==void 0?s.context:null,n=s.depth!==void 0?s.depth:!0,i=s.stencil!==void 0?s.stencil:!0,r=s.antialias!==void 0?s.antialias:!1,o=s.premultipliedAlpha!==void 0?s.premultipliedAlpha:!0,a=s.preserveDrawingBuffer!==void 0?s.preserveDrawingBuffer:!1,l=s.powerPreference!==void 0?s.powerPreference:"default",c=s.failIfMajorPerformanceCaveat!==void 0?s.failIfMajorPerformanceCaveat:!1;let h;e!==null?h=e.getContextAttributes().alpha:h=s.alpha!==void 0?s.alpha:!1;let u=null,d=null;const f=[],v=[];this.domElement=t,this.debug={checkShaderErrors:!0},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.outputEncoding=In,this.physicallyCorrectLights=!1,this.toneMapping=sn,this.toneMappingExposure=1;const m=this;let p=!1,g=0,y=0,x=null,w=-1,M=null;const C=new ae,z=new ae;let A=null,T=t.width,k=t.height,V=1,X=null,D=null;const L=new ae(0,0,T,k),G=new ae(0,0,T,k);let q=!1;const j=new Wo;let Z=!1,$=!1,Q=null;const ct=new jt,N=new lt,W=new P,nt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function it(){return x===null?V:1}let O=e;function Mt(b,I){for(let B=0;B<b.length;B++){const R=b[B],H=t.getContext(R,I);if(H!==null)return H}return null}try{const b={alpha:!0,depth:n,stencil:i,antialias:r,premultipliedAlpha:o,preserveDrawingBuffer:a,powerPreference:l,failIfMajorPerformanceCaveat:c};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Er}`),t.addEventListener("webglcontextlost",vt,!1),t.addEventListener("webglcontextrestored",pt,!1),t.addEventListener("webglcontextcreationerror",Lt,!1),O===null){const I=["webgl2","webgl","experimental-webgl"];if(m.isWebGL1Renderer===!0&&I.shift(),O=Mt(I,b),O===null)throw Mt(I)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}O.getShaderPrecisionFormat===void 0&&(O.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(b){throw console.error("THREE.WebGLRenderer: "+b.message),b}let dt,ft,ot,Nt,wt,xt,pe,ze,le,Le,Xt,Dt,Xe,Ne,_,S,U,K,tt,st,St,rt,J,gt;function At(){dt=new If(O),ft=new Pf(O,dt,s),dt.init(ft),rt=new vm(O,dt,ft),ot=new mm(O,dt,ft),Nt=new Ff,wt=new em,xt=new gm(O,dt,ot,wt,ft,rt,Nt),pe=new Lf(m),ze=new Df(m),le=new Wh(O,ft),J=new Cf(O,dt,le,ft),Le=new Nf(O,le,Nt,J),Xt=new Gf(O,Le,le,Nt),tt=new Hf(O,ft,xt),S=new zf(wt),Dt=new tm(m,pe,ze,dt,ft,J,S),Xe=new Mm(m,wt),Ne=new im,_=new cm(dt,ft),K=new Tf(m,pe,ze,ot,Xt,h,o),U=new pm(m,Xt,ft),gt=new wm(O,Nt,ft,ot),st=new Ef(O,dt,Nt,ft),St=new Of(O,dt,Nt,ft),Nt.programs=Dt.programs,m.capabilities=ft,m.extensions=dt,m.properties=wt,m.renderLists=Ne,m.shadowMap=U,m.state=ot,m.info=Nt}At();const ht=new ym(m,O);this.xr=ht,this.getContext=function(){return O},this.getContextAttributes=function(){return O.getContextAttributes()},this.forceContextLoss=function(){const b=dt.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){const b=dt.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return V},this.setPixelRatio=function(b){b!==void 0&&(V=b,this.setSize(T,k,!1))},this.getSize=function(b){return b.set(T,k)},this.setSize=function(b,I,B){if(ht.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}T=b,k=I,t.width=Math.floor(b*V),t.height=Math.floor(I*V),B!==!1&&(t.style.width=b+"px",t.style.height=I+"px"),this.setViewport(0,0,b,I)},this.getDrawingBufferSize=function(b){return b.set(T*V,k*V).floor()},this.setDrawingBufferSize=function(b,I,B){T=b,k=I,V=B,t.width=Math.floor(b*B),t.height=Math.floor(I*B),this.setViewport(0,0,b,I)},this.getCurrentViewport=function(b){return b.copy(C)},this.getViewport=function(b){return b.copy(L)},this.setViewport=function(b,I,B,R){b.isVector4?L.set(b.x,b.y,b.z,b.w):L.set(b,I,B,R),ot.viewport(C.copy(L).multiplyScalar(V).floor())},this.getScissor=function(b){return b.copy(G)},this.setScissor=function(b,I,B,R){b.isVector4?G.set(b.x,b.y,b.z,b.w):G.set(b,I,B,R),ot.scissor(z.copy(G).multiplyScalar(V).floor())},this.getScissorTest=function(){return q},this.setScissorTest=function(b){ot.setScissorTest(q=b)},this.setOpaqueSort=function(b){X=b},this.setTransparentSort=function(b){D=b},this.getClearColor=function(b){return b.copy(K.getClearColor())},this.setClearColor=function(){K.setClearColor.apply(K,arguments)},this.getClearAlpha=function(){return K.getClearAlpha()},this.setClearAlpha=function(){K.setClearAlpha.apply(K,arguments)},this.clear=function(b=!0,I=!0,B=!0){let R=0;b&&(R|=16384),I&&(R|=256),B&&(R|=1024),O.clear(R)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",vt,!1),t.removeEventListener("webglcontextrestored",pt,!1),t.removeEventListener("webglcontextcreationerror",Lt,!1),Ne.dispose(),_.dispose(),wt.dispose(),pe.dispose(),ze.dispose(),Xt.dispose(),J.dispose(),gt.dispose(),Dt.dispose(),ht.dispose(),ht.removeEventListener("sessionstart",at),ht.removeEventListener("sessionend",ut),Q&&(Q.dispose(),Q=null),kt.stop()};function vt(b){b.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),p=!0}function pt(){console.log("THREE.WebGLRenderer: Context Restored."),p=!1;const b=Nt.autoReset,I=U.enabled,B=U.autoUpdate,R=U.needsUpdate,H=U.type;At(),Nt.autoReset=b,U.enabled=I,U.autoUpdate=B,U.needsUpdate=R,U.type=H}function Lt(b){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function Bt(b){const I=b.target;I.removeEventListener("dispose",Bt),te(I)}function te(b){E(b),wt.remove(b)}function E(b){const I=wt.get(b).programs;I!==void 0&&(I.forEach(function(B){Dt.releaseProgram(B)}),b.isShaderMaterial&&Dt.releaseShaderCache(b))}this.renderBufferDirect=function(b,I,B,R,H,mt){I===null&&(I=nt);const yt=H.isMesh&&H.matrixWorld.determinant()<0,Tt=rl(b,I,B,R,H);ot.setMaterial(R,yt);let Ct=B.index,Rt=1;R.wireframe===!0&&(Ct=Le.getWireframeAttribute(B),Rt=2);const Et=B.drawRange,Pt=B.attributes.position;let Jt=Et.start*Rt,we=(Et.start+Et.count)*Rt;mt!==null&&(Jt=Math.max(Jt,mt.start*Rt),we=Math.min(we,(mt.start+mt.count)*Rt)),Ct!==null?(Jt=Math.max(Jt,0),we=Math.min(we,Ct.count)):Pt!=null&&(Jt=Math.max(Jt,0),we=Math.min(we,Pt.count));const Ye=we-Jt;if(Ye<0||Ye===1/0)return;J.setup(H,R,Tt,B,Ct);let xn,Vt=st;if(Ct!==null&&(xn=le.get(Ct),Vt=St,Vt.setIndex(xn)),H.isMesh)R.wireframe===!0?(ot.setLineWidth(R.wireframeLinewidth*it()),Vt.setMode(1)):Vt.setMode(4);else if(H.isLine){let zt=R.linewidth;zt===void 0&&(zt=1),ot.setLineWidth(zt*it()),H.isLineSegments?Vt.setMode(1):H.isLineLoop?Vt.setMode(2):Vt.setMode(3)}else H.isPoints?Vt.setMode(0):H.isSprite&&Vt.setMode(4);if(H.isInstancedMesh)Vt.renderInstances(Jt,Ye,H.count);else if(B.isInstancedBufferGeometry){const zt=B._maxInstanceCount!==void 0?B._maxInstanceCount:1/0,vs=Math.min(B.instanceCount,zt);Vt.renderInstances(Jt,Ye,vs)}else Vt.render(Jt,Ye)},this.compile=function(b,I){function B(R,H,mt){R.transparent===!0&&R.side===un&&R.forceSinglePass===!1?(R.side=ye,R.needsUpdate=!0,Re(R,H,mt),R.side=mn,R.needsUpdate=!0,Re(R,H,mt),R.side=un):Re(R,H,mt)}d=_.get(b),d.init(),v.push(d),b.traverseVisible(function(R){R.isLight&&R.layers.test(I.layers)&&(d.pushLight(R),R.castShadow&&d.pushShadow(R))}),d.setupLights(m.physicallyCorrectLights),b.traverse(function(R){const H=R.material;if(H)if(Array.isArray(H))for(let mt=0;mt<H.length;mt++){const yt=H[mt];B(yt,b,R)}else B(H,b,R)}),v.pop(),d=null};let F=null;function Y(b){F&&F(b)}function at(){kt.stop()}function ut(){kt.start()}const kt=new Xo;kt.setAnimationLoop(Y),typeof self<"u"&&kt.setContext(self),this.setAnimationLoop=function(b){F=b,ht.setAnimationLoop(b),b===null?kt.stop():kt.start()},ht.addEventListener("sessionstart",at),ht.addEventListener("sessionend",ut),this.render=function(b,I){if(I!==void 0&&I.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(p===!0)return;b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),I.parent===null&&I.matrixWorldAutoUpdate===!0&&I.updateMatrixWorld(),ht.enabled===!0&&ht.isPresenting===!0&&(ht.cameraAutoUpdate===!0&&ht.updateCamera(I),I=ht.getCamera()),b.isScene===!0&&b.onBeforeRender(m,b,I,x),d=_.get(b,v.length),d.init(),v.push(d),ct.multiplyMatrices(I.projectionMatrix,I.matrixWorldInverse),j.setFromProjectionMatrix(ct),$=this.localClippingEnabled,Z=S.init(this.clippingPlanes,$),u=Ne.get(b,f.length),u.init(),f.push(u),ee(b,I,0,m.sortObjects),u.finish(),m.sortObjects===!0&&u.sort(X,D),Z===!0&&S.beginShadows();const B=d.state.shadowsArray;if(U.render(B,b,I),Z===!0&&S.endShadows(),this.info.autoReset===!0&&this.info.reset(),K.render(u,b),d.setupLights(m.physicallyCorrectLights),I.isArrayCamera){const R=I.cameras;for(let H=0,mt=R.length;H<mt;H++){const yt=R[H];ce(u,b,yt,yt.viewport)}}else ce(u,b,I);x!==null&&(xt.updateMultisampleRenderTarget(x),xt.updateRenderTargetMipmap(x)),b.isScene===!0&&b.onAfterRender(m,b,I),J.resetDefaultState(),w=-1,M=null,v.pop(),v.length>0?d=v[v.length-1]:d=null,f.pop(),f.length>0?u=f[f.length-1]:u=null};function ee(b,I,B,R){if(b.visible===!1)return;if(b.layers.test(I.layers)){if(b.isGroup)B=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(I);else if(b.isLight)d.pushLight(b),b.castShadow&&d.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||j.intersectsSprite(b)){R&&W.setFromMatrixPosition(b.matrixWorld).applyMatrix4(ct);const yt=Xt.update(b),Tt=b.material;Tt.visible&&u.push(b,yt,Tt,B,W.z,null)}}else if((b.isMesh||b.isLine||b.isPoints)&&(b.isSkinnedMesh&&b.skeleton.frame!==Nt.render.frame&&(b.skeleton.update(),b.skeleton.frame=Nt.render.frame),!b.frustumCulled||j.intersectsObject(b))){R&&W.setFromMatrixPosition(b.matrixWorld).applyMatrix4(ct);const yt=Xt.update(b),Tt=b.material;if(Array.isArray(Tt)){const Ct=yt.groups;for(let Rt=0,Et=Ct.length;Rt<Et;Rt++){const Pt=Ct[Rt],Jt=Tt[Pt.materialIndex];Jt&&Jt.visible&&u.push(b,yt,Jt,B,W.z,Pt)}}else Tt.visible&&u.push(b,yt,Tt,B,W.z,null)}}const mt=b.children;for(let yt=0,Tt=mt.length;yt<Tt;yt++)ee(mt[yt],I,B,R)}function ce(b,I,B,R){const H=b.opaque,mt=b.transmissive,yt=b.transparent;d.setupLightsView(B),Z===!0&&S.setGlobalState(m.clippingPlanes,B),mt.length>0&&An(H,I,B),R&&ot.viewport(C.copy(R)),H.length>0&&Ut(H,I,B),mt.length>0&&Ut(mt,I,B),yt.length>0&&Ut(yt,I,B),ot.buffers.depth.setTest(!0),ot.buffers.depth.setMask(!0),ot.buffers.color.setMask(!0),ot.setPolygonOffset(!1)}function An(b,I,B){const R=ft.isWebGL2;Q===null&&(Q=new rn(1,1,{generateMipmaps:!0,type:dt.has("EXT_color_buffer_half_float")?zi:Dn,minFilter:Pi,samples:R&&r===!0?4:0})),m.getDrawingBufferSize(N),R?Q.setSize(N.x,N.y):Q.setSize(wr(N.x),wr(N.y));const H=m.getRenderTarget();m.setRenderTarget(Q),m.clear();const mt=m.toneMapping;m.toneMapping=sn,Ut(b,I,B),m.toneMapping=mt,xt.updateMultisampleRenderTarget(Q),xt.updateRenderTargetMipmap(Q),m.setRenderTarget(H)}function Ut(b,I,B){const R=I.isScene===!0?I.overrideMaterial:null;for(let H=0,mt=b.length;H<mt;H++){const yt=b[H],Tt=yt.object,Ct=yt.geometry,Rt=R===null?yt.material:R,Et=yt.group;Tt.layers.test(B.layers)&&qe(Tt,I,B,Ct,Rt,Et)}}function qe(b,I,B,R,H,mt){b.onBeforeRender(m,I,B,R,H,mt),b.modelViewMatrix.multiplyMatrices(B.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),H.onBeforeRender(m,I,B,R,b,mt),H.transparent===!0&&H.side===un&&H.forceSinglePass===!1?(H.side=ye,H.needsUpdate=!0,m.renderBufferDirect(B,I,R,H,b,mt),H.side=mn,H.needsUpdate=!0,m.renderBufferDirect(B,I,R,H,b,mt),H.side=un):m.renderBufferDirect(B,I,R,H,b,mt),b.onAfterRender(m,I,B,R,H,mt)}function Re(b,I,B){I.isScene!==!0&&(I=nt);const R=wt.get(b),H=d.state.lights,mt=d.state.shadowsArray,yt=H.state.version,Tt=Dt.getParameters(b,H.state,mt,I,B),Ct=Dt.getProgramCacheKey(Tt);let Rt=R.programs;R.environment=b.isMeshStandardMaterial?I.environment:null,R.fog=I.fog,R.envMap=(b.isMeshStandardMaterial?ze:pe).get(b.envMap||R.environment),Rt===void 0&&(b.addEventListener("dispose",Bt),Rt=new Map,R.programs=Rt);let Et=Rt.get(Ct);if(Et!==void 0){if(R.currentProgram===Et&&R.lightsStateVersion===yt)return Ur(b,Tt),Et}else Tt.uniforms=Dt.getUniforms(b),b.onBuild(B,Tt,m),b.onBeforeCompile(Tt,m),Et=Dt.acquireProgram(Tt,Ct),Rt.set(Ct,Et),R.uniforms=Tt.uniforms;const Pt=R.uniforms;(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(Pt.clippingPlanes=S.uniform),Ur(b,Tt),R.needsLights=ol(b),R.lightsStateVersion=yt,R.needsLights&&(Pt.ambientLightColor.value=H.state.ambient,Pt.lightProbe.value=H.state.probe,Pt.directionalLights.value=H.state.directional,Pt.directionalLightShadows.value=H.state.directionalShadow,Pt.spotLights.value=H.state.spot,Pt.spotLightShadows.value=H.state.spotShadow,Pt.rectAreaLights.value=H.state.rectArea,Pt.ltc_1.value=H.state.rectAreaLTC1,Pt.ltc_2.value=H.state.rectAreaLTC2,Pt.pointLights.value=H.state.point,Pt.pointLightShadows.value=H.state.pointShadow,Pt.hemisphereLights.value=H.state.hemi,Pt.directionalShadowMap.value=H.state.directionalShadowMap,Pt.directionalShadowMatrix.value=H.state.directionalShadowMatrix,Pt.spotShadowMap.value=H.state.spotShadowMap,Pt.spotLightMatrix.value=H.state.spotLightMatrix,Pt.spotLightMap.value=H.state.spotLightMap,Pt.pointShadowMap.value=H.state.pointShadowMap,Pt.pointShadowMatrix.value=H.state.pointShadowMatrix);const Jt=Et.getUniforms(),we=ls.seqWithValue(Jt.seq,Pt);return R.currentProgram=Et,R.uniformsList=we,Et}function Ur(b,I){const B=wt.get(b);B.outputEncoding=I.outputEncoding,B.instancing=I.instancing,B.skinning=I.skinning,B.morphTargets=I.morphTargets,B.morphNormals=I.morphNormals,B.morphColors=I.morphColors,B.morphTargetsCount=I.morphTargetsCount,B.numClippingPlanes=I.numClippingPlanes,B.numIntersection=I.numClipIntersection,B.vertexAlphas=I.vertexAlphas,B.vertexTangents=I.vertexTangents,B.toneMapping=I.toneMapping}function rl(b,I,B,R,H){I.isScene!==!0&&(I=nt),xt.resetTextureUnits();const mt=I.fog,yt=R.isMeshStandardMaterial?I.environment:null,Tt=x===null?m.outputEncoding:x.isXRRenderTarget===!0?x.texture.encoding:In,Ct=(R.isMeshStandardMaterial?ze:pe).get(R.envMap||yt),Rt=R.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,Et=!!R.normalMap&&!!B.attributes.tangent,Pt=!!B.morphAttributes.position,Jt=!!B.morphAttributes.normal,we=!!B.morphAttributes.color,Ye=R.toneMapped?m.toneMapping:sn,xn=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,Vt=xn!==void 0?xn.length:0,zt=wt.get(R),vs=d.state.lights;if(Z===!0&&($===!0||b!==M)){const be=b===M&&R.id===w;S.setState(R,b,be)}let ne=!1;R.version===zt.__version?(zt.needsLights&&zt.lightsStateVersion!==vs.state.version||zt.outputEncoding!==Tt||H.isInstancedMesh&&zt.instancing===!1||!H.isInstancedMesh&&zt.instancing===!0||H.isSkinnedMesh&&zt.skinning===!1||!H.isSkinnedMesh&&zt.skinning===!0||zt.envMap!==Ct||R.fog===!0&&zt.fog!==mt||zt.numClippingPlanes!==void 0&&(zt.numClippingPlanes!==S.numPlanes||zt.numIntersection!==S.numIntersection)||zt.vertexAlphas!==Rt||zt.vertexTangents!==Et||zt.morphTargets!==Pt||zt.morphNormals!==Jt||zt.morphColors!==we||zt.toneMapping!==Ye||ft.isWebGL2===!0&&zt.morphTargetsCount!==Vt)&&(ne=!0):(ne=!0,zt.__version=R.version);let Sn=zt.currentProgram;ne===!0&&(Sn=Re(R,I,H));let Hr=!1,pi=!1,As=!1;const me=Sn.getUniforms(),yn=zt.uniforms;if(ot.useProgram(Sn.program)&&(Hr=!0,pi=!0,As=!0),R.id!==w&&(w=R.id,pi=!0),Hr||M!==b){if(me.setValue(O,"projectionMatrix",b.projectionMatrix),ft.logarithmicDepthBuffer&&me.setValue(O,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),M!==b&&(M=b,pi=!0,As=!0),R.isShaderMaterial||R.isMeshPhongMaterial||R.isMeshToonMaterial||R.isMeshStandardMaterial||R.envMap){const be=me.map.cameraPosition;be!==void 0&&be.setValue(O,W.setFromMatrixPosition(b.matrixWorld))}(R.isMeshPhongMaterial||R.isMeshToonMaterial||R.isMeshLambertMaterial||R.isMeshBasicMaterial||R.isMeshStandardMaterial||R.isShaderMaterial)&&me.setValue(O,"isOrthographic",b.isOrthographicCamera===!0),(R.isMeshPhongMaterial||R.isMeshToonMaterial||R.isMeshLambertMaterial||R.isMeshBasicMaterial||R.isMeshStandardMaterial||R.isShaderMaterial||R.isShadowMaterial||H.isSkinnedMesh)&&me.setValue(O,"viewMatrix",b.matrixWorldInverse)}if(H.isSkinnedMesh){me.setOptional(O,H,"bindMatrix"),me.setOptional(O,H,"bindMatrixInverse");const be=H.skeleton;be&&(ft.floatVertexTextures?(be.boneTexture===null&&be.computeBoneTexture(),me.setValue(O,"boneTexture",be.boneTexture,xt),me.setValue(O,"boneTextureSize",be.boneTextureSize)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}const xs=B.morphAttributes;if((xs.position!==void 0||xs.normal!==void 0||xs.color!==void 0&&ft.isWebGL2===!0)&&tt.update(H,B,R,Sn),(pi||zt.receiveShadow!==H.receiveShadow)&&(zt.receiveShadow=H.receiveShadow,me.setValue(O,"receiveShadow",H.receiveShadow)),R.isMeshGouraudMaterial&&R.envMap!==null&&(yn.envMap.value=Ct,yn.flipEnvMap.value=Ct.isCubeTexture&&Ct.isRenderTargetTexture===!1?-1:1),pi&&(me.setValue(O,"toneMappingExposure",m.toneMappingExposure),zt.needsLights&&al(yn,As),mt&&R.fog===!0&&Xe.refreshFogUniforms(yn,mt),Xe.refreshMaterialUniforms(yn,R,V,k,Q),ls.upload(O,zt.uniformsList,yn,xt)),R.isShaderMaterial&&R.uniformsNeedUpdate===!0&&(ls.upload(O,zt.uniformsList,yn,xt),R.uniformsNeedUpdate=!1),R.isSpriteMaterial&&me.setValue(O,"center",H.center),me.setValue(O,"modelViewMatrix",H.modelViewMatrix),me.setValue(O,"normalMatrix",H.normalMatrix),me.setValue(O,"modelMatrix",H.matrixWorld),R.isShaderMaterial||R.isRawShaderMaterial){const be=R.uniformsGroups;for(let Ss=0,ll=be.length;Ss<ll;Ss++)if(ft.isWebGL2){const Gr=be[Ss];gt.update(Gr,Sn),gt.bind(Gr,Sn)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return Sn}function al(b,I){b.ambientLightColor.needsUpdate=I,b.lightProbe.needsUpdate=I,b.directionalLights.needsUpdate=I,b.directionalLightShadows.needsUpdate=I,b.pointLights.needsUpdate=I,b.pointLightShadows.needsUpdate=I,b.spotLights.needsUpdate=I,b.spotLightShadows.needsUpdate=I,b.rectAreaLights.needsUpdate=I,b.hemisphereLights.needsUpdate=I}function ol(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return g},this.getActiveMipmapLevel=function(){return y},this.getRenderTarget=function(){return x},this.setRenderTargetTextures=function(b,I,B){wt.get(b.texture).__webglTexture=I,wt.get(b.depthTexture).__webglTexture=B;const R=wt.get(b);R.__hasExternalTextures=!0,R.__hasExternalTextures&&(R.__autoAllocateDepthBuffer=B===void 0,R.__autoAllocateDepthBuffer||dt.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),R.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(b,I){const B=wt.get(b);B.__webglFramebuffer=I,B.__useDefaultFramebuffer=I===void 0},this.setRenderTarget=function(b,I=0,B=0){x=b,g=I,y=B;let R=!0,H=null,mt=!1,yt=!1;if(b){const Ct=wt.get(b);Ct.__useDefaultFramebuffer!==void 0?(ot.bindFramebuffer(36160,null),R=!1):Ct.__webglFramebuffer===void 0?xt.setupRenderTarget(b):Ct.__hasExternalTextures&&xt.rebindTextures(b,wt.get(b.texture).__webglTexture,wt.get(b.depthTexture).__webglTexture);const Rt=b.texture;(Rt.isData3DTexture||Rt.isDataArrayTexture||Rt.isCompressedArrayTexture)&&(yt=!0);const Et=wt.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(H=Et[I],mt=!0):ft.isWebGL2&&b.samples>0&&xt.useMultisampledRTT(b)===!1?H=wt.get(b).__webglMultisampledFramebuffer:H=Et,C.copy(b.viewport),z.copy(b.scissor),A=b.scissorTest}else C.copy(L).multiplyScalar(V).floor(),z.copy(G).multiplyScalar(V).floor(),A=q;if(ot.bindFramebuffer(36160,H)&&ft.drawBuffers&&R&&ot.drawBuffers(b,H),ot.viewport(C),ot.scissor(z),ot.setScissorTest(A),mt){const Ct=wt.get(b.texture);O.framebufferTexture2D(36160,36064,34069+I,Ct.__webglTexture,B)}else if(yt){const Ct=wt.get(b.texture),Rt=I||0;O.framebufferTextureLayer(36160,36064,Ct.__webglTexture,B||0,Rt)}w=-1},this.readRenderTargetPixels=function(b,I,B,R,H,mt,yt){if(!(b&&b.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Tt=wt.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&yt!==void 0&&(Tt=Tt[yt]),Tt){ot.bindFramebuffer(36160,Tt);try{const Ct=b.texture,Rt=Ct.format,Et=Ct.type;if(Rt!==Ie&&rt.convert(Rt)!==O.getParameter(35739)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}const Pt=Et===zi&&(dt.has("EXT_color_buffer_half_float")||ft.isWebGL2&&dt.has("EXT_color_buffer_float"));if(Et!==Dn&&rt.convert(Et)!==O.getParameter(35738)&&!(Et===dn&&(ft.isWebGL2||dt.has("OES_texture_float")||dt.has("WEBGL_color_buffer_float")))&&!Pt){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}I>=0&&I<=b.width-R&&B>=0&&B<=b.height-H&&O.readPixels(I,B,R,H,rt.convert(Rt),rt.convert(Et),mt)}finally{const Ct=x!==null?wt.get(x).__webglFramebuffer:null;ot.bindFramebuffer(36160,Ct)}}},this.copyFramebufferToTexture=function(b,I,B=0){const R=Math.pow(2,-B),H=Math.floor(I.image.width*R),mt=Math.floor(I.image.height*R);xt.setTexture2D(I,0),O.copyTexSubImage2D(3553,B,0,0,b.x,b.y,H,mt),ot.unbindTexture()},this.copyTextureToTexture=function(b,I,B,R=0){const H=I.image.width,mt=I.image.height,yt=rt.convert(B.format),Tt=rt.convert(B.type);xt.setTexture2D(B,0),O.pixelStorei(37440,B.flipY),O.pixelStorei(37441,B.premultiplyAlpha),O.pixelStorei(3317,B.unpackAlignment),I.isDataTexture?O.texSubImage2D(3553,R,b.x,b.y,H,mt,yt,Tt,I.image.data):I.isCompressedTexture?O.compressedTexSubImage2D(3553,R,b.x,b.y,I.mipmaps[0].width,I.mipmaps[0].height,yt,I.mipmaps[0].data):O.texSubImage2D(3553,R,b.x,b.y,yt,Tt,I.image),R===0&&B.generateMipmaps&&O.generateMipmap(3553),ot.unbindTexture()},this.copyTextureToTexture3D=function(b,I,B,R,H=0){if(m.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}const mt=b.max.x-b.min.x+1,yt=b.max.y-b.min.y+1,Tt=b.max.z-b.min.z+1,Ct=rt.convert(R.format),Rt=rt.convert(R.type);let Et;if(R.isData3DTexture)xt.setTexture3D(R,0),Et=32879;else if(R.isDataArrayTexture)xt.setTexture2DArray(R,0),Et=35866;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}O.pixelStorei(37440,R.flipY),O.pixelStorei(37441,R.premultiplyAlpha),O.pixelStorei(3317,R.unpackAlignment);const Pt=O.getParameter(3314),Jt=O.getParameter(32878),we=O.getParameter(3316),Ye=O.getParameter(3315),xn=O.getParameter(32877),Vt=B.isCompressedTexture?B.mipmaps[0]:B.image;O.pixelStorei(3314,Vt.width),O.pixelStorei(32878,Vt.height),O.pixelStorei(3316,b.min.x),O.pixelStorei(3315,b.min.y),O.pixelStorei(32877,b.min.z),B.isDataTexture||B.isData3DTexture?O.texSubImage3D(Et,H,I.x,I.y,I.z,mt,yt,Tt,Ct,Rt,Vt.data):B.isCompressedArrayTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),O.compressedTexSubImage3D(Et,H,I.x,I.y,I.z,mt,yt,Tt,Ct,Vt.data)):O.texSubImage3D(Et,H,I.x,I.y,I.z,mt,yt,Tt,Ct,Rt,Vt),O.pixelStorei(3314,Pt),O.pixelStorei(32878,Jt),O.pixelStorei(3316,we),O.pixelStorei(3315,Ye),O.pixelStorei(32877,xn),H===0&&R.generateMipmaps&&O.generateMipmap(Et),ot.unbindTexture()},this.initTexture=function(b){b.isCubeTexture?xt.setTextureCube(b,0):b.isData3DTexture?xt.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?xt.setTexture2DArray(b,0):xt.setTexture2D(b,0),ot.unbindTexture()},this.resetState=function(){g=0,y=0,x=null,ot.reset(),J.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}class _m extends $o{}_m.prototype.isWebGL1Renderer=!0;class Lr extends Me{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e}get autoUpdate(){return console.warn("THREE.Scene: autoUpdate was renamed to matrixWorldAutoUpdate in r144."),this.matrixWorldAutoUpdate}set autoUpdate(t){console.warn("THREE.Scene: autoUpdate was renamed to matrixWorldAutoUpdate in r144."),this.matrixWorldAutoUpdate=t}}class Tm extends de{constructor(t=null,e=1,n=1,i,r,o,a,l,c=re,h=re,u,d){super(null,o,a,l,c,h,i,r,u,d),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Cm extends Ii{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new _t(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}const ro=new jt,_r=new Bo,ns=new ps,is=new P;class tl extends Me{constructor(t=new oe,e=new Cm){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=t.material,this.geometry=t.geometry,this}raycast(t,e){const n=this.geometry,i=this.matrixWorld,r=t.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ns.copy(n.boundingSphere),ns.applyMatrix4(i),ns.radius+=r,t.ray.intersectsSphere(ns)===!1)return;ro.copy(i).invert(),_r.copy(t.ray).applyMatrix4(ro);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,u=n.attributes.position;if(c!==null){const d=Math.max(0,o.start),f=Math.min(c.count,o.start+o.count);for(let v=d,m=f;v<m;v++){const p=c.getX(v);is.fromBufferAttribute(u,p),ao(is,p,l,i,t,e,this)}}else{const d=Math.max(0,o.start),f=Math.min(u.count,o.start+o.count);for(let v=d,m=f;v<m;v++)is.fromBufferAttribute(u,v),ao(is,v,l,i,t,e,this)}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){const a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function ao(s,t,e,n,i,r,o){const a=_r.distanceSqToPoint(s);if(a<e){const l=new P;_r.closestPointToPoint(s,l),l.applyMatrix4(n);const c=i.ray.origin.distanceTo(l);if(c<i.near||c>i.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:t,face:null,object:o})}}class We{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(t,e){const n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){const t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const e=[];let n,i=this.getPoint(0),r=0;e.push(0);for(let o=1;o<=t;o++)n=this.getPoint(o/t),r+=n.distanceTo(i),e.push(r),i=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e){const n=this.getLengths();let i=0;const r=n.length;let o;e?o=e:o=t*n[r-1];let a=0,l=r-1,c;for(;a<=l;)if(i=Math.floor(a+(l-a)/2),c=n[i]-o,c<0)a=i+1;else if(c>0)l=i-1;else{l=i;break}if(i=l,n[i]===o)return i/(r-1);const h=n[i],d=n[i+1]-h,f=(o-h)/d;return(i+f)/(r-1)}getTangent(t,e){let i=t-1e-4,r=t+1e-4;i<0&&(i=0),r>1&&(r=1);const o=this.getPoint(i),a=this.getPoint(r),l=e||(o.isVector2?new lt:new P);return l.copy(a).sub(o).normalize(),l}getTangentAt(t,e){const n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e){const n=new P,i=[],r=[],o=[],a=new P,l=new jt;for(let f=0;f<=t;f++){const v=f/t;i[f]=this.getTangentAt(v,new P)}r[0]=new P,o[0]=new P;let c=Number.MAX_VALUE;const h=Math.abs(i[0].x),u=Math.abs(i[0].y),d=Math.abs(i[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),a.crossVectors(i[0],n).normalize(),r[0].crossVectors(i[0],a),o[0].crossVectors(i[0],r[0]);for(let f=1;f<=t;f++){if(r[f]=r[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(i[f-1],i[f]),a.length()>Number.EPSILON){a.normalize();const v=Math.acos(ue(i[f-1].dot(i[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(a,v))}o[f].crossVectors(i[f],r[f])}if(e===!0){let f=Math.acos(ue(r[0].dot(r[t]),-1,1));f/=t,i[0].dot(a.crossVectors(r[0],r[t]))>0&&(f=-f);for(let v=1;v<=t;v++)r[v].applyMatrix4(l.makeRotationAxis(i[v],f*v)),o[v].crossVectors(i[v],r[v])}return{tangents:i,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){const t={metadata:{version:4.5,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}}class Rr extends We{constructor(t=0,e=0,n=1,i=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=i,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(t,e){const n=e||new lt,i=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=i;for(;r>i;)r-=i;r<Number.EPSILON&&(o?r=0:r=i),this.aClockwise===!0&&!o&&(r===i?r=-i:r=r-i);const a=this.aStartAngle+t*r;let l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*h-f*u+this.aX,c=d*u+f*h+this.aY}return n.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){const t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}}class Em extends Rr{constructor(t,e,n,i,r,o){super(t,e,n,n,i,r,o),this.isArcCurve=!0,this.type="ArcCurve"}}function kr(){let s=0,t=0,e=0,n=0;function i(r,o,a,l){s=r,t=a,e=-3*r+3*o-2*a-l,n=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){i(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,h,u){let d=(o-r)/c-(a-r)/(c+h)+(a-o)/h,f=(a-o)/h-(l-o)/(h+u)+(l-a)/u;d*=h,f*=h,i(o,a,d,f)},calc:function(r){const o=r*r,a=o*r;return s+t*r+e*o+n*a}}}const ss=new P,nr=new kr,ir=new kr,sr=new kr;class Pm extends We{constructor(t=[],e=!1,n="centripetal",i=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=i}getPoint(t,e=new P){const n=e,i=this.points,r=i.length,o=(r-(this.closed?0:1))*t;let a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,h;this.closed||a>0?c=i[(a-1)%r]:(ss.subVectors(i[0],i[1]).add(i[0]),c=ss);const u=i[a%r],d=i[(a+1)%r];if(this.closed||a+2<r?h=i[(a+2)%r]:(ss.subVectors(i[r-1],i[r-2]).add(i[r-1]),h=ss),this.curveType==="centripetal"||this.curveType==="chordal"){const f=this.curveType==="chordal"?.5:.25;let v=Math.pow(c.distanceToSquared(u),f),m=Math.pow(u.distanceToSquared(d),f),p=Math.pow(d.distanceToSquared(h),f);m<1e-4&&(m=1),v<1e-4&&(v=m),p<1e-4&&(p=m),nr.initNonuniformCatmullRom(c.x,u.x,d.x,h.x,v,m,p),ir.initNonuniformCatmullRom(c.y,u.y,d.y,h.y,v,m,p),sr.initNonuniformCatmullRom(c.z,u.z,d.z,h.z,v,m,p)}else this.curveType==="catmullrom"&&(nr.initCatmullRom(c.x,u.x,d.x,h.x,this.tension),ir.initCatmullRom(c.y,u.y,d.y,h.y,this.tension),sr.initCatmullRom(c.z,u.z,d.z,h.z,this.tension));return n.set(nr.calc(l),ir.calc(l),sr.calc(l)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(i.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const i=this.points[e];t.points.push(i.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(new P().fromArray(i))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}}function oo(s,t,e,n,i){const r=(n-t)*.5,o=(i-e)*.5,a=s*s,l=s*a;return(2*e-2*n+r+o)*l+(-3*e+3*n-2*r-o)*a+r*s+e}function zm(s,t){const e=1-s;return e*e*t}function Lm(s,t){return 2*(1-s)*s*t}function Rm(s,t){return s*s*t}function bi(s,t,e,n){return zm(s,t)+Lm(s,e)+Rm(s,n)}function km(s,t){const e=1-s;return e*e*e*t}function Dm(s,t){const e=1-s;return 3*e*e*s*t}function Im(s,t){return 3*(1-s)*s*s*t}function Nm(s,t){return s*s*s*t}function _i(s,t,e,n,i){return km(s,t)+Dm(s,e)+Im(s,n)+Nm(s,i)}class el extends We{constructor(t=new lt,e=new lt,n=new lt,i=new lt){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=i}getPoint(t,e=new lt){const n=e,i=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(_i(t,i.x,r.x,o.x,a.x),_i(t,i.y,r.y,o.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class Om extends We{constructor(t=new P,e=new P,n=new P,i=new P){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=i}getPoint(t,e=new P){const n=e,i=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(_i(t,i.x,r.x,o.x,a.x),_i(t,i.y,r.y,o.y,a.y),_i(t,i.z,r.z,o.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class Dr extends We{constructor(t=new lt,e=new lt){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new lt){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e){const n=e||new lt;return n.copy(this.v2).sub(this.v1).normalize(),n}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Fm extends We{constructor(t=new P,e=new P){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new P){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class nl extends We{constructor(t=new lt,e=new lt,n=new lt){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new lt){const n=e,i=this.v0,r=this.v1,o=this.v2;return n.set(bi(t,i.x,r.x,o.x),bi(t,i.y,r.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Bm extends We{constructor(t=new P,e=new P,n=new P){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new P){const n=e,i=this.v0,r=this.v1,o=this.v2;return n.set(bi(t,i.x,r.x,o.x),bi(t,i.y,r.y,o.y),bi(t,i.z,r.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class il extends We{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new lt){const n=e,i=this.points,r=(i.length-1)*t,o=Math.floor(r),a=r-o,l=i[o===0?o:o-1],c=i[o],h=i[o>i.length-2?i.length-1:o+1],u=i[o>i.length-3?i.length-1:o+2];return n.set(oo(a,l.x,c.x,h.x,u.x),oo(a,l.y,c.y,h.y,u.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(i.clone())}return this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const i=this.points[e];t.points.push(i.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(new lt().fromArray(i))}return this}}var Um=Object.freeze({__proto__:null,ArcCurve:Em,CatmullRomCurve3:Pm,CubicBezierCurve:el,CubicBezierCurve3:Om,EllipseCurve:Rr,LineCurve:Dr,LineCurve3:Fm,QuadraticBezierCurve:nl,QuadraticBezierCurve3:Bm,SplineCurve:il});class Hm extends We{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){const t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);t.equals(e)||this.curves.push(new Dr(e,t))}getPoint(t,e){const n=t*this.getLength(),i=this.getCurveLengths();let r=0;for(;r<i.length;){if(i[r]>=n){const o=i[r]-n,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,e)}r++}return null}getLength(){const t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const t=[];let e=0;for(let n=0,i=this.curves.length;n<i;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){const e=[];let n;for(let i=0,r=this.curves;i<r.length;i++){const o=r[i],a=o.isEllipseCurve?t*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?t*o.points.length:t,l=o.getPoints(a);for(let c=0;c<l.length;c++){const h=l[c];n&&n.equals(h)||(e.push(h),n=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const i=t.curves[e];this.curves.push(i.clone())}return this.autoClose=t.autoClose,this}toJSON(){const t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){const i=this.curves[e];t.curves.push(i.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const i=t.curves[e];this.curves.push(new Um[i.type]().fromJSON(i))}return this}}class Gm extends Hm{constructor(t){super(),this.type="Path",this.currentPoint=new lt,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){const n=new Dr(this.currentPoint.clone(),new lt(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,i){const r=new nl(this.currentPoint.clone(),new lt(t,e),new lt(n,i));return this.curves.push(r),this.currentPoint.set(n,i),this}bezierCurveTo(t,e,n,i,r,o){const a=new el(this.currentPoint.clone(),new lt(t,e),new lt(n,i),new lt(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(t){const e=[this.currentPoint.clone()].concat(t),n=new il(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,i,r,o){const a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+a,e+l,n,i,r,o),this}absarc(t,e,n,i,r,o){return this.absellipse(t,e,n,n,i,r,o),this}ellipse(t,e,n,i,r,o,a,l){const c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+c,e+h,n,i,r,o,a,l),this}absellipse(t,e,n,i,r,o,a,l){const c=new Rr(t,e,n,i,r,o,a,l);if(this.curves.length>0){const u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);const h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){const t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}}class Ir extends oe{constructor(t=[new lt(0,-.5),new lt(.5,0),new lt(0,.5)],e=12,n=0,i=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:e,phiStart:n,phiLength:i},e=Math.floor(e),i=ue(i,0,Math.PI*2);const r=[],o=[],a=[],l=[],c=[],h=1/e,u=new P,d=new lt,f=new P,v=new P,m=new P;let p=0,g=0;for(let y=0;y<=t.length-1;y++)switch(y){case 0:p=t[y+1].x-t[y].x,g=t[y+1].y-t[y].y,f.x=g*1,f.y=-p,f.z=g*0,m.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case t.length-1:l.push(m.x,m.y,m.z);break;default:p=t[y+1].x-t[y].x,g=t[y+1].y-t[y].y,f.x=g*1,f.y=-p,f.z=g*0,v.copy(f),f.x+=m.x,f.y+=m.y,f.z+=m.z,f.normalize(),l.push(f.x,f.y,f.z),m.copy(v)}for(let y=0;y<=e;y++){const x=n+y*h*i,w=Math.sin(x),M=Math.cos(x);for(let C=0;C<=t.length-1;C++){u.x=t[C].x*w,u.y=t[C].y,u.z=t[C].x*M,o.push(u.x,u.y,u.z),d.x=y/e,d.y=C/(t.length-1),a.push(d.x,d.y);const z=l[3*C+0]*w,A=l[3*C+1],T=l[3*C+0]*M;c.push(z,A,T)}}for(let y=0;y<e;y++)for(let x=0;x<t.length-1;x++){const w=x+y*t.length,M=w,C=w+t.length,z=w+t.length+1,A=w+1;r.push(M,C,A),r.push(z,A,C)}this.setIndex(r),this.setAttribute("position",new Ht(o,3)),this.setAttribute("uv",new Ht(a,2)),this.setAttribute("normal",new Ht(c,3))}static fromJSON(t){return new Ir(t.points,t.segments,t.phiStart,t.phiLength)}}class Nr extends Ir{constructor(t=1,e=1,n=4,i=8){const r=new Gm;r.absarc(0,-e/2,t,Math.PI*1.5,0),r.absarc(0,e/2,t,0,Math.PI*.5),super(r.getPoints(n),i),this.type="CapsuleGeometry",this.parameters={radius:t,height:e,capSegments:n,radialSegments:i}}static fromJSON(t){return new Nr(t.radius,t.length,t.capSegments,t.radialSegments)}}class Or extends oe{constructor(t=1,e=32,n=0,i=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:i},e=Math.max(3,e);const r=[],o=[],a=[],l=[],c=new P,h=new lt;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let u=0,d=3;u<=e;u++,d+=3){const f=n+u/e*i;c.x=t*Math.cos(f),c.y=t*Math.sin(f),o.push(c.x,c.y,c.z),a.push(0,0,1),h.x=(o[d]/t+1)/2,h.y=(o[d+1]/t+1)/2,l.push(h.x,h.y)}for(let u=1;u<=e;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new Ht(o,3)),this.setAttribute("normal",new Ht(a,3)),this.setAttribute("uv",new Ht(l,2))}static fromJSON(t){return new Or(t.radius,t.segments,t.thetaStart,t.thetaLength)}}class Fr extends oe{constructor(t=1,e=32,n=16,i=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:i,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const l=Math.min(o+a,Math.PI);let c=0;const h=[],u=new P,d=new P,f=[],v=[],m=[],p=[];for(let g=0;g<=n;g++){const y=[],x=g/n;let w=0;g==0&&o==0?w=.5/e:g==n&&l==Math.PI&&(w=-.5/e);for(let M=0;M<=e;M++){const C=M/e;u.x=-t*Math.cos(i+C*r)*Math.sin(o+x*a),u.y=t*Math.cos(o+x*a),u.z=t*Math.sin(i+C*r)*Math.sin(o+x*a),v.push(u.x,u.y,u.z),d.copy(u).normalize(),m.push(d.x,d.y,d.z),p.push(C+w,1-x),y.push(c++)}h.push(y)}for(let g=0;g<n;g++)for(let y=0;y<e;y++){const x=h[g][y+1],w=h[g][y],M=h[g+1][y],C=h[g+1][y+1];(g!==0||o>0)&&f.push(x,w,C),(g!==n-1||l<Math.PI)&&f.push(w,M,C)}this.setIndex(f),this.setAttribute("position",new Ht(v,3)),this.setAttribute("normal",new Ht(m,3)),this.setAttribute("uv",new Ht(p,2))}static fromJSON(t){return new Fr(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class Jm extends xe{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Er}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Er);class Vm{constructor(t){this.state=Ot.getInstance(),this.view=Ae.getInstance(),this.scene=this.view.scene,this.viewport=this.state.viewport,this.setInstance()}setInstance(){this.instance=new De(45,this.viewport.width/this.viewport.height,.1,5e3),this.instance.rotation.reorder("YXZ"),this.scene.add(this.instance)}resize(){this.instance.aspect=this.viewport.width/this.viewport.height,this.instance.updateProjectionMatrix()}update(){const t=this.state.player;this.instance.position.set(t.camera.position[0],t.camera.position[1],t.camera.position[2]),this.instance.quaternion.set(t.camera.quaternion[0],t.camera.quaternion[1],t.camera.quaternion[2],t.camera.quaternion[3])}destroy(){}}const Zm="data:image/png;base64,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",Wm=s=>{typeof s=="number"&&(s=s.toString(10)[0]);const t=Xm.indexOf(s);if(t===-1)return[0,0];const e=t%co,n=Math.floor(t/co);return[e,n]},lo=(s,t=4)=>{typeof s=="number"&&(s=Math.floor(s).toString(10)),s.length>t&&(s=s.slice(0,t));const e=s.length;s.length<t&&(s=s.padEnd(t," "));const n=[...s].map(Wm);return{count:e,offsets:n}},Xm="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz #@&$%?!+-_=*/\\|[](){}<>.;:,×",qm=4096,Ym=256,co=64,ho=64,uo=120,jm=Zm;var Km=`precision highp float;
#define GLSLIFY 1

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float z_offset;

attribute vec3 position;

attribute float char_count;
varying float v_char_count;

attribute float size;

attribute vec3 color;
varying vec3 v_color;

// REPLACE-DECLARE:
attribute vec2 char_offset_X;
varying vec2 v_char_offset_X;
// REPLACE-END

void main() {

  v_char_count = char_count;
  v_color = color;
  
  // REPLACE-COMPUTE:
  v_char_offset_X = char_offset_X;
  // REPLACE-END
  
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_Position = projectionMatrix * mvPosition;
  gl_Position.z += z_offset;
	gl_PointSize = size * 2000.0 / -mvPosition.z;
}`,Qm=`precision highp float;
#define GLSLIFY 1

// #define MULTIPLY

uniform sampler2D atlas_texture;
uniform float char_max;
uniform vec2 char_size;
uniform float char_aspect;
uniform float opacity;

varying float v_char_count;
varying vec3 v_color;

// REPLACE-DECLARE:
varying vec2 v_char_offset_X;
// REPLACE-END

vec2 get_uv_coords(in vec2 position, in vec2 offset, float index) {
  float x = 
    (position.x * char_max 
    + offset.x 
    - index) * char_size.x;
  float y = 1.0 - (
    position.y 
    + offset.y
    ) * char_size.y;
  return vec2(x, y);
}

vec4 get_texel(in vec2 position, in vec2 offset, float index) {
#ifdef MULTIPLY
  float a = texture2D(atlas_texture, get_uv_coords(position, offset, index)).a;
  return vec4(mix(vec3(1.0), v_color, opacity * a), 1.0);
#else
  return vec4(v_color, opacity * texture2D(atlas_texture, get_uv_coords(position, offset, index)).a);
#endif
}

void main() {

  vec2 position = gl_PointCoord;

  position.x += -(char_max - v_char_count) / char_max / 2.0;

  position.y *= char_max * char_aspect;
  position.y += (1.0 - char_max * char_aspect) / 2.0;

  bool x_out = position.x < 0.0 || position.x > v_char_count / char_max;
  bool y_out = position.y < 0.0 || position.y > 1.0;

  if (x_out || y_out) {
    // gl_FragColor = vec4(1.0);
    // return;
    discard;
  }

  // REPLACE-COMPUTE:
  if (position.x < 1.0 / char_max) {
    gl_FragColor = get_texel(position, v_char_offset_X, 0.0);
  } else if (position.x < 2.0 / char_max) {
    gl_FragColor = get_texel(position, v_char_offset_X, 1.0);
  } else {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
  // REPLACE-END
}
`;const rr=s=>{const t=new Array(s);for(let e=0;e<s;e++)t[e]=e;return t},$n="  ",$m=s=>`
attribute vec2 char_offset_${s};
varying vec2 v_char_offset_${s};
`.slice(1),tg=s=>`
${$n}v_char_offset_${s} = char_offset_${s};
`.slice(1),eg=s=>`
varying vec2 v_char_offset_${s};
`.slice(1),ng=s=>{const t=rr(s).map($m).join(""),e=rr(s).map(tg).join(""),n=Km.replace(/ *\/\/ REPLACE-DECLARE[\s\S]*?REPLACE-END/,t).replace(/ *\/\/ REPLACE-COMPUTE[\s\S]*?REPLACE-END/,e),i=rr(s).map(eg).join(""),r=new Array;for(let l=0;l<s;l++)r.push(l===0?$n:`${$n}} else `),r.push(l<s-1?`if (position.x < ${l+1}.0 / char_max) `:""),r.push(`{
`),r.push(`${$n}${$n}gl_FragColor = get_texel(position, v_char_offset_${l}, ${l}.0);
`);r.push(`${$n}}
`);const o=r.join(""),a=Qm.replace(/ *\/\/ REPLACE-DECLARE[\s\S]*?REPLACE-END/,i).replace(/ *\/\/ REPLACE-COMPUTE[\s\S]*?REPLACE-END/,o);return[n,a]},Br=document.createElement("img");Br.src=jm;const sl=new de(Br);Br.onload=()=>sl.needsUpdate=!0;function ig(s,t,e){const[n,i]=ng(s),r={atlas_texture:{value:sl},opacity:{value:1},z_offset:{value:e},char_max:{value:s},char_size:{value:new lt(ho/qm,uo/Ym)},char_aspect:{value:ho/uo}},o={};t===vr&&(o.MULTIPLY=!0);const a=new Jm({uniforms:r,defines:o,vertexShader:n,fragmentShader:i,blending:t,transparent:t===Ln,vertexColors:!0,depthWrite:!1});return Object.defineProperty(a,"opacity",{get:()=>a.uniforms.opacity.value,set:l=>a.uniforms.opacity.value=l}),a}const ar=12,fo={position:{x:0,y:0,z:0},color:"white",size:1,text:"foo"};class po extends tl{constructor({charMax:t=4,blending:e=gr,zOffset:n=-.01}={}){t>ar&&(console.warn(`max chars is ${ar}`),t=ar);const i=new oe;i.setAttribute("position",new Wt(new Float32Array(0),3)),i.setAttribute("color",new Wt(new Float32Array(0),3)),i.setAttribute("size",new Wt(new Float32Array(0),1)),i.setAttribute("char_count",new Wt(new Float32Array(0),1));for(let o=0;o<t;o++)i.setAttribute(`char_offset_${o}`,new Wt(new Float32Array(0),2));const r=ig(t,e,n);super(i,r),this.charMax=t}push(t,e){const n=this.geometry,i=n.getAttribute(t),r=new Float32Array(i.array.length+e.length);r.set(i.array,0),r.set(e,i.array.length),n.setAttribute(t,new Wt(r,i.itemSize))}pushFill(t,e,n){const i=this.geometry,r=i.getAttribute(t),o=new Float32Array(r.array.length+n);o.set(r.array,0),o.fill(e,r.array.length),i.setAttribute(t,new Wt(o,r.itemSize))}display(t=fo){if(Array.isArray(t)){t.forEach(u=>this.display(u));return}t=Object.assign(Object.assign({},fo),t);const{x:e,y:n,z:i}=t.position;this.push("position",[e,n,i]);const{r,g:o,b:a}=new _t(t.color);this.push("color",[r,o,a]),this.push("size",[t.size]);const{charMax:l}=this,{count:c,offsets:h}=lo(t.text,l);this.push("char_count",[c]);for(let u=0;u<l;u++)this.push(`char_offset_${u}`,h[u])}displayVertices(t,e={}){var n;if(t instanceof oe)return this.displayVertices(t.getAttribute("position").array,e);const{color:i="white",size:r=1,format:o=void 0}=e,a=t instanceof Float32Array,l=typeof i=="function"?g=>new _t(i(g)):(()=>{const g=new _t(i);return()=>g})(),c=typeof r=="function"?g=>r(g):()=>r,h=a?t.length/3:t.length,{charMax:u}=this,d=a?t:new Float32Array(h*3),f=new Float32Array(h*3),v=new Float32Array(h),m=new Float32Array(h),p=new Array(u);for(let g=0;g<u;g++)p[g]=new Float32Array(h*2);if(a===!1)for(let g=0;g<h;g++){const{x:y,y:x,z:w}=t[g];d[g*3+0]=y,d[g*3+1]=x,d[g*3+2]=w}for(let g=0;g<h;g++){const y=l(g);f[g*3+0]=y.r,f[g*3+1]=y.g,f[g*3+2]=y.b,v[g]=c(g);const x=(n=o==null?void 0:o(g))!==null&&n!==void 0?n:g.toString(10),{count:w,offsets:M}=lo(x,u);m[g]=w;for(let C=0;C<u;C++){const[z,A]=M[C];p[C][g*2+0]=z,p[C][g*2+1]=A}}this.push("position",d),this.push("color",f),this.push("size",v),this.push("char_count",m);for(let g=0;g<u;g++)this.push(`char_offset_${g}`,p[g])}displayFaces(t,{color:e="white",size:n=1,format:i=void 0}={}){if(t.isBufferGeometry){t=t;const r=t.index.array,o=t.getAttribute("position").array,a=r.length/3,l=new Float32Array(a*3);for(let c=0;c<a;c++){const h=r[c*3+0],u=o[h*3+0],d=o[h*3+1],f=o[h*3+2],v=r[c*3+1],m=o[v*3+0],p=o[v*3+1],g=o[v*3+2],y=r[c*3+2],x=o[y*3+0],w=o[y*3+1],M=o[y*3+2];l[c*3+0]=(u+m+x)/3,l[c*3+1]=(d+p+w)/3,l[c*3+2]=(f+g+M)/3}this.displayVertices(l,{color:e,size:n,format:i})}}get zOffset(){return this.material.uniforms.z_offset.value}set zOffset(t){const e=this.material;e.uniforms.z_offset.value!==t&&(e.uniforms.z_offset.value=t,e.uniformsNeedUpdate=!0)}get z_offset(){return this.zOffset}set z_offset(t){this.zOffset=t}get opacity(){return this.material.opacity}set opacity(t){this.material.opacity=t}}class sg{constructor(t){this.state=Ot.getInstance(),this.view=Ae.getInstance(),this.scene=this.view.scene,this.chunkState=t,this.areaVisible=!0,this.idVisible=!0,this.neighboursIdVisible=!0}setGroup(){this.group=new zn,this.group.position.x=this.chunkState.x,this.group.position.z=this.chunkState.z,this.scene.add(this.group)}destroyGroup(){this.group&&this.scene.remove(this.group)}setArea(){this.destroyArea(),this.areaVisible&&(this.area=new Gt(new gn(this.chunkState.size,this.chunkState.size),new di({wireframe:!0})),this.area.geometry.rotateX(Math.PI*.5),this.area.material.color.multiplyScalar((this.chunkState.depth+1)/this.state.chunks.maxDepth),this.group.add(this.area))}destroyArea(){this.area&&(this.area.geometry.dispose(),this.area.material.dispose(),this.group.remove())}setId(){this.destroyId(),this.idVisible&&(this.id=new po({charMax:4}),this.id.material.depthTest=!1,this.id.material.onBeforeRender=()=>{},this.id.material.onBuild=()=>{},this.id.display({text:this.chunkState.id,color:"#ffc800",size:(this.state.chunks.maxDepth-this.chunkState.depth+1)*6,position:new P(0,(this.state.chunks.maxDepth-this.chunkState.depth)*10,0)}),this.group.add(this.id))}destroyId(){this.id&&(this.id.geometry.dispose(),this.id.material.dispose(),this.group.remove(this.id))}setNeighboursIds(){if(this.destroyNeighboursIds(),!this.neighboursIdVisible||this.chunkState.neighbours.size===0)return;this.neighboursIds=new po({charMax:4}),this.neighboursIds.material.depthTest=!1,this.neighboursIds.material.onBeforeRender=()=>{},this.neighboursIds.material.onBuild=()=>{},this.group.add(this.neighboursIds);const t=this.chunkState.neighbours.get("n"),e=this.chunkState.neighbours.get("e"),n=this.chunkState.neighbours.get("s"),i=this.chunkState.neighbours.get("w"),r=(this.state.chunks.maxDepth-this.chunkState.depth+1)*6,o=(this.state.chunks.maxDepth-this.chunkState.depth)*10,a=t?t.id:"";this.neighboursIds.display({text:a,color:"#00bfff",size:r,position:new P(0,o,-this.chunkState.quarterSize)});const l=e?e.id:"";this.neighboursIds.display({text:l,color:"#00bfff",size:r,position:new P(this.chunkState.quarterSize,o,0)});const c=n?n.id:"";this.neighboursIds.display({text:c,color:"#00bfff",size:r,position:new P(0,o,this.chunkState.quarterSize)});const h=i?i.id:"";this.neighboursIds.display({text:h,color:"#00bfff",size:r,position:new P(-this.chunkState.quarterSize,o,0)})}destroyNeighboursIds(){this.neighboursIds&&(this.neighboursIds.geometry.dispose(),this.neighboursIds.material.dispose(),this.group.remove(this.neighboursIds))}destroy(){this.destroyGroup(),this.destroyArea(),this.destroyId(),this.destroyNeighboursIds()}}class rg{constructor(t){this.game=Kt.getInstance(),this.state=Ot.getInstance(),this.scene=this.game.scene,this.chunkState=t,this.helper=new sg(this.chunkState)}update(){}destroy(){}}class ag{constructor(){this.state=Ot.getInstance(),this.state.chunks.events.on("create",t=>{const e=new rg(t);t.events.on("destroy",()=>{e.destroy()})})}update(){}}var og=`#define M_PI 3.1415926535897932384626433832795

uniform float uTime;
uniform float uGrassDistance;
uniform vec3 uPlayerPosition;
uniform float uTerrainSize;
uniform float uTerrainTextureSize;
uniform sampler2D uTerrainATexture;
uniform vec2 uTerrainAOffset;
uniform sampler2D uTerrainBTexture;
uniform vec2 uTerrainBOffset;
uniform sampler2D uTerrainCTexture;
uniform vec2 uTerrainCOffset;
uniform sampler2D uTerrainDTexture;
uniform vec2 uTerrainDOffset;
uniform sampler2D uNoiseTexture;
uniform float uFresnelOffset;
uniform float uFresnelScale;
uniform float uFresnelPower;
uniform vec3 uSunPosition;
uniform vec3 uGrassDefaultColor;
uniform vec3 uGrassShadedColor;

attribute vec2 center;

varying vec3 vColor;

float inverseLerp(float v, float minValue, float maxValue)
{
    return (v - minValue) / (maxValue - minValue);
}
float remap(float v, float inMin, float inMax, float outMin, float outMax)
{
    float t = inverseLerp(v, inMin, inMax);
    return mix(outMin, outMax, t);
}
float getSunShade(vec3 normal)
{
    float sunShade = dot(normal, - uSunPosition);
    sunShade = sunShade * 0.5 + 0.5;

    return sunShade;
}
vec3 getSunShadeColor(vec3 baseColor, float sunShade)
{
    vec3 shadeColor = baseColor * vec3(0.0, 0.5, 0.7);
    return mix(baseColor, shadeColor, sunShade);
}
float getSunReflection(vec3 viewDirection, vec3 worldNormal, vec3 viewNormal)
{
    vec3 sunViewReflection = reflect(uSunPosition, viewNormal);
    float sunViewStrength = max(0.2, dot(sunViewReflection, viewDirection));

    float fresnel = uFresnelOffset + uFresnelScale * (1.0 + dot(viewDirection, worldNormal));
    float sunReflection = fresnel * sunViewStrength;
    sunReflection = pow(sunReflection, uFresnelPower);

    return sunReflection;
}
vec3 getSunReflectionColor(vec3 baseColor, float sunReflection)
{
    float reflectionStrength = 0.3;
    vec3 highlightColor = baseColor * 1.3;
    return mix(baseColor, highlightColor, clamp(sunReflection * reflectionStrength, 0.0, 1.0));
}
float getGrassAttenuation(vec2 position)
{
    float distanceAttenuation = distance(uPlayerPosition.xz, position) / uGrassDistance * 2.0;
    return 1.0 - clamp(0.0, 1.0, smoothstep(0.3, 1.0, distanceAttenuation));
}
vec2 getRotatePivot2d(vec2 uv, float rotation, vec2 pivot)
{
    return vec2(
        cos(rotation) * (uv.x - pivot.x) + sin(rotation) * (uv.y - pivot.y) + pivot.x,
        cos(rotation) * (uv.y - pivot.y) - sin(rotation) * (uv.x - pivot.x) + pivot.y
    );
}

void main()
{
    
    vec2 newCenter = center;
    newCenter -= uPlayerPosition.xz;
    float halfSize = uGrassDistance * 0.5;
    newCenter.x = mod(newCenter.x + halfSize, uGrassDistance) - halfSize;
    newCenter.y = mod(newCenter.y + halfSize, uGrassDistance) - halfSize; 
    vec4 modelCenter = modelMatrix * vec4(newCenter.x, 0.0, newCenter.y, 1.0);

    
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    modelPosition.xz += newCenter; 

    
    float angleToCamera = atan(modelCenter.x - cameraPosition.x, modelCenter.z - cameraPosition.z);
    modelPosition.xz = getRotatePivot2d(modelPosition.xz, angleToCamera, modelCenter.xz);

    
    vec2 terrainAUv = (modelPosition.xz - uTerrainAOffset.xy) / uTerrainSize;
    vec2 terrainBUv = (modelPosition.xz - uTerrainBOffset.xy) / uTerrainSize;
    vec2 terrainCUv = (modelPosition.xz - uTerrainCOffset.xy) / uTerrainSize;
    vec2 terrainDUv = (modelPosition.xz - uTerrainDOffset.xy) / uTerrainSize;

    float fragmentSize = 1.0 / uTerrainTextureSize;
    vec4 terrainAColor = texture2D(uTerrainATexture, terrainAUv * (1.0 - fragmentSize) + fragmentSize * 0.5);
    vec4 terrainBColor = texture2D(uTerrainBTexture, terrainBUv * (1.0 - fragmentSize) + fragmentSize * 0.5);
    vec4 terrainCColor = texture2D(uTerrainCTexture, terrainCUv * (1.0 - fragmentSize) + fragmentSize * 0.5);
    vec4 terrainDColor = texture2D(uTerrainDTexture, terrainDUv * (1.0 - fragmentSize) + fragmentSize * 0.5);

    vec4 terrainData = vec4(0);
    terrainData += step(0.0, terrainAUv.x) * step(terrainAUv.x, 1.0) * step(0.0, terrainAUv.y) * step(terrainAUv.y, 1.0) * terrainAColor;
    terrainData += step(0.0, terrainBUv.x) * step(terrainBUv.x, 1.0) * step(0.0, terrainBUv.y) * step(terrainBUv.y, 1.0) * terrainBColor;
    terrainData += step(0.0, terrainCUv.x) * step(terrainCUv.x, 1.0) * step(0.0, terrainCUv.y) * step(terrainCUv.y, 1.0) * terrainCColor;
    terrainData += step(0.0, terrainDUv.x) * step(terrainDUv.x, 1.0) * step(0.0, terrainDUv.y) * step(terrainDUv.y, 1.0) * terrainDColor;

    vec3 normal = terrainData.rgb;

    modelPosition.y += terrainData.a;
    modelCenter.y += terrainData.a;

    
    float slope = 1.0 - abs(dot(vec3(0.0, 1.0, 0.0), normal));

    
    float distanceScale = getGrassAttenuation(modelCenter.xz);
    float slopeScale = smoothstep(remap(slope, 0.4, 0.5, 1.0, 0.0), 0.0, 1.0);
    float scale = distanceScale * slopeScale;
    modelPosition.xyz = mix(modelCenter.xyz, modelPosition.xyz, scale);

    
    float tipness = step(2.0, mod(float(gl_VertexID) + 1.0, 3.0));

    
    vec2 noiseUv = modelPosition.xz * 0.02 + uTime * 0.05;
    vec4 noiseColor = texture2D(uNoiseTexture, noiseUv);
    modelPosition.x += (noiseColor.x - 0.5) * tipness * scale;
    modelPosition.z += (noiseColor.y - 0.5) * tipness * scale;

    
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;
    
    vec3 viewDirection = normalize(modelPosition.xyz - cameraPosition);
    
    vec3 worldNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal);
    vec3 viewNormal = normalize(normalMatrix * normal);

    
    vec3 lowColor = mix(uGrassShadedColor, uGrassDefaultColor, 1.0 - scale); 
    vec3 color = mix(lowColor, uGrassDefaultColor, tipness);

    
    float sunShade = getSunShade(normal);
    color = getSunShadeColor(color, sunShade);

    
    float sunReflection = getSunReflection(viewDirection, worldNormal, viewNormal);
    color = getSunReflectionColor(color, sunReflection);

    vColor = color;
    
}`,lg=`varying vec3 vColor;

void main()
{
    gl_FragColor = vec4(vColor, 1.0);
}`;function cg(){return new xe({uniforms:{uTime:{value:null},uGrassDistance:{value:null},uPlayerPosition:{value:null},uTerrainSize:{value:null},uTerrainTextureSize:{value:null},uTerrainATexture:{value:null},uTerrainAOffset:{value:null},uTerrainBTexture:{value:null},uTerrainBOffset:{value:null},uTerrainCTexture:{value:null},uTerrainCOffset:{value:null},uTerrainDTexture:{value:null},uTerrainDOffset:{value:null},uNoiseTexture:{value:null},uFresnelOffset:{value:null},uFresnelScale:{value:null},uFresnelPower:{value:null},uSunPosition:{value:null},uGrassDefaultColor:{value:new _t(.35,.65,.15)},uGrassShadedColor:{value:new _t(.25,.45,.1)}},vertexShader:og,fragmentShader:lg})}class hg{constructor(){this.game=Kt.getInstance(),this.view=Ae.getInstance(),this.state=Ot.getInstance(),this.time=this.state.time,this.scene=this.view.scene,this.noises=this.view.noises,this.details=200,this.size=this.state.chunks.minSize,this.count=this.details*this.details,this.fragmentSize=this.size/this.details,this.bladeWidthRatio=1.5,this.bladeHeightRatio=4,this.bladeHeightRandomness=.5,this.positionRandomness=.5,this.noiseTexture=this.noises.create(128,128),this.setGeometry(),this.setMaterial(),this.setMesh()}setGeometry(){const t=new Float32Array(this.count*3*2),e=new Float32Array(this.count*3*3);for(let n=0;n<this.details;n++){const i=(n/this.details-.5)*this.size+this.fragmentSize*.5;for(let r=0;r<this.details;r++){const o=(r/this.details-.5)*this.size+this.fragmentSize*.5,a=(n*this.details+r)*9,l=(n*this.details+r)*6,c=i+(Math.random()-.5)*this.fragmentSize*this.positionRandomness,h=o+(Math.random()-.5)*this.fragmentSize*this.positionRandomness;t[l]=c,t[l+1]=h,t[l+2]=c,t[l+3]=h,t[l+4]=c,t[l+5]=h;const d=this.fragmentSize*this.bladeWidthRatio*.5,f=this.fragmentSize*this.bladeHeightRatio*(1-this.bladeHeightRandomness+Math.random()*this.bladeHeightRandomness);e[a]=-d,e[a+1]=0,e[a+2]=0,e[a+3]=0,e[a+4]=f,e[a+5]=0,e[a+6]=d,e[a+7]=0,e[a+8]=0}}this.geometry=new oe,this.geometry.setAttribute("center",new Ht(t,2)),this.geometry.setAttribute("position",new Ht(e,3))}setMaterial(){const t=this.state.chunks,e=this.state.terrains,n=this.view.terrains;this.material=new cg,this.material.uniforms.uTime.value=0,this.material.uniforms.uGrassDistance.value=this.size,this.material.uniforms.uPlayerPosition.value=new P,this.material.uniforms.uTerrainSize.value=t.minSize,this.material.uniforms.uTerrainTextureSize.value=e.segments,this.material.uniforms.uTerrainATexture.value=null,this.material.uniforms.uTerrainAOffset.value=new lt,this.material.uniforms.uTerrainBTexture.value=null,this.material.uniforms.uTerrainBOffset.value=new lt,this.material.uniforms.uTerrainCTexture.value=null,this.material.uniforms.uTerrainCOffset.value=new lt,this.material.uniforms.uTerrainDTexture.value=null,this.material.uniforms.uTerrainDOffset.value=new lt,this.material.uniforms.uNoiseTexture.value=this.noiseTexture,this.material.uniforms.uFresnelOffset.value=0,this.material.uniforms.uFresnelScale.value=.5,this.material.uniforms.uFresnelPower.value=2,this.material.uniforms.uSunPosition.value=new P(-.5,-.5,-.5),n&&n.material&&(this.material.uniforms.uGrassDefaultColor=n.material.uniforms.uGrassDefaultColor,this.material.uniforms.uGrassShadedColor=n.material.uniforms.uGrassShadedColor)}setMesh(){this.mesh=new Gt(this.geometry,this.material),this.mesh.frustumCulled=!1,this.scene.add(this.mesh)}update(){const e=this.state.player.position.current,n=this.state.chunks,i=this.state.sun;this.material.uniforms.uTime.value=this.time.elapsed,this.material.uniforms.uSunPosition.value.set(i.position.x,i.position.y,i.position.z),this.mesh.position.set(e[0],0,e[2]),this.material.uniforms.uPlayerPosition.value.set(e[0],e[1],e[2]);const r=n.getDeepestChunkForPosition(e[0],e[2]);if(r&&r.terrain&&r.terrain.renderInstance.texture){this.material.uniforms.uTerrainATexture.value=r.terrain.renderInstance.texture,this.material.uniforms.uTerrainAOffset.value.set(r.x-r.size*.5,r.z-r.size*.5);const o=(e[0]-r.x+r.size*.5)/r.size,a=(e[2]-r.z+r.size*.5)/r.size,l=r.neighbours.get(o<.5?"w":"e");l&&l.terrain&&l.terrain.renderInstance.texture&&(this.material.uniforms.uTerrainBTexture.value=l.terrain.renderInstance.texture,this.material.uniforms.uTerrainBOffset.value.set(l.x-l.size*.5,l.z-l.size*.5));const c=r.neighbours.get(a<.5?"n":"s");c&&c.terrain&&c.terrain.renderInstance.texture&&(this.material.uniforms.uTerrainCTexture.value=c.terrain.renderInstance.texture,this.material.uniforms.uTerrainCOffset.value.set(c.x-c.size*.5,c.z-c.size*.5));const h=l.neighbours.get(a<.5?"n":"s");h&&h.terrain&&h.terrain.renderInstance.texture&&(this.material.uniforms.uTerrainDTexture.value=h.terrain.renderInstance.texture,this.material.uniforms.uTerrainDOffset.value.set(h.x-h.size*.5,h.z-h.size*.5))}}}var ug=`varying vec2 vUv;

void main()
{
    gl_Position = vec4(position, 1.0);

    vUv = uv;
}`,dg=`varying vec2 vUv;

vec3 mod289(vec3 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
  return mod289(((x*34.0)+10.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

float perlin3dPeriodic(vec3 P, vec3 rep)
{
  vec3 Pi0 = mod(floor(P), rep); 
  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); 
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P); 
  vec3 Pf1 = Pf0 - vec3(1.0); 
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}

void main()
{
    float uFrequency = 8.0;

    float noiseR = perlin3dPeriodic(vec3(vUv * uFrequency, 123.456), vec3(uFrequency)) * 0.5 + 0.5;
    float noiseG = perlin3dPeriodic(vec3(vUv * uFrequency, 456.789), vec3(uFrequency)) * 0.5 + 0.5;
    float noiseB = perlin3dPeriodic(vec3(vUv * uFrequency, 789.123), vec3(uFrequency)) * 0.5 + 0.5;

    gl_FragColor = vec4(noiseR, noiseG, noiseB, 1.0);
}`;function fg(){return new xe({uniforms:{},vertexShader:ug,fragmentShader:dg})}class pg{constructor(){this.view=Ae.getInstance(),this.renderer=this.view.renderer,this.scene=this.view.scene,this.setCustomRender(),this.setMaterial(),this.setPlane()}setCustomRender(){this.customRender={},this.customRender.scene=new Lr,this.customRender.camera=new qo(-1,1,1,-1,.1,10)}setMaterial(){this.material=new fg}setPlane(){this.plane=new Gt(new gn(2,2),this.material),this.plane.frustumCulled=!1,this.customRender.scene.add(this.plane)}setHelper(){this.helper={},this.helper.geometry=new gn(1,1),this.helper.material=new di;const t=new Gt(this.helper.geometry,this.helper.material);t.position.y=5+1,t.position.x=-1,t.scale.set(2,2,2);const e=new Gt(this.helper.geometry,this.helper.material);e.position.y=5+1,e.position.x=1,e.scale.set(2,2,2);const n=new Gt(this.helper.geometry,this.helper.material);n.position.y=5-1,n.position.x=-1,n.scale.set(2,2,2);const i=new Gt(this.helper.geometry,this.helper.material);i.position.y=5-1,i.position.x=1,i.scale.set(2,2,2),window.requestAnimationFrame(()=>{this.scene.add(t)})}create(t,e){const n=new rn(t,e,{generateMipmaps:!1,wrapS:Ei,wrapT:Ei});this.renderer.instance.setRenderTarget(n),this.renderer.instance.render(this.customRender.scene,this.customRender.camera),this.renderer.instance.setRenderTarget(null);const i=n.texture;return this.helper&&(this.helper.material.map=i),i}}var mg=`varying vec3 vGameNormal;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;

    vec3 worldNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal);

    
    vGameNormal = worldNormal;
}`,gg=`uniform vec3 uSunPosition;
uniform vec3 uColor;

varying vec3 vGameNormal;

float getSunShade(vec3 normal)
{
    float sunShade = dot(normal, - uSunPosition);
    sunShade = sunShade * 0.5 + 0.5;

    return sunShade;
}
vec3 getSunShadeColor(vec3 baseColor, float sunShade)
{
    vec3 shadeColor = baseColor * vec3(0.0, 0.5, 0.7);
    return mix(baseColor, shadeColor, sunShade);
}

void main()
{
    vec3 color = uColor;

    float sunShade = getSunShade(vGameNormal);
    color = getSunShadeColor(color, sunShade);
    
    gl_FragColor = vec4(color, 1.0);
    
}`;function vg(){return new xe({uniforms:{uColor:{value:null},uLightnessSmoothness:{value:null},uSunPosition:{value:null}},vertexShader:mg,fragmentShader:gg})}class Ag{constructor(){this.game=Kt.getInstance(),this.state=Ot.getInstance(),this.view=Ae.getInstance(),this.debug=nn.getInstance(),this.scene=this.view.scene,this.setGroup(),this.setHelper(),this.setDebug()}setGroup(){this.group=new zn,this.scene.add(this.group)}setHelper(){this.helper=new Gt,this.helper.material=new vg,this.helper.material.uniforms.uColor.value=new _t("#fff8d6"),this.helper.material.uniforms.uSunPosition.value=new P(-.5,-.5,-.5),this.helper.geometry=new Nr(.5,.8,3,16),this.helper.geometry.translate(0,.9,0),this.group.add(this.helper)}setDebug(){if(!this.debug.active)return;this.debug.ui.getFolder("视图/玩家").addColor(this.helper.material.uniforms.uColor,"value").name("颜色")}update(){const t=this.state.player,e=this.state.sun;this.group.position.set(t.position.current[0],t.position.current[1],t.position.current[2]),this.helper.rotation.y=t.rotation,this.helper.material.uniforms.uSunPosition.value.set(e.position.x,e.position.y,e.position.z)}}class xg{constructor(t={}){this.game=Kt.getInstance(),this.view=Ae.getInstance(),this.state=Ot.getInstance(),this.debug=nn.getInstance(),this.scene=this.view.scene,this.domElement=this.game.domElement,this.viewport=this.state.viewport,this.time=this.state.time,this.camera=this.view.camera,this.setInstance()}setInstance(){this.clearColor="#222222",this.instance=new $o({alpha:!1,antialias:!0}),this.instance.sortObjects=!1,this.instance.domElement.style.position="absolute",this.instance.domElement.style.top=0,this.instance.domElement.style.left=0,this.instance.domElement.style.width="100%",this.instance.domElement.style.height="100%",this.instance.setClearColor(this.clearColor,1),this.instance.setSize(this.viewport.width,this.viewport.height),this.instance.setPixelRatio(this.viewport.clampedPixelRatio),this.context=this.instance.getContext(),this.debug.stats&&this.debug.stats.setRenderPanel(this.context)}resize(){this.instance.setSize(this.viewport.width,this.viewport.height),this.instance.setPixelRatio(this.viewport.clampedPixelRatio)}update(){this.debug.stats&&this.debug.stats.beforeRender(),this.instance.render(this.scene,this.camera.instance),this.debug.stats&&this.debug.stats.afterRender()}destroy(){this.instance.renderLists.dispose(),this.instance.dispose(),this.renderTarget.dispose()}}var Sg=`varying vec2 vUv;

void main()
{
    gl_Position = vec4(position, 1.0);

    vUv = uv;
}`,yg=`uniform sampler2D uTexture;

varying vec2 vUv;

void main()
{
    vec3 color = texture2D(uTexture, vUv).rgb;
    gl_FragColor = vec4(color, 1.0);
}`;function Mg(){return new xe({uniforms:{uTexture:{value:null}},vertexShader:Sg,fragmentShader:yg})}var wg=`#define M_PI 3.1415926535897932384626433832795

uniform vec3 uSunPosition;

uniform float uAtmosphereElevation;
uniform float uAtmospherePower;
uniform vec3 uColorDayCycleLow;
uniform vec3 uColorDayCycleHigh;
uniform vec3 uColorNightLow;
uniform vec3 uColorNightHigh;

uniform float uDawnAngleAmplitude;
uniform float uDawnElevationAmplitude;
uniform vec3 uColorDawn;

uniform float uSunAmplitude;
uniform float uSunMultiplier;
uniform vec3 uColorSun;

uniform float uDayCycleProgress;

varying vec3 vColor;

vec3 blendAdd(vec3 base, vec3 blend)
{
	return min(base + blend, vec3(1.0));
}

vec3 blendAdd(vec3 base, vec3 blend, float opacity)
{
	return (blendAdd(base, blend) * opacity + base * (1.0 - opacity));
}

void main()
{
    
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    vec3 normalizedPosition = normalize(position);

    
    
    float horizonIntensity = (uv.y - 0.5) / uAtmosphereElevation;
    horizonIntensity = pow(1.0 - horizonIntensity, uAtmospherePower);

    
    vec3 colorDayCycle = mix(uColorDayCycleHigh, uColorDayCycleLow, horizonIntensity);
    
    
    vec3 colorNight = mix(uColorNightHigh, uColorNightLow, horizonIntensity);
    
    
    float dayIntensity = abs(uDayCycleProgress - 0.5) * 2.0;
    vec3 color = mix(colorNight, colorDayCycle, dayIntensity);

    /**
     * Sun glow
     */
    
    float distanceToSun = distance(normalizedPosition, uSunPosition);

    /**
     * Dawn
     */
    
    float dawnAngleIntensity = dot(normalize(uSunPosition.xz), normalize(normalizedPosition.xz));
    dawnAngleIntensity = smoothstep(0.0, 1.0, (dawnAngleIntensity - (1.0 - uDawnAngleAmplitude)) / uDawnAngleAmplitude);

    
    float dawnElevationIntensity = 1.0 - min(1.0, (uv.y - 0.5) / uDawnElevationAmplitude);

    
    float dawnDayCycleIntensity = cos(uDayCycleProgress * 4.0 * M_PI + M_PI) * 0.5 + 0.5;

    
    float dawnIntensity = clamp(dawnAngleIntensity * dawnElevationIntensity * dawnDayCycleIntensity, 0.0, 1.0);
    color = blendAdd(color, uColorDawn, dawnIntensity);

    /**
     * Sun glow
     */
    
    float sunIntensity = smoothstep(0.0, 1.0, clamp(1.0 - distanceToSun / uSunAmplitude, 0.0, 1.0)) * uSunMultiplier;
    color = blendAdd(color, uColorSun, sunIntensity);

    float sunGlowStrength = pow(max(0.0, 1.0 + 0.05 - distanceToSun * 2.5), 2.0);
    color = blendAdd(color, uColorSun, sunGlowStrength);

    vColor = vec3(color);
    
}`,bg=`varying vec3 vColor;

void main()
{
    gl_FragColor = vec4(vColor, 1.0);
}`;function _g(){return new xe({uniforms:{uSunPosition:{value:new P},uAtmosphereElevation:{value:.5},uAtmospherePower:{value:10},uColorDayCycleLow:{value:new _t},uColorDayCycleHigh:{value:new _t},uColorNightLow:{value:new _t},uColorNightHigh:{value:new _t},uDawnAngleAmplitude:{value:1},uDawnElevationAmplitude:{value:.2},uColorDawn:{value:new _t},uSunAmplitude:{value:.75},uSunMultiplier:{value:1},uColorSun:{value:new _t},uDayCycleProgress:{value:0}},vertexShader:wg,fragmentShader:bg})}var Tg=`#define M_PI 3.1415926535897932384626433832795

uniform vec3 uSunPosition;
uniform float uSize;
uniform float uBrightness;
uniform float uHeightFragments;

attribute float aSize;
attribute vec3 aColor;

varying vec3 vColor;

void main()
{
    
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    
    vec3 normalizedPosition = normalize(modelPosition.xyz);
    float sunSizeMultiplier = 1.0 - (dot(normalize(uSunPosition), normalizedPosition) * 0.5 + 0.5);
    

    gl_PointSize = aSize * uSize * sunSizeMultiplier * uHeightFragments;

    
    if(gl_PointSize < 0.5)
        gl_Position = vec4(2.0, 2.0, 2.0, 1.0);

    vColor = mix(aColor, vec3(1.0), uBrightness);
}`,Cg=`varying vec3 vColor;

void main()
{
    gl_FragColor = vec4(vColor, 1.0);
}`;function Eg(){return new xe({uniforms:{uSunPosition:{value:new P},uSize:{value:.01},uBrightness:{value:.5},uHeightFragments:{value:null}},vertexShader:Tg,fragmentShader:Cg})}class Pg{constructor(){this.game=Kt.getInstance(),this.view=Ae.getInstance(),this.state=Ot.getInstance(),this.debug=nn.getInstance(),this.viewport=this.state.viewport,this.renderer=this.view.renderer,this.scene=this.view.scene,this.outerDistance=1e3,this.group=new zn,this.scene.add(this.group),this.setCustomRender(),this.setBackground(),this.setSphere(),this.setSun(),this.setStars(),this.setDebug()}setCustomRender(){this.customRender={},this.customRender.scene=new Lr,this.customRender.camera=this.view.camera.instance.clone(),this.customRender.resolutionRatio=.1,this.customRender.renderTarget=new rn(this.viewport.width*this.customRender.resolutionRatio,this.viewport.height*this.customRender.resolutionRatio,{generateMipmaps:!1}),this.customRender.texture=this.customRender.renderTarget.texture}setBackground(){this.background={},this.background.geometry=new gn(2,2),this.background.material=new Mg,this.background.material.uniforms.uTexture.value=this.customRender.renderTarget.texture,this.background.material.depthTest=!1,this.background.material.depthWrite=!1,this.background.mesh=new Gt(this.background.geometry,this.background.material),this.background.mesh.frustumCulled=!1,this.group.add(this.background.mesh)}setSphere(){this.sphere={},this.sphere.widthSegments=128,this.sphere.heightSegments=64,this.sphere.update=()=>{const t=new Fr(10,this.sphere.widthSegments,this.sphere.heightSegments);this.sphere.geometry&&(this.sphere.geometry.dispose(),this.sphere.mesh.geometry=this.sphere.geometry),this.sphere.geometry=t},this.sphere.material=new _g,this.sphere.material.uniforms.uColorDayCycleLow.value.set("#f0fff9"),this.sphere.material.uniforms.uColorDayCycleHigh.value.set("#2e89ff"),this.sphere.material.uniforms.uColorNightLow.value.set("#004794"),this.sphere.material.uniforms.uColorNightHigh.value.set("#001624"),this.sphere.material.uniforms.uColorSun.value.set("#ff531a"),this.sphere.material.uniforms.uColorDawn.value.set("#ff1900"),this.sphere.material.uniforms.uDayCycleProgress.value=0,this.sphere.material.side=ye,this.sphere.update(),this.sphere.mesh=new Gt(this.sphere.geometry,this.sphere.material),this.customRender.scene.add(this.sphere.mesh)}setSun(){this.sun={},this.sun.distance=this.outerDistance-50;const t=new Or(.02*this.sun.distance,32),e=new di({color:16777215});this.sun.mesh=new Gt(t,e),this.group.add(this.sun.mesh)}setStars(){this.stars={},this.stars.count=1e3,this.stars.distance=this.outerDistance,this.stars.update=()=>{const t=new Float32Array(this.stars.count*3),e=new Float32Array(this.stars.count),n=new Float32Array(this.stars.count*3);for(let r=0;r<this.stars.count;r++){const o=r*3,a=new P;a.setFromSphericalCoords(this.stars.distance,Math.acos(Math.random()),2*Math.PI*Math.random()),t[o]=a.x,t[o+1]=a.y,t[o+2]=a.z,e[r]=Math.pow(Math.random()*.9,10)+.1;const l=new _t;l.setHSL(Math.random(),1,.5+Math.random()*.5),n[o]=l.r,n[o+1]=l.g,n[o+2]=l.b}const i=new oe;i.setAttribute("position",new Ht(t,3)),i.setAttribute("aSize",new Ht(e,1)),i.setAttribute("aColor",new Ht(n,3)),this.stars.geometry&&(this.stars.geometry.dispose(),this.stars.points.geometry=this.stars.geometry),this.stars.geometry=i},this.stars.update(),this.stars.material=new Eg,this.stars.material.uniforms.uHeightFragments.value=this.viewport.height*this.viewport.clampedPixelRatio,this.stars.points=new tl(this.stars.geometry,this.stars.material),this.group.add(this.stars.points)}setDebug(){if(!this.debug.active)return;const t=this.debug.ui.getFolder("视图/天空/球体/几何");t.add(this.sphere,"widthSegments").min(4).max(512).step(1).name("宽度分段").onChange(()=>{this.sphere.update()}),t.add(this.sphere,"heightSegments").min(4).max(512).step(1).name("高度分段").onChange(()=>{this.sphere.update()});const e=this.debug.ui.getFolder("视图/天空/球体/材质");e.add(this.sphere.material.uniforms.uAtmosphereElevation,"value").min(0).max(5).step(.01).name("大气高度"),e.add(this.sphere.material.uniforms.uAtmospherePower,"value").min(0).max(20).step(1).name("大气强度"),e.addColor(this.sphere.material.uniforms.uColorDayCycleLow,"value").name("日间低色"),e.addColor(this.sphere.material.uniforms.uColorDayCycleHigh,"value").name("日间高色"),e.addColor(this.sphere.material.uniforms.uColorNightLow,"value").name("夜间低色"),e.addColor(this.sphere.material.uniforms.uColorNightHigh,"value").name("夜间高色"),e.add(this.sphere.material.uniforms.uDawnAngleAmplitude,"value").min(0).max(1).step(.001).name("黄昏角度"),e.add(this.sphere.material.uniforms.uDawnElevationAmplitude,"value").min(0).max(1).step(.01).name("黄昏高度"),e.addColor(this.sphere.material.uniforms.uColorDawn,"value").name("黄昏颜色"),e.add(this.sphere.material.uniforms.uSunAmplitude,"value").min(0).max(3).step(.01).name("太阳振幅"),e.add(this.sphere.material.uniforms.uSunMultiplier,"value").min(0).max(1).step(.01).name("太阳倍增"),e.addColor(this.sphere.material.uniforms.uColorSun,"value").name("太阳颜色");const n=this.debug.ui.getFolder("视图/天空/星星");n.add(this.stars,"count").min(100).max(5e4).step(100).name("数量").onChange(()=>{this.stars.update()}),n.add(this.stars.material.uniforms.uSize,"value").min(0).max(1).step(1e-4).name("大小"),n.add(this.stars.material.uniforms.uBrightness,"value").min(0).max(1).step(.001).name("亮度")}update(){const t=this.state.day,e=this.state.sun,n=this.state.player;this.group.position.set(n.position.current[0],n.position.current[1],n.position.current[2]),this.sphere.material.uniforms.uSunPosition.value.set(e.position.x,e.position.y,e.position.z),this.sphere.material.uniforms.uDayCycleProgress.value=t.progress,this.sun.mesh.position.set(e.position.x*this.sun.distance,e.position.y*this.sun.distance,e.position.z*this.sun.distance),this.sun.mesh.lookAt(n.position.current[0],n.position.current[1],n.position.current[2]),this.stars.material.uniforms.uSunPosition.value.set(e.position.x,e.position.y,e.position.z),this.stars.material.uniforms.uHeightFragments.value=this.viewport.height*this.viewport.clampedPixelRatio,this.customRender.camera.quaternion.copy(this.view.camera.instance.quaternion),this.renderer.instance.setRenderTarget(this.customRender.renderTarget),this.renderer.instance.render(this.customRender.scene,this.customRender.camera),this.renderer.instance.setRenderTarget(null)}resize(){this.customRender.renderTarget.width=this.viewport.width*this.customRender.resolutionRatio,this.customRender.renderTarget.height=this.viewport.height*this.customRender.resolutionRatio}}class zg{constructor(t,e){this.state=Ot.getInstance(),this.view=Ae.getInstance(),this.scene=this.view.scene,this.terrains=t,this.terrainState=e,this.terrainState.renderInstance=this,this.created=!1,this.terrainState.events.on("ready",()=>{this.create()})}create(){const t=this.state.terrains;this.created?(this.geometry.dispose(),this.geometry=new oe,this.geometry.setAttribute("position",new Wt(this.terrainState.positions,3)),this.geometry.index=new Wt(this.terrainState.indices,1,!1),this.mesh.geometry=this.geometry):(this.geometry=new oe,this.geometry.setAttribute("position",new Ht(this.terrainState.positions,3)),this.geometry.setAttribute("uv",new Ht(this.terrainState.uv,2)),this.geometry.index=new Wt(this.terrainState.indices,1,!1),this.texture=new Tm(this.terrainState.texture,t.segments,t.segments,Ie,dn,Pr,Ee,Ee,Se,Se),this.texture.flipY=!1,this.texture.needsUpdate=!0,this.mesh=new Gt(this.geometry,this.terrains.material),this.mesh.userData.texture=this.texture,this.scene.add(this.mesh),this.created=!0)}update(){}destroy(){this.created&&(this.geometry.dispose(),this.scene.remove(this.mesh))}}class Lg{constructor(){this.game=Kt.getInstance(),this.canvas=document.createElement("canvas"),this.context=this.canvas.getContext("2d"),this.texture=new de(this.canvas),this.colors={aboveFar:"#7cb342",aboveClose:"#558b2f",belowClose:"#2f3d36",belowFar:"#011018"},this.width=1,this.height=512,this.update(),this.setDebug()}update(){const t=this.context.createLinearGradient(0,0,0,this.height);t.addColorStop(0,this.colors.aboveFar),t.addColorStop(.49999,this.colors.aboveClose),t.addColorStop(.51111,this.colors.belowClose),t.addColorStop(1,this.colors.belowFar),this.context.fillStyle=t,this.context.fillRect(0,0,this.width,this.height),this.texture.needsUpdate=!0}setDebug(){const t=this.game.debug;if(!t.active)return;const e=t.ui.getFolder("视图/地形/渐变");e.addColor(this.colors,"aboveFar").name("高处远景色").onChange(()=>this.update()),e.addColor(this.colors,"aboveClose").name("高处近景色").onChange(()=>this.update()),e.addColor(this.colors,"belowClose").name("低处近景色").onChange(()=>this.update()),e.addColor(this.colors,"belowFar").name("低处远景色").onChange(()=>this.update())}}var Rg=`uniform vec3 uPlayerPosition;
uniform float uLightnessSmoothness;
uniform float uFresnelOffset;
uniform float uFresnelScale;
uniform float uFresnelPower;
uniform vec3 uSunPosition;
uniform float uGrassDistance;
uniform sampler2D uTexture;
uniform sampler2D uFogTexture;
uniform vec3 uGrassDefaultColor;
uniform vec3 uGrassShadedColor;

varying vec3 vColor;
varying float vElevation;

float inverseLerp(float v, float minValue, float maxValue)
{
    return (v - minValue) / (maxValue - minValue);
}
float remap(float v, float inMin, float inMax, float outMin, float outMax)
{
    float t = inverseLerp(v, inMin, inMax);
    return mix(outMin, outMax, t);
}
float getSunShade(vec3 normal)
{
    float sunShade = dot(normal, - uSunPosition);
    sunShade = sunShade * 0.5 + 0.5;

    return sunShade;
}
vec3 getSunShadeColor(vec3 baseColor, float sunShade)
{
    vec3 shadeColor = baseColor * vec3(0.0, 0.5, 0.7);
    return mix(baseColor, shadeColor, sunShade);
}
float getSunReflection(vec3 viewDirection, vec3 worldNormal, vec3 viewNormal)
{
    vec3 sunViewReflection = reflect(uSunPosition, viewNormal);
    float sunViewStrength = max(0.2, dot(sunViewReflection, viewDirection));

    float fresnel = uFresnelOffset + uFresnelScale * (1.0 + dot(viewDirection, worldNormal));
    float sunReflection = fresnel * sunViewStrength;
    sunReflection = pow(sunReflection, uFresnelPower);

    return sunReflection;
}
vec3 getSunReflectionColor(vec3 baseColor, float sunReflection)
{
    float reflectionStrength = 0.3;
    vec3 highlightColor = baseColor * 1.3;
    return mix(baseColor, highlightColor, clamp(sunReflection * reflectionStrength, 0.0, 1.0));
}
vec3 getFogColor(vec3 baseColor, float depth, vec2 screenUv)
{
    float uFogIntensity = 0.0025;
    vec3 fogColor = texture2D(uFogTexture, screenUv).rgb;
    
    float fogIntensity = 1.0 - exp(- uFogIntensity * uFogIntensity * depth * depth );
    return mix(baseColor, fogColor, fogIntensity);
}
float getGrassAttenuation(vec2 position)
{
    float distanceAttenuation = distance(uPlayerPosition.xz, position) / uGrassDistance * 2.0;
    return 1.0 - clamp(0.0, 1.0, smoothstep(0.3, 1.0, distanceAttenuation));
}

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    float depth = - viewPosition.z;
    gl_Position = projectionMatrix * viewPosition;

    
    vec4 terrainData = texture2D(uTexture, uv);
    vec3 normal = terrainData.rgb;
    float elevation = terrainData.a;

    
    float slope = 1.0 - abs(dot(vec3(0.0, 1.0, 0.0), normal));

    vec3 viewDirection = normalize(modelPosition.xyz - cameraPosition);
    vec3 worldNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal);
    vec3 viewNormal = normalize(normalMatrix * normal);

    
    vec3 grassDefaultColor = uGrassDefaultColor;
    vec3 grassShadedColor = uGrassShadedColor;
    
    
    
    float grassDistanceAttenuation = getGrassAttenuation(modelPosition.xz);
    float grassSlopeAttenuation = smoothstep(remap(slope, 0.4, 0.5, 1.0, 0.0), 0.0, 1.0);
    float grassAttenuation = grassDistanceAttenuation * grassSlopeAttenuation;
    vec3 grassColor = mix(grassShadedColor, grassDefaultColor, 1.0 - grassAttenuation);

    vec3 color = grassColor;

    
    float sunShade = getSunShade(normal);
    color = getSunShadeColor(color, sunShade);

    
    float sunReflection = getSunReflection(viewDirection, worldNormal, viewNormal);
    color = getSunReflectionColor(color, sunReflection);

    
    vec2 screenUv = (gl_Position.xy / gl_Position.w * 0.5) + 0.5;
    color = getFogColor(color, depth, screenUv);

    
    

    
    vColor = color;
    vElevation = elevation;
}`,kg=`uniform sampler2D uGradientTexture;

varying vec3 vColor;
varying float vElevation;

void main()
{
    vec3 color = vColor;
    
    
    
    float normalizedElevation = clamp((vElevation + 5.0) / 20.0, 0.0, 1.0);
    vec3 gradientColor = texture2D(uGradientTexture, vec2(0.5, normalizedElevation)).rgb;
    
    
    color = mix(color, gradientColor, 0.5);
    
    gl_FragColor = vec4(color, 1.0);
}`;function Dg(){return new xe({uniforms:{uPlayerPosition:{value:null},uGradientTexture:{value:null},uLightnessSmoothness:{value:null},uFresnelOffset:{value:null},uFresnelScale:{value:null},uFresnelPower:{value:null},uSunPosition:{value:null},uFogTexture:{value:null},uGrassDistance:{value:null},uTexture:{value:null},uGrassDefaultColor:{value:new _t(.35,.65,.15)},uGrassShadedColor:{value:new _t(.25,.45,.1)}},vertexShader:Rg,fragmentShader:kg})}class Ig{constructor(){this.game=Kt.getInstance(),this.state=Ot.getInstance(),this.view=Ae.getInstance(),this.debug=Ae.getInstance(),this.viewport=this.state.viewport,this.sky=this.view.sky,this.setGradient(),this.setMaterial(),this.setDebug(),this.state.terrains.events.on("create",t=>{const e=new zg(this,t);t.events.on("destroy",()=>{e.destroy()})})}setGradient(){this.gradient=new Lg}setMaterial(){this.material=new Dg,this.material.uniforms.uPlayerPosition.value=new P,this.material.uniforms.uGradientTexture.value=this.gradient.texture,this.material.uniforms.uLightnessSmoothness.value=.25,this.material.uniforms.uFresnelOffset.value=0,this.material.uniforms.uFresnelScale.value=.5,this.material.uniforms.uFresnelPower.value=2,this.material.uniforms.uSunPosition.value=new P(-.5,-.5,-.5),this.material.uniforms.uFogTexture.value=this.sky.customRender.texture,this.material.uniforms.uGrassDistance.value=this.state.chunks.minSize,this.material.onBeforeRender=(t,e,n,i,r)=>{this.material.uniforms.uTexture.value=r.userData.texture,this.material.uniformsNeedUpdate=!0}}setDebug(){if(!this.debug.active)return;const t=debug.ui.getFolder("视图/地形");t.add(this.material,"wireframe").name("线框模式"),t.add(this.material.uniforms.uLightnessSmoothness,"value").min(0).max(1).step(.001).name("光照平滑度"),t.add(this.material.uniforms.uFresnelOffset,"value").min(-1).max(1).step(.001).name("菲涅尔偏移"),t.add(this.material.uniforms.uFresnelScale,"value").min(0).max(2).step(.001).name("菲涅尔缩放"),t.add(this.material.uniforms.uFresnelPower,"value").min(1).max(10).step(1).name("菲涅尔强度");const e=debug.ui.getFolder("视图/地形/颜色");e.addColor(this.material.uniforms.uGrassDefaultColor,"value").name("草地默认色"),e.addColor(this.material.uniforms.uGrassShadedColor,"value").name("草地阴影色")}update(){const e=this.state.player.position.current,n=this.state.sun;this.material.uniforms.uPlayerPosition.value.set(e[0],e[1],e[2]),this.material.uniforms.uSunPosition.value.set(n.position.x,n.position.y,n.position.z)}resize(){}}class Ng{constructor(){this.view=Ae.getInstance(),this.state=Ot.getInstance(),this.scene=this.view.scene,this.mesh=new Gt(new gn(1e3,1e3),new di({color:"#1d3456"})),this.mesh.geometry.rotateX(-Math.PI*.5)}update(){const t=this.state.player;this.mesh.position.set(t.position.current[0],0,t.position.current[2])}}const ii=class{static getInstance(){return ii.instance}constructor(){if(ii.instance)return ii.instance;ii.instance=this,this.scene=new Lr,this.camera=new Vm,this.renderer=new xg,this.noises=new pg,this.sky=new Pg,this.water=new Ng,this.terrains=new Ig,this.chunks=new ag,this.player=new Ag,this.grass=new hg}resize(){this.camera.resize(),this.renderer.resize(),this.sky.resize(),this.terrains.resize()}update(){this.sky.update(),this.water.update(),this.terrains.update(),this.chunks.update(),this.player.update(),this.grass.update(),this.camera.update(),this.renderer.update()}destroy(){}};let Ae=ii;Oe(Ae,"instance");const si=class{static getInstance(){return si.instance}constructor(){if(si.instance)return si.instance;si.instance=this,this.domElement=document.querySelector(".game")||document.body,this.seed="p",this.debug=new nn,this.state=new Ot,this.view=new Ae,window.addEventListener("resize",()=>{this.resize()}),this.update()}update(){this.state.update(),this.view.update(),window.requestAnimationFrame(()=>{this.update()})}resize(){this.state.resize(),this.view.resize()}destroy(){}};let Kt=si;Oe(Kt,"instance");const mo=new Kt;mo.view&&document.querySelector(".game").append(mo.view.renderer.instance.domElement);
