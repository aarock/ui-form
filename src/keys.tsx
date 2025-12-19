export function key () {
  return `${ Math.random() }`.slice( 2 )
}

export function keymap<T> ( arr: T[] ): T[] {
  return arr.map( t => {
    Object.assign( t as any, { key: key() } )
    return t
  } )
}
