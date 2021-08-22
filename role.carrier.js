const { 
    ROLE_TYPE_CARRIER,
    ROLE_TYPE_REPAIRER,
} = require("./role.constant")

module.exports = {
    run: creep => {
        var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: s => {
                if ((s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION) && s.store.getFreeCapacity(RESOURCE_ENERGY) >0) {
                    return true
                }
                
                if (s.structureType === STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 150) {
                    return true
                }
                
                return false
            }
        })
        const sidejob = creep.memory.sidejob
        if (!target && sidejob && sidejob !== ROLE_TYPE_CARRIER) {
            return creep.pcSideJob()
        }
        var err = creep.pcHarvest()
        if (err === ERR_FULL) {
            if (target) {
               return creep.pcTransfer(target)
            }
            creep.setSideJob(ROLE_TYPE_REPAIRER)
            return OK
        }
        return err
	}
}