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
      let consumer: StructureContainer | ConstructionSite | Source = Game.getObjectById<StructureContainer | ConstructionSite>(consumerId)
      const producer = Game.getObjectById<Source>(producerId)

      // 未在内存中找到container，尝试在Source周围找
      if (!consumer) {
        // 尝试在能源周围找container
        const containers = producer.pos.findInRange<StructureContainer>(FIND_STRUCTURES, 1, {
          filter: s => s.structureType === STRUCTURE_CONTAINER
        })

        // 找到了就把 container 当做目标
        if (containers.length > 0) {
          consumer = containers[0]
        }
      }

      // 未在Source周围找到container，尝试找container的工地
      if (!consumer) {
        const constructionSite = producer.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
          filter: s => s.structureType === STRUCTURE_CONTAINER
        })

        if (constructionSite.length > 0) {
          consumer = constructionSite[0]
        }
      }

      // 也没找到工地，那先向着Source走
      if (!consumer) {
        consumer = producer
      }
      args.consumerId = consumer.id

      creep._moveTo(producer)

      return creep.pos.inRangeTo(producer.pos, 1)
    },
    produce: (creep: Creep) => {
      if (creep.ticksToLive < 2) {
        creep.drop(RESOURCE_ENERGY)
        return true
      }

      // 采矿已经满了，结束工作
      if (!creep.store.getFreeCapacity(RESOURCE_ENERGY)) {
        obj.consume(creep)
        return true
      }
      const source: Structure | Source = Game.getObjectById(creep.memory.producerId)
      const droppeds = source.pos.findInRange(FIND_DROPPED_RESOURCES, 2)
      if (droppeds.length > 0) {
        creep.pickupFrom(droppeds[0])
        return false
      } else {
        creep.harvestFrom(source)
      }

      return false
    },
    consume: (creep: Creep) => {
      if (creep.store[RESOURCE_ENERGY] <= 0) {
        obj.produce(creep)
        return true
      }
      const consumerId = creep.memory.consumerId
      let consumer = Game.getObjectById<StructureContainer | Source>(consumerId)

      // 找到了container，将能量放进去
      if (consumer instanceof StructureContainer) {
        return creep.transferTo(consumer, RESOURCE_ENERGY) === OK
      }

      // 尝试搜索一下source周围的container
      const producer: Source = Game.getObjectById(creep.memory.producerId)
      const containers = producer.pos.findInRange(FIND_STRUCTURES, 1, {
        filter: s => s.structureType === STRUCTURE_CONTAINER,
      })
      if (containers && containers.length) {
        creep.memory.consumerId = containers[0].id
        obj.consume(creep)
        return true
      }

      // 在没找到container的情况，尝试找一下container的工地
      let containerSite: ConstructionSite
      // 如果有csid属性，的话
      if (creep.memory.csid) {
        containerSite = Game.getObjectById<ConstructionSite>(creep.memory.csid)
        if (containerSite) {
          creep.build(containerSite)
          return false
        }
      }

      // 没有csid或没有根据csid找到container工地，尝试在source周围找container工地
      const containerSites = producer.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
        filter: s => s.structureType === STRUCTURE_CONTAINER,
      })
      if (containerSites && containerSites.length) {
        containerSite = containerSites[0]
      }
      if (containerSite) {
        // 找到了工地
        creep.memory.csid = containerSite.id
        creep.build(containerSite)
      } else {
        // 没找到工地缓存且周围没有工地，重新创建一个
        creep.pos.createConstructionSite(STRUCTURE_CONTAINER)
      }
      return false
    },
  }

  return obj
}
