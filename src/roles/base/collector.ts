export default (args: WorkerArgs) => {
  const obj = {
    // collector使用worker的body定义
    bodys: 'collector' as BodyAutoConfigConstant,
    prepare: () => true,
    produce: (creep: Creep) => {
      if (creep.ticksToLive <= 3) {
        creep.drop(RESOURCE_ENERGY)
        return true
      }

      if (!creep.store.getFreeCapacity(RESOURCE_ENERGY)) {
        obj.consume(creep)
        return true
      }
      const s = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
        filter: t => t.store.getUsedCapacity(RESOURCE_ENERGY),
      })
      if (s) {
        creep.harvestFrom(s)
        return false
      }

      const t = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
        filter: t => t.store.getUsedCapacity(RESOURCE_ENERGY),
      })
      if (t) {
        creep.harvestFrom(t)
        return false
      }

      const producer: StructureContainer | StructureStorage = Game.getObjectById(args.producerId)
      if (!producer) {
        return false
      }
      creep.harvestFrom(producer)
      return false
    },
    consume: (creep: Creep) => {
      if (!creep.store.getUsedCapacity(RESOURCE_ENERGY)) {
        obj.produce(creep)
        return true
      }

      const consumer: Structure = Game.getObjectById(args.consumerId)
      // 找不到目标了，自杀并重新运行发布规划
      if (!consumer) {
        return false
      }

      creep.transferTo(consumer, RESOURCE_ENERGY)
    },
  }

  return obj
}
