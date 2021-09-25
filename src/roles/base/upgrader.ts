const HarvesteStructureList = [STRUCTURE_CONTAINER, STRUCTURE_STORAGE, STRUCTURE_TERMINAL]

export default (args: UpgraderArgs) => {
  const obj = {
    bodys: 'upgrader' as BodyAutoConfigConstant,
    prepare: (creep: Creep): boolean => {
      creep.memory.consumerId = creep.room.controller.id
      creep.memory.producerId = args.producerId
      return true
    },
    produce: (creep: Creep): boolean => {
      if (!creep.store.getFreeCapacity(RESOURCE_ENERGY)) {
        creep.memory.producerId = args.producerId
        obj.consume(creep)
        return true
      }
      let producer: Structure | Source

      if (creep.memory.producerId) {
        producer = Game.getObjectById(creep.memory.producerId)
      }

      if (producer) {
        var err: ScreepsReturnCode = creep.harvestFrom(producer)
        // creep最多等待5个tick，如果此时没有能量可用，则考虑自己采集或换一个有能量的
        if (err === OK || Game.time % 5) {
          return false
        }
      }
      producer = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: s => (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE || s.structureType === STRUCTURE_TERMINAL) && s.store.getUsedCapacity(RESOURCE_ENERGY),
      })
      if (!producer) {
        producer = creep.pos.findClosestByPath(FIND_SOURCES)
      }

      creep.memory.producerId = producer.id
      creep.harvestFrom(producer)
      return false
    },
    consume: (creep: Creep): boolean => {
      if (!creep.store.getUsedCapacity(RESOURCE_ENERGY)) {
        creep.memory.standguard = false
        obj.produce(creep)
        return true
      }
      const roomController: StructureController = Game.getObjectById(creep.memory.consumerId)
      const err = creep.upgradeRoomController(roomController)
      creep.memory.standguard = err === OK
      return false
    }
  }

  return obj
}