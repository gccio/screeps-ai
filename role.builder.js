const { 
    ROLE_TYPE_BUILDER,
    ROLE_TYPE_REPAIRER,
} = require("./role.constant")
 
module.exports = {
    run: creep => {
        const sidejob = creep.memory.sidejob
        if (sidejob && sidejob !== ROLE_TYPE_BUILDER) {
            return creep.pcSideJob()
        }
        var err = creep.pcHarvest()
        if (err == ERR_FULL) {
            var target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES)
            if (target) {
                var err = creep.build(target)
                if (err === ERR_NOT_IN_RANGE) {
                    return creep.pcMoveTo(target)
                }
                return err
            }
            creep.setSideJob(ROLE_TYPE_REPAIRER)
            return OK
        }
        return err
    }
}