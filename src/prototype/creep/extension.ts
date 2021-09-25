import roles from '@/roles'
import { defaultCreepMemory } from '@/setting'
import { serializePos, turnAround } from '@/utils'

export default class CreepExtension extends Creep {
  public work() {
    const role = this.memory.role
    if (!(role in roles)) {
      return
    }
    if (this.spawning) {
      return
    }

    const creepConfig: CreepConfig = Memory.creepConfigs[this.name]
    if (!creepConfig) {
      console.log(`无法找到${this.name}的配置，自杀了，有缘再见。`)
      this.suicide()
      return
    }
    const args: CreepArgs = creepConfig.args
    const creepArgs: ICreepConfig = roles[role](args)
    if (!this.memory.ready) {
      this.memory.ready = creepArgs.prepare ? creepArgs.prepare(this) : true
    }
    if (!this.memory.ready) {
      return
    }

    const working = creepArgs.produce ? this.memory.working : true
    let fn = (_: Creep): boolean => false
    if (working) {
      fn = creepArgs.consume || fn
    } else {
      fn = creepArgs.produce || fn
    }

    if (fn(this)) {
      this.memory.working = !this.memory.working
    }
  }

  // harvestFrom 采集资源
  public harvestFrom(dst: Structure | Source | Tombstone, resourceType: ResourceConstant = RESOURCE_ENERGY): ScreepsReturnCode {
    let err: ScreepsReturnCode

    if (dst instanceof Structure || dst instanceof Tombstone) {
      err = this.withdraw(dst, resourceType)
    } else if (dst instanceof Resource) {
      err = this.pickup(dst)
    } else {
      err = this.harvest(dst)
    }

    if (err === ERR_NOT_IN_RANGE) {
      this._moveTo(dst)
      return OK
    }

    return err
  }

  // transferTo 转移资源到结构
  public transferTo(dst: Structure, RESOURCE: ResourceConstant): ScreepsReturnCode {
    let err = this.transfer(dst, RESOURCE)
    if (err === ERR_NOT_IN_RANGE) {
      let range = (this.memory.role === 'harvester' && dst.structureType === STRUCTURE_CONTAINER) ? 0 : 1
      this._moveTo(dst, range)
    }
    return err
  }

  public repairTo(dst: Structure): ScreepsReturnCode {
    let err = this.repair(dst)
    if (err === ERR_NOT_IN_RANGE) {
      this._moveTo(dst)
    }
    return err
  }

  public pickupFrom(dst: Resource): ScreepsReturnCode {
    let err = this.pickup(dst)
    if (err === ERR_NOT_IN_RANGE) {
      this._moveTo(dst)
    }
    return err
  }

  public upgradeRoomController(dst?: StructureController): ScreepsReturnCode {
    dst = dst || this.room.controller
    if (!dst) {
      return ERR_NOT_FOUND
    }
    let err = this.upgradeController(dst)
    if (err === ERR_NOT_IN_RANGE) {
      this._moveTo(dst)
    }
    return err
  }

  // findPath 寻路
  // TODO 考虑如何缓存寻路结果，在缓存时需要考虑房间位置变化时对寻路结果的影响
  public findPath(dst: RoomPosition, range: number): string | null {
    if (!this.memory._move) {
      this.memory._move = { ...defaultCreepMemory._move }
    }

    const result = PathFinder.search(this.pos, { pos: dst, range }, {
      plainCost: 2,
      swampCost: 10,
      maxOps: 4000,
      roomCallback: (roomName: string): boolean | CostMatrix => {
        const room = Game.rooms[roomName]
        if (!room) {
          return
        }

        const costs = new PathFinder.CostMatrix
        room.find(FIND_STRUCTURES).forEach((s: AnyStructure) => {
          const { x, y } = s.pos
          const isRoad = s.structureType === STRUCTURE_ROAD
          if (isRoad) {
            costs.set(x, y, 1)
            return
          }

          // container按照plain处理
          const isContainer = s.structureType === STRUCTURE_CONTAINER
          if (isContainer) {
            costs.set(x, y, 2)
            return
          }

          const canCross = s.structureType === STRUCTURE_CONTAINER || (s.structureType === STRUCTURE_RAMPART && s.my)
          if (!canCross) {
            costs.set(x, y, 255)
            return
          }
        })

        room.find(FIND_CREEPS).forEach(c => {
          const { x, y } = c.pos
          if (!c.my) {
            costs.set(x, y, 255)
            return
          }

          if (c.memory.standguard) {
            costs.set(x, y, 255)
            return
          }

          costs.set(x, y, 6)
        })

        return costs
      }
    })

    if (result.path.length <= 0) {
      return ''
    }

    return this.pathToDirectionString(result.path)
  }


  // pathToDirectionString 将path转为每一步要走的方向
  public pathToDirectionString(posList: RoomPosition[]): string {
    if (posList.length == 0) {
      return ''
    }

    // 确保路径的第一个位置是自己的当前位置
    if (!posList[0].isEqualTo(this.pos)) {
      posList.splice(0, 0, this.pos)
    }
    return posList.map((pos, index) => {
      // 最后一个位置就不用再移动
      if (index >= posList.length - 1) {
        return null
      }
      // 由于房间边缘地块会有重叠，所以这里筛除掉重叠的步骤
      if (pos.roomName != posList[index + 1].roomName) {
        return null
      }
      // 获取到下个位置的方向
      return pos.getDirectionTo(posList[index + 1])
    }).join('')
  }

  // _moveTo 用来替代moveTo。内含寻路优化和对穿功能。
  public _moveTo(dst: RoomPosition | { pos: RoomPosition }, range: number = 1): CreepMoveReturnCode | ERR_INVALID_TARGET | ERR_NO_PATH {
    // 疲劳不移动
    if (this.fatigue) {
      return ERR_TIRED
    }

    let pos: RoomPosition
    if (dst instanceof RoomPosition) {
      pos = dst
    } else {
      pos = dst.pos
    }

    // 到达目的地直接返回OK
    if (this.pos.isEqualTo(pos)) {
      return OK
    }

    if (!this.memory._move) {
      this.memory._move = { ...defaultCreepMemory._move }
    }

    const roomName = this.room.name
    const curDst = serializePos(roomName, pos)

    // 没有路径缓存，或目的地变化时，重新寻路。
    if (!(this.memory._move.path && curDst === this.memory._move.dst)) {
      this.memory._move.dst = curDst
      this.memory._move.path = this.findPath(pos, range)
    }

    // 依然没有路线，清空路线
    if (!this.memory._move.path) {
      this.say(`无路可走`)
      console.log(`${this.name}无法从${this.pos}到达目的地${pos}，findPath失败。`)
      return OK
    }

    // 使用缓存进行移动
    const err = this.moveWithCache()
    // 如果发生撞停或者参数异常的话说明缓存可能存在问题，移除缓存
    // 除异常目标外的其他异常直接报告
    if (err === ERR_INVALID_TARGET) {
      console.log(`${this.name}在${this.pos}尝试使用缓存移动失败。当前缓存路径${this.memory._move.path}。`)
      this.say(`目标异常`)
      this.memory._move.prev = ''
    } else if (err != OK && err != ERR_TIRED) {
      this.say(`unknown dst`)
    }

    // 本回合未能移动
    if (err !== OK && this.memory._move.prev === `${this.pos.x}/${this.pos.y}`) {
      this.memory._move.path = ''
    }

    return err
  }

  // moveWithCache 根据缓存移动
  public moveWithCache(): CreepMoveReturnCode | ERR_INVALID_TARGET | ERR_NO_PATH {
    // 获取方向，进行移动，尝试对穿。
    const direction = Number(this.memory._move.path[0]) as DirectionConstant
    if (this.memory._move.prev !== `${this.pos.x}/${this.pos.y}`) {
      const err = this.moveWithRecord(direction)
      if (err === OK) {
          this.memory._move.path = this.memory._move.path.substr(1);
          return OK
      }
  }

    const mutualResutl = this.mutualCross(direction)
    // 没找到说明撞墙上了或者前面的 creep 拒绝对穿，重新寻路
    if (!mutualResutl) {
      return ERR_INVALID_TARGET
    }

    this.memory._move.path = this.memory._move.path.substr(1)
    return OK
  }

  // mutualCross 对穿
  public mutualCross(direction: DirectionConstant): boolean {
    // 获取前方位置
    const nextPos = this.pos.directionToPos(direction)
    if (!nextPos) {
      return false
    }

    // 查看前方位置是否为creep，如果不是creep则直接返回false
    const frontCreep = nextPos.lookFor(LOOK_CREEPS)[0]
    if (!frontCreep) {
      return false
    }

    // 如果前面的creep不同意对穿，返回false
    if (!frontCreep.acceptMutual(turnAround(direction))) {
      console.log(`${this.name}尝试向${direction}方向的${frontCreep.name}发起对穿失败。`)
      return false
    }

    // 对方接受对穿，进行移动
    return this.moveWithRecord(direction) === OK
  }

  // acceptMutual 尝试接受对穿
  public acceptMutual(direction: DirectionConstant): boolean {
    // 疲劳不对穿
    if (this.fatigue) {
      return false
    }
    
    // this下没有memory说明creep已经凉了，直接移动即可
    if (!this.memory) {
      return true
    }

    // 拒绝对穿
    if (this.memory.standguard) {
      return false
    }

    // 检查当前creep的移动路线
    this.memory._move = this.memory._move || { ...defaultCreepMemory._move }
    const curPath = this.memory._move.path

    // 当前creep刚好也要到指定位置，索性接受
    const next: DirectionConstant = Number(curPath[0]) as DirectionConstant
    if (next === direction && this.moveWithRecord(direction) === OK) {
      this.memory._move.path = curPath.substr(1)
      return true
    }

    // 当前creep本来也要离开这个位置，直接进行
    if (curPath) {
      return this.moveWithCache() === OK
    }

    // 当前creep并不想到这个位置，但可以接受位置交换
    if (this.moveWithRecord(direction) === OK) {
      // 交换位置后，在原行进路线上增加回到原位置的方向
      this.memory._move.path = turnAround(direction) + this.memory._move.path
      return true
    }

    // 当前creep对穿失败
    return false
  }

  // moveWithRecord 移动并记录当前回合已移动
  public moveWithRecord(direction: DirectionConstant): CreepMoveReturnCode {
    if (this.memory._move.tick === Game.time) {
      return OK
    }
    const err = this.move(direction)
    if (err === OK) {
      this.memory._move.tick = Game.time
      this.memory._move.prev = `${this.pos.x}/${this.pos.y}`
    } else if (err === ERR_TIRED) {
      return OK
    } else {
      console.log(`${this.name}在${this.pos}朝方向${direction}移动失败，错误信息为${err}.`)
    }
    return err
  }
}
