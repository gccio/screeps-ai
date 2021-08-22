const { 
    ROLE_TYPE_REPAIRER, 
    ROLE_TYPE_UPGRADER,
 } = require("./role.constant")

module.exports = {
    run: creep => {
        const sidejob = creep.memory.sidejob
        if (sidejob && sidejob !== ROLE_TYPE_REPAIRER) {
            return creep.pcSideJob()
        }
        var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: s => s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART && s.hits < s.hitsMax,
        })
        if(target) {
            var err = creep.repair(target)
            if(err == ERR_NOT_IN_RANGE) {
                return creep.pcMoveTo(target)
            }
            return err
        }
        creep.setSideJob(ROLE_TYPE_UPGRADER)
        return OK
    }
}