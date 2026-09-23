import { useEffect, useRef, useState } from 'react';
import FarmScene from './FieldWorld';
import FarmMap from './FarmMap';
import { CROPS, createGame, tick, upgrade, hireWorker, unlockCrop, productionRate, formatNumber, loadGame, serializeGame, addPlot, harvestPlot, upgradeTractor, upgradeTruck } from './game';
import type { CropId, GameState } from './types';
import './App.css';

const SAVE_KEY = 'filiz-idle-farm-v1';
const regionNames: Record<CropId, string> = { tomato: 'Domates Bahçesi', pepper: 'Biber Tarlası', strawberry: 'Çilek Vadisi', honey: 'Bal Ormanı' };
function initialGame() { try { return loadGame(localStorage.getItem(SAVE_KEY)); } catch { return createGame(); } }

export default function App() {
  const [game, setGame] = useState<GameState>(initialGame);
  const [notice, setNotice] = useState('');
  const [saved, setSaved] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [showMap,setShowMap] = useState(false);
  const gameRef = useRef(game);
  gameRef.current = game;
  const farm = game.farms[game.selectedCrop];
  const workers = farm.plots.filter(plot => plot.worker).length;
  const income = CROPS.reduce((sum, crop) => sum + productionRate(game, crop.id), 0);

  useEffect(() => {
    let lastTime = Date.now();
    const timer = window.setInterval(() => {
      const now = Date.now();
      const elapsed = Math.min(8 * 3600, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      setGame(current => tick(current, elapsed));
    }, 100);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const save = () => {
      try { localStorage.setItem(SAVE_KEY, serializeGame({ ...gameRef.current, lastSaved: Date.now() })); setSaved(true); }
      catch { setSaved(false); }
    };
    const timer = window.setInterval(save, 1500);
    const onVisibility = () => { if (document.visibilityState === 'hidden') save(); };
    window.addEventListener('pagehide', save);
    document.addEventListener('visibilitychange', onVisibility);
    return () => { window.clearInterval(timer); window.removeEventListener('pagehide', save); document.removeEventListener('visibilitychange', onVisibility); save(); };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    const update = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch { setNotice('Bu tarayıcı tam ekranı desteklemiyor. Oyun pencerenin tamamını kullanmaya devam ediyor.'); }
  }
  function act(transform: (current: GameState) => GameState, message?: string) {
    const current = gameRef.current;
    const next = transform(current);
    if (next === current) return;
    gameRef.current = next;
    setGame(next);
    if (message) setNotice(message);
  }
  function chooseRegion(id: CropId) {
    if (game.farms[id].unlocked) act(current => ({ ...current, selectedCrop: id }));
    else act(current => unlockCrop(current, id), `${regionNames[id]} açıldı!`);
    if(gameRef.current.farms[id].unlocked)setShowMap(false);
  }
  const nextRegion = CROPS.find(crop => !game.farms[crop.id].unlocked);
  const goal = workers === 0 ? 'İlk çiftçini işe al, hasadı otomatikleştir.' : farm.plots.length < 4 ? 'Yeni 2 × 2 alanlar açarak tarlanı büyüt.' : nextRegion ? `${nextRegion.name} için ${formatNumber(nextRegion.unlockCost)} altın biriktir.` : 'Tarlalarını ve traktörünü geliştirmeye devam et.';

  return <main className="game-screen">
    <div className="game-world">{showMap?<FarmMap game={game} onChoose={chooseRegion}/>:<FarmScene key={game.selectedCrop} game={game}
      onHarvest={index => act(current => harvestPlot(current, current.selectedCrop, index))}
      onUpgrade={index => act(current => upgrade(current, current.selectedCrop, index))}
      onHire={index => act(current => hireWorker(current, current.selectedCrop, index), 'Yeni çiftçin hasat ve taşımayı devraldı.')}
      onExpand={() => act(current => addPlot(current, current.selectedCrop), 'Yeni 2 × 2 alan ekildi. Çiftliğin büyüyor!')}
      onTractorUpgrade={kind => act(current => upgradeTractor(current, kind))}
      onTruckUpgrade={()=>act(current=>upgradeTruck(current))}
    />}</div>
    <header className="game-hud">
      <div className="game-brand"><span className="brand-leaf">❧</span><span>filiz<small>IDLE FARM</small></span></div>
      <div className="hud-pill hud-coins"><span className="coin-emblem" aria-hidden="true">₡</span><div><small>ALTIN</small><strong>{formatNumber(game.coins)}</strong></div></div>
      <div className="hud-pill hud-income"><span className="income-emblem" aria-hidden="true">↗</span><div><small>ÜRETİM DEĞERİ /sn</small><strong>{formatNumber(income)} <em>altın</em></strong></div></div>
      <div className="hud-spacer"/>
      <div className="hud-pill hud-farm"><span>🌱</span><div><strong>{farm.plots.length} alan <i>·</i> {workers} çiftçi</strong><small>{regionNames[game.selectedCrop]}</small></div></div>
      <div className={`save-indicator ${saved ? '' : 'save-failed'}`} title={saved ? 'Bu tarayıcıya otomatik kaydediliyor' : 'Tarayıcı kaydı kullanılamıyor'}><span/>{saved ? 'Kayıt açık' : 'Kayıt hatası'}</div>
      <button className="fullscreen-button" onClick={toggleFullscreen} aria-label={fullscreen ? 'Tam ekrandan çık' : 'Tam ekran'} title={fullscreen ? 'Tam ekrandan çık' : 'Tam ekran'}>{fullscreen ? '⊡' : '⛶'}</button>
    </header>
    <footer className="game-bottom">
      <div className="game-guidance"><span className="goal-label">SIRADAKİ ADIM</span><strong>{goal}</strong><p>Çiftçi → traktör → depo → satış kamyonu</p></div>
      <button className="map-toggle" onClick={()=>setShowMap(v=>!v)} aria-label={showMap?'Çiftliğe dön':'Dünya haritasını aç'}><svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m3 7 9-3 8 3 9-3v21l-9 3-8-3-9 3ZM12 4v21M20 7v21"/></svg><span>{showMap?'Çiftliğe dön':'Dünya haritası'}<small>{showMap?'TARLALARIM':'FİLİZ VADİSİ'}</small></span></button>
      <span className="prototype-label">PROTOTİP 0.3</span>
    </footer>
    {notice && <div className="game-toast" role="status"><span>✦</span>{notice}<button aria-label="Bildirimi kapat" onClick={() => setNotice('')}>×</button></div>}
  </main>;
}
