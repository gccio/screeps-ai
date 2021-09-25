export default (args: WorkerArgs) => {
  const obj = {
    // collector使用worker的body定义
    bodys: 'worker' as BodyAutoConfigConstant,
    prepare: (creep: Creep) => {
      creep.memory.producerId = args.producerId
      creep.memory.consumerId = args.consumerId
      return true
    },
    produce: (creep: Creep) => {
      if (!creep.store.getFreeCapacity(RESOURCE_ENERGY)) {
        creep.memory.producerId = args.producerId
        obj.consume(creep)
        return true
      }

      let producer: Source | Structure = Game.getObjectById(args.producerId)
      if (!producer) {
        return false
      }
      var err: ScreepsReturnCode = creep.harvestFrom(producer)
      // creep最多等待5个tick，如果此时没有能量可用，则考虑自己采集或换一个有能量的
      if (err === OK || Game.time % 5) {
        return false
      }

      producer = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: s => (s instanceof StructureContainer || s.structureType === STRUCTURE_STORAGE || s.structureType === STRUCTURE_TERMINAL) && s.store.getUsedCapacity(RESOURCE_ENERGY),
      })
      if (!producer) {
        producer = creep.pos.findClosestByPath(FIND_SOURCES)
      }

      creep.memory.producerId = producer.id
      creep.harvestFrom(producer)

      return false
    },
    consume: (creep: Creep) => {
      if (!creep.store.getUsedCapacity(RESOURCE_ENERGY)) {
        creep.memory.consumerId = args.consumerId
        obj.produce(creep)
        return true
      }

      let consumer: StructureExtension | StructureSpawn | StructureTower = Game.getObjectById(creep.memory.consumerId)
      if (consumer && !consumer.store.getFreeCapacity(RESOURCE_ENERGY)) {
        consumer = null
      }
      // 优先填充生产creep的建筑
      if (!consumer) {
        consumer = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
          filter: (s: StructureExtension | StructureSpawn) => {
            const isExpectType = s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_SPAWN
            return isExpectType && s.store.getFreeCapacity(RESOURCE_ENERGY)
          }
        })
      }
      // 不存在则填充炮塔
      if (!consumer) {
        consumer = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
          filter: (s: StructureTower) => s.structureType === STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 50,
        })
      }

      if (consumer) {
        creep.memory.consumerId = consumer.id
        creep.transferTo(consumer, RESOURCE_ENERGY)
      } else {
        // 不记录consumerId，随时打断
        creep.upgradeRoomController(creep.room.controller)
      }

      return false
    },
  }

  return obj
}
