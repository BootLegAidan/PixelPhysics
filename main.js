let c = document.getElementById('canvas')
let ctx = c.getContext('2d')
let debug = document.getElementById('debug')

class ClassHandleElements {
  constructor() {
    this.elementProperties = {
      water: {
        color: '#6666ff',
        shortHand: 'w',
        gravity: true,
        flow: true,
        passable: ['a'],
        solids: ['w','b'],
        flowSearchDist: 10
      },
      brick: {
        color: "#550000",
        shortHand: 'b',
      },
      sand: {
        color: "#f2d78d",
        gravity: true,
        flow: true,
        flowSearchDist: 1,
        shortHand: 's',
        solids: ['b'],
        passable: ['a'],

        sink: true,
        sinkIn: ['w']
      }
    }
    this.elementList = []
  }
  propertyOf(element){
    return this.elementProperties[element] || 'null';
  }
  createElement(element, x, y) {
    let prop = this.propertyOf(element)
    this.elementList.sort(compare)
    this.elementList.reverse()
    world.draw({
      type: element,
      x: x,
      y: y
    })
    this.elementList.push({
      type: element,
      x: x,
      y: y,
      shortHand: prop.shortHand
    })
    console.log(this.elementList[this.elementList.length-1])
    world.array[y][x]=this.elementList[this.elementList.length-1]
  }
  applyPhysics (element){
    let canMove = true
    let props = this.propertyOf(element.type)
    if (props.gravity && canMove){
      if (element.y < world.height - 1){
        if (props.passable.includes(world.array[element.y+1][element.x].shortHand)) {
          this.updatePosition(element,0,1)
          canMove = false
        }
      }
    }
    if (props.sink && canMove){
      if (element.y < world.height - 1 && props.sinkIn.includes(world.array[element.y + 1][element.x].shortHand)) {
        this.updatePosition(element,0,1,true)
      }
    }
    if (props.flow && canMove){
      let found = false
      let canFlowDirs = [1,0,1]
      if (element.y < world.height - 1 && props.solids.includes(world.array[element.y+1][element.x].shortHand)){
        let firstDir = Math.round(Math.random())*2-1
        for (let j = 1; j < props.flowSearchDist + 1; j++){
          let flowDir = firstDir
          for (let i = 0; i < 2; i++) {
            flowDir *= -1
            // console.log(j * -firstDir + element.x)
            if (
              world.array[element.y] &&
              world.array[element.y + 1] &&
              world.array[element.y][element.x + (j*flowDir)] &&
              world.array[element.y + 1][element.x + (j*flowDir)] &&
              world.array[element.y][element.x + (j*flowDir)].shortHand &&
              world.array[element.y + 1][element.x + (j*flowDir)].shortHand) {
              if (props.passable.includes(world.array[element.y][element.x + (j*flowDir)].shortHand) && !found  && canFlowDirs[flowDir+1] == 1) {
                if (props.passable.includes(world.array[element.y + 1][element.x + (j*flowDir)].shortHand) && !props.solids.includes(world.array[element.y][element.x + (j*flowDir)].shortHand)) {
                  debug.innerHTML = `found lower part at ${element.x + (j*flowDir)}`
                  found = true
                  console.log(found)
                  this.updatePosition(element,flowDir,0)
                  if (j == 1){
                    this.updatePosition(element,0,1)
                  }
                }
              } else {
                canFlowDirs[flowDir + 1] = 0;
              }
            }
          }
        }
      }
    }
  }
  updatePosition(element,xInc,yInc,swap = false){
    let props = this.propertyOf(element.type)
    if (swap){
      world.array[element.y + 1][element.x].y += -yInc
      world.array[element.y + 1][element.x].x += -xInc
      world.draw(world.array[element.y + 1][element.x])
      element.x+=xInc;
      element.y+=yInc;
      world.draw(element)
      [world.array[element.y][element.x], world.array[element.y + yInc][element.x + xInc]] = [world.array[element.y + yInc][element.x + xInc], world.array[element.y][element.x]]
    } else {
      world.array[element.y][element.x] = {shortHand: 'a'}
      element.x+=xInc;
      element.y+=yInc;
      world.array[element.y][element.x] = element
    }
  }
}
class ClassWorld {
  constructor(cfg) {
    this.height = cfg.height || 10;
    this.width = cfg.width || 10;
    this.sizeMult = cfg.sizeMult || 1;

    c.width = this.width * this.sizeMult;
    c.height = this.height * this.sizeMult;

    this.array = new Array(this.height)
    for (let i = 0; i < this.height; i++) {
      this.array[i] = new Array(this.width)
      for (let j = 0; j < this.width; j++){
        this.array[i][j] = {shortHand: 'a'}
      }
    }
  }
  draw (element){
    let property = handleElements.propertyOf(element.type)
    ctx.fillStyle = property.color
    ctx.fillRect(element.x * this.sizeMult, element.y * this.sizeMult, this.sizeMult, this.sizeMult)
  }
  update (quick = false){
    ctx.clearRect(0,0,c.width,c.height)
    for (let i of handleElements.elementList){
      if (!quick){
        handleElements.applyPhysics(i)
      }
      this.draw(i)
    }
  }
}


let world = new ClassWorld({
  height: 10,
  width: 10,
  sizeMult: 100,
})
let handleElements = new ClassHandleElements()
handleElements.createElement('brick',1,2)
handleElements.createElement('brick',1,3)
handleElements.createElement('brick',1,4)
handleElements.createElement('brick',1,5)
handleElements.createElement('brick',2,5)
handleElements.createElement('brick',3,5)
handleElements.createElement('brick',4,5)
handleElements.createElement('brick',5,5)
handleElements.createElement('brick',6,5)
handleElements.createElement('brick',7,5)
handleElements.createElement('brick',8,2)
handleElements.createElement('brick',8,3)
handleElements.createElement('brick',8,4)
handleElements.createElement('brick',0,2)

for (let i = 2; i < 8; i++){
  handleElements.createElement('water',i,2)
  handleElements.createElement('water',i,3)
  handleElements.createElement('water',i,4)
}
handleElements.createElement('sand',3,0)

setInterval(() => {world.update()},500)
