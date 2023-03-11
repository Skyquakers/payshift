export const callbacks:  Map<string, Function[]> = new Map()


export const register = function (event: PayshiftEventName, callback: Function) {
  const fns = callbacks.get(event)
  if (fns) {
    fns.push(callback)
  } else {
    callbacks.set(event, [callback])
  }
}


export const trigger = function (event: PayshiftEventName, object: PayshiftEvent, ...args: any[]) {
  const fns = callbacks.get(event)
  if (fns) {
    fns.forEach(fn => {
      fn.call(null, object, ...args)
    })
  }
}


export const unregister = function (event: PayshiftEventName, callback: Function) {
  const fns = callbacks.get(event)
  if (fns) {
    const index = fns.indexOf(callback)
    if (index !== -1) {
      fns.splice(index, 1)
    }
  }
}