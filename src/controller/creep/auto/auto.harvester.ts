import creepAPI from "../api"

const getStats = (room: Room) => ({
  roomName: room.name,
  sources: room
    .find(FIND_SOURCES)
    .filter((s: Source) => !s.pos.lookFor(LOOK_FLAGS).filter((f: Flag) => f.name.indexOf('ignore') !== -1).length)
    .map<HarvesterArgs>((s: Source): HarvesterArgs => {
      const args = {
        producerId: s.id,
        consumerId: '',
      } as HarvesterArgs

      // 找找link
      const links: StructureLink[] = s.pos.findInRange(FIND_STRUCTURES, 2, {
        filter: s => s.structureType === STRUCTURE_LINK,
      })
      if (links && links.length) {
        args.consumerId = links[0].id
        return args
      }

      // 找找container
      const conatiners: StructureContainer[] = s.pos.findInRange(FIND_STRUCTURES, 2, {
        filter: s => s.structureType === STRUCTURE_CONTAINER,
      })
      if (conatiners && conatiners.length) {
        args.consumerId = conatiners[0].id
        return args
      }

      // 没有container也没有link，那就让harvester自己找吧
      return args
    }) || [],
})

export default (room: Room) => {
  const producerIds = Object.values(Memory.creepConfigs || {})
    .filter((config: CreepConfig) => config.role === 'harvester')
    .map((config: CreepConfig) => (config.args as HarvesterArgs).producerId)

  const argslist: HarvesterArgs[] = getStats(room).sources.filter(source => producerIds.indexOf(source.producerId) === -1)
  argslist.forEach((args: HarvesterArgs) => {
    const producerId = args.producerId
    const name = `harvester-${producerId.substr(-6, 6)}`
    creepAPI.Add(name, 'harvester', args, room.name)
  })
}
