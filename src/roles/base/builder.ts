import { RampartHitMax } from "@/setting"

export default (args: WorkerArgs) => {
  const obj = {
    bodys: 'worker' as BodyAutoConfigConstant,
    isNeed: (room: Room, creepName: string): boolean => {
      if (creepName.indexOf('repair') !== -1) {
        return true
      }
      const sites: ConstructionSite[] = room.find(FIND_MY_CONSTRUCTION_SITES)
      const wallRampart: Structure[] = room.find(FIND_MY_STRUCTURES, {
        filter: (s: Structure) => (s.structureType === STRUCTURE_RAMPART || s.structureType === STRUCTURE_WALL) && s.hits < RampartHitMax[room.controller.level - 1]
      })

      return sites.length > 0 || wallRampart.length > 0
    },
    prepare: (creep: Creep): boolean => {
      if (args.consumerId) {
        creep.memory.consumerId = args.consumerId
      }
      if (args.producerId) {
        creep.memory.producerId = args.producerId
      }
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
        creep.memory.consumerId = args.consumerId
        obj.produce(creep)
        return true
      }

      let s: Structure
      if (creep.memory.consumerId) {
        s = Game.getObjectById(creep.memory.consumerId)
      }

      var err: ScreepsReturnCode

      // 有对应的consumer建筑
      if (s) {
        if (s instanceof ConstructionSite) {
          err = creep.build(s)
        } else if (s instanceof StructureController) {
          err = creep.upgradeController(s)
        } else {
          if (s.hits < s.hitsMax) {
            err = creep.repair(s)
          } else {
            creep.memory.consumerId = args.consumerId
            return false
          }
        }

        if (err === ERR_NOT_ENOUGH_ENERGY) {
          creep.memory.consumerId = args.consumerId
          obj.produce(creep)
          return true
        }
        if (err === ERR_NOT_IN_RANGE) {
          creep._moveTo(s)
          return false
        }
        if (err === OK) {
          return false
        }
      }
      // 其他工地
      const site = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES)
      if (site) {
        creep.memory.consumerId = site.id
        creep._moveTo(site)
        return false
      }

      // 修理各种
      s = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: s => s.hits < s.hitsMax && s.structureType !== STRUCTURE_WALL
      })
      if (s) {
        creep.memory.consumerId = s.id
        creep._moveTo(s)
        return false
      }

      // 刷墙和保护
      if (creep.room.controller) {
        const level: number = creep.room.controller.level
        s = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: s => s.hits < s.hitsMax && ((s.hits <= RampartHitMax[level - 1] && s.structureType === STRUCTURE_WALL) || s.structureType === STRUCTURE_RAMPART)
        })
      }
      if (s) {
        creep.memory.consumerId = s.id
        creep._moveTo(s)
        return false
      }

      // 升级controller
      creep.memory.consumerId = creep.room.controller.id
      return false
    }
  }

  return obj
}
