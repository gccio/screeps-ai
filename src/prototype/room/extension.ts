export default class RoomExtension extends Room {
  public addSpawnTask(creepName: string): ScreepsReturnCode | number {
    if (!this.memory.spawnList) {
      this.memory.spawnList = []
    }

    // 先检查下任务是不是已经在队列里了
    if (!this.hasSpawnTask(creepName)) {
      // 任务加入队列
      this.memory.spawnList.push(creepName)
      return this.memory.spawnList.length - 1
    }

    // 如果已经有的话返回异常
    return ERR_NAME_EXISTS
  }

  public backoffSpawnTask(): void {
    const task = this.memory.spawnList.shift()
    this.memory.spawnList.push(task)
  }

  private hasSpawnTask(spawnName: string): boolean {
    if (!this.memory.spawnList) {
      this.memory.spawnList = []
    }

    return this.memory.spawnList.indexOf(spawnName) > -1
  }
}
