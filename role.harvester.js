const { ROLE_TYPE_HARVESTER } = require("./role.constant")

module.exports = {
    run: creep => {
        const sidejob = creep.memory.sidejob
        if (sidejob && sidejob !== ROLE_TYPE_HARVESTER) {
            return creep.pcSideJob()
        }
        var err = creep.pcHarvest()
        if (err === ERR_FULL) {
            var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: s => (
                    s.structureType === STRUCTURE_CONTAINER || 
                    s.structureType === STRUCTURE_SPAWN ||
                    s.structureType === STRUCTURE_EXTENSION
                ) && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            })
            
            if(target) {
                return creep.pcTransfer(target)
            }
            return OK
        }
        
        return err
    },
}