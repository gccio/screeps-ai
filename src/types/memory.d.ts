interface Memory {
  creepConfigs: { string?: CreepConfig }
  stats: any
}

interface CreepConfig {
  role: BaseRoleConstant
  args: CreepArgs
  bodys: BodyAutoConfigConstant | BodyPartConstant[]
  spawnRoom: string
}

interface CreepMemory {
  // 角色
  role: string
  // 是否就绪，在prepare生命周期过之后为true
  ready: boolean
  // 工作状态
  // true在工作，false未工作，可能在采集资源路上
  working: boolean
  // constructionSiteId 建筑工地id
  csid: string
  // 能源生产者id，一般指source、container、storage之类
  producerId: string
  // 能源消费者id，一般指wall、建筑工地之类
  consumerId: string
  // 站岗，拒绝对穿
  standguard: boolean
  // 寻路缓存
  _move: {
    prev: string // 上一tick的位置
    path: string // 路线
    dst: string // 目标坐标
    tick: number // 游戏时间
  }
}

interface RoomMemory {
  // spawn的工作队列，value是要生产的creep名字
  spawnList: string[]
}
