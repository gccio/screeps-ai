const { 
    ROLE_TYPE_HARVESTER, 
    ROLE_TYPE_UPGRADER,
    ROLE_TYPE_REPAIRER,
    ROLE_TYPE_BUILDER,
 } = require("./role.constant")
 var roleHarvester = require('./role.harvester');
 var roleUpgrader = require('./role.upgrader');
 var roleBuilder = require('./role.builder');
 var roleCarrier = require('./role.carrier');
 var roleBirth = require('./role.birth');
const roleRepairer = require("./role.repairer");

// pcMoveTo 移动到目标地
/** @param {Structure} target **/
Creep.prototype.pcMoveTo = function(target) {
    var err = this.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}})
    if (err == ERR_TIRED || OK) {
        return OK
    }
    return err
}

// pcHarvest 针对角色收敛采集函数
// harvester: sources
// builder、upgrader...: conatiner
Creep.prototype.pcHarvest = function() {
    var source = null
    var usedCap = this.store.getUsedCapacity(RESOURCE_ENERGY)
    var freeCap = this.store.getFreeCapacity(RESOURCE_ENERGY)

    // 背包里有但是不满，且不是正在挖矿，说明正在工作
    if (usedCap && freeCap && !this.memory.harvesting) {
        return ERR_FULL
    }
    // 背包里满了，那就干活去
    if (!freeCap) {
        this.memory.harvesting = false
        return ERR_FULL
    }
    // 背包里没有，那就挖矿去
    if (!usedCap) {
        this.memory.harvesting = true
        if (this.memory.sidejob) {
            this.say('lost job')
            this.memory.sidejob = ""
        }
        this.say('🔄 harvest')
    }

    if (this.store.getFreeCapacity() <= 0) {
        return ERR_FULL
    }
    source = this.pos.findClosestByPath(FIND_RUINS, {
        filter: r => r.store.getUsedCapacity(RESOURCE_ENERGY) >= 50,
    })
    if (!source) {
        switch (this.memory.role) {
            case ROLE_TYPE_HARVESTER:
                if (this.memory.tid) {
                    source = Game.getObjectById(this.memory.tid)
                    break
                }
                source = this.pos.findClosestByPath(FIND_SOURCES)
                break
            case ROLE_TYPE_BUILDER:
                var sourceA = this.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: s => (
                        s.structureType === STRUCTURE_CONTAINER
                    ) && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
                })
                var sourceB = this.pos.findClosestByPath(FIND_SOURCES, {
                    filter: s=> s.energy,
                })

                const rangeA = this.pos.getRangeTo(sourceA)
                const rangeB = this.pos.getRangeTo(sourceB)
                source = rangeA < rangeB + 10 ? sourceA : sourceB
                if (!source) {
                    source = this.pos.findClosestByPath(FIND_SOURCES)
                }
                break
            default:
                if (this.memory.tid) {
                    source = Game.getObjectById(this.memory.tid)
                } else {
                    source = this.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: s => (
                            s.structureType === STRUCTURE_CONTAINER
                        ) && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
                    })
                }
                if (!source) {
                    source = this.pos.findClosestByPath(FIND_SOURCES)
                }
                break
        }
    }
    
    var err = OK
    if (!source) {
        return err
    }
    if (source.structureType === STRUCTURE_CONTAINER || source.ticksToDecay) {
        err = this.withdraw(source, RESOURCE_ENERGY)
    } else {
        err = this.harvest(source,RESOURCE_ENERGY)
    }
    if(err = ERR_NOT_IN_RANGE) {
        return this.pcMoveTo(source)
    }

    return err
}

// pcTransfer 运送能量到指定位置
// 位置支持Spawn、Container、Extension、Storage
/** @param {Structure} target **/
Creep.prototype.pcTransfer = function(target) {
    switch (target.structureType) {
        case STRUCTURE_SPAWN:
        case STRUCTURE_CONTAINER:
        case STRUCTURE_EXTENSION:
        case STRUCTURE_STORAGE:
        case STRUCTURE_TOWER:
            if (target.store.getFreeCapacity(RESOURCE_ENERGY)) {
                var err = this.transfer(target, RESOURCE_ENERGY)
                if(err == ERR_NOT_IN_RANGE) {
                    return this.pcMoveTo(target)
                }
                return err
            }
            break
    }
}

// pcSideJob 做副业
Creep.prototype.pcSideJob = function() {
    var err = OK
    switch (this.getSideJob()) {
        case ROLE_TYPE_BUILDER:
            err = roleBuilder.run(this)
            break
        case ROLE_TYPE_UPGRADER:
            err = roleUpgrader.run(this)
            break
        case ROLE_TYPE_REPAIRER:
            err = roleRepairer.run(this)
            break
        default:
            console.log("unsupport the sidejob: ", this.memory.sidejob)
            this.memory.sidejob = ""
    }
    if (err !== OK && err != ERR_TIRED) {
        console.log("sidejob failed with error: ", err)
        this.memory.sidejob = ""
    }
}

Creep.prototype.getSideJob = function() {
    return this.memory.sidejob
}

Creep.prototype.setSideJob = function(sidejob) {
    this.memory.sidejob = sidejob
}