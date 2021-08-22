const { ROLE_TYPE_UPGRADER } = require("./role.constant")

module.exports = {
    run: creep => {
        const sidejob = creep.memory.sidejob
        if (sidejob && sidejob !== ROLE_TYPE_UPGRADER) {
            return creep.pcSideJob()
        }
        var err = creep.pcHarvest()
        if (err == ERR_FULL) {
            var err = creep.upgradeController(creep.room.controller)
            if(err == ERR_NOT_IN_RANGE) {
                return creep.pcMoveTo(creep.room.controller);
            }
            return err
        }
        return err
    }
}