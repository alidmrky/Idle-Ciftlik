export type CropId = 'tomato' | 'pepper' | 'strawberry' | 'honey';
export type Plot = { level:number; progress:number; ready:number; waiting:number; worker:boolean; workerPhase:'idle'|'harvesting'|'carrying'|'returning'; workerProgress:number; carrying:number };
export type Farm = { unlocked:boolean; plots:Plot[]; stock:number };
export type Tractor = { capacityLevel:number; speedLevel:number; phase:'loading'|'outbound'|'returning'; progress:number; cargo:number; cargoValue:number; cropId:CropId; plotIndex:number };
export type Truck = { phase:'loading'|'outbound'|'returning'; progress:number; cargo:number; cargoValue:number; level:number };
export type GameState = { version:3; coins:number; totalEarned:number; totalSold:number; selectedCrop:CropId; farms:Record<CropId,Farm>; tractor:Tractor; truck:Truck; lastSaved:number; elapsed:number };
