// assignPrototype 合并src的原型链到dst中
export const assignPrototype = (src: { [key: string]: any }, dst: { [key: string]: any }) => {
  Object.getOwnPropertyNames(src.prototype).forEach(key => {
    if (key.includes('Getter')) {
      Object.defineProperty(dst.prototype, key.split('Getter')[0], {
        get: src.prototype[key],
        enumerable: false,
        configurable: true
      })
    } else {
      dst.prototype[key] = src.prototype[key]
    }
  })
}

export const serializePos = (roomName: string, pos: RoomPosition) => {
  return `${roomName}/${pos.x}/${pos.y}`
}

// turnAround 计算输入方向的反方向
export function turnAround(direction: DirectionConstant): DirectionConstant {
  return <DirectionConstant>((direction + 3) % 8 + 1)
}
