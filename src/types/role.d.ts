// BaseRoleConstant Creep角色
type BaseRoleConstant = 'harvester' | 'collector' | 'upgrader' | 'filler' | 'builder'

// 所有creep角色的args
type CreepArgs = EmptyArgs | HarvesterArgs | WorkerArgs | UpgraderArgs

// ICreepConfig 每个role的抽象
interface ICreepConfig {
  // 每次死后都会进行判断，只有返回 true 时才会重新发布孵化任务
  isNeed?: (room: Room, creepName: string, preMemory: CreepMemory) => boolean
  // 准备阶段执行的方法, 返回 true 时代表准备完成
  prepare?: (creep: Creep) => boolean
  // creep 生产（从容器里拿也算一种生产）工作所需资源时执行的方法，
  // 返回 true 则执行consume阶段，返回其他将继续执行该方法
  produce?: (creep: Creep) => boolean
  // creep 消费当前身上资源的方法
  // 返回 true 则执行 source 阶段，返回其他将继续执行该方法
  consume: (creep: Creep) => boolean
  // 每个角色默认的身体组成部分
  bodys: BodyAutoConfigConstant | BodyPartConstant[]
}

// CreepWorkFn creep工作逻辑的集合
type CreepWorkFn = {
  [role in BaseRoleConstant]: (args: CreepArgs) => ICreepConfig
}

// 无参角色，就单纯的一个Creep
interface EmptyArgs { }

// HarvesterArgs 采集者的参数
interface HarvesterArgs {
  // 要采集source的id
  producerId: string
  // 存储目标id
  consumerId: string
}

// WorkerArgs 收集者的参数
interface WorkerArgs {
  // 能源来源的id
  producerId: string
  // 消费能源的目标id
  consumerId: string
}


// UpgraderArgs 升级者参数
interface UpgraderArgs {
  // 能源来源id
  producerId: string
}

// BodyAutoConfigConstant 自动规划身体类型，以下类型的详细规划定义在setting.ts 中
type BodyAutoConfigConstant = 'harvester' | 'worker' | 'upgrader' | 'collector'

// BodySet 身体部件配置信息
interface BodySet {
  [MOVE]?: number
  [CARRY]?: number
  [ATTACK]?: number
  [RANGED_ATTACK]?: number
  [WORK]?: number
  [CLAIM]?: number
  [TOUGH]?: number
  [HEAL]?: number
}

// BodyConfig 能量上限所对应的身体部位组成
type BodyConfig = {
  [level in 300 | 550 | 800 | 1300 | 1800 | 2300 | 5600 | 10000]: BodyPartConstant[]
}

// BodyConfigs 身体配置项类别，包含了所有角色类型的身体配置
type BodyConfigs = {
  [type in BodyAutoConfigConstant]: BodyConfig
}
