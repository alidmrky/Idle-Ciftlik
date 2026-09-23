import type { GameState, CropId } from './types';
import { CROPS, formatNumber } from './game';

export default function FarmMap({game,onChoose}:{game:GameState;onChoose:(id:CropId)=>void}) {
  const names=['Domates Ovası','Biber Tepeleri','Çilek Vadisi','Arı Ormanı'];
  return <div className="farm-map" aria-label="Çiftlik dünya haritası"><div className="map-heading"><small>FİLİZ VADİSİ</small><h1>Bir dünya dolusu toprak.</h1><p>Bölgene dokun. Yeni parseller aç, çiftliğini büyüt.</p></div>
    <svg viewBox="0 0 1100 640" role="group" aria-label="Dört bölgeye ayrılmış çiftlik haritası">
      <path d="M-50 360Q240 70 470 380T1180 290" fill="none" stroke="#70a9ad" strokeWidth="65"/>
      <path d="M80 200Q320 200 500 150T1000 190M320 240Q520 300 660 420" fill="none" stroke="#eed6a3" strokeWidth="24" strokeLinecap="round"/>
      {CROPS.map((crop,i)=>{
        const x=[185,505,825,530][i],y=[145,120,155,410][i],f=game.farms[crop.id];
        const canOpen=f.unlocked||(game.coins>=crop.unlockCost&&(i===0||game.farms[CROPS[i-1].id].unlocked));
        return <g key={crop.id} transform={`translate(${x} ${y})`}>
          <path d="M0-94 136-23 0 65-136-23Z" fill={f.unlocked?'#98bb6e':'#b0b98c'} stroke="#e6edc0" strokeWidth="5"/>
          {Array.from({length:36},(_,j)=>{const r=Math.floor(j/6),c=j%6;return <path key={j} d={`M${(c-r)*17} ${-68+(c+r)*9}l15 8-15 8-15-8Z`} fill={f.unlocked&&j<f.plots.length?'#99724b':'#b4ca8e'} stroke="#dbe5b5" strokeWidth="1"/>;})}
          <text y="-108" textAnchor="middle" fill="#38583d" fontSize="16" fontWeight="800">{names[i]}</text>
          <foreignObject x="-130" y="74" width="260" height="80"><button className="map-region-action" aria-label={`${names[i]} ${f.unlocked?'bölgesine git':'bölgesini aç'}`} disabled={!canOpen} onClick={()=>onChoose(crop.id)}>{f.unlocked?'Çiftliğe git':`Bölgeyi aç · ${formatNumber(crop.unlockCost)} altın`}<small>{f.unlocked?`${f.plots.length} parsel · ${f.plots.length*4} ekim karesi`:i>0&&!game.farms[CROPS[i-1].id].unlocked?'Önce önceki bölgeyi aç':'Yeni bir başlangıç'}</small></button></foreignObject>
        </g>;
      })}
      <g transform="translate(905 460)"><path d="M0-65 95-16 0 40-95-16Z" fill="#a8bba0" stroke="#d4dfb9" strokeWidth="3" strokeDasharray="8 7"/><text textAnchor="middle" y="-10" fill="#5f775c" fontSize="26">♧</text><text textAnchor="middle" y="65" fill="#42674b" fontSize="13">Mera & seralar</text><text textAnchor="middle" y="87" fill="#66836a" fontSize="11">Gelecek bölgeler</text></g>
    </svg>
  </div>;
}
