export default class TowerExtension extends StructureTower {
  public work(): void {
    // 攻击敌人
    this.room.find(FIND_HOSTILE_CREEPS)
    const target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if(target) {
      this.attack(target)
      return
    }

    // 修
    if (this.store.getUsedCapacity(RESOURCE_ENERGY) >= this.store.getCapacity(RESOURCE_ENERGY) * 0.8) {
      const needRepairs: Structure[] = this.room.find(FIND_STRUCTURES, {
        filter: s => s.hits < s.hitsMax && s.structureType !== STRUCTURE_WALL
      })

      this.repair(needRepairs[Math.floor(Math.random() * needRepairs.length)])
      return
    }
  }
}