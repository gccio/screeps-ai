// Harvester的角色
// 主要负责采集能量
// 如果有container，则将能量放在container中，之后由收集者收集走
// 如果没有container，则在target旁边一格的位置建造一个container工地，之后进行建筑
//
// 关于source和target
// 对于harvester有一些特殊，harvester的工作就是采集资源，所以producerId是采集目标的id，consumerId是消耗能源的id
export default (args: HarvesterArgs) => {
  const obj = {
    bodys: 'harvester' as BodyAutoConfigConstant,
    isNeed: () => true,
    prepare: (creep: Creep) => {
      let consumerId = creep.memory.consumerId
      let producerId = args.producerId
      const consumer: StructureContainer | ConstructionSite | Source = Game.getObjectById<StructureContainer | ConstructionSite>(consumerId)
      const producer = Game.getObjectById<Source>(producerId)

      // harvester的consumer只能是container
      if (consumer) {
        creep._moveTo(consumer, 0)
        return creep.pos.inRangeTo(consumer.pos, 0)
      }

      // 未在内存中找到container，尝试在source周围找
      if (!consumer) {
        // 尝试在能源周围找container
        const containers = producer.pos.findInRange<StructureContainer>(FIND_STRUCTURES, 1, {
          filter: s => s.structureType === STRUCTURE_CONTAINER
        })

        // 找到了就把 container 当做目标
        if (containers.length > 0) {
          creep._moveTo(containers[0], 0)
          args.consumerId = containers[0].id
          return creep.pos.inRangeTo(consumer.pos, 0)
        }
      }

      // 未在Source周围找到container，尝试找container的工地
      if (!consumer) {
        const constructionSite = producer.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
          filter: s => s.structureType === STRUCTURE_CONTAINER
        })

        if (constructionSite.length > 0) {
          creep._moveTo(constructionSite[0])
          return creep.pos.inRangeTo(consumer.pos, 1)
        }
      }

      // 如果什么都没找到，就先向预定好的source出发
      creep._moveTo(producer)
      return creep.pos.inRangeTo(producer.pos, 1)
    },
    produce: (creep: Creep) => {
      // 如果harvester马上死亡，则丢掉能量，准备去死
      if (creep.ticksToLive < 2) {
        creep.drop(RESOURCE_ENERGY)
        return true
      }

      // 采矿已经满了，结束工作
      if (!creep.store.getFreeCapacity(RESOURCE_ENERGY)) {
        obj.consume(creep)
        return true
      }

      // 有丢掉的资源去捡资源
      // 没有就采集source
      const source = Game.getObjectById<Source>(creep.memory.producerId)
      const droppeds = source.pos.findInRange(FIND_DROPPED_RESOURCES, 2)
      if (droppeds.length > 0) {
        creep.pickupFrom(droppeds[0])
      } else {
        creep.harvestFrom(source)
      }
      return false
    },
    consume: (creep: Creep) => {
      // 如果harvester中没有能源了，则进行生产采集，并结束消费过程
      if (creep.store[RESOURCE_ENERGY] <= 0) {
        obj.produce(creep)
        return true
      }

      const consumerId = creep.memory.consumerId
      let consumer = Game.getObjectById<StructureContainer | Source>(consumerId)

      // 找到了container，将能量放进去
      if (consumer instanceof StructureContainer) {
        return !creep.transferTo(consumer, RESOURCE_ENERGY)
      }

      // 尝试搜索一下source周围的container
      const producer = Game.getObjectById<Source>(creep.memory.producerId)
      const containers = producer.pos.findInRange(FIND_STRUCTURES, 1, {
        filter: s => s.structureType === STRUCTURE_CONTAINER,
      })
      if (containers.length) {
        creep.memory.consumerId = containers[0].id
        return !creep.transferTo(containers[0], RESOURCE_ENERGY)
      }

      // 在没找到container的情况，尝试找一下container的工地
      let cs: ConstructionSite
      // 没有csid或没有根据csid找到container工地，尝试在source周围找container工地
      const css = producer.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
        filter: s => s.structureType === STRUCTURE_CONTAINER,
      })
      if (css.length) {
        // 找到了工地
        const err = creep.build(css[0])
        if (err === ERR_NOT_IN_RANGE) {
          creep._moveTo(css[0])
        }
      }
      return false
    },
  }

  return obj
}
